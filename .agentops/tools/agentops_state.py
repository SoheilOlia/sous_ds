#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib import error, request


LINEAR_API = "https://api.linear.app/graphql"


def now_utc() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def run(cmd: list[str], cwd: Path | None = None, check: bool = True) -> str:
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"command failed: {' '.join(cmd)}")
    return result.stdout.strip()


def try_run(cmd: list[str], cwd: Path | None = None) -> str:
    try:
        return run(cmd, cwd=cwd, check=True)
    except Exception:
        return ""


def detect_repo_root(start: Path) -> Path:
    root = try_run(["git", "rev-parse", "--show-toplevel"], cwd=start)
    return Path(root) if root else start.resolve()


def detect_base_branch(repo_root: Path) -> str:
    env_branch = os.environ.get("AGENTOPS_BASE_BRANCH", "").strip()
    if env_branch:
        return env_branch
    remote_head = try_run(["git", "symbolic-ref", "refs/remotes/origin/HEAD"], cwd=repo_root)
    if remote_head.startswith("refs/remotes/origin/"):
        return remote_head.rsplit("/", 1)[-1]
    for candidate in ("main", "master"):
        ok = subprocess.run(
            ["git", "show-ref", "--verify", f"refs/heads/{candidate}"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        if ok.returncode == 0:
            return candidate
    branch = try_run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_root)
    return branch or "main"


def detect_lessons_path(repo_root: Path) -> str:
    env_path = os.environ.get("AGENTOPS_LESSONS_FILE", "").strip()
    candidates = [env_path] if env_path else []
    candidates.extend(
        [
            "consent_orders/lessons.md",
            "lessons.md",
            "docs/lessons.md",
            ".agentops/lessons.md",
        ]
    )
    for candidate in candidates:
        if candidate and (repo_root / candidate).exists():
            return candidate
    return ""


def read_text(path: Path) -> str:
    try:
        return path.read_text()
    except Exception:
        return ""


def extract_markdown_section(text: str, heading: str) -> str:
    lines = text.splitlines()
    capture = False
    collected: list[str] = []
    target = heading.strip().lower()
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#"):
            current = stripped.lstrip("#").strip().lower()
            if capture and current != target:
                break
            capture = current == target
            continue
        if capture:
            collected.append(line)
    return "\n".join(collected).strip()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-").lower()
    return slug or "session"


def shorten_text(value: str, limit: int = 220) -> str:
    cleaned = " ".join(value.replace("|", " ").split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 3].rstrip() + "..."


def first_nonempty_line(block: str) -> str:
    for line in block.splitlines():
        stripped = line.strip().lstrip("-").strip()
        if stripped:
            return stripped
    return ""


def is_placeholder_brief(value: str) -> bool:
    normalized = " ".join(value.lower().split())
    placeholders = {
        "describe the core problem this repo or room is trying to solve.",
        "describe the current initiative or milestone this room is working on.",
        "describe how this room contributes to the larger project, program, or strategy.",
    }
    return normalized in placeholders


def safe_rel(path: Path, repo_root: Path) -> str:
    try:
        return str(path.relative_to(repo_root))
    except ValueError:
        return str(path)


def log_event(agentops_dir: Path, event: str, **payload: str) -> None:
    ledger = agentops_dir / "ledger" / "ledger.ndjson"
    if not ledger.exists():
        return
    entry: dict[str, Any] = {"ts": now_utc(), "event": event}
    entry.update(payload)
    with ledger.open("a") as handle:
        handle.write(json.dumps(entry) + "\n")


def repo_candidates(repo_root: Path) -> dict[str, Path]:
    return {
        "tracker": repo_root / "consent_orders" / "tasks" / "tracker.md",
        "agent5_pcm_buddy": repo_root / "consent_orders" / "docs" / "agent5-pcm-buddy-integration.md",
        "weekly_update_meta": repo_root / "consent_orders" / "docs" / "weekly-update-meta-2026-04-21.md",
        "team_update_notes": repo_root / "consent_orders" / "docs" / "team-update-running-notes-2026-04-21.md",
        "pipeline_status_report": repo_root / "consent_orders" / "docs" / "pipeline-status-report.md",
        "pipeline_status": repo_root / "consent_orders" / "PIPELINE_STATUS.md",
        "session_receipt": repo_root / "consent_orders" / "SESSION-RECEIPT.md",
        "claude": repo_root / "CLAUDE.md",
        "agents": repo_root / "AGENTS.md",
    }


def room_brief_path(agentops_dir: Path) -> Path:
    return agentops_dir / "context" / "ROOM_BRIEF.md"


def build_room_narrative(repo_root: Path, agentops_dir: Path, tasks: dict[str, Any], receipts: list[dict[str, Any]]) -> dict[str, str]:
    brief_path = room_brief_path(agentops_dir)
    project_context_path = agentops_dir / "context" / "PROJECT_CONTEXT.md"
    problem = ""
    focus = ""
    bigger = ""
    source = "inferred"

    if brief_path.exists():
        text = read_text(brief_path)
        brief_problem = first_nonempty_line(extract_markdown_section(text, "Problem"))
        brief_focus = first_nonempty_line(extract_markdown_section(text, "Current Focus"))
        brief_bigger = first_nonempty_line(extract_markdown_section(text, "Bigger Program"))
        if brief_problem and not is_placeholder_brief(brief_problem):
            problem = brief_problem
        if brief_focus and not is_placeholder_brief(brief_focus):
            focus = brief_focus
        if brief_bigger and not is_placeholder_brief(brief_bigger):
            bigger = brief_bigger
        if problem or focus or bigger:
            source = "room-brief"

    if not (problem and focus and bigger) and project_context_path.exists():
        context_text = read_text(project_context_path)
        system_purpose = first_nonempty_line(extract_markdown_section(context_text, "System purpose"))
        pipeline_arch = first_nonempty_line(extract_markdown_section(context_text, "Pipeline architecture"))
        done_def = first_nonempty_line(extract_markdown_section(context_text, "Definition of done for orchestration tasks"))
        state_layer = first_nonempty_line(extract_markdown_section(context_text, "State and recap layer"))
        if not problem and system_purpose:
            problem = system_purpose
        if not focus and pipeline_arch:
            focus = pipeline_arch
        if not bigger and (state_layer or done_def):
            bigger = state_layer or done_def

    branch = try_run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_root) or ""
    modified_paths = git_modified_paths(repo_root)
    recent_subjects = [row["subject"] for row in git_recent_commits(repo_root, limit=6)]
    repo_docs = repo_candidates(repo_root)
    pcm_doc_text = read_text(repo_docs["agent5_pcm_buddy"])
    weekly_meta_text = read_text(repo_docs["weekly_update_meta"])
    team_update_text = read_text(repo_docs["team_update_notes"])
    signal_text = " ".join(
        [branch] + modified_paths + recent_subjects + [pcm_doc_text[:2000], weekly_meta_text[:2000], team_update_text[:2000]]
    ).lower()

    if not problem:
        if "pcm buddy" in signal_text or "pcm gate" in signal_text:
            problem = (
                "This room is integrating PCM Buddy-style compliance gating into Agent 5 so generated handoffs carry the right blocker checks, "
                "reviewer expectations, and compliance receipts."
            )
        elif "trust automation" in signal_text or "render-and-review platform" in signal_text or "enforcement prds" in signal_text:
            problem = (
                "This room is building the Trust Automation platform that turns enforcement PRDs into review-ready handoffs, renders, and evidence-backed artifacts."
            )

    if not focus:
        branch_l = branch.lower()
        if "pcm buddy" in signal_text or "pcm gate" in signal_text:
            focus = (
                "The current focus is documenting and hardening the Agent 5 + PCM Buddy path so compliance checks run at the right stages and the remaining adapter gaps are explicit."
            )
        elif "infra" in branch_l or "diagram" in branch_l:
            focus = (
                "The current focus is demo and infrastructure storytelling: reconciling the repo state, sharpening the system narrative, and keeping the architecture/status docs honest."
            )
        elif "weekly-update" in signal_text or "team-update" in signal_text:
            focus = (
                "The current focus is turning the latest technical progress into accurate weekly updates and review-ready program status."
            )

    if not bigger:
        if "trust automation" in signal_text or "render-and-review platform" in signal_text or "pcm buddy" in signal_text:
            bigger = (
                "This room contributes to the broader Trust Automation program: a reusable system that helps PM, Compliance, Legal, Design, and Engineering review enforcement work from one shared source of truth."
            )

    if not focus:
        active_titles = [task.get("title", "").strip() for task in tasks["active"] if task.get("title", "").strip()]
        draft_titles = [task.get("title", "").strip() for task in tasks["drafts"] if task.get("title", "").strip()]
        if active_titles:
            focus = f"The current focus is {active_titles[0]}."
        elif draft_titles:
            focus = f"The next planned focus is {draft_titles[0]}."
        elif receipts:
            focus = f"The most recent completed work was {receipt_summary_text(receipts[-1]).rstrip('.')}."

    if not bigger:
        tracker_text = read_text(repo_root / "consent_orders" / "tasks" / "tracker.md")
        status_summary = first_nonempty_line(extract_markdown_section(tracker_text, "STATUS SUMMARY"))
        if status_summary:
            bigger = f"This room contributes to the broader program tracked in consent_orders/tasks/tracker.md."

    if not problem:
        problem = "This room needs a clearer problem statement in .agentops/context/ROOM_BRIEF.md."
    if not focus:
        focus = "The current focus is not yet captured; add it to .agentops/context/ROOM_BRIEF.md or create the next task."
    if not bigger:
        bigger = "The bigger-program link is not yet captured; add it to .agentops/context/ROOM_BRIEF.md."

    return {
        "problem": shorten_text(problem, 260),
        "focus": shorten_text(focus, 260),
        "bigger": shorten_text(bigger, 260),
        "source": source,
    }


def git_last_commit(repo_root: Path, path: Path) -> str:
    rel = safe_rel(path, repo_root)
    return try_run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=repo_root)


def get_markdown_sources(repo_root: Path, lessons_rel: str) -> list[dict[str, str]]:
    sources: list[Path] = []
    candidates = repo_candidates(repo_root)
    sources.extend(candidates.values())
    if lessons_rel:
        sources.append(repo_root / lessons_rel)
    seen: set[Path] = set()
    rows: list[dict[str, str]] = []
    for path in sources:
        if path in seen or not path.exists():
            continue
        seen.add(path)
        text = read_text(path)
        title = ""
        for line in text.splitlines():
            if line.startswith("#"):
                title = line.lstrip("#").strip()
                break
        updated = ""
        for line in text.splitlines():
            if "Updated:" in line or "Last Updated:" in line or line.startswith("**Date:**"):
                updated = line.strip()
                break
        rows.append(
            {
                "path": safe_rel(path, repo_root),
                "title": title or path.name,
                "updated": updated or "not stated",
                "last_commit": git_last_commit(repo_root, path) or "unknown",
            }
        )
    return rows


def count_lessons(repo_root: Path, lessons_rel: str) -> tuple[int, list[str]]:
    if not lessons_rel:
        return 0, []
    text = read_text(repo_root / lessons_rel)
    entries = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("|---"):
            continue
        if stripped.lower().startswith("| date ") or stripped.lower().startswith("| session "):
            continue
        if "|" in stripped:
            entries.append(stripped)
    return len(entries), entries[-3:]


def receipt_summary_text(receipt: dict[str, Any]) -> str:
    summary = receipt.get("summary") or receipt.get("review_summary")
    if summary and summary.lower() != "todo":
        return str(summary)
    task_id = str(receipt.get("task_id", ""))
    if task_id.endswith("-REVIEW"):
        approved = receipt.get("approved_for_merge")
        if approved is True:
            return f"{task_id} approved for merge"
        if approved is False:
            return f"{task_id} requested fixes"
        return f"{task_id} review recorded"
    return task_id or "Receipt present without summary"


def parse_task_card(path: Path) -> dict[str, str]:
    fields = {
        "task_id": "",
        "title": "",
        "status": "",
        "owner_agent": "",
        "review_agent": "",
        "branch": "",
        "base_branch": "",
        "base_sha": "",
    }
    for line in read_text(path).splitlines():
        for key in list(fields):
            if line.startswith(f"{key}:"):
                fields[key] = line.split(":", 1)[1].strip().strip('"')
    return fields


def task_summary(agentops_dir: Path) -> dict[str, Any]:
    task_dir = agentops_dir / "tasks"
    counts: Counter[str] = Counter()
    tasks: list[dict[str, str]] = []
    for path in sorted(task_dir.glob("TASK-*.yaml")):
        parsed = parse_task_card(path)
        counts[parsed.get("status", "")] += 1
        parsed["path"] = str(path)
        tasks.append(parsed)
    active = [t for t in tasks if t.get("status") in {"ready", "executing", "review", "awaiting_approval"}]
    drafts = [t for t in tasks if t.get("status") == "draft"]
    return {
        "counts": counts,
        "active": active[:5],
        "drafts": drafts[:5],
    }


def receipt_rows(agentops_dir: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted((agentops_dir / "receipts").glob("RCT-*.json")):
        try:
            payload = json.loads(path.read_text())
        except Exception:
            continue
        payload["path"] = str(path)
        rows.append(payload)
    rows.sort(key=lambda row: row.get("timestamp", ""))
    return rows


def latest_receipts(agentops_dir: Path, limit: int = 5) -> list[dict[str, Any]]:
    rows = receipt_rows(agentops_dir)
    return rows[-limit:]


def weekly_receipts(agentops_dir: Path, since_iso: str) -> list[dict[str, Any]]:
    rows = receipt_rows(agentops_dir)
    return [row for row in rows if row.get("timestamp", "") >= since_iso]


def session_rows(agentops_dir: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in sorted((agentops_dir / "sessions").glob("SESSION_STATE-*.md")):
        text = read_text(path)
        tool = ""
        disposition = ""
        updated = ""
        for line in text.splitlines():
            if line.startswith("- tool:"):
                tool = line.split(":", 1)[1].strip()
            elif line.startswith("- disposition:"):
                disposition = line.split(":", 1)[1].strip()
            elif line.startswith("- generated_at:"):
                updated = line.split(":", 1)[1].strip()
        rows.append(
            {
                "path": str(path),
                "tool": tool or "unknown",
                "disposition": disposition or "unknown",
                "updated_at": updated or datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
            }
        )
    rows.sort(key=lambda row: row["updated_at"])
    return rows


def git_status_lines(repo_root: Path) -> list[str]:
    output = try_run(["git", "status", "--short"], cwd=repo_root)
    return [line for line in output.splitlines() if line.strip()]


def git_modified_paths(repo_root: Path, limit: int = 40) -> list[str]:
    paths = []
    for line in git_status_lines(repo_root):
        path = line[3:].strip()
        if path:
            paths.append(path)
    return paths[:limit]


def git_recent_commits(repo_root: Path, limit: int = 5, since_iso: str | None = None) -> list[dict[str, str]]:
    cmd = ["git", "log", f"-{limit}", "--format=%H%x09%cs%x09%s"]
    if since_iso:
        cmd.insert(2, f"--since={since_iso}")
    output = try_run(cmd, cwd=repo_root)
    rows = []
    for line in output.splitlines():
        if not line.strip():
            continue
        sha, date, subject = (line.split("\t", 2) + ["", "", ""])[:3]
        rows.append({"sha": sha, "date": date, "subject": subject})
    return rows


def git_week_commit_count(repo_root: Path, since_iso: str) -> int:
    output = try_run(["git", "rev-list", "--count", f"--since={since_iso}", "HEAD"], cwd=repo_root)
    try:
        return int(output)
    except Exception:
        return 0


def extract_ticket_prefixes(repo_root: Path) -> Counter[str]:
    prefixes: Counter[str] = Counter()
    patterns = re.compile(r"\b([A-Z][A-Z0-9]+)-\d+\b")
    for row in get_markdown_sources(repo_root, detect_lessons_path(repo_root)):
        text = read_text(repo_root / row["path"])
        for match in patterns.findall(text):
            prefixes[match] += 1
    return prefixes


def detect_linear_team_key(repo_root: Path) -> str:
    env_key = os.environ.get("AGENTOPS_LINEAR_TEAM_KEY", "").strip()
    if env_key:
        return env_key
    prefixes = extract_ticket_prefixes(repo_root)
    if prefixes:
        return prefixes.most_common(1)[0][0]
    return ""


def linear_query(api_key: str, query: str, variables: dict[str, Any]) -> dict[str, Any]:
    payload = json.dumps({"query": query, "variables": variables}).encode()
    req = request.Request(
        LINEAR_API,
        data=payload,
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
        },
    )
    with request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode())


def build_linear_state(
    repo_root: Path,
    agentops_dir: Path,
    team_key: str,
    requester: str,
) -> tuple[str, str | None]:
    linear_path = agentops_dir / "context" / "LINEAR_STATE.md"
    api_key = os.environ.get("LINEAR_API_KEY", "").strip()
    followup_path: str | None = None

    if api_key and team_key:
        try:
            payload = linear_query(
                api_key,
                """
                query($teamKey: String!) {
                  team(key: $teamKey) {
                    id
                    key
                    name
                    issues(first: 15, orderBy: updatedAt) {
                      nodes {
                        identifier
                        title
                        url
                        updatedAt
                        state { name type }
                      }
                    }
                  }
                }
                """,
                {"teamKey": team_key},
            )
            team = payload.get("data", {}).get("team") or {}
            issues = team.get("issues", {}).get("nodes", [])
            state_counts: Counter[str] = Counter()
            for issue in issues:
                state_counts[issue.get("state", {}).get("name", "Unknown")] += 1
            lines = [
                "# LINEAR_STATE",
                "",
                f"- generated_at: {now_utc()}",
                "- access_status: VERIFIED",
                f"- team_key: {team.get('key', team_key)}",
                f"- team_name: {team.get('name', 'unknown')}",
                f"- recent_issue_count: {len(issues)}",
                "",
                "## Verified",
            ]
            for state, count in sorted(state_counts.items()):
                lines.append(f"- VERIFIED: {count} recent issues currently in `{state}`.")
            lines.extend(["", "## Recently Updated Issues"])
            for issue in issues[:10]:
                lines.append(
                    f"- VERIFIED: {issue['identifier']} [{issue['title']}]({issue['url']}) "
                    f"was updated at {issue['updatedAt']} and is in `{issue.get('state', {}).get('name', 'Unknown')}`."
                )
            lines.extend(
                [
                    "",
                    "## Update Needs",
                    "- VERIFIED: compare these issue states against local receipts before marking room reset complete.",
                ]
            )
            linear_path.write_text("\n".join(lines) + "\n")
            return "VERIFIED", None
        except Exception as exc:
            error_message = str(exc)
    else:
        error_message = "LINEAR_API_KEY missing or team key could not be detected."

    goose_outbox = agentops_dir / "outbox" / "goose"
    ensure_dir(goose_outbox)
    followup_reason = "Reset Room could not access Linear directly."
    for existing in goose_outbox.glob("*_LINEAR-FOLLOWUP_reset-room.md"):
        text = read_text(existing)
        if (
            f"- repo_root: {repo_root}" in text
            and f"- team_key_guess: {team_key or 'unknown'}" in text
            and f"- reason: {followup_reason}" in text
        ):
            try:
                existing.unlink()
            except OSError:
                pass

    followup_file = goose_outbox / f"{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}_LINEAR-FOLLOWUP_reset-room.md"
    followup = textwrap.dedent(
        f"""\
        # Linear Follow-up Request

        - generated_at: {now_utc()}
        - requested_by: {requester}
        - repo_root: {repo_root}
        - team_key_guess: {team_key or "unknown"}
        - reason: {followup_reason}

        ## What Goose needs to verify
        - Which tickets are currently active, done, or stale for this repo.
        - Which tickets should be updated based on the latest receipts and markdown truth.
        - Which tickets need a comment linking the current code or receipt evidence.

        ## Suggested follow-up prompt
        Read `.agentops/context/ROOM_STATE.md`, `.agentops/context/LINEAR_STATE.md`, the latest receipts, and the latest markdown status files.
        Then verify the relevant Linear issues, update stale statuses, add missing comments, and write back exact ticket URLs or identifiers.

        ## Why this exists
        {error_message}
        """
    )
    followup_file.write_text(followup)
    followup_path = safe_rel(followup_file, repo_root)

    lines = [
        "# LINEAR_STATE",
        "",
        f"- generated_at: {now_utc()}",
        "- access_status: NO_ACCESS",
        f"- team_key: {team_key or 'unknown'}",
        f"- followup_artifact: {followup_path}",
        "",
        "## Verified",
        "- VERIFIED: local repo evidence was collected successfully.",
        "",
        "## Unknown",
        "- UNKNOWN: current ticket truth in Linear until Goose performs the follow-up.",
        "",
        "## Update Needs",
        f"- REQUIRED: Goose must process `{followup_path}` before treating Linear as current.",
    ]
    linear_path.write_text("\n".join(lines) + "\n")
    return "NO_ACCESS", followup_path


def room_needs_updates(
    repo_root: Path,
    markdown_rows: list[dict[str, str]],
    git_dirty: list[str],
    active_tasks: list[dict[str, str]],
    linear_status: str,
) -> list[str]:
    updates = []
    if git_dirty:
        updates.append(
            f"VERIFIED: working tree has {len(git_dirty)} pending file changes that may need a new receipt or status update."
        )
    for row in markdown_rows:
        if row["updated"] == "not stated":
            updates.append(f"INFERRED: `{row['path']}` has no explicit updated stamp; consider refreshing it during the next reset.")
    if active_tasks:
        updates.append(f"VERIFIED: {len(active_tasks)} task cards are still active and should stay reflected in status docs.")
    if linear_status != "VERIFIED":
        updates.append("UNKNOWN: Linear may be stale until Goose processes the follow-up artifact.")
    return updates


def write_room_state(repo_root: Path, agentops_dir: Path, requester: str, reason: str = "manual") -> Path:
    base_branch = detect_base_branch(repo_root)
    branch = try_run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_root) or "unknown"
    base_sha = try_run(["git", "rev-parse", base_branch], cwd=repo_root) or "unknown"
    dirty = git_status_lines(repo_root)
    lessons_rel = detect_lessons_path(repo_root)
    lesson_count, latest_lessons = count_lessons(repo_root, lessons_rel)
    markdown_rows = get_markdown_sources(repo_root, lessons_rel)
    tasks = task_summary(agentops_dir)
    receipts = latest_receipts(agentops_dir)
    sessions = session_rows(agentops_dir)
    linear_team = detect_linear_team_key(repo_root)
    linear_status, followup_path = build_linear_state(repo_root, agentops_dir, linear_team, requester)
    recent_commits = git_recent_commits(repo_root, limit=5)
    room_path = agentops_dir / "context" / "ROOM_STATE.md"
    narrative = build_room_narrative(repo_root, agentops_dir, tasks, receipts)

    verified = [
        f"VERIFIED: repo_root is `{repo_root}` on branch `{branch}` with base branch `{base_branch}` at `{base_sha}`.",
        f"VERIFIED: working tree is {'clean' if not dirty else f'dirty with {len(dirty)} changed paths'}.",
        f"VERIFIED: task cards currently total {sum(tasks['counts'].values())} "
        f"(active={len(tasks['active'])}, draft={len(tasks['drafts'])}, completed markers={tasks['counts'].get('completed', 0)}).",
        f"VERIFIED: lessons source is `{lessons_rel or 'missing'}` with {lesson_count} append-only entries.",
        f"VERIFIED: {len(receipts)} recent machine-readable receipts were found for this room.",
        f"VERIFIED: {len(markdown_rows)} markdown status sources were inspected.",
    ]
    if sessions:
        verified.append(f"VERIFIED: {len(sessions)} session state files exist under `.agentops/sessions/`.")
    if linear_status == "VERIFIED":
        verified.append(f"VERIFIED: Linear access succeeded for team `{linear_team}`.")
    else:
        verified.append("VERIFIED: Linear fallback artifact was written because direct Linear access was unavailable.")

    inferred = []
    if dirty and not tasks["active"]:
        inferred.append("INFERRED: there may be in-flight work that is not yet represented by an active task card.")
    if tasks["drafts"]:
        inferred.append("INFERRED: planning work exists but has not been dispatched yet.")
    if not sessions:
        inferred.append("INFERRED: no recent session resets are on disk, so tab-level state may still be stale.")

    unknown = []
    if not lessons_rel:
        unknown.append("UNKNOWN: no lessons file was detected, so long-term project memory may be incomplete.")
    if linear_status != "VERIFIED":
        unknown.append("UNKNOWN: actual ticket state in Linear until Goose completes the follow-up.")

    update_needs = room_needs_updates(repo_root, markdown_rows, dirty, tasks["active"], linear_status)
    next_tasks = []
    for task in tasks["active"][:3]:
        next_tasks.append(
            f"- VERIFIED: `{task.get('task_id')}` is `{task.get('status')}` and owned by `{task.get('owner_agent')}`."
        )
    if not next_tasks:
        next_tasks.append("- VERIFIED: no active task cards are currently blocking the room.")
    if linear_status != "VERIFIED" and followup_path:
        next_tasks.append(f"- REQUIRED: Goose must process `{followup_path}` before Linear is considered current.")

    lines = [
        "# ROOM_STATE",
        "",
        f"- generated_at: {now_utc()}",
        f"- generated_by: {requester}",
        f"- reset_reason: {reason}",
        f"- repo_root: {repo_root}",
        f"- branch: {branch}",
        f"- base_branch: {base_branch}",
        f"- base_sha: {base_sha}",
        "",
        "## What This Room Is About",
        f"- problem: {narrative['problem']}",
        f"- current_focus: {narrative['focus']}",
        f"- bigger_program: {narrative['bigger']}",
        f"- source: {narrative['source']}",
        "",
        "## What I Can Prove",
    ]
    lines.extend(f"- {line}" if not line.startswith("- ") else line for line in verified)
    lines.extend(["", "## What I Infer"])
    if inferred:
        lines.extend(f"- {line}" if not line.startswith("- ") else line for line in inferred)
    else:
        lines.append("- INFERRED: no additional inferences were needed beyond the verified facts above.")
    lines.extend(["", "## What I Still Do Not Know"])
    if unknown:
        lines.extend(f"- {line}" if not line.startswith("- ") else line for line in unknown)
    else:
        lines.append("- UNKNOWN: no unresolved unknowns were detected from local repo state.")

    lines.extend(["", "## Lessons Snapshot"])
    lines.append(f"- lessons_file: `{lessons_rel or 'missing'}`")
    for entry in latest_lessons:
        lines.append(f"- VERIFIED: {entry}")
    if not latest_lessons:
        lines.append("- VERIFIED: no structured lesson entries were found.")

    lines.extend(["", "## Recent Receipts"])
    for receipt in receipts:
        lines.append(
            f"- VERIFIED: `{receipt.get('receipt_id')}` for `{receipt.get('task_id')}` "
            f"reports `{receipt_summary_text(receipt)}`."
        )
    if not receipts:
        lines.append("- VERIFIED: no JSON receipts were found yet.")

    lines.extend(["", "## Markdown Truth Sources"])
    for row in markdown_rows:
        lines.append(
            f"- VERIFIED: `{row['path']}` ({row['title']}) "
            f"last committed {row['last_commit']} and reports `{row['updated']}`."
        )

    lines.extend(["", "## Recent Commits"])
    for commit in recent_commits:
        lines.append(f"- VERIFIED: `{commit['sha'][:8]}` on {commit['date']} — {commit['subject']}")
    if not recent_commits:
        lines.append("- VERIFIED: no recent commits were available from git log.")

    lines.extend(["", "## What Needs Updating"])
    for item in update_needs:
        lines.append(f"- {item}")
    if not update_needs:
        lines.append("- VERIFIED: no obvious markdown or task drift was detected.")

    lines.extend(["", "## Recommended Next Tasks"])
    lines.extend(next_tasks)

    room_path.write_text("\n".join(lines) + "\n")
    log_event(agentops_dir, "room_reset", repo_root=str(repo_root), by=requester)
    return room_path


def classify_disposition(dirty: list[str], active_tasks: list[dict[str, str]]) -> tuple[str, str]:
    if dirty:
        return "keep", "VERIFIED: uncommitted work exists in this session's workspace."
    if active_tasks:
        return "handoff", "VERIFIED: active task cards exist but this workspace is clean."
    return "close", "VERIFIED: no active tasks and no uncommitted work were detected."


def write_session_state(repo_root: Path, agentops_dir: Path, tool: str, label: str, intent: str) -> Path:
    branch = try_run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_root) or "unknown"
    base_branch = detect_base_branch(repo_root)
    dirty = git_status_lines(repo_root)
    tasks = task_summary(agentops_dir)
    receipts = latest_receipts(agentops_dir, limit=3)
    narrative = build_room_narrative(repo_root, agentops_dir, tasks, latest_receipts(agentops_dir))
    room_path = agentops_dir / "context" / "ROOM_STATE.md"
    room_summary = "Reset Room has not been run yet."
    room_problem = narrative["problem"]
    room_focus = narrative["focus"]
    if room_path.exists():
        for line in read_text(room_path).splitlines():
            if line.startswith("- problem:"):
                room_problem = line.split(":", 1)[1].strip()
            if line.startswith("- current_focus:"):
                room_focus = line.split(":", 1)[1].strip()
            if line.startswith("- VERIFIED: repo_root"):
                room_summary = line[2:].replace("VERIFIED: ", "", 1)
                break
    disposition, disposition_reason = classify_disposition(dirty, tasks["active"])
    commits = git_recent_commits(repo_root, limit=3)
    session_path = agentops_dir / "sessions" / f"SESSION_STATE-{slugify(tool)}-{slugify(label)}.md"
    lines = [
        "# SESSION_STATE",
        "",
        f"- generated_at: {now_utc()}",
        f"- tool: {tool}",
        f"- label: {label}",
        f"- disposition: {disposition}",
        f"- repo_root: {repo_root}",
        f"- branch: {branch}",
        f"- base_branch: {base_branch}",
        "",
        "## What This Session Was Trying To Do",
        f"- intent: {intent or 'not supplied'}",
        "",
        "## What Is Real",
        f"- VERIFIED: working tree is {'clean' if not dirty else f'dirty with {len(dirty)} changed paths'}.",
        f"- VERIFIED: {len(tasks['active'])} active task cards are currently attached to this room.",
    ]
    for commit in commits:
        lines.append(f"- VERIFIED: recent commit `{commit['sha'][:8]}` — {commit['subject']}")
    if receipts:
        for receipt in receipts:
            lines.append(
                f"- VERIFIED: latest receipt `{receipt.get('receipt_id')}` reports `{receipt_summary_text(receipt)}`."
            )
    lines.extend(
        [
            "",
            "## What Is Only Planned",
            f"- VERIFIED: {len(tasks['drafts'])} draft task cards exist in `.agentops/tasks/`.",
            "",
            "## What This Session Adds To The Bigger Project",
            f"- room_problem: {room_problem}",
            f"- room_focus: {room_focus}",
            f"- session_contribution: {intent or 'Session intent was not supplied.'}",
            "",
            "## Bigger Picture",
            f"- VERIFIED: {room_summary}",
            "",
            "## Recommended Disposition",
            f"- VERIFIED: `{disposition}`",
            f"- reason: {disposition_reason}",
        ]
    )
    if dirty:
        lines.extend(["", "## Pending File Changes"])
        for line in dirty[:15]:
            lines.append(f"- VERIFIED: `{line}`")
    session_path.write_text("\n".join(lines) + "\n")
    log_event(agentops_dir, "session_reset", tool=tool, label=label)
    return session_path


def load_registry(hq_root: Path) -> dict[str, Any]:
    registry_path = hq_root / "projects.json"
    if not registry_path.exists():
        return {"projects": {}}
    try:
        return json.loads(registry_path.read_text())
    except Exception:
        return {"projects": {}}


def save_registry(hq_root: Path, payload: dict[str, Any]) -> None:
    ensure_dir(hq_root)
    (hq_root / "projects.json").write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")


def update_registry(
    hq_root: Path,
    repo_root: Path,
    room_path: Path | None = None,
    linear_path: Path | None = None,
    session_path: Path | None = None,
) -> None:
    payload = load_registry(hq_root)
    projects = payload.setdefault("projects", {})
    key = str(repo_root)
    project = projects.setdefault(
        key,
        {
            "name": repo_root.name,
            "repo_root": str(repo_root),
            "created_at": now_utc(),
            "sessions": [],
        },
    )
    project["updated_at"] = now_utc()
    project["base_branch"] = detect_base_branch(repo_root)
    project["current_branch"] = try_run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_root)
    project["linear_team_key"] = detect_linear_team_key(repo_root)
    if room_path:
        project["last_room_state"] = str(room_path)
        project["last_room_reset"] = now_utc()
    if linear_path:
        project["last_linear_state"] = str(linear_path)
    if session_path:
        sessions = project.setdefault("sessions", [])
        session_record = {
            "path": str(session_path),
            "updated_at": now_utc(),
        }
        sessions[:] = [row for row in sessions if row.get("path") != str(session_path)]
        sessions.append(session_record)
        sessions[:] = sessions[-25:]
    save_registry(hq_root, payload)


def monday_start_local() -> datetime:
    local_now = datetime.now().astimezone()
    start = local_now - timedelta(days=local_now.weekday())
    return start.replace(hour=0, minute=0, second=0, microsecond=0)


def iso_week_label(now: datetime) -> str:
    year, week, _ = now.isocalendar()
    return f"WEEK-{year}-{week:02d}"


def write_weekly_recap(hq_root: Path, current_repo: Path | None = None) -> Path:
    ensure_dir(hq_root / "weekly")
    payload = load_registry(hq_root)
    projects = payload.get("projects", {})
    week_start = monday_start_local()
    since_iso = week_start.isoformat()
    rows = []
    total_commits = 0
    total_receipts = 0
    highest_impact: list[str] = []
    next_week: list[str] = []

    if current_repo and str(current_repo) not in projects:
        update_registry(hq_root, current_repo)
        payload = load_registry(hq_root)
        projects = payload.get("projects", {})

    for repo_root_str, project in sorted(projects.items()):
        repo_root = Path(repo_root_str)
        if not repo_root.exists():
            continue
        commits = git_week_commit_count(repo_root, since_iso)
        total_commits += commits
        receipts = weekly_receipts(repo_root / ".agentops", since_iso) if (repo_root / ".agentops").exists() else []
        total_receipts += len(receipts)
        room_state_path = Path(project.get("last_room_state", "")) if project.get("last_room_state") else None
        room_headline = "No room reset on file."
        if room_state_path and room_state_path.exists():
            for line in read_text(room_state_path).splitlines():
                if line.startswith("- VERIFIED: repo_root"):
                    room_headline = line[2:]
                    break
        if receipts:
            preferred = next(
                (
                    receipt
                    for receipt in reversed(receipts)
                    if not str(receipt.get("task_id", "")).endswith("-REVIEW")
                ),
                receipts[-1],
            )
            receipt_summary = receipt_summary_text(preferred)
        else:
            receipt_summary = "No receipts this week."
        rows.append(
            {
                "name": project.get("name", repo_root.name),
                "repo_root": repo_root_str,
                "commits": commits,
                "receipts": len(receipts),
                "headline": room_headline,
                "receipt_summary": receipt_summary,
            }
        )
        if receipts:
            highest_impact.append(f"{project.get('name', repo_root.name)}: {receipt_summary}")
        if (repo_root / ".agentops" / "tasks").exists():
            tasks = task_summary(repo_root / ".agentops")
            for task in tasks["active"][:1]:
                next_week.append(f"{project.get('name', repo_root.name)}: {task.get('task_id')} remains {task.get('status')}.")

    lessons_line = ""
    if current_repo:
        lessons_rel = detect_lessons_path(current_repo)
        _, latest_lessons = count_lessons(current_repo, lessons_rel)
        if latest_lessons:
            lessons_line = shorten_text(latest_lessons[-1])

    week_now = datetime.now().astimezone()
    recap_path = hq_root / "weekly" / f"{iso_week_label(week_now)}.md"
    paragraph_one = (
        f"This week across {len(rows)} tracked projects we observed {total_commits} commits and "
        f"{total_receipts} receipts. The highest-impact work was {highest_impact[0] if highest_impact else 'capturing clean room state and receipts so the work is trustworthy'}."
    )
    paragraph_two = (
        f"We are tracking toward bigger project completion by keeping room resets current and reducing stale session state. "
        f"Learning this week: {lessons_line if lessons_line else 'the system is only trustworthy when receipts, markdown truth, and ticket truth are reconciled together'}. "
        f"Next week: {next_week[0] if next_week else 'run the next bounded task through the reset-room workflow and keep the recap current'}."
    )

    lines = [
        f"# Weekly Recap — {iso_week_label(week_now)}",
        "",
        f"- generated_at: {now_utc()}",
        f"- week_start: {week_start.isoformat()}",
        "",
        "## Executive Summary",
        paragraph_one,
        "",
        paragraph_two,
        "",
        "## Project Rollup",
        "| Project | Commits | Receipts | Current Pulse |",
        "|---|---:|---:|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row['name']} | {row['commits']} | {row['receipts']} | {row['receipt_summary']} |"
        )
    if not rows:
        lines.append("| none | 0 | 0 | No projects registered yet |")

    lines.extend(["", "## What Matters Most"])
    for item in highest_impact[:5]:
        lines.append(f"- VERIFIED: {item}")
    if not highest_impact:
        lines.append("- VERIFIED: no receipt-backed impact statements were available yet.")

    lines.extend(["", "## What We Learned"])
    if lessons_line:
        lines.append(f"- VERIFIED: {lessons_line}")
    else:
        lines.append("- VERIFIED: no fresh lesson entry was available this week.")

    lines.extend(["", "## Next Week"])
    for item in next_week[:5]:
        lines.append(f"- VERIFIED: {item}")
    if not next_week:
        lines.append("- VERIFIED: no active tasks are currently queued in the registry.")

    recap_path.write_text("\n".join(lines) + "\n")
    return recap_path


def bootstrap_repo(repo_root: Path, hq_root: Path) -> None:
    agentops_dir = repo_root / ".agentops"
    ensure_dir(agentops_dir)
    for relative in [
        "context",
        "tasks",
        "receipts",
        "inbox/goose",
        "inbox/codex",
        "inbox/cursor",
        "outbox/goose",
        "outbox/codex",
        "outbox/cursor",
        "approvals",
        "ledger",
        "archive/completed",
        "templates",
        "tools",
        "sessions",
    ]:
        ensure_dir(agentops_dir / relative)

    defaults_root = hq_root / "defaults"
    copy_pairs = [
        (defaults_root / "agentops-cli.sh", repo_root / "agentops-cli.sh"),
        (defaults_root / ".agentops" / "tools" / "agentops_state.py", agentops_dir / "tools" / "agentops_state.py"),
    ]
    for src, dest in copy_pairs:
        if src.exists() and not dest.exists():
            ensure_dir(dest.parent)
            shutil.copy2(src, dest)
            if dest.name.endswith(".sh") or dest.name.endswith(".py"):
                dest.chmod(0o755)
    for template in (defaults_root / ".agentops" / "templates").glob("*"):
        dest = agentops_dir / "templates" / template.name
        if template.is_file() and not dest.exists():
            shutil.copy2(template, dest)
    if (defaults_root / "docs" / "agent-orchestration").exists():
        dest_docs = repo_root / "docs" / "agent-orchestration"
        ensure_dir(dest_docs)
        for path in (defaults_root / "docs" / "agent-orchestration").rglob("*"):
            if path.is_dir():
                continue
            target = dest_docs / path.relative_to(defaults_root / "docs" / "agent-orchestration")
            if not target.exists():
                ensure_dir(target.parent)
                shutil.copy2(path, target)

    ledger = agentops_dir / "ledger" / "ledger.ndjson"
    if not ledger.exists():
        ledger.write_text("")

    base_branch = detect_base_branch(repo_root)
    lessons_rel = detect_lessons_path(repo_root)
    context_files: dict[Path, str] = {
        agentops_dir / "context" / "PROJECT_CONTEXT.md": textwrap.dedent(
            f"""\
            # PROJECT_CONTEXT

            ## Bootstrap status
            - generated_at: {now_utc()}
            - source: bootstrap-derived
            - repo_root: `{repo_root}`
            - base_branch: `{base_branch}`

            ## What this file is
            This is a bootstrap-generated project context. Confirm and refine it after the first reset-room pass.

            ## Detected signals
            - lessons_file: `{lessons_rel or 'not found'}`
            - AGENTS.md: `{'present' if (repo_root / 'AGENTS.md').exists() else 'missing'}`
            - docs directory: `{'present' if (repo_root / 'docs').exists() else 'missing'}`
            """
        ),
        agentops_dir / "context" / "REPO_MAP.md": textwrap.dedent(
            f"""\
            # REPO_MAP

            ## Bootstrap status
            - generated_at: {now_utc()}
            - source: bootstrap-derived

            ## Key paths
            - `AGENTS.md` — repo instructions if present
            - `{lessons_rel or 'lessons file not yet detected'}` — lessons or long-term memory
            - `.agentops/` — agent orchestration state
            - `docs/` — markdown project status, plans, and specifications
            """
        ),
        agentops_dir / "context" / "ROOM_BRIEF.md": textwrap.dedent(
            """\
            # ROOM_BRIEF

            ## Problem
            Describe the core problem this repo or room is trying to solve.

            ## Current Focus
            Describe the current initiative or milestone this room is working on.

            ## Bigger Program
            Describe how this room contributes to the larger project, program, or strategy.
            """
        ),
        agentops_dir / "context" / "STATUS.md": textwrap.dedent(
            f"""\
            # STATUS

            Last Updated: {now_utc()}

            ## Scope
            Bootstrap-generated status. Replace with repo-specific truth after reset-room and first task.

            ## Done
            - .agentops skeleton created.

            ## In Progress
            - Bootstrap review and first room reset.

            ## Blocked
            - None recorded yet.

            ## Next 3
            1. Run `./agentops-cli.sh reset-room`.
            2. Confirm lessons file and first reads.
            3. Create the first real task card.
            """
        ),
        agentops_dir / "context" / "DECISIONS_LOG.md": "# DECISIONS_LOG\n\n- Bootstrap created this file. Add architecture and workflow decisions here.\n",
        agentops_dir / "context" / "ROOM_STATE.md": "# ROOM_STATE\n\nRun `./agentops-cli.sh reset-room` to generate the first room state.\n",
        agentops_dir / "context" / "LINEAR_STATE.md": "# LINEAR_STATE\n\nRun `./agentops-cli.sh reset-room` to generate the first Linear state.\n",
    }
    for path, content in context_files.items():
        if not path.exists():
            path.write_text(content)

    log_event(agentops_dir, "bootstrap_completed", repo_root=str(repo_root), by="cli")


def init_hq(repo_root: Path, hq_root: Path) -> None:
    ensure_dir(hq_root / "defaults" / ".agentops" / "templates")
    ensure_dir(hq_root / "defaults" / ".agentops" / "tools")
    ensure_dir(hq_root / "defaults" / "docs" / "agent-orchestration" / "templates")
    ensure_dir(hq_root / "commands")
    ensure_dir(hq_root / "bin")
    ensure_dir(hq_root / "weekly")

    copy_map = [
        (repo_root / "agentops-cli.sh", hq_root / "defaults" / "agentops-cli.sh"),
        (repo_root / ".agentops" / "tools" / "agentops_state.py", hq_root / "defaults" / ".agentops" / "tools" / "agentops_state.py"),
    ]
    for src, dest in copy_map:
        if src.exists():
            shutil.copy2(src, dest)
            if dest.suffix in {".sh", ".py"}:
                dest.chmod(0o755)

    for template in (repo_root / ".agentops" / "templates").glob("*"):
        if template.is_file():
            shutil.copy2(template, hq_root / "defaults" / ".agentops" / "templates" / template.name)
    docs_root = repo_root / "docs" / "agent-orchestration"
    if docs_root.exists():
        for path in docs_root.rglob("*"):
            if path.is_dir():
                continue
            target = hq_root / "defaults" / "docs" / "agent-orchestration" / path.relative_to(docs_root)
            ensure_dir(target.parent)
            shutil.copy2(path, target)

    command_docs = {
        "RESET_SESSION.md": "# RESET SESSION\n\nInspect one tool session, compare it to repo truth, write a session state, and recommend keep/handoff/close.\n",
        "RESET_ROOM.md": "# RESET ROOM\n\nInspect repo truth, markdown truth, lessons, receipts, and Linear status. Write ROOM_STATE.md and LINEAR_STATE.md.\n",
        "WEEKLY_RECAP.md": "# WEEKLY RECAP\n\nSummarize tracked projects for the current week with impact, commit/receipt counts, learnings, and next focus.\n",
        "START_WORK.md": "# START WORK\n\nAssign the next task only after reset-room has reconciled the repo and surfaced stale state.\n",
    }
    for name, content in command_docs.items():
        (hq_root / "commands" / name).write_text(content)

    install_script = textwrap.dedent(
        """\
        #!/usr/bin/env bash
        set -euo pipefail

        HQ_ROOT="${AGENTOPS_HQ:-$HOME/.agentops-hq}"
        TARGET="${1:-$(pwd)}"

        mkdir -p "$TARGET/.agentops/templates" "$TARGET/.agentops/tools" "$TARGET/docs/agent-orchestration"
        cp "$HQ_ROOT/defaults/agentops-cli.sh" "$TARGET/agentops-cli.sh"
        cp "$HQ_ROOT/defaults/.agentops/tools/agentops_state.py" "$TARGET/.agentops/tools/agentops_state.py"
        cp "$HQ_ROOT/defaults/.agentops/templates/"* "$TARGET/.agentops/templates/"
        if [ -d "$HQ_ROOT/defaults/docs/agent-orchestration" ]; then
          cp -R "$HQ_ROOT/defaults/docs/agent-orchestration/." "$TARGET/docs/agent-orchestration/"
        fi
        chmod +x "$TARGET/agentops-cli.sh" "$TARGET/.agentops/tools/agentops_state.py"
        (cd "$TARGET" && ./agentops-cli.sh bootstrap)
        echo "AgentOps installed into $TARGET"
        """
    )
    install_path = hq_root / "install.sh"
    install_path.write_text(install_script)
    install_path.chmod(0o755)

    global_wrapper = textwrap.dedent(
        """\
        #!/usr/bin/env bash
        set -euo pipefail

        HQ_ROOT="${AGENTOPS_HQ:-$HOME/.agentops-hq}"
        if [ ! -f "$HQ_ROOT/install.sh" ]; then
          echo "AgentOps HQ is not initialized. Run ./agentops-cli.sh init-hq from the rollout repo first." >&2
          exit 1
        fi

        command="${1:-}"
        if [ -z "$command" ]; then
          echo "Usage: agentops <command> [args]" >&2
          exit 1
        fi

        if git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
          target="$git_root"
        else
          target="$(pwd)"
        fi

        local_cli="$target/agentops-cli.sh"

        ensure_local_install() {
          if [ ! -f "$local_cli" ]; then
            "$HQ_ROOT/install.sh" "$target" >/dev/null
          fi
        }

        ensure_local_supports() {
          local requested="$1"
          ensure_local_install
          if [ ! -f "$local_cli" ]; then
            "$HQ_ROOT/install.sh" "$target" >/dev/null
            return
          fi

          case "$requested" in
            huddle-up|session-huddle)
              if ! rg -q "$requested" "$local_cli" 2>/dev/null; then
                "$HQ_ROOT/install.sh" "$target" >/dev/null
              fi
              ;;
          esac
        }

        case "$command" in
          init-hq)
            echo "HQ already initialized at $HQ_ROOT"
            ;;
          bootstrap|reset-room|reset-session|huddle-up|session-huddle|weekly-recap|doctor|create-task|dispatch|claim|verify-pin|write-receipt|status|ledger|next)
            ensure_local_supports "$command"
            (cd "$target" && ./agentops-cli.sh "$@")
            ;;
          install)
            "$HQ_ROOT/install.sh" "$target"
            ;;
          upgrade|refresh)
            "$HQ_ROOT/install.sh" "$target"
            ;;
          *)
            ensure_local_supports "$command"
            (cd "$target" && ./agentops-cli.sh "$@")
            ;;
        esac
        """
    )
    wrapper_path = hq_root / "bin" / "agentops"
    wrapper_path.write_text(global_wrapper)
    wrapper_path.chmod(0o755)

    local_bin = Path.home() / ".local" / "bin"
    ensure_dir(local_bin)
    shutil.copy2(wrapper_path, local_bin / "agentops")
    (local_bin / "agentops").chmod(0o755)

    projects_path = hq_root / "projects.json"
    if not projects_path.exists():
        projects_path.write_text('{\n  "projects": {}\n}\n')
    lessons_global = hq_root / "lessons-global.md"
    if not lessons_global.exists():
        lessons_global.write_text("# Global Lessons\n\n- Add cross-project lessons here.\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="AgentOps state helpers")
    parser.add_argument("--hq-root", default=os.environ.get("AGENTOPS_HQ", str(Path.home() / ".agentops-hq")))
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("bootstrap")
    subparsers.add_parser("init-hq")

    room_parser = subparsers.add_parser("reset-room")
    room_parser.add_argument("--by", default="cli")
    room_parser.add_argument("--reason", default="manual")

    session_parser = subparsers.add_parser("reset-session")
    session_parser.add_argument("tool")
    session_parser.add_argument("label")
    session_parser.add_argument("--intent", default="")

    subparsers.add_parser("weekly-recap")

    args = parser.parse_args()
    start = Path.cwd()
    repo_root = detect_repo_root(start)
    agentops_dir = repo_root / ".agentops"
    hq_root = Path(args.hq_root).expanduser()

    if args.command == "init-hq":
        init_hq(repo_root, hq_root)
        print(hq_root)
        return 0

    if args.command == "bootstrap":
        bootstrap_repo(repo_root, hq_root)
        print(agentops_dir)
        return 0

    if not agentops_dir.exists():
        bootstrap_repo(repo_root, hq_root)

    if args.command == "reset-room":
        room_path = write_room_state(repo_root, agentops_dir, args.by, args.reason)
        update_registry(hq_root, repo_root, room_path=room_path, linear_path=agentops_dir / "context" / "LINEAR_STATE.md")
        print(room_path)
        return 0

    if args.command == "reset-session":
        session_path = write_session_state(repo_root, agentops_dir, args.tool, args.label, args.intent)
        update_registry(hq_root, repo_root, session_path=session_path)
        print(session_path)
        return 0

    if args.command == "weekly-recap":
        recap_path = write_weekly_recap(hq_root, current_repo=repo_root)
        print(recap_path)
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
