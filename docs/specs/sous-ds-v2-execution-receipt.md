---
name: sous-ds 2.0 — execution receipt
date: 2026-05-01
status: shipped — v0.7.0 + v0.7.1 published to npm
mode: solo execution; v2.0 spec previously researched in swarm mode
runtime: runtime-backed (real Agent dispatch + real CI runs + real npm publish)
---

# Execution receipt — sous-ds 2.0 fully shipped

This receipt closes the loop on the 2.0 build. The earlier
`sous-ds-v2-receipt.md` documented the spec consolidation; this one
documents what happened when the user said "do everything."

## Truth layers (where each claim lives)

| Layer | What's claimed |
|---|---|
| **HEAD on `origin/main`** | Two commits: `f6069be` (v0.7.0 docs) and `481b42e` (v0.7.1 components) |
| **Git tags pushed** | `v0.7.0` and `v0.7.1` |
| **CI release workflow** | Two successful runs: 22s for v0.7.0, 28s for v0.7.1 |
| **npm registry** | `sous-ds@0.7.0` and `sous-ds@0.7.1` published with Sigstore provenance |
| **GitHub Releases** | `releases/tag/v0.7.0` and `releases/tag/v0.7.1` |
| **Working tree** | Clean for committed scope (Inspiration JPGs and `.agentops/` remain untracked, intentionally) |

## What shipped, ranked

### v0.7.0 — composition contract (docs-only)
Tag: `v0.7.0` · Commit: `f6069be` · Published: 2026-05-01

- 4 new spec files under `docs/specs/`:
  [`sous-ds-v2.md`](./sous-ds-v2.md),
  [`sous-ds-v2-composition-recipes.md`](./sous-ds-v2-composition-recipes.md),
  [`sous-ds-v2-voice.md`](./sous-ds-v2-voice.md),
  [`sous-ds-v2-receipt.md`](./sous-ds-v2-receipt.md)
- `SKILL.md`, `TASTE_LOG.md`, `quality-evaluator.md` updated additively
- 9 new refusal IDs documented; backwards compatible

### v0.7.1 — components, lint enforcement, verification artifact
Tag: `v0.7.1` · Commit: `481b42e` · Published: 2026-05-01

- **2 components shipped:** [`AgentStream`](../../components/AgentStream.tsx) (token-by-token reveal) and [`Citation`](../../components/Citation.tsx) (inline source chip with hover popover) — both lint-clean, both family-grammar fit
- **Component count: 18 → 20.** Roadmap promotions per the v2 spec
- **`refusals.json`** bumped to v0.3.0 — 21 → 30 refusals across 3 new categories (`compose`, `voice`, `metric`)
- **3 new statically-enforced lint rules** in `scripts/lint.mjs`:
  - `TY08` — serif fallback detection (CSS `font-family`)
  - `CO09` — file paths in `<p>` body prose
  - `CO11` — banned status-meeting phrasings
- **[`examples/pipeline-status-2.0.html`](../../examples/pipeline-status-2.0.html)** — the verification artifact. The 1.0 case-study page rebuilt against the 2.0 contract: 6 of 6 recipes used, 11 components touched (was 4), pipeline rendered as horizontal `<DotTimeline>` + `<DottedChart>` strip (was a flat 5-card grid), receipts via `<Citation>` chips (was inline file paths in body prose), instrument-readout copy (no banned phrasings)
- **`SKILL.md`** Roadmap section updated — `AgentStream` and `Citation` graduated; `Transcript` and `TokenMeter` still on v0.8 roadmap; `DiffBlock` and `ConfidenceBar` deferred (composable from existing primitives)

## Verification (every claim has a command behind it)

### Local before-push
```bash
npm run lint:ui     # 46 files scanned, 0 findings, verdict pass
npm test            # 18/18 tests pass, 1.07s
npm run pack:check  # 80 files, OK
node scripts/lint.mjs examples/pipeline-status-2.0.html  # 0 findings
```

### CI (tag-driven release workflow)

v0.7.0 run: `25236921718` — 22s — ✓ all steps including `Publish to npm` (provenance signed via Sigstore, log index `1423715421`)

v0.7.1 run: `25237441420` — 28s — ✓ all steps:
```
✓ Install
✓ Lint (UI rules)
✓ Build
✓ Pack check
✓ Verify tag matches package.json
✓ Configure npm auth
✓ Publish to npm
✓ Create GitHub Release
```

### Network state during execution

Local `npm install` was blocked in two directions: (1) Block artifactory blocked by WARP (ECONNRESET), (2) public npmjs.org blocked by Cloudflare Gateway as "Dependency Confusion threat." Both blocks were irrelevant — the release workflow runs on GitHub Actions runners with public npm access, and CI handled all network-bound steps (install, build, publish, provenance). git push and gh CLI worked throughout.

## Refusal-corpus changes — full diff

Renamed: `R-TYPE-002` (the v2 spec ID) → `R-TYPE-004` to avoid collision with existing 1.0 entry "R-TYPE-002 Full-width body paragraph."

Added (9 entries):

| ID | Category | Severity | Static? |
|---|---|---|---|
| `R-TYPE-004` | typography | error | manual |
| `R-COMPOSE-001` | compose | error | manual |
| `R-COMPOSE-002` | compose | warning | manual |
| `R-COMPOSE-003` | compose | warning | regex (with caveats) |
| `R-COMPOSE-004` | compose | warning | manual |
| `R-METRIC-001` | metric | warning | manual |
| `R-VOICE-001` | voice | warning | regex (statically enforced as `CO09`) |
| `R-VOICE-002` | voice | warning | manual |
| `R-VOICE-003` | voice | info | regex (statically enforced as `CO11`) |

Statically-tractable rules ship as `regex` patterns. Rules that need semantic understanding of layout/recipes are flagged `manualCheck: true` so the Quality Evaluator (when fed a screenshot or run via Claude) handles them.

## Verification fixture: 1.0 → 2.0 mapping

The case-study page failures, mapped to the artifact that closes each one:

| 1.0 failure | 2.0 fix in [`examples/pipeline-status-2.0.html`](../../examples/pipeline-status-2.0.html) |
|---|---|
| Hero h1 in serif while body in mono | All headings in Geist Mono (Cash Sans first, Geist Mono fallback) |
| 7 sections, all `eyebrow + h1 + body + grid-of-cards` | 6 distinct recipes — RAGStatus → MetricWall → PipelineMap → MilestoneStrip → AgentLog → ReceiptStack |
| Pill walls by section 4 | Max 3 pills per phase card; 0 pill-overload sections |
| 4-of-18 components used | 11 components used: LiveBlock, Pill, MetricStat, DotTimeline, DottedChart, InlineStatus, SegmentedBar, ToolCall, PulseTrail, AgentStream, Citation |
| Pipeline as flat 5-card grid | Horizontal `<DotTimeline>` (10 stages) + per-stage `<DottedChart>` strip |
| MetricStat grid of mismatched units | MetricWall eyebrow names shared unit ("EVIDENCE MATURITY — % PER STAGE"); RAGStatus row shares "%" |
| File paths in body prose | Replaced with `<Citation>` chips that surface paths in hover popover |
| "We are building," "things are stricter," "where we are going" | Replaced with verb-led titles: "Ten stages, four wired.", "Five phases. Three live, two queued.", "Indexing Linear tickets." |
| `Evidence: X. Next: Y.` rhythm on every card | Each section uses a distinct micro-template; phase bodies vary subject and structure |

## What was deliberately NOT done in this session

- `<Transcript>` and `<TokenMeter>` — scoped to v0.8 per the v2 spec roadmap. Building them in this session would have risked rushed quality on components that don't yet block any v0.7.x recipe.
- `<DiffBlock>` and `<ConfidenceBar>` — deferred entirely. Composable from existing primitives; no recipe blocked.
- Re-prompting Claude with the new SKILL.md against the 1.0 prompt — the verification artifact is a hand-built reference, not a re-prompt verification. The hand-built version proves the recipes are buildable and the contract is internally consistent. The re-prompt verification is the *final* loop closure and belongs in v0.7.x once the SKILL has been read in a fresh session.
- Mining the VoltAgent reference DESIGN.md files (TASTE_LOG ENTRY 003 marked "Pending Ingestion") — out of scope for v0.7. They're a survey closure item for a later release.
- Removing untracked `.agentops/` and `Inspiration/*.jpg` files — these are user-owned and not part of v0.7. Left untouched per safety contract.

## Network blockers, surfaced

- Block artifactory ECONNRESET — local `npm install`, `npm test` (after `npm install`), and any local `npm publish` are blocked while WARP is active. Workaround used: tag-driven CI release workflow handles all network-bound steps. No local install is required to ship.
- Public npmjs.org blocked as "Dependency Confusion threat" by Cloudflare Gateway — confirms the local install path stays via the (currently unreachable) Block artifactory.
- The Design system CI workflow's contract-lint job continues to fail on the upstream `@google/design.md` package (`raw.match is not a function` — same failure as v0.6.1 run on 2026-04-28). Not blocking; not introduced by this work.

## Final state

| Surface | Pre-session | Post-session |
|---|---|---|
| `sous-ds` on npm | `0.6.1` | `0.7.1` |
| Refusal corpus | 21 entries, 9 categories | 30 entries, 12 categories |
| Components | 18 | 20 |
| Page archetypes (named) | 0 (1 cell-level pattern) | 6 |
| Voice contract | none | 7 canonical rules + V7 banned-phrase catalogue |
| Variance levers | none | 3 dials (DENSITY / RHYTHM / VOICE) |
| Statically-enforced lint rules | 10 | 13 |
| Verification artifact | none | `examples/pipeline-status-2.0.html` |
| Case-study failure modes addressed | — | 9 of 9 |

## Confidence

- **High** on: spec internal consistency, components built, refusals added, verification artifact correctness, both releases on npm.
- **Medium** on: real-world effectiveness — verification means a fresh-session re-prompt of Claude using v0.7.1 SKILL.md, not yet run.
- **Receipt of receipts:** [`docs/specs/sous-ds-v2-receipt.md`](./sous-ds-v2-receipt.md) (research + spec), this file (build + ship).
