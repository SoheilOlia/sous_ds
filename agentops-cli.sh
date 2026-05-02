#!/usr/bin/env bash
set -euo pipefail

# agentops-cli.sh -- Repo-local automation for agent orchestration.
# Replaces clipboard copy-paste between Goose, Codex, and Cursor.

AGENTOPS_DIR=".agentops"
LEDGER="$AGENTOPS_DIR/ledger/ledger.ndjson"
TASKS_DIR="$AGENTOPS_DIR/tasks"
RECEIPTS_DIR="$AGENTOPS_DIR/receipts"
INBOX_DIR="$AGENTOPS_DIR/inbox"
OUTBOX_DIR="$AGENTOPS_DIR/outbox"
APPROVALS_DIR="$AGENTOPS_DIR/approvals"
TEMPLATES_DIR="$AGENTOPS_DIR/templates"
SESSIONS_DIR="$AGENTOPS_DIR/sessions"
TOOLS_DIR="$AGENTOPS_DIR/tools"
STATE_TOOL="$TOOLS_DIR/agentops_state.py"
HQ_ROOT="${AGENTOPS_HQ:-$HOME/.agentops-hq}"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
ts_file() { date -u +"%Y%m%d-%H%M%S"; }

detect_base_branch() {
  if [ -n "${AGENTOPS_BASE_BRANCH:-}" ]; then
    echo "$AGENTOPS_BASE_BRANCH"
    return
  fi
  local remote_head
  remote_head=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
  if [ -n "$remote_head" ]; then
    echo "$remote_head"
  elif git show-ref --verify --quiet refs/heads/main; then
    echo "main"
  elif git show-ref --verify --quiet refs/heads/master; then
    echo "master"
  else
    git rev-parse --abbrev-ref HEAD
  fi
}

git_base_sha() {
  git rev-parse "$(detect_base_branch)"
}

detect_lessons_file() {
  local env_path="${AGENTOPS_LESSONS_FILE:-}"
  local candidates=()
  if [ -n "$env_path" ]; then candidates+=("$env_path"); fi
  candidates+=("consent_orders/lessons.md" "lessons.md" "docs/lessons.md" ".agentops/lessons.md")
  local candidate
  for candidate in "${candidates[@]}"; do
    if [ -f "$candidate" ]; then
      echo "$candidate"
      return
    fi
  done
  echo ""
}

log_event() {
  local event="$1"; shift
  local extra=""
  while [ $# -gt 0 ]; do extra="$extra,\"$1\":\"$2\""; shift 2; done
  echo "{\"ts\":\"$(ts)\",\"event\":\"$event\"$extra}" >> "$LEDGER"
}

usage() {
  echo "Usage: ./agentops-cli.sh <command> [args]"
  echo ""
  echo "Commands:"
  echo "  init-hq                         Install global HQ defaults in ~/.agentops-hq"
  echo "  bootstrap                       Scaffold .agentops in the current repo"
  echo "  huddle-up [by] [reason]         Human-friendly room sync; preferred alias for reset-room"
  echo "  session-huddle <tool> <label> [intent]"
  echo "                                  Human-friendly alias for reset-session"
  echo "  create-task                     Create a new task card from template"
  echo "  dispatch <TASK-ID> <agent>      Send task to agent inbox"
  echo "  claim <TASK-ID> <agent>         Agent claims a task"
  echo "  verify-pin <TASK-ID>            Verify workspace pin matches task card"
  echo "  write-receipt <TASK-ID> <agent> Scaffold markdown + JSON receipt"
  echo "  reset-session <tool> <label> [intent]"
  echo "                                  Capture session truth and recommend keep/handoff/close"
  echo "  reset-room [by] [reason]        Capture repo truth, markdown truth, lessons, receipts, and Linear state"
  echo "  weekly-recap                    Write the global weekly recap"
  echo "  doctor                          Run full consistency check"
  echo "  status                          Show current STATUS.md"
  echo "  ledger [N]                      Show last N ledger entries (default 20)"
  echo "  next                            Show next ready task"
  exit 1
}

cmd_create_task() {
  local max_id=0
  for f in "$TASKS_DIR"/TASK-*.yaml; do
    [ -f "$f" ] || continue
    local num
    num=$(basename "$f" | sed 's/TASK-0*\([0-9]*\).*/\1/')
    if [ "$num" -gt "$max_id" ] 2>/dev/null; then max_id=$num; fi
  done
  local next_id
  next_id=$(printf "TASK-%04d" $((max_id + 1)))
  local task_file="$TASKS_DIR/$next_id.yaml"

  cp "$TEMPLATES_DIR/TASK_CARD_TEMPLATE.yaml" "$task_file"
  local repo_root branch base_branch base_sha lessons_file
  repo_root=$(git rev-parse --show-toplevel)
  branch=$(git rev-parse --abbrev-ref HEAD)
  base_branch=$(detect_base_branch)
  base_sha=$(git_base_sha)
  lessons_file=$(detect_lessons_file)

  sed -i '' "s|^task_id:.*|task_id: $next_id|" "$task_file"
  sed -i '' "s|^created_at:.*|created_at: \"$(ts)\"|" "$task_file"
  sed -i '' "s|^repo_root:.*|repo_root: \"$repo_root\"|" "$task_file"
  sed -i '' "s|^worktree_path:.*|worktree_path: \"$(pwd)\"|" "$task_file"
  sed -i '' "s|^branch:.*|branch: \"$branch\"|" "$task_file"
  sed -i '' "s|^base_branch:.*|base_branch: \"$base_branch\"|" "$task_file"
  sed -i '' "s|^base_sha:.*|base_sha: \"$base_sha\"|" "$task_file"
  if [ -n "$lessons_file" ]; then
    sed -i '' "s|__LESSONS_FILE__|$lessons_file|" "$task_file"
  fi

  log_event "task_created" "task_id" "$next_id" "by" "goose"
  echo "Created: $task_file"
  echo "Edit the task card to fill: title, goal, scope, acceptance_criteria"
}

cmd_dispatch() {
  local task_id="$1" agent="$2"
  local task_file="$TASKS_DIR/$task_id.yaml"
  [ ! -f "$task_file" ] && echo "ERROR: $task_file not found" && exit 1

  mkdir -p "$INBOX_DIR/$agent"
  local msg_file="$INBOX_DIR/$agent/$(ts_file)_goose-${agent}_${task_id}.md"
  local lessons_file
  lessons_file=$(detect_lessons_file)

  echo "# Handoff Brief" > "$msg_file"
  echo "- from_agent: goose" >> "$msg_file"
  echo "- to_agent: $agent" >> "$msg_file"
  echo "- task_id: $task_id" >> "$msg_file"
  echo "- timestamp: $(ts)" >> "$msg_file"
  echo "- transition: ready -> executing" >> "$msg_file"
  echo "" >> "$msg_file"
  echo "## Instructions" >> "$msg_file"
  echo "Read task card at \`$task_file\` and execute." >> "$msg_file"
  echo "" >> "$msg_file"
  echo "## Required before editing" >> "$msg_file"
  echo "1. Read AGENTS.md" >> "$msg_file"
  echo "2. Read ${lessons_file:-<detected lessons file missing; write blocker if none exists>}" >> "$msg_file"
  echo "3. Read .agentops/context/PROJECT_CONTEXT.md" >> "$msg_file"
  echo "4. Read .agentops/context/REPO_MAP.md" >> "$msg_file"
  echo "5. Read .agentops/context/STATUS.md" >> "$msg_file"
  echo "6. Run: ./agentops-cli.sh verify-pin $task_id" >> "$msg_file"
  echo "" >> "$msg_file"
  echo "## When done" >> "$msg_file"
  echo "1. Run: ./agentops-cli.sh write-receipt $task_id $agent" >> "$msg_file"
  echo "2. Fill the receipt with evidence." >> "$msg_file"
  echo "3. Write completion note to .agentops/outbox/$agent/" >> "$msg_file"

  sed -i '' "s|^status:.*|status: ready|" "$task_file"
  sed -i '' "s|^owner_agent:.*|owner_agent: $agent|" "$task_file"

  log_event "handoff" "task_id" "$task_id" "from" "goose" "to" "$agent"
  echo "Dispatched $task_id to $agent"
  echo "Inbox message: $msg_file"
}

cmd_claim() {
  local task_id="$1" agent="$2"
  local task_file="$TASKS_DIR/$task_id.yaml"
  [ ! -f "$task_file" ] && echo "ERROR: $task_file not found" && exit 1

  sed -i '' "s|^status:.*|status: executing|" "$task_file"
  log_event "task_claimed" "task_id" "$task_id" "by" "$agent"
  echo "$agent claimed $task_id (status: executing)"
}

cmd_verify_pin() {
  local task_id="$1"
  local task_file="$TASKS_DIR/$task_id.yaml"
  [ ! -f "$task_file" ] && echo "ERROR: $task_file not found" && exit 1

  local errors=0
  local expected_repo expected_branch expected_base_branch expected_sha
  expected_repo=$(grep '^repo_root:' "$task_file" | sed 's/repo_root: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
  expected_branch=$(grep '^branch:' "$task_file" | sed 's/branch: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
  expected_base_branch=$(grep '^base_branch:' "$task_file" | sed 's/base_branch: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
  expected_sha=$(grep '^base_sha:' "$task_file" | sed 's/base_sha: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')

  local actual_repo actual_branch actual_base_branch actual_sha
  actual_repo=$(git rev-parse --show-toplevel)
  actual_branch=$(git rev-parse --abbrev-ref HEAD)
  actual_base_branch=$(detect_base_branch)
  actual_sha=$(git_base_sha)

  echo "Workspace pin verification for $task_id:"

  if [ "$actual_repo" = "$expected_repo" ]; then
    echo "  [OK] repo_root: $actual_repo"
  else
    echo "  [FAIL] repo_root: expected=$expected_repo actual=$actual_repo"
    errors=$((errors + 1))
  fi

  if [ "$actual_branch" = "$expected_branch" ]; then
    echo "  [OK] branch: $actual_branch"
  else
    echo "  [FAIL] branch: expected=$expected_branch actual=$actual_branch"
    errors=$((errors + 1))
  fi

  if [ "$actual_base_branch" = "$expected_base_branch" ]; then
    echo "  [OK] base_branch: $actual_base_branch"
  else
    echo "  [FAIL] base_branch: expected=$expected_base_branch actual=$actual_base_branch"
    errors=$((errors + 1))
  fi

  if [ "$actual_sha" = "$expected_sha" ]; then
    echo "  [OK] base_sha: $actual_sha"
  else
    echo "  [FAIL] base_sha: expected=$expected_sha actual=$actual_sha"
    errors=$((errors + 1))
  fi

  if [ "$errors" -gt 0 ]; then
    echo "FAIL: $errors pin mismatches. Do NOT proceed."
    log_event "pin_verification_failed" "task_id" "$task_id" "errors" "$errors"
    exit 1
  else
    echo "PASS: all pins match."
    log_event "workspace_verified" "task_id" "$task_id" "by" "cli"
  fi
}

cmd_write_receipt() {
  local task_id="$1" agent="$2"
  local rct_id="RCT-${task_id#TASK-}"
  local md_file="$RECEIPTS_DIR/$rct_id.md"
  local json_file="$RECEIPTS_DIR/$rct_id.json"

  local repo_root branch base_branch base_sha
  repo_root=$(git rev-parse --show-toplevel)
  branch=$(git rev-parse --abbrev-ref HEAD)
  base_branch=$(detect_base_branch)
  base_sha=$(git_base_sha)

  echo "# Receipt $rct_id" > "$md_file"
  echo "" >> "$md_file"
  echo "- task_id: $task_id" >> "$md_file"
  echo "- owner_agent: $agent" >> "$md_file"
  echo "- status: completed" >> "$md_file"
  echo "- repo_root: $repo_root" >> "$md_file"
  echo "- worktree_path: $(pwd)" >> "$md_file"
  echo "- branch: $branch" >> "$md_file"
  echo "- base_branch: $base_branch" >> "$md_file"
  echo "- base_sha: $base_sha" >> "$md_file"
  echo "- completed_at: $(ts)" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Summary" >> "$md_file"
  echo "TODO: describe what was done" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Files Changed" >> "$md_file"
  echo "TODO: list files" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Commands Run" >> "$md_file"
  echo "TODO: list commands and results" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Acceptance Evidence" >> "$md_file"
  echo "TODO: map each criterion to evidence" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Risks / Follow-ups" >> "$md_file"
  echo "TODO" >> "$md_file"
  echo "" >> "$md_file"
  echo "## Handoff" >> "$md_file"
  echo "- handoff_to: goose" >> "$md_file"
  echo "- next_task: TODO" >> "$md_file"

  printf '{\n  "receipt_id": "%s",\n  "task_id": "%s",\n  "owner_agent": "%s",\n  "status": "completed",\n  "repo_root": "%s",\n  "worktree_path": "%s",\n  "branch": "%s",\n  "base_branch": "%s",\n  "base_sha": "%s",\n  "timestamp": "%s",\n  "summary": "TODO",\n  "files_changed": [],\n  "commands_run": [],\n  "acceptance_evidence": [],\n  "risks": [],\n  "handoff_to": "goose",\n  "next_task": "TODO"\n}\n' \
    "$rct_id" "$task_id" "$agent" "$repo_root" "$(pwd)" "$branch" "$base_branch" "$base_sha" "$(ts)" > "$json_file"

  log_event "receipt_written" "receipt_id" "$rct_id" "task_id" "$task_id" "by" "$agent"
  echo "Created receipts:"
  echo "  $md_file"
  echo "  $json_file"
  echo "Fill in the TODO sections with actual evidence."
}

cmd_doctor() {
  echo "=== AgentOps Doctor ==="
  local errors=0 warnings=0

  echo ""
  echo "-- Required files --"
  local lessons_file
  lessons_file=$(detect_lessons_file)
  local required_files=(
    "AGENTS.md"
    ".agentops/context/PROJECT_CONTEXT.md"
    ".agentops/context/REPO_MAP.md"
    ".agentops/context/STATUS.md"
    ".agentops/context/DECISIONS_LOG.md"
    ".agentops/context/ROOM_STATE.md"
    ".agentops/context/LINEAR_STATE.md"
    ".agentops/ledger/ledger.ndjson"
  )
  if [ -n "$lessons_file" ]; then
    required_files+=("$lessons_file")
  fi
  for f in "${required_files[@]}"; do
    if [ -f "$f" ]; then
      echo "  [OK] $f"
    else
      echo "  [FAIL] MISSING: $f"
      errors=$((errors + 1))
    fi
  done
  if [ -z "$lessons_file" ]; then
    echo "  [WARN] No lessons file detected via AGENTOPS_LESSONS_FILE or common paths"
    warnings=$((warnings + 1))
  fi

  echo ""
  echo "-- Placeholder scan --"
  local placeholder_files=0
  for f in docs/agent-orchestration/*.md .agentops/context/*.md; do
    if [ -f "$f" ]; then
      local bad_lines
      bad_lines=$(grep -c '^\\\\' "$f" 2>/dev/null || true)
      if [ "${bad_lines:-0}" -gt 0 ]; then
        echo "  [FAIL] CORRUPTED: $f has $bad_lines bare-backslash placeholder lines"
        errors=$((errors + 1))
        placeholder_files=$((placeholder_files + 1))
      fi
    fi
  done
  if [ "$placeholder_files" -eq 0 ]; then
    echo "  [OK] No corrupted placeholder lines found"
  fi

  echo ""
  echo "-- TODO marker scan --"
  local todo_total=0
  for f in .agentops/receipts/RCT-*.md .agentops/receipts/RCT-*.json \
    .agentops/context/*.md .agentops/sessions/*.md docs/agent-orchestration/*.md; do
    if [ -f "$f" ]; then
      local todo_count
      todo_count=$(grep -ci 'TODO' "$f" 2>/dev/null || true)
      if [ "${todo_count:-0}" -gt 0 ]; then
        echo "  [WARN] $f has $todo_count TODO markers"
        warnings=$((warnings + 1))
        todo_total=$((todo_total + todo_count))
      fi
    fi
  done
  if [ "$todo_total" -eq 0 ]; then
    echo "  [OK] No TODO markers in receipts or context files"
  fi

  echo ""
  echo "-- Ledger consistency --"
  local completed_tasks
  completed_tasks=$(grep '"task_completed"' "$LEDGER" 2>/dev/null | grep -o '"TASK-[0-9]*"' | tr -d '"' | sort -u)
  for tid in $completed_tasks; do
    local rct_id="RCT-${tid#TASK-}"
    if [ ! -f "$RECEIPTS_DIR/$rct_id.md" ]; then
      echo "  [FAIL] $tid completed in ledger but $rct_id.md missing"
      errors=$((errors + 1))
    elif [ ! -f "$RECEIPTS_DIR/$rct_id.json" ]; then
      echo "  [FAIL] $tid completed in ledger but $rct_id.json missing"
      errors=$((errors + 1))
    else
      echo "  [OK] $tid has matching receipts"
    fi
  done

  echo ""
  echo "-- Review artifact consistency --"
  local review_events
  review_events=$(grep '"review_completed"' "$LEDGER" 2>/dev/null | grep -o '"TASK-[^"]*"' | tr -d '"' | sort -u)
  for rtid in $review_events; do
    local rct_id="RCT-${rtid#TASK-}"
    if [ ! -f "$RECEIPTS_DIR/$rct_id.md" ]; then
      echo "  [FAIL] $rtid reviewed in ledger but $rct_id.md missing"
      errors=$((errors + 1))
    else
      echo "  [OK] $rtid has review receipt"
    fi
    if [ ! -f "$TASKS_DIR/$rtid.yaml" ]; then
      echo "  [FAIL] $rtid reviewed in ledger but $rtid.yaml task card missing"
      errors=$((errors + 1))
    else
      echo "  [OK] $rtid has review task card"
    fi
  done

  echo ""
  echo "-- Temporal consistency --"
  python3 -c "
import json, sys
lines = open('$LEDGER').readlines()
events = []
for l in lines:
    try:
        events.append(json.loads(l.strip()))
    except:
        pass

# Group by task_id
from collections import defaultdict
by_task = defaultdict(list)
for e in events:
    tid = e.get('task_id', '')
    if tid:
        by_task[tid].append(e)

errors_found = 0
for tid, evts in sorted(by_task.items()):
    evts.sort(key=lambda x: x['ts'])
    prev_ts = ''
    for e in evts:
        if prev_ts and e['ts'] < prev_ts:
            print(f'  [FAIL] {tid}: {e[\"event\"]} at {e[\"ts\"]} is before previous event at {prev_ts}')
            errors_found += 1
        prev_ts = e['ts']

    # Check: review events must come after execution events
    exec_ts = [e['ts'] for e in evts if e['event'] in ('receipt_written', 'workspace_verified')]
    review_ts = [e['ts'] for e in evts if e['event'] in ('review_completed', 'review_receipt_written')]
    if exec_ts and review_ts:
        if min(review_ts) < max(exec_ts):
            print(f'  [FAIL] {tid}: review ({min(review_ts)}) before execution completed ({max(exec_ts)})')
            errors_found += 1

if errors_found == 0:
    print('  [OK] All task event chains are temporally consistent')
else:
    print(f'  {errors_found} chronology errors found')
sys.exit(errors_found)
" 2>&1
  local chrono_result=$?
  errors=$((errors + chrono_result))

  echo ""
  echo "-- Workspace pin (active tasks) --"
  local actual_repo actual_branch actual_base_branch actual_sha
  actual_repo=$(git rev-parse --show-toplevel)
  actual_branch=$(git rev-parse --abbrev-ref HEAD)
  actual_base_branch=$(detect_base_branch)
  actual_sha=$(git_base_sha)

  for tf in "$TASKS_DIR"/TASK-*.yaml; do
    [ -f "$tf" ] || continue
    local task_status
    task_status=$(grep '^status:' "$tf" | sed 's/status: *//')
    # Only check active tasks (ready, executing, review)
    case "$task_status" in
      ready|executing|review)
        local tid_name
        tid_name=$(basename "$tf" .yaml)
        local expected_repo expected_branch expected_base_branch expected_sha
        expected_repo=$(grep '^repo_root:' "$tf" | sed 's/repo_root: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
        expected_branch=$(grep '^branch:' "$tf" | sed 's/branch: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
        expected_base_branch=$(grep '^base_branch:' "$tf" | sed 's/base_branch: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')
        expected_sha=$(grep '^base_sha:' "$tf" | sed 's/base_sha: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/')

        local pin_ok=true
        if [ -n "$expected_branch" ] && [ "$actual_branch" != "$expected_branch" ]; then
          echo "  [FAIL] $tid_name: branch pin mismatch (expected=$expected_branch actual=$actual_branch)"
          errors=$((errors + 1))
          pin_ok=false
        fi
        if [ -n "$expected_base_branch" ] && [ "$actual_base_branch" != "$expected_base_branch" ]; then
          echo "  [FAIL] $tid_name: base_branch pin mismatch (expected=$expected_base_branch actual=$actual_base_branch)"
          errors=$((errors + 1))
          pin_ok=false
        fi
        if [ -n "$expected_sha" ] && [ "$actual_sha" != "$expected_sha" ]; then
          echo "  [FAIL] $tid_name: base_sha pin mismatch (expected=$expected_sha actual=$actual_sha)"
          errors=$((errors + 1))
          pin_ok=false
        fi
        if $pin_ok; then
          echo "  [OK] $tid_name: workspace pins match"
        fi
        ;;
      draft)
        # Draft tasks may have empty pins — skip
        ;;
      *)
        ;;
    esac
  done
  # If no active tasks, just show current workspace
  echo "  Current: repo=$actual_repo branch=$actual_branch base_branch=$actual_base_branch base_sha=$actual_sha"

  echo ""
  echo "-- Linear fallback consistency --"
  if [ -f ".agentops/context/LINEAR_STATE.md" ] && grep -q 'access_status: NO_ACCESS' ".agentops/context/LINEAR_STATE.md"; then
    if ls .agentops/outbox/goose/*LINEAR-FOLLOWUP*.md >/dev/null 2>&1; then
      echo "  [OK] Linear follow-up artifact exists for no-access mode"
    else
      echo "  [FAIL] LINEAR_STATE reports NO_ACCESS but no Goose follow-up artifact exists"
      errors=$((errors + 1))
    fi
  else
    echo "  [OK] Linear fallback artifact not required"
  fi

  echo ""
  echo "-- HQ defaults --"
  if [ -d "$HQ_ROOT" ]; then
    if [ -f "$HQ_ROOT/projects.json" ]; then
      echo "  [OK] HQ registry present at $HQ_ROOT/projects.json"
    else
      echo "  [WARN] HQ exists but projects.json is missing"
      warnings=$((warnings + 1))
    fi
  else
    echo "  [WARN] HQ not initialized yet at $HQ_ROOT"
    warnings=$((warnings + 1))
  fi

  echo ""
  echo "-- Git tracking --"
  local untracked
  untracked=$(git status --porcelain .agentops/ docs/agent-orchestration/ agentops-cli.sh 2>/dev/null | grep -c '^??' || true)
  if [ "${untracked:-0}" -gt 0 ]; then
    echo "  [WARN] $untracked untracked rollout paths (run: git add .agentops/ docs/agent-orchestration/ agentops-cli.sh)"
    warnings=$((warnings + 1))
  else
    echo "  [OK] All rollout files tracked"
  fi

  echo ""
  echo "=== DOCTOR SUMMARY ==="
  echo "Errors: $errors"
  echo "Warnings: $warnings"
  if [ "$errors" -gt 0 ]; then
    echo "RESULT: FAIL -- fix $errors errors before proceeding"
    exit 1
  elif [ "$warnings" -gt 0 ]; then
    echo "RESULT: PASS with $warnings warnings"
    exit 0
  else
    echo "RESULT: CLEAN"
    exit 0
  fi
}

cmd_status() {
  cat "$AGENTOPS_DIR/context/STATUS.md"
}

cmd_ledger() {
  local n="${1:-20}"
  tail -n "$n" "$LEDGER"
}

cmd_next() {
  echo "Ready tasks:"
  grep -l 'status: ready' "$TASKS_DIR"/*.yaml 2>/dev/null || echo "  (none)"
  echo ""
  echo "Draft tasks:"
  grep -l 'status: draft' "$TASKS_DIR"/*.yaml 2>/dev/null || echo "  (none)"
}

cmd_init_hq() {
  python3 "$STATE_TOOL" --hq-root "$HQ_ROOT" init-hq
}

cmd_bootstrap() {
  python3 "$STATE_TOOL" --hq-root "$HQ_ROOT" bootstrap
}

cmd_reset_session() {
  local tool="$1" label="$2" intent="${3:-}"
  python3 "$STATE_TOOL" --hq-root "$HQ_ROOT" reset-session "$tool" "$label" --intent "$intent"
}

cmd_reset_room() {
  local by="${1:-cli}" reason="${2:-manual}"
  python3 "$STATE_TOOL" --hq-root "$HQ_ROOT" reset-room --by "$by" --reason "$reason"
}

cmd_weekly_recap() {
  python3 "$STATE_TOOL" --hq-root "$HQ_ROOT" weekly-recap
}

case "${1:-}" in
  init-hq)       cmd_init_hq ;;
  bootstrap)     cmd_bootstrap ;;
  huddle-up)     cmd_reset_room "${2:-cli}" "${3:-huddle-up}" ;;
  session-huddle) cmd_reset_session "${2:?tool required}" "${3:?label required}" "${4:-}" ;;
  create-task)   cmd_create_task ;;
  dispatch)      cmd_dispatch "${2:?task_id required}" "${3:?agent required}" ;;
  claim)         cmd_claim "${2:?task_id required}" "${3:?agent required}" ;;
  verify-pin)    cmd_verify_pin "${2:?task_id required}" ;;
  write-receipt) cmd_write_receipt "${2:?task_id required}" "${3:?agent required}" ;;
  reset-session) cmd_reset_session "${2:?tool required}" "${3:?label required}" "${4:-}" ;;
  reset-room)    cmd_reset_room "${2:-cli}" "${3:-manual}" ;;
  weekly-recap)  cmd_weekly_recap ;;
  doctor)        cmd_doctor ;;
  status)        cmd_status ;;
  ledger)        cmd_ledger "${2:-20}" ;;
  next)          cmd_next ;;
  *)             usage ;;
esac
