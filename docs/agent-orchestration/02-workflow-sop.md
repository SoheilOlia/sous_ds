# SOP — Reset, Assign, Review

## Hard constraints
- No free-form handoffs; use task card + inbox/outbox messages.
- One task, one owner, one writable scope.
- Every state transition logged in `.agentops/ledger/ledger.ndjson`.
- Every completion requires Markdown + JSON receipt.
- Branch/base SHA verification is mandatory before edits.
- Review is a first-class artifact: `TASK-####-REVIEW.yaml` + `RCT-####-REVIEW.md` + `RCT-####-REVIEW.json`.
- Goose must distinguish `VERIFIED`, `INFERRED`, and `UNKNOWN`.
- If Linear is unavailable, the agent must write a Goose follow-up artifact.

## State machine
```
draft -> ready -> executing -> review -> awaiting_approval -> approved -> completed -> archived
```

## Approval gate policy
Approval is required for:
- schema/data migration changes
- production config/policy changes
- any action marked `approval_gate.required: true` in the task card

## Phase 0 — Huddle first
Before assigning new work:
1. Run `agentops huddle-up`
2. If a tab or tool session is messy, run `agentops session-huddle <tool> <label> "<intent>"`
3. Read the generated `ROOM_STATE.md` and `LINEAR_STATE.md`
4. Only then create or dispatch the next task

This is how the room gets back in order before work starts.

## Receipt policy
For each task AND each review, write both:
- `.agentops/receipts/RCT-####.md` (human-readable)
- `.agentops/receipts/RCT-####.json` (machine-readable)

JSON receipt minimum keys:
```json
{
  "receipt_id": "RCT-####",
  "task_id": "TASK-####",
  "owner_agent": "<agent>",
  "status": "completed|failed|blocked",
  "repo_root": "/Users/soheil/Automating_Conset_Orders",
  "worktree_path": "<path>",
  "branch": "<branch>",
  "base_branch": "main",
  "base_sha": "<sha>",
  "files_changed": [],
  "commands_run": [],
  "acceptance_evidence": [],
  "risks": [],
  "handoff_to": "<agent>",
  "next_task": "TASK-####",
  "timestamp": "<ISO8601>"
}
```

## Review artifacts
When a task goes through review, the reviewer must produce:
- `.agentops/tasks/TASK-####-REVIEW.yaml` (review task card)
- `.agentops/receipts/RCT-####-REVIEW.md`
- `.agentops/receipts/RCT-####-REVIEW.json`

The review receipt must include:
- `approved_for_merge: true|false`
- evidence for each acceptance criterion
- scope violation check result
- required fixes (if not approved)

## Cursor autonomy status (honest assessment)
Cursor/Claude Code cannot currently run unattended from repo state alone.
It requires a human to open the session and paste the system prompt.
Therefore:
- **v1 (now):** Goose → Codex is autonomous. Cursor is manual review.
- **v2 (tracked):** Full Cursor automation via `.cursor/rules` or MCP bridge.
- A follow-up task is tracked for v2.

## Linear truth rule
- Linear is part of `Huddle Up`, not an afterthought.
- If the current agent can read Linear, it should write a verified `LINEAR_STATE.md`.
- If it cannot, it must write a follow-up artifact for Goose under `.agentops/outbox/goose/`.
- Goose then owns the ticket verification and update step.

## Weekly recap rule
At least once per week, generate:

```bash
./agentops-cli.sh weekly-recap
```

That recap lives in `~/.agentops-hq/weekly/` and should summarize:
- highest-impact work
- commit and receipt counts
- bigger-picture progress
- one key learning
- next week's focus

## End-to-end flow
1. Goose runs `reset-room` and reads `ROOM_STATE.md`.
2. If needed, the working agent runs `reset-session`.
3. Goose creates `TASK-####.yaml` with owner `codex`.
4. Goose writes handoff to `.agentops/inbox/codex/`.
5. Codex reads inbox, verifies workspace pin, executes task.
6. Codex writes outbox + receipt + ledger update.
7. Goose creates `TASK-####-REVIEW.yaml` with owner `cursor`.
8. Goose writes review handoff to `.agentops/inbox/cursor/`.
9. Cursor validates and writes review receipt.
10. If approval gate is required, Goose creates `APR-####.md`.
11. Human responds in `APR-####.response.md`.
12. Goose marks task completed, archives, updates STATUS.
