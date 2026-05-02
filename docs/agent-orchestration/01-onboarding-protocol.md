# Onboarding Protocol

## First required reads (in order)
1. `AGENTS.md`
2. detected lessons file for this repo
3. `.agentops/context/PROJECT_CONTEXT.md`
4. `.agentops/context/REPO_MAP.md`
5. `.agentops/context/ROOM_BRIEF.md`
6. `.agentops/context/STATUS.md`
7. `.agentops/context/ROOM_STATE.md`
8. `.agentops/context/LINEAR_STATE.md`
9. tail of `.agentops/ledger/ledger.ndjson`
10. assigned task card or session state

If the repo does not have `.agentops/`, use the global front door:

```bash
agentops huddle-up
```

That command should auto-install the local OS before generating the room snapshot.

## Workspace pin verification
Run these commands and compare against the task card:

```bash
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git symbolic-ref refs/remotes/origin/HEAD || true
git status --porcelain
```

Then verify:
- `repo_root`
- `branch`
- `base_branch`
- `base_sha`

If any mismatch exists, stop and write a blocker note to `.agentops/outbox/<agent>/`.

## Session reset contract
Before doing substantial work in a fresh tab or tool session, run:

```bash
agentops session-huddle <tool> <label> "<intent>"
```

That file should answer:
- what the session thought it was doing
- what is real
- what is only planned
- whether the session should stay open

## Room reset contract
Before planning or assigning work, run:

```bash
agentops huddle-up
```

That reset must reconcile:
- repo truth
- receipts
- lessons
- markdown status files
- active tasks
- Linear truth or an explicit Goose follow-up artifact

## Agent bootstrap checklist
- [ ] I read AGENTS.md
- [ ] I read the repo lessons file
- [ ] I read `.agentops/context/PROJECT_CONTEXT.md`
- [ ] I read `.agentops/context/REPO_MAP.md`
- [ ] I read `.agentops/context/ROOM_BRIEF.md`
- [ ] I read `.agentops/context/STATUS.md`
- [ ] I read `.agentops/context/ROOM_STATE.md`
- [ ] I read `.agentops/context/LINEAR_STATE.md`
- [ ] I checked recent ledger entries
- [ ] I verified workspace pins
- [ ] I understand whether I am working from a task card or a session reset
- [ ] I know what proof I must leave behind

## Cold-start recovery
A fresh session can recover with no human fill-in by:
1. Running `./agentops-cli.sh doctor`
2. Running `agentops huddle-up`
3. Running `agentops session-huddle <tool> <label> "<intent>"`
4. Reading the generated room and session state files
