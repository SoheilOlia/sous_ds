---
name: sous-ds 2.0 — consolidation receipt
date: 2026-05-01
status: spec landed; implementation pending in v0.7.0
mode: swarm (5 research agents) + solo synthesis
runtime: runtime-backed (real subagent dispatch)
---

# Receipt — sous-ds 2.0 consolidation

## What ran

A swarm of five research agents, dispatched in parallel via the Explore subagent, mined nine external design-skill sources and returned tight extraction reports. A synthesis pass cross-referenced those reports with a four-screenshot ground-truth review of a B+/D− test page produced by sous-ds 1.0, then wrote the 2.0 contract.

### Sources mined

| Source | Skill / file |
|---|---|
| `Donsoleil/awesome-design-md` | DESIGN.md template |
| `Donsoleil/awesome-design-patterns` | Pattern taxonomy |
| `anthropics/skills` | `frontend-design` |
| `vercel-labs/agent-skills` | `web-design-guidelines` |
| `google-labs-code/stitch-skills` | `design-md` |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` |
| `leonxlnx/taste-skill` | `design-taste-frontend` |
| `github/awesome-copilot` | `documentation-writer` |
| `remotion-dev/skills` | `remotion-best-practices` |

### Ground truth

The screenshots of a 1.0-generated "PRD-to-verified-handoff" pipeline status dashboard, plus a direct read of all 1.0 contract files (`SKILL.md`, `DESIGN.md`, `TASTE_LOG.md`, `quality-evaluator.md`, `AGENTS.md`, `ANIMATION_RULES.md`, `README.md`), 18 component sources in `components/`.

## Files written

| Path | Lines | Purpose |
|---|---|---|
| [`docs/specs/sous-ds-v2.md`](./sous-ds-v2.md) | 308 | Canonical 2.0 spec — gap analysis, four-layer architecture, new refusals, migration path |
| [`docs/specs/sous-ds-v2-composition-recipes.md`](./sous-ds-v2-composition-recipes.md) | 259 | Initial six recipes with JSX skeletons, microcopy templates, density quotas, forbidden substitutes |
| [`docs/specs/sous-ds-v2-voice.md`](./sous-ds-v2-voice.md) | 230 | Voice contract — seven canonical voice rules, per-recipe microcopy, banned-phrase catalogue |
| [`docs/specs/sous-ds-v2-receipt.md`](./sous-ds-v2-receipt.md) | this file | This receipt |

## Files updated (additive only — no 1.0 content removed)

| Path | What changed |
|---|---|
| [`SKILL.md`](../../SKILL.md) | Added 2.0 marker to header; expanded `description`; added v2 docs to read order; added 9 new refusal rows; renamed cell-level patterns; added Composition Recipes section, Intent → Component decision tree, Voice Contract summary, Design Dials, Pre-composition checklist; added 6 new prompt → action mappings |
| [`TASTE_LOG.md`](../../TASTE_LOG.md) | Bumped header version to "v2.0 — composition contract"; appended ENTRY 010 documenting source-by-source extraction, decisions taken, decisions explicitly rejected (Tailwind, Framer Motion, font expansion, spring physics, 67-style taxonomy) |
| [`quality-evaluator.md`](../../quality-evaluator.md) | Updated system prompt to reference v2 docs; added `TY08`, `LY04`, `LY05`, `CO07`–`CO12` (9 new rules); added Composition / 2.0 section explaining how to audit recipes/pills/metrics/voice from screenshots |

## Files explicitly NOT changed

- `DESIGN.md` — token contract unchanged. 2.0 is additive on layout/composition; no token edits needed.
- `AGENTS.md` — code-level rules unchanged.
- `ANIMATION_RULES.md` — motion contract unchanged.
- `refusals.json` — schema unchanged; 9 new entries pending in v0.7.0 implementation work.
- `tokens.css` — unchanged.
- `components/` — no component edits; 4 roadmap promotions land in v0.7.x as separate work.

## Gap → fix mapping (load-bearing audit)

This is the proof that the spec is sized correctly against the failing case study. Every D− failure on the 1.0 page maps to a specific 2.0 layer.

| Failure (1.0 screenshot) | 2.0 fix | Evidence |
|---|---|---|
| Hero h1 in serif while body in mono | `R-TYPE-004` / `TY08` — fallback must be Geist Mono Bold | [`docs/specs/sous-ds-v2.md`](./sous-ds-v2.md) §"New refusals" |
| Same `eyebrow + h1 + body + grid-of-cards` rhythm 7 times | `R-COMPOSE-002` (no recipe twice) + `R-COMPOSE-004` (≥3 recipes) | [`docs/specs/sous-ds-v2-composition-recipes.md`](./sous-ds-v2-composition-recipes.md) catalogue |
| Pill walls by section 4 | `R-COMPOSE-003` — max 3 pills/card, 8 pills/section | [`SKILL.md`](../../SKILL.md) refusal table |
| 4-of-18 components used; pipeline rendered as flat card grid | Intent → Component decision tree + `R-COMPOSE-001` | [`SKILL.md`](../../SKILL.md) §"Intent → component decision tree" |
| `MetricStat` grid mixing `10`, `M2`, `5`, `2` (no shared unit) | `R-METRIC-001` — eyebrow must name shared unit/axis | [`SKILL.md`](../../SKILL.md) refusal table |
| Every card ends `Evidence: X. Next: Y.` | `R-VOICE-002` — no adjacent micro-template repetition | [`docs/specs/sous-ds-v2-voice.md`](./sous-ds-v2-voice.md) §V6 |
| File paths in body prose (`consent_orders/docs/receipts/...`) | `R-VOICE-001` — paths in code/ToolCall/footnotes only | [`docs/specs/sous-ds-v2-voice.md`](./sous-ds-v2-voice.md) §V4 |
| "We are building," "things are stricter," "main-branch truth" | `R-VOICE-003` — banned-phrase catalogue with substitutes | [`docs/specs/sous-ds-v2-voice.md`](./sous-ds-v2-voice.md) §V7 |
| "Where we are going" / "What we are building" as h1 | Voice contract V7 (banned editorial frames as h1) | [`docs/specs/sous-ds-v2-voice.md`](./sous-ds-v2-voice.md) §"Headline construction" |
| Same page every time (no variance lever) | Design Dials — DENSITY / RHYTHM / VOICE | [`docs/specs/sous-ds-v2.md`](./sous-ds-v2.md) §"Layer 6" |

## What's claimed and what's not

**Claimed (truth layer: spec on working tree):**
- The 2.0 architecture is named, written, and committed to disk under `docs/specs/`.
- SKILL.md, TASTE_LOG.md, quality-evaluator.md carry the v2 layer.
- The contract is fully backwards compatible with 1.0 — no token changes, no component renames, no refusal removals.

**Not claimed:**
- That `refusals.json` carries the 9 new rule patterns. (Pending v0.7.0 implementation.)
- That `scripts/lint.mjs` enforces the new rules. (Pending v0.7.0 implementation.)
- That the 1.0 case-study page has been re-prompted against the 2.0 SKILL to verify the fix. (This is the v0.7.0 verification target — would need a re-run of the original prompt with the updated SKILL loaded.)
- That the four roadmap component promotions (`<AgentStream>`, `<Citation>`, `<Transcript>`, `<TokenMeter>`) are built. (Spec only; build is v0.7.x.)
- That `examples/pipeline-status-2.0.html` exists. (Built next, alongside the four component graduations.)
- That a real prototype has tested the recipes against actual content. (The recipes are spec-backed by JSX skeletons; live verification belongs in v0.7.0.)

## Next actions (ranked)

1. **Cut v0.7.0 release as "composition contract."** Bumps SKILL.md / DESIGN.md voice / quality-evaluator without component changes. Low-risk, high-leverage — gets the new rules into AI assistants via `npx sous-ds init`.
2. **Re-prompt the 1.0 case-study page against v2 SKILL.md.** Side-by-side render becomes `examples/pipeline-status-2.0.html` and the canonical teaching artifact. This is also the verification of the spec.
3. **Add the 9 new rule patterns to `refusals.json`** so the lint script enforces them.
4. **Build `<AgentStream>` and `<Citation>`** as v0.7.x patches. They unblock the AgentLog and ReceiptStack recipes' best forms.
5. **Build `<Transcript>` and `<TokenMeter>`** as v0.8 patches.
6. **Mine remaining ENTRY-007-pending VoltAgent reference DESIGN.md files** for any patterns the swarm missed — these were marked pending in 1.0 and should be cleared to close the source-survey loop.
7. **Trial `<DiffBlock>` and `<ConfidenceBar>` as composables** before deciding on graduation.

## Sources verified before recommendation

The four sources I had high confidence in (`anthropics/skills`, `vercel-labs/agent-skills`, `github/awesome-copilot`, `Donsoleil/*`) returned full extraction reports. The five with medium confidence (`google-labs-code/stitch-skills`, `nextlevelbuilder/ui-ux-pro-max-skill`, `leonxlnx/taste-skill`, `remotion-dev/skills`) all returned material — every source contributed at least one extracted artifact to the 2.0 spec. No source was empty/dead.

## Decisions explicitly rejected from sources

These deserve a paper trail because they're plausible adoptions that I declined:

- **Tailwind utilities and Framer Motion adoption** (from `vercel-labs` + `taste-skill`): incompatible with sous-ds's zero-dep CSS + RAF motion primitive, which is load-bearing for portability across React/Vite/Astro/RSC/HTML/Figma Make.
- **Font expansion to Geist / Outfit / Cabinet Grotesk / Satoshi** (from `taste-skill`): conflicts with the canonical Cash Sans + Geist + Geist Mono stack. The principle (no Inter) was already in 1.0.
- **Spring physics defaults `stiffness: 100, damping: 20`** (from `taste-skill`): the motion primitive is dependency-free; `var(--ds-ease-out)` (`cubic-bezier(0.16, 1, 0.3, 1)`) stays canonical.
- **67-style taxonomy** (from `ui-ux-pro-max`): over-constrains. sous-ds is one style; the dials parameterize within it.
- **Centered-hero ban as universal rule** (from `taste-skill`): too aggressive — sous-ds's editorial display headings benefit from center alignment in some recipes. Adopted as a per-recipe rule, not a global rule.
- **Diátaxis as the page-level taxonomy** (from `documentation-writer`): four-quadrant model is for documentation systems, not interface composition. Adopted as a microcopy framing tool only.

## Mode + runtime honesty

- **Mode:** swarm for research (5 agents in parallel), solo for synthesis.
- **Runtime:** runtime-backed (real Agent dispatch via Explore subagents). No prompt-only role passes.
- **Confidence:** high on the spec's correctness against the 1.0 contract; medium on the spec's effectiveness against re-prompted output (verification belongs in v0.7.0).

## Verification

The 1.0 page is the verification fixture. The 2.0 spec is correct iff re-prompting Claude with the updated `SKILL.md` produces a page that:

- uses ≥5 of the six initial recipes
- uses ≥8 distinct components from the 18 available
- renders the pipeline as `<DotTimeline>`, not a card grid
- has zero file paths in body prose
- uses zero status-meeting phrasings ("we are building," "things are stricter," etc.)
- displays h1s in Geist Mono Bold (Cash Sans likely unavailable in test env)
- shows ≤3 pills per card and ≤8 per section
- has zero adjacent sections sharing micro-template

Until that re-prompt happens, the spec is **landed and load-bearing on disk** but **not yet proven against output**.
