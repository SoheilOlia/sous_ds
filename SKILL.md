---
name: sous-ds
description: Use when building, styling, auditing, or refining UI in any project using the sous-ds design system. Triggers on any UI task mentioning components, pages, dashboards, data displays, agent or chat interfaces, streaming responses, tool-call rows, citation chips, or the dot/dash data motif. Also triggers on dark mode, restrained aesthetic, monospace-for-data, sub-300ms motion, WCAG AA review, the `--ds-accent-live` or `--ds-accent-success` semantics, and any task referencing DESIGN.md, AGENTS.md, tokens.css, or components/. Use to review or reject UI that uses gradients, shadow blur ≥ 25px, `transition: all`, scale(0) entries, Inter/system-ui as primary face, accent on CTAs, or glass morphism.
---

# sous-ds

A dark-first, data-dense, restraint-led design system for AI-native interfaces. Precision instrument, not marketing brochure. This skill transfers the contract so generated UI matches the system's taste without re-prompting.

## When this skill applies

Apply to any UI task in a repo where `DESIGN.md`, `tokens.css`, or `components/` exists. Also apply as a style critique anywhere — you can audit non-Sous codebases against the refusal corpus and explain the rule violated.

Signal phrases that should trigger this skill:
- "build a dashboard / component / agent UI / chat surface"
- "review the design / UI / accessibility"
- "why does this look AI-slop"
- "make this match our system"
- "streaming response / tool call / citation chip"

## Read in this order

1. `DESIGN.md` — the canonical contract (YAML tokens + prose rationale).
2. `AGENTS.md` — code-generation rules and hard prohibitions.
3. `ANIMATION_RULES.md` — motion contract.
4. `TASTE_LOG.md` — append-only taste memory; each decision traces to a source.
5. `quality-evaluator.md` — lint rule IDs and severities.
6. `refusals.json` — **machine-readable refusal corpus. Load this first when evaluating or generating.**
7. `components/` — reference implementations. Check before building new.

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
- `<DensityStrip>` — a bucket in `live` state (currently-running time window)

`--ds-accent-success` (#00E013) is the primary accent: success / committed / positive highlight / goal-met. It may appear ONLY on:
- `<SegmentedBar>` when `value === total`
- `<DottedChart>` on an explicitly-successful endpoint or closed positive result
- `<DensityStrip>` — a bucket in `done` state (terminal, committed)

`<DensityStrip>` is the one component allowed to carry both accents simultaneously; each bucket holds exactly one state so the two never collide within a bucket.

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

When refusing: cite the `R-*` id, quote the rationale, propose the canonical alternative.

## Composition patterns

- **Dashboard cell:** `<Card>` → header row with `<Pill>` status + `mono` timestamp → body with `<DottedChart>` or tabular-nums numbers → optional `<LiveDot>` in header when live-updating.
- **Data row:** monospace for every data column; sans for labels only. Right-align numbers. Use `tabular-nums`.
- **Loading state:** terse mono status text via `<InlineStatus>` for indefinite work, `<SegmentedBar>` when total progress is known. Never skeleton shimmer.
- **Execution row:** `<ToolCall>` for tool invocations, duration, and running/done state. Use `surface-raised`; do not invent gradients or terminal theater.
- **Empty state:** short sans body text, single ghost-variant action, no illustration.
- **Error state:** `<Toast tone="error">` for transient, inline text + retry button for persistent. Never modal for an error unless destructive.

## Prompt → action mapping

| User says | Do this |
|---|---|
| "Make it pop" | Refuse. Propose stronger weight/luminance hierarchy instead. Cite R-COLOR-001/002 if they asked for gradient or decorative hue. |
| "Add an accent color" | If it is semantic, choose `accent-live` or `accent-success` and update the contract. If decorative, refuse with R-COLOR-002. |
| "Use a sparkle for the AI feature" | Refuse R-SLOP-003. Suggest geometric glyph or text label. |
| "Streaming response / chat bubble / agent output" | Use `<ToolCall>` for execution rows and `<InlineStatus>` for explicit state. Stream body content still composes from `<Card>` + mono body + `<LiveDot>` until `<AgentStream>` ships. |
| "Show a loading state" | Refuse skeletons with R-STATE-001. Use `<InlineStatus>` for indefinite work or `<SegmentedBar>` if the total is known. |
| "Rounded-20 dark card" | Refuse R-ELEV-002. Offer `--ds-radius-md` (12) or `--ds-radius-lg` (16). |
| "Loading spinner" | Ghost variant with `prefers-reduced-motion` fallback; duration ≤ standard; opacity pulse, not rotation. |
| "Celebration / success moment" | Short (≤ 220ms) opacity+scale pulse on the affected element; no confetti, no sparkle. |

## Roadmap primitives (not yet shipped)

These are the signature AI-native components the system is growing toward. If a user needs one before it ships, compose from current primitives and flag the gap:

- **`<AgentStream>`** — token-by-token reveal, variable-rate easing, cursor glyph
- **`<Citation>`** — inline source chip with hover preview (extends `<Pill>`)
- **`<Transcript>`** — role-keyed rows with mono timestamps
- **`<TokenMeter>`** — context-window usage using mono + tabular-nums
- **`<DiffBlock>`** — before/after with accent for changes only
- **`<ConfidenceBar>`** — low/mid/high probability by length (extends dot motif)

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
