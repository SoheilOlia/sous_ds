# Agent Orchestration OS

This repo-local OS turns the repository into the shared brain for Goose, Codex, and Cursor.
The handoff no longer lives in your clipboard; it lives in files, receipts, ledger events, and reset reports.

In v1, human involvement is reduced to:
- session initiation
- reset approval or sanity checks
- explicit approval gates

Full unattended wake-up remains a later follow-up.

## Two layers

### Local runtime state
Each repo gets a local `.agentops/` with:
- `context/` for project, room, status, and Linear state
- `context/ROOM_BRIEF.md` for the plain-English mission of the room
- `tasks/`, `inbox/`, `outbox/`, `receipts/`, `ledger/`, `approvals/`
- `sessions/` for tab or tool-level resets

### Global HQ
`~/.agentops-hq/` stores reusable defaults and cross-project rollups:
- templates and install defaults
- command specs
- project registry
- weekly recaps

## The simple human verbs

### `Session Huddle`
Use this for one Claude/Cursor/Codex tab or window.
It writes a session state file that answers:
- what this session was trying to do
- what is real in code
- what is only planned
- whether to `keep`, `handoff`, or `close`

Command:
- `agentops session-huddle <tool> <label> "<intent>"`

### `Huddle Up`
Use this for the whole repo or project.
It writes:
- `.agentops/context/ROOM_STATE.md`
- `.agentops/context/LINEAR_STATE.md`

It reconciles:
- git truth
- receipts
- lessons
- markdown status files
- active tasks
- Linear truth when access exists

It also includes a plain-English mission section:
- what problem this room is solving
- what the current focus is
- how the room contributes to the bigger project or program

The preferred persistent source for that narrative is:
- `.agentops/context/ROOM_BRIEF.md`

If the current agent cannot access Linear, it must write a Goose follow-up artifact instead of pretending the tickets are current.

Command:
- `agentops huddle-up`

### `Weekly Recap`
Use this at the end of the week.
It rolls up tracked projects into one short summary covering:
- highest-impact work
- commit and receipt counts
- progress toward the bigger picture
- biggest learning
- next focus

### `Start Work`
Only do this after `Huddle Up` has reconciled the project.

## Roles
- **Goose**: orchestrator and evidence compiler, not sole narrator
- **Codex**: executor and receipt writer
- **Cursor/Claude Code**: reviewer in v1, manual session start

## Proof policy
Goose should classify claims as:
- `VERIFIED`
- `INFERRED`
- `UNKNOWN`

Room resets and summaries should always separate those three buckets.

## Command surface
- global first-run entry point: `agentops huddle-up`
- `./agentops-cli.sh init-hq`
- `./agentops-cli.sh bootstrap`
- `./agentops-cli.sh session-huddle <tool> <label> [intent]`
- `./agentops-cli.sh huddle-up [by] [reason]`
- `./agentops-cli.sh weekly-recap`
- compatibility aliases still supported: `reset-session`, `reset-room`
- `./agentops-cli.sh create-task`
- `./agentops-cli.sh dispatch <TASK-ID> <agent>`
- `./agentops-cli.sh claim <TASK-ID> <agent>`
- `./agentops-cli.sh verify-pin <TASK-ID>`
- `./agentops-cli.sh write-receipt <TASK-ID> <agent>`
- `./agentops-cli.sh doctor`

## New-project install
1. Run `./agentops-cli.sh init-hq` once on a repo that already has the OS.
2. Add `~/.local/bin` to your shell PATH if it is not already there.
3. In any new repo, run `agentops huddle-up`.
4. The global wrapper will auto-install the local OS on first use, then generate the first room snapshot.

If you prefer the explicit path, this works too:
- `~/.agentops-hq/install.sh /path/to/repo`

## Consent Orders rollout note
This branch is the hardened rollout worktree for the Consent Orders repo.
The current validated worktree is:
- repo root: `/Users/soheil/Automating_Conset_Orders`
- rollout worktree: `/Users/soheil/Automating_Conset_Orders/.agentops-worktrees/agentops-rollout`
- branch: `agentops/handoff-os-rollout`
