# Linear Follow-up Request

- generated_at: 2026-04-25T06:58:29Z
- requested_by: cli
- repo_root: /Users/soheil/Sous_DS
- team_key_guess: unknown
- reason: Reset Room could not access Linear directly.

## What Goose needs to verify
- Which tickets are currently active, done, or stale for this repo.
- Which tickets should be updated based on the latest receipts and markdown truth.
- Which tickets need a comment linking the current code or receipt evidence.

## Suggested follow-up prompt
Read `.agentops/context/ROOM_STATE.md`, `.agentops/context/LINEAR_STATE.md`, the latest receipts, and the latest markdown status files.
Then verify the relevant Linear issues, update stale statuses, add missing comments, and write back exact ticket URLs or identifiers.

## Why this exists
LINEAR_API_KEY missing or team key could not be detected.
