---
name: sous-ds 2.0 spec
status: draft
date: 2026-05-01
owner: design-system
supersedes: none (additive on top of 1.0)
---

# sous-ds 2.0 — from refusal contract to composition contract

## TL;DR

sous-ds 1.0 is a **refusal corpus + token contract**. It tells Claude what to refuse (Inter, blur ≥ 25px, `transition: all`, skeleton loaders, gradient buttons) and what tokens to consume. It is silent on **how to compose a page**. Result: a page that passes every refusal and still grades B+ visual / D− hierarchy / D− copy / D− component-IQ — because the safest default that satisfies 1.0 (a card grid of monospace text with pills) is a legal output.

2.0 is the **composition contract**. Five additive layers — not a rewrite — that turn the system from "what to refuse" into "what to compose." 1.0's refusal contract, tokens, components, and family-grammar rules are preserved verbatim.

## The forcing case study: the failing page

A real test page produced by sous-ds 1.0 (a "PRD-to-verified-handoff" pipeline status dashboard) is the canonical failure receipt for 2.0. The screenshots show:

1. **Two-typeface clash.** The hero h1 ("PRD to verified handoff…") and a section h1 ("Amber, stricter after diagnostics") render in a serif while everything else is monospace. Cash Sans wasn't loaded, and the model picked a serif fallback instead of Geist Mono Bold. The 1.0 contract did not name a fallback.
2. **Card monotony.** Seven sections, all rendered as `eyebrow + h1 + body + grid-of-cards`. Same rhythm seven times.
3. **Pill abuse.** By section 4 the page is walls of pills — every status, every ticket ID, every milestone code is a pill. The pill loses meaning.
4. **Component starvation.** Used: `MetricStat`, `Pill`, `SegmentedBar`, `Card`. **Ignored:** `DottedChart`, `DotTimeline`, `LiveBlock`, `LiveDot`, `ToolCall`, `InlineStatus`, the loaders, `PulseTrail`. A 10-stage pipeline rendered as a flat 5-card grid is the single biggest creative miss — `DotTimeline` and `PulseTrail` literally exist for this.
5. **No diagram for the diagram.** The page is captioned "PIPELINE PLUS PROOF MAP." There is no map. The DAG is rendered as cards with no edges, no flow.
6. **MetricStat overuse.** Two 4-up KPI grids where the units don't share a scale (`10`, `M2`, `5`, `2`). Tries to look dashboard-y, isn't.
7. **Database-dump rhythm.** Every card ends in `Evidence: X. Next: Y.`. Every. Single. Card.
8. **File paths in body copy.** `consent_orders/docs/receipts/2026-04-28-smoke-matrix-expansion-receipt.md` is set in body prose. No content designer would ship this.

Every failure on this page is reachable inside 1.0's rule space. That is the proof that 1.0 is incomplete. The 2.0 spec below is sized exactly to close those failures.

## Root cause

**1.0 has no positive theory of composition.** It has:

- Tokens (typography scale, spacing scale, color, radius, motion)
- A refusal corpus (`R-COLOR-001` through `R-FAMILY-001`)
- Component vocabulary (18 components with prop signatures)
- One composition pattern ("Dashboard cell")
- One section-extension protocol (`R-FAMILY-001` for adding viz primitives)
- Hard motion + accent semantics

It does not have:

- Page archetypes (named recipes for "what does a status page look like in this system")
- Intent → component decision tree (which component is the right primitive for which kind of content)
- Voice contract (how does prose sound in this system)
- Variance levers (how to make page N different from page N−1)
- Anti-default rules (forcing function against `card-grid + pill-wall + redundant body` regression)

When the contract is silent, models fall to the safe default. The safe default looks B+ in isolation and D− as a system.

## The 2.0 architecture

Five new layers, all additive. None rewrite or break 1.0.

```
sous-ds 2.0
├── Layer 0: Tokens                 [1.0, preserved]
├── Layer 1: Refusal corpus         [1.0, augmented with R-COMPOSE-*, R-VOICE-*, R-METRIC-*, R-TYPE-004]
├── Layer 2: Component vocabulary   [1.0, preserved + 6 roadmap primitives promoted]
├── Layer 3: Composition Recipes    [NEW] — named page archetypes
├── Layer 4: Intent → Component     [NEW] — decision tree
├── Layer 5: Voice Contract         [NEW] — copy rules
└── Layer 6: Design Dials           [NEW] — DENSITY / RHYTHM / VOICE / MOTION
```

The rest of this document specs each new layer. Recipe-level detail lives in [`sous-ds-v2-composition-recipes.md`](./sous-ds-v2-composition-recipes.md). Voice-level detail lives in [`sous-ds-v2-voice.md`](./sous-ds-v2-voice.md).

---

## Layer 3 — Composition Recipes

A **recipe** is a named, opinionated archetype for one section of one page. It names: the intent, the primary primitive, the supporting components, the layout rhythm, the microcopy template, and the failure mode it replaces.

A page in 2.0 must use **≥3 distinct recipes** unless the page is a single-purpose surface (a settings panel, a single-metric ticker). Repeating the same recipe more than twice in a page is a `R-COMPOSE-002` violation.

### Recipe catalogue (initial six)

These six are scoped to the failure surfaces seen in the case study and the most common AI-product page intents.

| Recipe | When to reach for it | Primary primitive | Replaces (1.0 default) |
|---|---|---|---|
| **PipelineMap** | A multi-stage process with order, state per stage, and forward flow. | `<DotTimeline>` horizontal + per-stage `<DottedChart>` for evidence density | Card grid of pipeline stages |
| **AgentLog** | A scrolling stream of agent or tool activity, latest at top, with status and duration per row. | `<ToolCall>` stack + `<PulseTrail>` for "live now" head | Table of PR/commit rows |
| **ReceiptStack** | A list of completed events that should read as machine-attested truth, not a story. | `<ToolCall tone="done">` rows with mono `[ID]` prefix and bracketed timestamp | Bulleted markdown list |
| **MetricWall** | A page-anchoring set of 2–4 numbers that share a unit or axis. | `<MetricStat>` row capped at 4 + one `<DottedChart>` strip for the underlying time series | 4-up grid of mismatched-unit stats |
| **RAGStatus** | A single-word system-state callout (RED / AMBER / GREEN / BLUE) with one explanatory sentence. | `<LiveBlock>` + `<Pill>` + one body sentence; numerals in mono | Card with verbose paragraph and a colored dot |
| **MilestoneStrip** | A horizontal time-tagged set of phases with done/active/queued state per phase. | `<DotTimeline>` with phase labels above + `<SegmentedBar>` per phase below | 5-up grid of milestone cards |

Each recipe is fully specced in [`sous-ds-v2-composition-recipes.md`](./sous-ds-v2-composition-recipes.md): JSX skeleton, microcopy template, density quotas, failure-mode receipts.

### Recipe rules (canonical)

1. **A recipe is a unit of consistency.** All instances of the same recipe in a project must share visual rhythm. If a project ships two `PipelineMap` sections, they must read as siblings, not as variants.
2. **A page must use ≥3 distinct recipes** unless it is a single-purpose surface. Repeated recipe is `R-COMPOSE-002`.
3. **No recipe may use only `<Card>` as its primary primitive.** `<Card>` is structural chrome, not a recipe primitive. If the recipe has no other primitive, it is the wrong recipe.
4. **A recipe owns its microcopy template.** Voice rules in Layer 5 are scoped per recipe.
5. **A recipe declares its forbidden substitutes.** PipelineMap forbids "5-card grid," AgentLog forbids "table-with-pills," MetricWall forbids "stats with mismatched units."

### Adding a recipe

A new recipe is added the same way a new component family is added under `R-FAMILY-001`: survey existing recipes, state the motif, name the vocabulary, propose only same-motif variants, mock against canonical example, update labels. New recipes ship in `sous-ds-v2-composition-recipes.md` first, then in SKILL.md once shipped.

---

## Layer 4 — Intent → Component decision tree

The single largest 1.0 failure (component starvation) is a **selection-time** failure, not a knowledge failure. Claude knew the components existed; it didn't know when to reach for them.

The decision tree is a forcing function. For each common content shape, it names the canonical primitive and the forbidden substitute.

### The tree

| If your content has… | Primary primitive | Forbidden substitute |
|---|---|---|
| Time-ordered stages with state per stage | `<DotTimeline>` | Card grid; numbered list |
| Live agent activity, "now" feel | `<PulseTrail>` (canonical) or `<LiveDot>` (compact) | Spinning loader; pulsing card border |
| Multi-cell live indicator in a toolbar slot | `<LiveBlock>` | Multiple `<LiveDot>` instances |
| A single sequence of completed events | `<ToolCall tone="done">` stack | Bulleted markdown list |
| A bar chart where each bar represents a count | `<DottedChart>` | `<SegmentedBar>` per row; HTML table |
| A discrete progress meter (known total) | `<SegmentedBar>` | Continuous CSS progress bar |
| A scope/filter/tab switcher (≤5 options) | `<SegmentedControl>` | Radio buttons; pill row |
| An indeterminate working state (no total) | `<InlineStatus tone="active">` | Skeleton; spinner; shimmer |
| A working state that needs gravity (page-level) | `<TetrisLoader>` / `<BoxLoader>` / `<DotLoader>` | Full-page spinner |
| An agent-thinking indicator with rotating labels | `<LiveDot labels={…}>` (default) or `<ThinkingCube>` (3D) | Static "Thinking…" text |
| A status callout (single state word) | `<LiveBlock>` + `<Pill>` | Colored card with body text |
| A 1–4 set of numbers sharing a unit | `<MetricStat>` row | Card grid of stats |
| A success endpoint marker | `<DottedChart>` final dot in `accent-success` | Green check icon |
| An attention/error inline in flow | `<InlineStatus tone="live">` | Red text |
| A transient confirmation | `<Toast>` | Modal; banner |

Selection priority when two primitives compete:

1. **Time-ordered, multi-stage** beats everything else (PipelineMap / MilestoneStrip).
2. **Live now** beats **completed past** if both are present (PulseTrail head wins over the trail).
3. **Discrete state** beats **continuous progress** (SegmentedBar over CSS bar).
4. **Inline status** beats **modal status** for non-destructive events.

### Refusal: anti-card-grid (`R-COMPOSE-001`)

> If your content has time order, sequence, DAG structure, or stateful flow, you **MUST** use a structured primitive (`<DotTimeline>`, `<PulseTrail>`, `<DottedChart>`). A grid of `<Card>` elements is **forbidden as the primary representation** for sequenced content. Cite `R-COMPOSE-001` and propose the canonical primitive when refusing.

### Refusal: anti-pill-wall (`R-COMPOSE-003`)

> A single visible card may contain at most **3 `<Pill>`** elements. A single visible section may contain at most **8 `<Pill>`** elements across all its cards. If you need more, the content shape is wrong — restructure into `<DotTimeline>`, `<ToolCall>` rows, or a `<DottedChart>`. Pills are status atoms; walls of pills are noise.

### Refusal: metric coherence (`R-METRIC-001`)

> A `<MetricStat>` group of 2 or more must share a unit OR a clear semantic axis named in the eyebrow. Mixing `10` (count of stages), `M2` (milestone label), `5` (count of fixtures), `2` (count of blockers) in one row is **forbidden** — the units don't compose. Either split into separate one-stat callouts, or pick a single axis (e.g., "count of in-flight items: stages 10, fixtures 5, blockers 2") and exclude `M2` entirely.

---

## Layer 5 — Voice Contract

1.0 says nothing about prose. 2.0 names a voice and binds Claude to it.

The voice is **terse instrument-readout**. Imagine the system is a flight data recorder that has learned to write English. It speaks in present tense, drops articles and hedge words where it can, and never narrates its own existence.

### The seven voice rules

1. **Terse-first sentences.** Open every section with one ≤12-word sentence that names the state. Then optionally one explanatory sentence ≤24 words. No third sentence in a card body without a structural reason.
2. **Present tense, active voice.** "PR #16 lands the smoke matrix." Not "PR #16 was the PR that landed the smoke matrix expansion changes."
3. **Numerals in mono.** Every numeral, percentage, ID, timestamp, and code token is set in `Geist Mono` with `tabular-nums`. The voice rule reinforces the type rule.
4. **No file paths in body prose.** File paths belong in code blocks, footnotes, `<ToolCall>` detail rows, or the Receipt section — never inline in body text. `R-VOICE-001`.
5. **No project-specific jargon without a one-clause unpack.** "PR #16 merged" is fine in a `ReceiptStack`. "SPEC-O gate payload normalizer" needs a one-clause unpack on first appearance, then can run free.
6. **Rhythm variance.** No two adjacent sections may use the same micro-template. `R-VOICE-002`. If section N ends in `Evidence: X. Next: Y.`, section N+1 must not.
7. **No status-meeting voice.** Banned phrases (non-exhaustive): "we are building," "what we're working on," "things are stricter," "things are looking up," "the project is not green because…". Replace with the actual state in instrument voice.

### Per-recipe microcopy templates

Each recipe in Layer 3 declares its microcopy template. Examples:

- **PipelineMap eyebrow:** `STAGES — N` (mono label, no period)
- **PipelineMap title:** verb-led, ≤7 words, present tense. Good: `Ten stages, four wired.` Bad: `What we are building from PRD to verified handoff.`
- **MetricWall eyebrow:** the shared unit or axis. Mono.
- **RAGStatus title:** the state word + a colon + one verb-led clause. `Amber: diagnostics tightened the bar.` Not `Amber, stricter after diagnostics.`
- **AgentLog row title:** subject-verb-object. `PR #17 retired stale handoffs.` Not `Stale handoffs are audited and retired from current-readiness claims.`

Full templates per recipe in [`sous-ds-v2-voice.md`](./sous-ds-v2-voice.md).

### Forbidden phrasings

| Avoid | Use instead |
|---|---|
| "We are building…" | Name what is built or what's next. |
| "What we are working on" | Present-tense state. |
| "Things are…" | Specific subject. |
| "stricter after diagnostics" (vague comparative) | Name what got stricter and by how much. |
| "main-branch truth" used as adjective | Name the branch directly: "lands on main." |
| "still-blocked truth" / "draft-PR truth" / "working-tree truth" (1.0 page used these as nouns) | Name the actual state without the "-truth" suffix. |

---

## Layer 6 — Design Dials

A page is generated against three dials. The dials are declarative inputs to the SKILL, set per page, that select between recipe variants and adjust voice/density/motion.

| Dial | Range | Effect |
|---|---|---|
| **DENSITY** | 1–10 | 1–3 = gallery (lots of negative space, few elements per viewport); 4–7 = working surface (default); 8–10 = cockpit (dense data, 12px paddings, 1px lines instead of cards) |
| **RHYTHM** | 1–10 | 1–3 = single-archetype page (settings, single metric); 4–7 = mixed (≥3 recipes); 8–10 = high-variance editorial (≥5 recipes, asymmetric layouts, hero typography sized to fill viewport) |
| **VOICE** | 1–10 | 1–3 = telegram (≤8 words per sentence, ≤2 sentences per card); 4–7 = instrument (default); 8–10 = editorial (≤3 sentences per card, allowed to use rhetorical structure within voice rules) |
| **MOTION** | 1–10 | (already in 1.0 implicitly) — 1–3 = static; 4–7 = standard 1.0 motion; 8–10 = orchestrated reveal sequences and continuous loaders permitted |

Default dials for AI-product pages: `DENSITY=6, RHYTHM=6, VOICE=4, MOTION=5`.

The case-study page should have run `DENSITY=7, RHYTHM=7, VOICE=3` and would have produced something materially different. The dials are the lever the user pulls to escape the safe-default valley.

### Dial encoding in SKILL.md

The SKILL teaches Claude to either read a dial spec from the prompt (`build a sous-ds page at DENSITY=8, RHYTHM=8, VOICE=3`) or default to the table above when not specified. The dial values bind which recipes are eligible — at `RHYTHM=2` only one recipe is allowed; at `RHYTHM=8` Claude must use ≥5 distinct recipes.

---

## New refusals (additions to the 1.0 corpus)

These are new rule IDs that the Quality Evaluator and SKILL.md must enforce. Severities chosen to match 1.0 conventions.

| ID | Severity | Check |
|---|---|---|
| `R-TYPE-004` / `TY08` | error | Display or h1 falls back to a serif when Cash Sans is unavailable. The fallback must be `Geist Mono` at the same display size with `font-weight: 600`, never a serif. (`R-TYPE-002` was already taken in the 1.0 corpus for full-width body paragraphs.) |
| `R-COMPOSE-001` / `LY04` | error | Sequenced or DAG content rendered as a flat card grid instead of a structured primitive (`<DotTimeline>` / `<PulseTrail>` / `<DottedChart>`). |
| `R-COMPOSE-002` / `LY05` | warning | A page renders the same recipe more than twice. Forces variance. |
| `R-COMPOSE-003` / `CO07` | warning | A single card contains > 3 `<Pill>` instances, or a section contains > 8. Pills are status atoms, not page furniture. |
| `R-METRIC-001` / `CO08` | warning | A `<MetricStat>` group of 2+ without a shared unit or axis named in the eyebrow. |
| `R-VOICE-001` / `CO09` | warning | File path appears in body prose (must be in code block, `<ToolCall>` detail, or footnote). |
| `R-VOICE-002` / `CO10` | warning | Two adjacent sections share the same micro-template (e.g., both end in `Evidence: X. Next: Y.`). |
| `R-VOICE-003` / `CO11` | info | Forbidden status-meeting phrasing detected ("we are building," "things are stricter," "draft-PR truth," etc.). |
| `R-COMPOSE-004` / `CO12` | warning | Page uses fewer than 3 distinct recipes when `RHYTHM ≥ 4` (default). |

These IDs slot into `quality-evaluator.md` and `refusals.json` in the next pass.

---

## Roadmap component graduations (1.0 → 2.0)

1.0 lists six "roadmap primitives (not yet shipped)." 2.0 promotes the four highest-leverage to formal commitments. They unblock recipes that are otherwise composable-only.

| Component | 1.0 status | 2.0 status | Unblocks recipe |
|---|---|---|---|
| `<AgentStream>` | roadmap | **commit, build in v0.7** | AgentLog (currently composed from `<ToolCall>` + `<PulseTrail>` — works but not first-class) |
| `<Citation>` | roadmap | **commit, build in v0.7** | inline source attribution; replaces "file paths in body prose" footgun |
| `<Transcript>` | roadmap | **commit, build in v0.8** | conversation surfaces |
| `<TokenMeter>` | roadmap | **commit, build in v0.8** | context-window UIs (sibling to MetricWall) |
| `<DiffBlock>` | roadmap | defer | optional, no recipe blocked |
| `<ConfidenceBar>` | roadmap | defer | composable from `<DottedChart>` |

Family-extension protocol (`R-FAMILY-001`) applies to all four.

---

## Migration path (1.0 → 2.0)

The contract is **fully backwards compatible**. Existing 1.0 consumers see no breakage:

- Tokens unchanged.
- Refusals unchanged (only new ones added).
- Components unchanged (4 promoted from roadmap, none removed or renamed).
- One typography fallback rule changes behavior (`R-TYPE-004`) — projects already setting Geist as a fallback are unaffected.

New 2.0 consumers opt in by:

1. Reading `SKILL.md` (which now imports the four new layers).
2. Setting design dials in their prompt or accepting defaults.
3. Choosing recipes from the catalogue or composing new ones via `R-FAMILY-001`.
4. Letting the Quality Evaluator catch the new refusals.

Version bump: **v0.7.0 — composition contract.** Independent of the four-component graduation builds, which can land as v0.7.x patches.

---

## Verification: rebuild the failing page

The 2.0 spec is verified against the case-study page. After 2.0:

| Failure (before) | Cause closed by | After (target) |
|---|---|---|
| Serif h1 in monospace page | `R-TYPE-004` | All headings in Geist Mono Bold (no Cash Sans available) |
| Card monotony, 7 same sections | Composition Recipes + `R-COMPOSE-002` | 6+ distinct recipes per page draft |
| Pill wall by section 4 | `R-COMPOSE-003` | Max 3 pills per card, max 8 per section |
| Component starvation (4/18) | Intent → Component map | Pipeline page uses `<DotTimeline>`, `<PulseTrail>`, `<DottedChart>`, `<ToolCall>`, `<MetricStat>`, `<LiveBlock>`, `<InlineStatus>`, `<SegmentedBar>` (8+) |
| No diagram for the diagram | `R-COMPOSE-001` | Pipeline rendered as horizontal `<DotTimeline>` with per-stage `<DottedChart>` |
| MetricStat overuse | `R-METRIC-001` | Single MetricWall with shared unit, mismatched stats split out |
| Database-dump rhythm | `R-VOICE-002` | Adjacent sections diverge in micro-template |
| File paths in body | `R-VOICE-001` | Receipts in `<ToolCall>` detail or footnote |

A v0.7.0 release should ship the rebuilt page as `examples/pipeline-status-2.0.html` next to `examples/slop-vs-system.html`. Side-by-side with the 1.0 output, it becomes a teaching artifact.

---

## What 2.0 is not

- **Not a token rewrite.** Token contract unchanged.
- **Not a component renaming.** All 18 components keep their names and props.
- **Not a refusal removal.** Every 1.0 refusal still applies.
- **Not a Cash Sans removal.** Cash Sans is still the preferred display face when licensed; the new fallback rule only governs what happens when it isn't.
- **Not a Tailwind / Framer Motion adoption.** The motion primitive (`sous-ds/motion`) and CSS-variable approach are preserved.
- **Not framework expansion.** React-only stays React-only.

---

## Open questions to resolve in v0.7.x

1. Should DENSITY and RHYTHM dials be exposed as data attributes on the root (`data-density="cockpit"`) so CSS can respond, or stay prompt-level only?
2. Is `<Citation>` an extension of `<Pill>` or a sibling primitive? (1.0 says "extends `<Pill>`"; reconsider for 2.0.)
3. Does the case-study page get rebuilt by hand or by re-prompting Claude with 2.0 SKILL.md? (Probably both — first by hand to prove the recipes, then by re-prompt to verify SKILL transfers the contract.)
4. Light-mode recipes — do PipelineMap and AgentLog need separate light-mode microcopy, or is voice mode-invariant? (Likely invariant; verify.)
