---
name: sous-ds
description: Use when building, styling, auditing, refining, or learning from UI in any project using the sous-ds design system. Triggers on /sous-ds, /learn-from-this-project, "Learn from this project", "make this match SOUS-DS", "SOOS-DS", any UI task mentioning components, pages, dashboards, data displays, agent or chat interfaces, streaming responses, tool-call rows, citation chips, or the dot/dash data motif. Also triggers on dark mode, light mode, prezzo mode, presentation mode, theme toggle, mode toggle, `[data-theme]`, `[data-mode]`, restrained aesthetic, monospace-for-data, sub-300ms motion, WCAG AA review, the `--ds-accent-live` or `--ds-accent-success` semantics, and any task referencing DESIGN.md, AGENTS.md, tokens.css, or components/. Use to review or reject UI that uses gradients, shadow blur ≥ 25px, `transition: all`, scale(0) entries, Inter/system-ui as primary face, accent on CTAs, glass morphism, card-grid layouts for sequenced content, pill walls, or status-meeting voice.
---

# sous-ds

A dark-first, data-dense, restraint-led design system for AI-native interfaces. Precision instrument, not marketing brochure. Light mode is a first-class peer (flip with `data-theme="light"`); semantic accents stay constant across modes. **Prezzo mode** (`data-mode="prezzo"`, orthogonal to theme) collapses typography to Cash Sans Regular at every role and size — for slides, keynotes, and screenshots meant to be read at presentation distance. This skill transfers the contract so generated UI matches the system's taste without re-prompting.

> **2.0 — composition contract.** Layered on top of the 1.0 refusal contract. The refusal corpus, tokens, components, and family-grammar rules are unchanged. Five new layers added: composition recipes, intent → component decision tree, voice contract, design dials, and new refusals. Full spec: [`docs/specs/sous-ds-v2.md`](./docs/specs/sous-ds-v2.md). Read 1.0 first; the 2.0 layer below assumes it.

## When this skill applies

Apply to any UI task in a repo where `DESIGN.md`, `tokens.css`, or `components/` exists. Also apply as a style critique anywhere — you can audit non-Sous codebases against the refusal corpus and explain the rule violated.

Signal phrases that should trigger this skill:
- "build a dashboard / component / agent UI / chat surface"
- "review the design / UI / accessibility"
- "why does this look AI-slop"
- "make this match our system"
- "streaming response / tool call / citation chip"
- "Learn from this project"
- "/learn-from-this-project"

## Read in this order

1. `DESIGN.md` — the canonical contract (YAML tokens + prose rationale).
2. `AGENTS.md` — code-generation rules and hard prohibitions.
3. `ANIMATION_RULES.md` — motion contract.
4. `TASTE_LOG.md` — append-only taste memory; each decision traces to a source.
5. `quality-evaluator.md` — lint rule IDs and severities.
6. `refusals.json` — **machine-readable refusal corpus. Load this first when evaluating or generating.**
7. `components/` — reference implementations. Check before building new.
8. `docs/specs/sous-ds-v2.md` — composition contract. Read this before composing any page.
9. `docs/specs/sous-ds-v2-composition-recipes.md` — named page archetypes.
10. `docs/specs/sous-ds-v2-voice.md` — copy contract.
11. `docs/specs/sous-ds-reference-learning.md` — learning protocol for promoting finished project patterns into SOUS-DS.

## Learning from a project

When the user says "Learn from this project", treat the finished surface as evidence, not authority. Search the source files, screenshots, PRs, and local CSS first; then classify each lesson as a token, component, composition recipe, refusal, motion rule, voice rule, installer/tooling change, or taste-log entry.

Promote only reusable structure into SOUS-DS. Do not import project-specific copy, brand styling, PR IDs, one-off measurements, or a foreign aesthetic. If SOUS-DS already has the rule, cite the existing source instead of duplicating it. If the lesson is real, update source truth first (`DESIGN.md`, `SKILL.md`, `AGENTS.md`, `refusals.json`, `components/`, `docs/specs/`, `TASTE_LOG.md`, installer) and verify before claiming it is learned.

Reference posture:
- `Donsoleil/ui-ux-pro-max-skill` teaches searchable design intelligence, stack/domain checklists, and multi-agent packaging. SOUS-DS adopts the operating model, not the broad style taxonomy.
- `Donsoleil/cult-ui` teaches source-owned registry components and inspectable recipes. SOUS-DS adopts copy-owned component promotion, not black-box dependency or decorative component imports.

## Non-negotiables

- **Tokens only.** Every color, size, radius, duration, easing comes from `var(--ds-*)`. If a value needed is not a token, propose one in a PR — never improvise.
- **Type.** Display and page titles use `Cash Sans` via `var(--ds-font-display)` with Geist fallback. `h2`/`h3` framing plus every datum, timestamp, label, and code uses `Geist Mono` via `var(--ds-font-mono)`, with `font-variant-numeric: tabular-nums` whenever numerals appear. Body/UI sans stays on `Geist`. Body max-width: `var(--ds-measure)` (65ch). Ellipsis `…`, not `...`.
- **Elevation.** Dark cards: 1px `var(--ds-line)` border, no shadow. Shadows reserved for floating menus/toasts (`--ds-elev-1`) and modals (`--ds-elev-2`). Blur ≥ 25px is rejected (R-ELEV-001).
- **Motion.** Duration ceiling 300ms. Default easing `var(--ds-ease-out)`. Enumerate transition properties — never `all`. Entries start from `scale(0.95)` minimum. Respect `prefers-reduced-motion`.
- **Hit areas.** ≥ 44×44 enforced via `var(--ds-size-interactive-min)` pattern, even when visual size is smaller.
- **Contrast.** WCAG AA (4.5:1 normal, 3:1 large) on every text/bg pair. The accessible pair is table-stakes.

## Accent carriers (exhaustive)

`--ds-accent-live` (#E5533C) marks the attention rail: alert / anomaly / error / urgent live-now. It may appear ONLY as a foreground on:
- `<LiveDot>` — the 6px dot
- `<Pill live>` — pill with the live-state prefix
- `<Toast tone="live">` — toast marking live state change
- `<DottedChart>` — a sparse anomaly or attention-needed point in an otherwise neutral chart
- `<DotTimeline>` — a column in `live` state (currently-running time window)
- `<PulseTrail>` — the head dot that sweeps across; canonical carrier for agent "alive now" feel

`--ds-accent-success` (#00E013) is the primary accent: success / committed / positive highlight / goal-met. It may appear ONLY on:
- `<SegmentedBar>` when `value === total`
- `<DottedChart>` on an explicitly-successful endpoint or closed positive result
- `<DotTimeline>` — a column in `done` state (terminal, committed)
- `<PulseTrail>` — trail dots representing prior done events

`<DotTimeline>` and `<PulseTrail>` are the two components allowed to carry both accents simultaneously; in each, per-element state is single-valued so the two accents never collide within one rendered element.

**Accents are semantic, not decorative.** Any other use violates R-SEMANTIC-001.

Focus rings (`outline` / `box-shadow` on `:focus-visible`) are the documented exception — focus is a transient state carrier, not content.

## Extending a component family — non-negotiables

When asked to add a new component to an existing family (e.g., "another Data Motif viz," "another accent-carrier," "another toast-like message"), the following steps are **required and ordered**. Skipping any of them is a **R-FAMILY-001 violation** and you MUST refuse to continue until the gap is closed.

**The motif — not the spec — is the grammar. Sibling components must share it.**

### 1. MUST: Survey the family before proposing anything
- Open and read every `.tsx` and `.css` file of every existing family member.
- Render the preview and inspect the pixels.
- If you have not done this, you have not earned the right to propose. Stop.

### 2. MUST: State the motif in one sentence
Example: _"DottedChart = bars built from stacked 6px dots, one color accent per column, mono labels, restraint."_
If you cannot compress the family to one sentence, you do not understand it yet. Keep reading.

### 3. MUST: Name the vocabulary explicitly
Before any option is proposed, name:
- **Primitive shape** (dot? bar? line? glyph?)
- **State coloring** rules — which accent means what, when
- **Motion cadence** — durations, easings, pulse rhythms (e.g., 2000ms linear LiveDot cadence)
- **Axis + label language** — mono text-muted endpoints? per-column labels? none?
- **Typography** — what text appears and at what scale

### 4. MUST: Propose only same-primitive variants
When offering 2–3 design options, **every** option must share the primitive. You may vary:
- the **data** the primitive encodes (time vs magnitude vs rate vs density)
- the **motion** of the primitive (static vs trailing vs revealing vs pulsing)
- the **axis / layout** of the primitive (x = time vs x = category; y = count vs y = value)

You **MAY NOT** offer a variant that starts from a different primitive as a peer option among normal choices. If the user explicitly asks for a different primitive, respond: _"This variant breaks the family grammar. Let's talk about whether we're branching into a second family — that's its own conversation."_ Never silently smuggle a breaking variant into the option list.

### 5. MUST: Mock next to the canonical family member before implementation
Render the new component **as actual pixels, in the same viewport**, next to the family's canonical member. Screenshot. Ask: _"Does this read as a sibling or a visitor?"_
If the answer is "visitor," stop and revise. Spec-reviewed correctness is not enough — the glance test is the test.

### 6. MUST: Update section labels after shipping
If the section-aside said `DOTTED BAR` and you shipped solid rectangles, the label is a lie. Either rewrite the component back into the motif, or rewrite the aside to name the new language honestly. Do not leave drift.

### The test

"Does it pass the spec review?" is **not** the test.
"Does it look like it belongs?" is the test.

### Refusal behavior

If you are asked to skip any of steps 1–6, or to propose/implement a family member without first completing 1–3, **refuse and cite R-FAMILY-001**. Offer to run the protocol first.

## Refuse to generate

Load `refusals.json` for the full machine-readable corpus with patterns. Summary:

| # | Refuse | Why |
|---|---|---|
| R-COLOR-001 | Gradients on heroes/cards/buttons | Noise without semantics |
| R-COLOR-002 | Decorative brand hues (purple/teal/gold/orange or decorative green) | Accent discipline |
| R-COLOR-003 | Accent on CTA buttons | Semantic collision |
| R-TYPE-001 | Inter/Roboto/system-ui as primary | AI-slop type signature |
| R-TYPE-004 | Display/h1 falling back to a serif when Cash Sans is unavailable | Voice drift; fallback must be Geist Mono Bold at the same size |
| R-ELEV-001 | Shadow blur ≥ 25px | AI-slop elevation |
| R-ELEV-002 | Dark card radius > 16px | Too soft for instrument UI |
| R-MOTION-001 | `transition: all` | Opaque, thrash-prone |
| R-MOTION-002 | Duration > 300ms | Over the ceiling |
| R-MOTION-003 | `scale(0)` entries | Cartoonish |
| R-LAYOUT-001 | Spacing off 8pt scale (15/18/20/26px) | Off-grid signature |
| R-SEMANTIC-001 | Semantic accent outside documented carriers | Accent discipline |
| R-STATE-001 | Skeleton / shimmer loading UI | Use terse mono status or segmented progress |
| R-SLOP-001 | Glass morphism | AI-slop marker |
| R-SLOP-003 | Sparkle/magic-wand for AI features | AI-theatre |
| R-COMPOSE-001 | Sequenced/DAG content rendered as a flat card grid | Use DotTimeline / PulseTrail / DottedChart |
| R-COMPOSE-002 | Same recipe used > 2 times on one page | Forces variance; ≥3 distinct recipes per page when RHYTHM ≥ 4 |
| R-COMPOSE-003 | More than 3 `<Pill>` per card or > 8 per section | Pill wall — content shape is wrong |
| R-COMPOSE-004 | Page uses < 3 distinct recipes when RHYTHM ≥ 4 | Forces archetype variance |
| R-METRIC-001 | `<MetricStat>` group of 2+ without a shared unit/axis | Mismatched-unit KPI grid |
| R-VOICE-001 | File path inline in body prose | Belongs in code block, ToolCall detail, or footnote |
| R-VOICE-002 | Two adjacent sections share micro-template | Database-dump rhythm |
| R-VOICE-003 | Status-meeting phrasing ("we are building," "things are stricter," "draft-PR truth") | Generic editorial voice; replace with instrument readout |

When refusing: cite the `R-*` id, quote the rationale, propose the canonical alternative.

## Composition patterns (cell level)

- **Dashboard cell:** `<Card>` → header row with `<Pill>` status + `mono` timestamp → body with `<DottedChart>` or tabular-nums numbers → optional `<LiveDot>` in header when live-updating.
- **Data row:** monospace for every data column; sans for labels only. Right-align numbers. Use `tabular-nums`.
- **Loading state:** terse mono status text via `<InlineStatus>` for indefinite work, `<SegmentedBar>` when total progress is known. Never skeleton shimmer.
- **Execution row:** `<ToolCall>` for tool invocations, duration, and running/done state. Use `surface-raised`; do not invent gradients or terminal theater.
- **Empty state:** short sans body text, single ghost-variant action, no illustration.
- **Error state:** `<Toast tone="error">` for transient, inline text + retry button for persistent. Never modal for an error unless destructive.

## Composition recipes (page level — 2.0)

Cell-level patterns above describe what one card or row looks like. **Recipes describe what one section of a page looks like.** Without recipes, every section converges on `eyebrow + h1 + body + grid-of-cards` and pages grade D− on hierarchy.

A page in 2.0 must use **≥3 distinct recipes** unless `RHYTHM ≤ 3` (single-purpose surfaces). Repeating the same recipe more than twice is `R-COMPOSE-002`.

| Recipe | Use when content is… | Primary primitive |
|---|---|---|
| **PipelineMap** | A multi-stage process with order and per-stage state | `<DotTimeline>` horizontal + per-stage `<DottedChart>` |
| **MilestoneStrip** | Time-tagged phases with done/active/queued state | `<DotTimeline>` + per-phase `<SegmentedBar>` |
| **AgentLog** | Live agent/tool activity with a "now" head | `<ToolCall>` stack + `<PulseTrail>` head |
| **ReceiptStack** | Completed events as machine-attested truth | `<ToolCall tone="done">` rows with `[ID]` + `[STATE]` |
| **MetricWall** | 2–4 numbers sharing a unit or axis | `<MetricStat>` row + optional `<DottedChart>` strip |
| **RAGStatus** | Single state-word callout (RED/AMBER/GREEN) | `<LiveBlock>` + `<Pill>` + one body sentence |

Full specs (JSX skeletons, microcopy templates, density quotas, forbidden substitutes) in [`docs/specs/sous-ds-v2-composition-recipes.md`](./docs/specs/sous-ds-v2-composition-recipes.md).

**Recipe-pair anti-patterns:**
- PipelineMap + MilestoneStrip on the same page (overlapping intent — pick one or split explicitly)
- Two MetricWalls (only one anchor per page)
- AgentLog + ReceiptStack of the same source (live + historical of the same stream — distinguish or pick one)

## Intent → component decision tree (2.0)

The single largest 1.0 failure was **component starvation** — using 4 of 18 components because the contract listed components without naming when each is the right primitive. The decision tree is a forcing function.

| If your content has… | Reach for | Forbidden substitute |
|---|---|---|
| Time-ordered stages with state | `<DotTimeline>` | Card grid; numbered list |
| Live agent activity, "now" feel | `<PulseTrail>` (canonical) or `<LiveDot>` | Spinning loader; pulsing card border |
| Multi-cell live indicator | `<LiveBlock>` | Multiple `<LiveDot>` instances |
| A sequence of completed events | `<ToolCall tone="done">` stack | Bulleted markdown list |
| Bar chart of counts | `<DottedChart>` | `<SegmentedBar>` per row |
| Discrete progress (known total) | `<SegmentedBar>` | Continuous progress bar |
| Scope/filter switcher (≤5 options) | `<SegmentedControl>` | Radio buttons; pill row |
| Indeterminate working state | `<InlineStatus tone="active">` | Skeleton; spinner |
| Page-level working state | `<TetrisLoader>` / `<BoxLoader>` / `<DotLoader>` | Full-page spinner |
| Agent thinking with rotating labels | `<LiveDot labels={…}>` or `<ThinkingCube>` | Static "Thinking…" |
| Single state-word callout | `<LiveBlock>` + `<Pill>` | Colored card |
| 1–4 numbers sharing a unit | `<MetricStat>` row | Card grid of stats |
| Success endpoint marker | `<DottedChart>` final dot in `accent-success` | Green check icon |
| Inline attention/error | `<InlineStatus tone="live">` | Red text |
| Transient confirmation | `<Toast>` | Modal; banner |

**Selection priority when two primitives compete:**
1. Time-ordered, multi-stage beats everything else
2. Live now beats completed past
3. Discrete state beats continuous progress
4. Inline status beats modal status (non-destructive events)

## Voice contract (2.0)

The system speaks like a precision instrument that has learned English. Full contract: [`docs/specs/sous-ds-v2-voice.md`](./docs/specs/sous-ds-v2-voice.md).

The seven voice rules:

1. **Terse-first sentences.** ≤12 words for the opening sentence of any section/card/row. Optional second sentence ≤24 words.
2. **Present tense, active voice.** Subject-verb-object. "PR #16 lands the smoke matrix." Not "PR #16 was the PR that landed…"
3. **Numerals in mono.** Every numeral, percentage, ID, timestamp, code token in `Geist Mono` + `tabular-nums`.
4. **No file paths in body prose.** Belongs in code blocks, `<ToolCall>` detail, footnotes, or `<Citation>` chips. `R-VOICE-001`.
5. **Project jargon needs a one-clause unpack on first appearance.** Then runs free.
6. **Rhythm variance.** No two adjacent sections share micro-template. `R-VOICE-002`.
7. **No status-meeting voice.** Banned: "we are building," "things are stricter," "main-branch truth" as adjective, "the project is not green because…", "where we are going" as h1. `R-VOICE-003`.

Headlines: verb-led, present tense, period at end of declarative h1/h2. No editorial frames as h1 ("What we are building" → name the artifact).

Body: first sentence names the state (≤12 words). Second sentence (optional) names cause or next. Third sentence requires a structural reason — almost always means restructure into a recipe.

## Design dials (2.0)

A page is generated against three dials. Set in the prompt or default per the table below.

| Dial | Range | Effect |
|---|---|---|
| **DENSITY** | 1–10 | 1–3 gallery (negative space, few elements); 4–7 working surface; 8–10 cockpit (12px paddings, 1px lines instead of cards) |
| **RHYTHM** | 1–10 | 1–3 single-archetype; 4–7 mixed (≥3 recipes); 8–10 high-variance (≥5 recipes, asymmetric layouts, hero typography filling viewport) |
| **VOICE** | 1–10 | 1–3 telegram (≤8 words/sentence); 4–7 instrument (default, the contract above); 8–10 editorial (≤3 sentences/card, rhetorical structure permitted) |

**Defaults for AI-product pages:** `DENSITY=6, RHYTHM=6, VOICE=4`.

`RHYTHM` binds recipe variance — at `RHYTHM=2` only one recipe is allowed; at `RHYTHM=8` Claude must use ≥5 distinct recipes. `VOICE` bounds sentence length and structural latitude. `DENSITY` selects layout variant within each recipe.

## Pre-composition checklist (2.0)

Before writing any JSX for a page, Claude must answer these in the order shown. Skipping is `R-COMPOSE-004`.

1. **What is the page's purpose?** One sentence.
2. **What dials does the user want?** Read prompt. Default if unspecified.
3. **What recipes does the content shape demand?** ≥3 distinct unless `RHYTHM ≤ 3`. Map content to the recipe catalogue. If content has time order or state-per-stage and no PipelineMap/MilestoneStrip is selected, restart.
4. **What components does each recipe need?** Use the Intent → Component tree. Cite the row.
5. **What microcopy template applies per recipe?** State the eyebrow, title, body, row template before writing JSX.
6. **What's the variance check?** No two adjacent sections share a recipe or a micro-template.
7. **What did the cell-level patterns and refusals add?** Apply 1.0 contract last; it's enforcement, not composition.

## Prompt → action mapping

| User says | Do this |
|---|---|
| "Make it pop" | Refuse. Propose stronger weight/luminance hierarchy instead. Cite R-COLOR-001/002 if they asked for gradient or decorative hue. |
| "Add an accent color" | If it is semantic, choose `accent-live` or `accent-success` and update the contract. If decorative, refuse with R-COLOR-002. |
| "Use a sparkle for the AI feature" | Refuse R-SLOP-003. Suggest geometric glyph or text label. |
| "Streaming response / chat bubble / agent output" | Use **AgentLog** recipe: `<ToolCall>` stack with `<PulseTrail>` head row. Stream body content composes from `<ToolCall>` + mono body + `<LiveDot>` until `<AgentStream>` ships. |
| "Show a loading state" | Refuse skeletons with R-STATE-001. Use `<InlineStatus>` for indefinite work or `<SegmentedBar>` if the total is known. |
| "Rounded-20 dark card" | Refuse R-ELEV-002. Offer `--ds-radius-md` (12) or `--ds-radius-lg` (16). |
| "Loading spinner" | Ghost variant with `prefers-reduced-motion` fallback; duration ≤ standard; opacity pulse, not rotation. |
| "Celebration / success moment" | Short (≤ 220ms) opacity+scale pulse on the affected element; no confetti, no sparkle. |
| "Build a status page / dashboard / pipeline view" | Use **PipelineMap** or **MilestoneStrip** recipe — never a card grid for sequenced content. Cite R-COMPOSE-001 if the user pushes back on the structured primitive. |
| "Show our 4 KPIs" | Use **MetricWall** recipe. Eyebrow names the shared unit/axis. Refuse R-METRIC-001 if the units don't compose. |
| "Add a status callout / RAG indicator" | Use **RAGStatus** recipe. State word + colon + verb-led clause; one explanatory sentence; ≤2 supporting `<MetricStat>`. |
| "List recent PRs / events / activity" | Use **AgentLog** (live) or **ReceiptStack** (historical). Never a markdown table with status pills. Cite R-COMPOSE-003 if pill density is the temptation. |
| "Where we are going" / "What we are building" as h1 | Refuse R-VOICE-003. Replace with the artifact: "Five phases queued." "Ten stages, four wired." |
| "Cash Sans isn't loading; can we use a serif?" | Refuse R-TYPE-004. Fallback is `Geist Mono` at the same display size with `font-weight: 600`. Never a serif. |

## Roadmap primitives

Two components graduated to the catalogue in v0.7.1:

- **`<AgentStream>`** — token-by-token reveal of agent or model output. Composes the `typewriter` motion primitive. Inline span; mono type; `▍` cursor glyph blinks via opacity. Cancellable via unmount. Use inside `<ToolCall>` detail rows or as the body of an AgentLog recipe row.
- **`<Citation>`** — inline source chip with hover/focus preview. Extends `<Pill>` shape; on hover or keyboard focus a popover surfaces the source name + optional preview + meta. Replaces the 1.0 footgun of file paths inline in body prose (cite `R-VOICE-001`).

Still on the roadmap (not yet shipped) — compose from current primitives and flag the gap if a user needs one:

- **`<Transcript>`** — role-keyed rows with mono timestamps (v0.8)
- **`<TokenMeter>`** — context-window usage using mono + tabular-nums (v0.8)
- **`<DiffBlock>`** — before/after with accent for changes only (deferred — composable from existing primitives)
- **`<ConfidenceBar>`** — low/mid/high probability by length (deferred — composable from `<DottedChart>`)

## Verify before shipping

```bash
npx @google/design.md lint DESIGN.md     # contract shape
node scripts/lint.mjs components/ preview.html   # implementation rules including R-* refusals
npm run lint                               # both, via package.json
```

Errors block. Warnings are discretion.

## Philosophy

Restraint is the primary move — remove what does not inform or structure. Weight and luminance beat color. Data is the design; mono, tabular, display-sized, the number is the hero. Precision over softness — 1px, tight radii, snappy motion. The dot motif carries data encoding. Neutrals do the structural work; green is the primary accent for positive emphasis, red is the attention rail.

If you need playful, warm, or gradient — this is not your system.
