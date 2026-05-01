# TASTE_LOG.md
> Canonical taste memory for the design system.
> Append-only. Never silently overwrite. Each entry is timestamped and sourced.
> Last updated: 2026-05-01 (v2.0 — composition contract)

---

## HOW TO READ THIS FILE

Each entry records what was learned, from what source, and what it means for the system.
Conflicts between entries are flagged explicitly, never silently resolved.
The Quality Evaluator uses this file as ground truth for taste signals.

**Editorial note (2026-04-22):** references below to `/Users/soheil/Desktop/Inspiration` and "8 images" describe the initial subset review, preserved for history. The current working corpus lives in `Inspiration/` at repo root and contains 18 files; see ENTRY 005.

---

## ENTRY 001 — Emil Kowalski Skill
**Date:** 2026-04-21
**Source:** https://emilkowal.ski/ui/agents-with-taste + `npx skills add emilkowalski/skill`
**Type:** Principle reference

### Signals extracted:
- Animation taste is articulable. Every "this feels right" has a logical reason. Find it. Encode it.
- `scale(0)` is always wrong. Start from `scale(0.95)` minimum. Even a deflated balloon has shape.
- `ease-out` is the default easing for everything. Everything else is a deliberate override.
- Exit animations should be ~20% faster than entrance. Asymmetry feels natural.
- UI animations must stay under 300ms. Hard ceiling, no exceptions.
- `will-change: transform` on anything that was jittery in testing.
- `transform-origin` must be set explicitly on popovers and dropdowns. Default center is wrong.
- Sequential tooltips: skip delay/animation after the first one. Repetition kills it.
- Animate child elements, not parents. Hover on parent causes flicker.
- Body text caps at ~65ch. Not full width.
- `tabular-nums` on all data/price/metric columns.
- Ellipsis character (`…`) not three dots (`...`).
- Uppercase labels need loosened letter-spacing. Tight uppercase reads cramped.
- Underlines are for links only.
- Bold for UI emphasis. Italic for citations and prose only.

### System integration:
See `ANIMATION_RULES.md` for full encoding.

---

## ENTRY 002 — Inspiration Image Analysis
**Date:** 2026-04-21
**Source:** `/Users/soheil/Desktop/Inspiration` (8 images)
> _Superseded — actual source is `Inspiration/` at repo root; 18 files (17 JPEG + 1 GIF). See ENTRY 005 §5._
**Type:** Visual reference

*Content unchanged from v1.0. Full per-image analysis retained as is. Summary of cross-image synthesis below.*

### Cross-image synthesis (canonical taste principles)

Patterns that appeared in 3 or more of the 8 images and are now canonical:

1. **Dot/dash as data motif** (5/8 images). Dots, dashes, and pill-shapes as data encoding. Length = duration. Darkness = intensity. Density = volume. This is the system's defining visual signature.

2. **Single red-orange accent #E5533C** (3/8 images). Always semantic, never decorative. Reserved for: live/active state, alert, current moment, primary status.

3. **Monospace for all data** (4/8 images). Times, metrics, percentages, numbered lists, data values. `tabular-nums` always on.

4. **Large display number as content anchor** (3/8 images). The number is the hero. `+326%`, `7HR 48MIN`, `15:39`. Display at 48px+ with mixed-weight unit superscripts.

5. **Dark card on dark background** (2/8 images, core system pattern). Differentiated by surface luminance and 1px border, not shadow. No elevation theater.

6. **Restraint as the primary move** (across all 8). Every element justifies its presence or gets removed.

7. **Weight hierarchy without color** (Images 02, 06). Primary text bold, secondary muted gray. Color is never used to create hierarchy.

---

## ENTRY 003 — DESIGN.md Convention
**Date:** 2026-04-21
**Source:** https://github.com/google-labs-code/design.md, https://github.com/VoltAgent/awesome-design-md
**Type:** Structural reference

### What this is:
DESIGN.md is a Google Stitch / Google Labs convention. A markdown file with YAML front matter (machine-readable tokens) and prose body (human-readable rationale). The spec defines canonical section order, token types, component schema, and linting rules. VoltAgent's collection extends it with Responsive Behavior and Agent Prompt Guide sections.

### System integration:
- `DESIGN.md` is the primary contract consumed by coding and design agents
- `design-tokens.json` is the W3C DTCG-flavored machine layer
- `tokens.css` is the runtime CSS implementation
- `AGENTS.md` is the paired coding-agent guide (VoltAgent pattern)
- Linting: `npx @google/design.md lint DESIGN.md` in CI
- Regression check: `npx @google/design.md diff before.md after.md` on contract PRs

---

## ENTRY 004 — v1.1 Corrections and Gaps Closed
**Date:** 2026-04-21
**Source:** Internal audit against Google Labs spec + WCAG contrast checks + internal consistency review
**Type:** Correction log

### What changed and why

**1. Raised `text-muted` color to pass WCAG AA**
- Prior value (light mode): `#999999`. Contrast on white: 2.85:1. **Fails AA** for normal text (required 4.5:1) and **fails AA** for large text (required 3:1).
- New value (light mode): `#767676`. Contrast on white: 4.55:1. Passes AA minimum.
- New value (dark mode): `#888888` on `#0A0A0A`. Contrast 5.58:1. Passes AA comfortably.
- Impact: every instance of muted gray in the codebase needs to be migrated to the new token.

**2. Removed card shadow token**
- Prior: `--card-shadow: 0 1px 2px rgba(0,0,0,0.4)` existed as a token.
- Conflict: Image 01 analysis explicitly stated "1px border instead of shadow, no drop shadows on cards in dark mode."
- Resolution: shadows are now scoped to floating surfaces only (menus, toasts, modals). Cards use `--ds-line` border. `--ds-elev-0` is `none`.

**3. Resolved Image 07 verdict**
- Prior: dismissed as "generic SaaS" but then included "bento grid with dark card contrast" in what-to-take. Contradiction.
- Resolution: separate the pattern from its execution. Bento grid with a dark contrast card = good pattern, adopted. Gold stars, green-availability-dot, and rating-card aesthetic = rejected execution.

**4. Cleaned up the anti-pattern table**
- Prior: conflated "not seen in reference" with "rejected." Absence of evidence is not evidence of absence.
- Resolution: anti-patterns are now listed with their taste-based reasoning, not their absence from references. See `DESIGN.md` → Do's and Don'ts.

**5. Added `prefers-reduced-motion` contract**
- Prior: animation rules had no degradation path for users who opt out. Accessibility gap.
- Resolution: global rule in `tokens.css` collapses all animation/transition durations to ~0ms under `prefers-reduced-motion: reduce`. Opacity changes still permitted for state legibility.

**6. Added complete type scale**
- Prior: fonts and tracking defined, no sizes.
- Resolution: 10 type roles defined (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `body-sm`, `label`, `mono-xl`, `mono`). See `DESIGN.md` → Typography.

**7. Added spacing, radius scales**
- Prior: neither existed.
- Resolution: 12-step 8pt spacing scale, 6-step radius scale. See `DESIGN.md`.

**8. Removed Cash Sans dependency**
- Prior: Cash Sans specified as primary face. Licensing concern for any deployment outside Cash App. No fallback stack.
- Resolution: primary face is now Geist, mono face is Geist Mono. Both free, both on Google Fonts, both with defined fallback stacks that match x-height to prevent FOUT layout shift.

**9. Defined components that were only implicit**
- Button (primary/secondary/ghost with states)
- Card (single variant, no shadow)
- Pill (filled vs outline, dashed border for "impermanent" states)
- Dot-live (the accent-bearing element)
- Input, Modal, Toast, Dotted bar chart

**10. Built reference implementations**
- `components/Button.tsx` — canonical button with all states
- `preview.html` — single-file visual catalog
- These are the ground truth agents pattern-match against.

---

## PENDING INGESTION

| Source | Type | Status | Unblock path |
|--------|------|--------|--------------|
| https://pin.it/4khCrB7hx | Pinterest board | ⏳ Not yet ingested | Use a Pinterest-to-image export tool or manually screenshot each pin at 2x. Drop images into chat, append as ENTRY 005. |
| Emil's full skill output | npx package | ⏳ Only animation rules extracted | Run `npx skills add emilkowalski/skill` locally, read every `SKILL.md` in the returned directory, extract component-design and Sonner rules as ENTRY 006. |
| VoltAgent reference DESIGN.md files | Repo | ⏳ Structure referenced, content not mined | Clone the repo. Read DESIGN.md for Linear, Vercel, Expo, VoltAgent itself. Extract section-structure and token-organization patterns as ENTRY 007. |

---

## CONFLICT LOG

| Date | New signal | Conflicts with | Proposed resolution | Status |
|------|-----------|----------------|---------------------|--------|
| 2026-04-21 | Card shadow token existed | Image 01 analysis: no shadows on dark cards | Remove shadow token from cards. Restrict shadows to menus/modals only. | ✓ Resolved in v1.1 |
| 2026-04-21 | Bento grid "dismissed" but also "taken" | Internal contradiction | Separate pattern from execution. Pattern = adopted. Execution of Image 07 = rejected. | ✓ Resolved in v1.1 |
| 2026-04-21 | `#999` muted gray failed WCAG AA | Accessibility contract | Raise to `#767676` light / `#888` dark. Document contrast ratios in DESIGN.md. | ✓ Resolved in v1.1 |
| 2026-04-21 | Cash Sans not universally licensed | Deployability | Switch to Geist + Geist Mono as system default. Cash Sans can be swapped in by projects that own a license, via token override. | ✓ Resolved in v1.1 |

---

## ENTRY 005 — Truth Layer Realignment
**Date:** 2026-04-22
**Source:** Internal audit against reference implementations, evaluator assumptions, and packaging contract
**Type:** Correction log

### What changed and why

**1. Realigned file layout to the documented structure**
- Reference components moved into `components/`.
- Quality evaluator moved into `scripts/lint.mjs`.
- Teaching artifact moved into `examples/slop-vs-system.html`.
- Root `index.ts` now re-exports from `components/index.ts`.
- Why: the docs, evaluator, and agent guide all depended on this layout. The files needed to match the contract.

**2. Added a real `SKILL.md`**
- The repo now has an actual skill entry point instead of only claiming one in docs and changelog.
- Why: the system's primary distribution target is agents. The skill entry point cannot be theoretical.

**3. Resolved the semantic accent contradiction**
- `LiveDot` is now documented as the primary accent carrier, not the only carrier.
- Allowed carriers are now explicit: `LiveDot`, live-pill prefix, live-tone toast marker.
- Why: the rule was already being used in multiple places. The contract needed to describe the intended system, not an impossible ideal.

**4. Tightened the reference implementations**
- Button press duration, shared sizes, live pulse cadence, toast exit duration, and chart stagger values are now tokenized.
- Card default padding now matches the 24px contract.
- Pill tracking now matches the label tracking contract.
- Toast action and close controls now have 44px minimum hit areas and visible focus rings.
- Why: the references teach agents what “correct” looks like. They must not silently undermine the rules.

**5. Corrected inspiration source drift**
- The inspiration corpus is in `Inspiration/` at repo root, not `/Users/soheil/Desktop/Inspiration`.
- The corpus currently contains 18 source files, not 8.
- Why: provenance needs to be auditable if the taste log is going to act as system memory.

---

## ENTRY 006 — Additional Inspiration Drop
**Date:** 2026-04-22
**Source:** Newly added images in `Inspiration/` (latest 2026-04-22 batch)
**Type:** Visual reference

### Signals extracted

**1. Segmented progress reads more instrument-like than continuous fill**
- Repeated signal: thin discrete ticks for credits, quota, or completion.
- Decision: add `SegmentedBar` as a first-class component alongside `DottedChart`.

**2. Compact segmented controls are a strong fit for dense tool surfaces**
- Repeated signal: pill-track mode switchers with a filled active segment and quiet inactive segments.
- Decision: add `SegmentedControl` for tabs, scopes, and filter rows.

**3. Light references still reward spacing discipline more than decoration**
- Repeated signal: quiet paper-like canvases, thin dividers, minimal shadows, strong content hierarchy.
- Decision: keep light mode as a secondary surface language, but do not soften radius or add elevation theater to imitate it.

**4. Progress and state should feel explicit, not atmospheric**
- Repeated signal: concrete usage, credits, and task status views.
- Decision: formally discourage skeleton loaders and shimmer chrome. Status should read as text or discrete progress, not as placeholder theater.

---

## ENTRY 007 — Softer Display Voice + AI-Native State
**Date:** 2026-04-22
**Source:** Direct review of the live preview plus current inspiration batch
**Type:** Correction / extension

### Signals extracted

**1. Large Geist at 600 reads too neutral in the hero**
- Repeated signal: the big headline had the right restraint but the wrong tone. At 600, Geist started reading closer to Helvetica than intended.
- Decision: keep Geist, but lighten `display` through `h3` to 500 and open tracking slightly. Fix the voice before changing the family.

**2. Motion should clarify state, not just decorate sections**
- Repeated signal: progress, hero copy, and metric surfaces wanted a clearer sense of arrival.
- Decision: add staggered segment reveal to `SegmentedBar`, soft line-reveal motion in the hero, and a small fade/translate entrance for explicit state surfaces.

**3. The system needed more first-class AI-native primitives**
- Repeated signal: loading and execution states were still being composed ad hoc from generic parts.
- Decision: add `InlineStatus` for explicit system state and `ToolCall` for invocation rows. These push the DS toward AI-native product surfaces without adding theatre.

---

## ENTRY 008 — Title Hierarchy Turns Toward Instrument Type
**Date:** 2026-04-22
**Source:** Direct review of the live preview and current title hierarchy
**Type:** Correction / extension

### Signals extracted

**1. Section and card titles wanted more system authority than display softness**
- Repeated signal: the Cash Sans section title was elegant, but too close to the page-title voice. The hierarchy felt flatter than intended.
- Decision: move `h2` and `h3` to `Geist Mono` while keeping `display` and `h1` on Cash Sans. This makes framing text feel more like an instrument readout than a marketing subhead.

**2. Chapter and page titles should prove the alpha/numeric mix**
- Repeated signal: the system talks about data-forward typography, but the heading specimens were still all-letters.
- Decision: update the display and h1 specimens to read `Aa 0123`, with the numeric run explicitly set in mono + tabular figures. Letters keep the editorial voice; numbers keep the machine voice.

---

## ENTRY 009 — Completion Accent, Not Decoration
**Date:** 2026-04-22
**Source:** Direct request during preview refinement
**Type:** Extension

### Signals extracted

**1. The system needed a completion color without becoming a multicolor brand palette**
- Repeated signal: red handled live/active well, but the system had no semantic endpoint color for "done", "committed", or "goal met".
- Decision: add `accent-success` (`#00E013`) as a second semantic accent. It is reserved for terminal completion only, never generic "positive" decoration.

**2. Green should appear only where the state has actually resolved**
- Repeated signal: progress completion and a chart endpoint are the places where green feels earned.
- Decision: allow `accent-success` on `SegmentedBar` only when `value === total`, and on `DottedChart` only for an explicitly documented success endpoint. Keep the rest of the graph monochrome.

---

## ENTRY 010 — 2.0 Consolidation: Refusal Contract → Composition Contract
**Date:** 2026-05-01
**Source:** Cross-skill mining of nine external design-skill repos + direct review of a B+/D− test page produced by 1.0
**Type:** Major extension (additive, no removals)

### Why this entry exists

A real test page produced by sous-ds 1.0 (a "PRD-to-verified-handoff" pipeline status dashboard) graded B+ overall but D− on visual taste, hierarchy, copywriting, and component-IQ. Every failure on that page was reachable inside 1.0's rule space — meaning 1.0 is incomplete.

Root cause: 1.0 is a **refusal contract + token contract** (what to refuse, what tokens to consume) with no positive theory of composition (no page archetypes, no intent → component decision tree, no copy contract, no variance dial). The safest default that satisfies 1.0 — `card grid + Pill walls + verbose body + 4-of-18 components` — is a legal output that grades D−.

### Sources mined for 2.0

| Source | Highest-leverage extraction |
|---|---|
| `Donsoleil/awesome-design-md` | 9-section DESIGN.md template; semantic-over-technical naming; Agent Prompt Guide pattern |
| `Donsoleil/awesome-design-patterns` | Problem-centric component selection (vs. listing components by name) |
| `anthropics/skills` → `frontend-design` | Tone Picker (10 extreme aesthetics); Spatial Composition (asymmetry, overlap); "intentionality > intensity" mantra; pre-coding Design Thinking checklist (Purpose / Tone / Constraints / Differentiation) |
| `vercel-labs/agent-skills` → `web-design-guidelines` | Anti-pattern audit checklist; content-aware layout (truncate / min-w-0); content & copy guards (active voice, error messages that suggest fixes) |
| `google-labs-code/stitch-skills` → `design-md` | Atmosphere statement (one line that constrains all decisions); whitespace rhythm as system (8px units, 2rem vertical); responsive as architecture |
| `nextlevelbuilder/ui-ux-pro-max-skill` | Priority-ranked decision (a11y/touch GATE style); type scale `12-14-16-18-24-32`; touch targets `44pt + 8px`; product-type → component matching (161 categories) |
| `leonxlnx/taste-skill` | Three Design Dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY); specific bans (no Inter, no #000, spring physics constants); centered-hero ban when DESIGN_VARIANCE > 4; mobile fallback rule |
| `github/awesome-copilot` → `documentation-writer` | Diátaxis four-quadrant (Tutorial / How-to / Reference / Explanation); brevity-as-structure; user-goal-first writing |
| `remotion-dev/skills` → `remotion-best-practices` | Motion-as-information (every motion answers "why does this animate?"); still-frame legibility audit; stagger-and-delay rhythm; duration-clarity checklist |

### Decisions

**1. 2.0 is additive, not a rewrite.**
- 1.0 tokens, refusals, components, family-grammar (`R-FAMILY-001`), accent semantics — all preserved verbatim.
- Five new layers stacked on top: composition recipes, intent → component map, voice contract, design dials, new refusals.

**2. Composition Recipes — named page archetypes.**
- Initial six: `PipelineMap`, `MilestoneStrip`, `AgentLog`, `ReceiptStack`, `MetricWall`, `RAGStatus`.
- Each declares: intent, primary primitive, supporting components, layout, microcopy template, density quotas, forbidden substitutes.
- Page must use ≥3 distinct recipes when `RHYTHM ≥ 4` (default).
- Source: `anthropics/frontend-design` Spatial Composition + `awesome-design-patterns` problem-centric mapping + `stitch` atmosphere statement.

**3. Intent → Component decision tree.**
- 15-row table mapping content shape to canonical primitive + forbidden substitute.
- Closes the 4-of-18 component starvation gap by removing selection ambiguity.
- Source: `awesome-design-patterns` + `ui-ux-pro-max` product-type matching.

**4. Voice Contract — terse instrument-readout.**
- Seven canonical voice rules. Per-recipe microcopy templates. Banned phrases (V7) catalogue (status-meeting voice).
- Source: `documentation-writer` Diátaxis + brevity-as-structure; `taste-skill` name bans; `vercel` content guards; `remotion` still-frame legibility.

**5. Design Dials — DENSITY / RHYTHM / VOICE.**
- Three dials parameterize the page. Defaults `6/6/4` for AI-product surfaces.
- `RHYTHM` binds recipe variance.
- Source: `taste-skill` three-dial system; `anthropics` Tone Picker; `ui-ux-pro-max` searchable BM25 taxonomy.

**6. Nine new refusal IDs added to the corpus.**
- `R-TYPE-002` (no serif fallback for display/h1)
- `R-COMPOSE-001` (no card grid for sequenced content)
- `R-COMPOSE-002` (no recipe used > 2 times)
- `R-COMPOSE-003` (max 3 pills per card / 8 per section)
- `R-COMPOSE-004` (≥3 distinct recipes when RHYTHM ≥ 4)
- `R-METRIC-001` (MetricStat group needs shared unit/axis)
- `R-VOICE-001` (no file paths in body prose)
- `R-VOICE-002` (no adjacent-section micro-template repetition)
- `R-VOICE-003` (no status-meeting phrasing)

**7. Roadmap promotions.**
- `<AgentStream>` and `<Citation>` committed for v0.7.
- `<Transcript>` and `<TokenMeter>` committed for v0.8.
- `<DiffBlock>` and `<ConfidenceBar>` deferred (composable from existing primitives).

### Source-driven decisions explicitly rejected

- **No Tailwind / Framer Motion adoption.** `taste-skill` and `vercel-labs` lean heavily on these; sous-ds keeps the zero-dep CSS + RAF motion primitive for portability.
- **No font expansion to Geist / Outfit / Cabinet Grotesk / Satoshi.** `taste-skill`'s "no Inter, use Geist/Outfit/Satoshi" rule conflicts with sous-ds's already-canonical Cash Sans + Geist + Geist Mono stack. Adopted the principle (no Inter), kept the family choice.
- **No spring physics defaults.** `taste-skill` mandates `type: spring, stiffness: 100, damping: 20` via Framer Motion. sous-ds keeps `var(--ds-ease-out)` (`cubic-bezier(0.16, 1, 0.3, 1)`) as the canonical entrance easing, since the motion primitive is dependency-free.
- **No "67 named styles" taxonomy.** `ui-ux-pro-max`'s 67-style search index (Glassmorphism, Bento, Brutalism, etc.) over-constrains. sous-ds is one style; the dials parameterize within it.

### Verification target

The 1.0 case-study page becomes the v0.7.0 verification target. After 2.0 ships, the same prompt should produce a page that uses `PipelineMap` + `MetricWall` + `RAGStatus` + `AgentLog` + `MilestoneStrip` (≥5 recipes), 8+ distinct components, no card grid for the pipeline, instrument-readout copy, and no file paths inline. Side-by-side with the 1.0 output, this becomes a teaching artifact at `examples/pipeline-status-2.0.html`.

### Spec artifacts (not in repo root — under `docs/specs/`)

- `docs/specs/sous-ds-v2.md` — canonical 2.0 spec with full architecture, gap analysis, and rule additions
- `docs/specs/sous-ds-v2-composition-recipes.md` — initial six recipes with JSX skeletons and microcopy templates
- `docs/specs/sous-ds-v2-voice.md` — voice contract with seven rules, per-recipe templates, banned phrases catalogue
