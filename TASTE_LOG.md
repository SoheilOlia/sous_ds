# TASTE_LOG.md
> Canonical taste memory for the design system.
> Append-only. Never silently overwrite. Each entry is timestamped and sourced.
> Last updated: 2026-05-12 (v0.12.0 — Profile recipe; R-FAMILY-001 pass on the recipes family)

---

## HOW TO READ THIS FILE

Each entry records what was learned, from what source, and what it means for the system.
Conflicts between entries are flagged explicitly, never silently resolved.
The Quality Evaluator uses this file as ground truth for taste signals.

### Entry template (v0.11.0+)

Every new entry MUST include a `### Planner update` subsection that names
what rule (if any) was added to `docs/specs/planner-taste.md` and at what
anchor. If the entry does not touch planner behavior, write `n/a`.

This is the taste-bridge contract — `TASTE_LOG.md` is the human audit
trail; `planner-taste.md` is the runtime planner-audience corpus. Without
the cross-reference, new taste decisions silently fail to reach the
planner. See `docs/specs/2026-05-11-taste-bridge-design.md` (Option D).

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
- `R-TYPE-004` (no serif fallback for display/h1; `R-TYPE-002` already taken in 1.0)
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

---

## ENTRY 011 — Learning Protocol: Source-Owned, Not Style-Owned
**Date:** 2026-05-04
**Source:** Direct mining of `Donsoleil/ui-ux-pro-max-skill`, `Donsoleil/cult-ui`, and the Trust Automation milestone map polish pass
**Type:** Distribution / governance extension

### Signals extracted

**1. Design intelligence needs a portable operating model**
- `ui-ux-pro-max-skill` is strongest as a packaging and reasoning pattern: searchable knowledge, domain/stack checklists, pre-delivery gates, and platform templates.
- Decision: add a global SOUS-DS skill and installer path so Claude, Codex, Goose, and Cursor start from the same contract.
- Rejected: importing a broad catalogue of named visual styles. SOUS-DS remains one system; dials and recipes handle variation.

**2. Repeated local CSS should become source-owned system code**
- `cult-ui` is strongest as a source-owned registry model: copyable components, inspectable recipes, and no black-box package layer between design and implementation.
- Decision: "Learn from this project" now means extract durable component/recipe/refusal lessons and promote them into SOUS-DS source truth.
- Rejected: copying decorative components or project-specific surface styling into the system.

**3. The Trust Automation milestone map exposed real promotion candidates**
- Linked pills, source links, compact metric rails, progress stacks, dense evidence tables, and milestone stage cards should not remain app-local forever.
- Decision: capture those as SOUS-DS learning candidates in `docs/specs/sous-ds-reference-learning.md`.
- Boundary: Trust Automation copy, PR IDs, milestone labels, and proof semantics stay in Trust Automation.

---

## ENTRY 011 — Nexus session: reflective surfaces and the policing-chrome refusal
**Date:** 2026-05-11
**Source:** Nexus app session with the user (`/Users/soheil/Library/Application Support/com.nexus.app/...`) — visual critique on generated UI variants A / B / C against Cash CDWM Block 2.0 / democratized-knowledge-layer surfaces. Captured in the structured handoff format defined in this conversation.
**Type:** Composition contract extension + voice clarification + new refusals

### Why this entry exists

This session surfaced a structural distinction the system had implicit but never named: **reflective surfaces vs status surfaces.** Without it, the system kept generating "looks restrained, behaves like a status dashboard" outputs — passing every R-* check in the 2.0 contract yet still wrong. Naming it as a refusal (R-COMPOSE-005) and adjacent refusals (R-COMPOSE-006, R-METRIC-002) closes the gap.

The session also produced the forcing function for the taste-bridge architecture: this many cross-cutting decisions, all planner-relevant, with no path into the runtime planner system prompt other than hand-copy. Option D (`docs/specs/planner-taste.md`) ships in the same release.

### Signals extracted (10 blocks)

**1. R-COMPOSE-005 — No policing chrome on reflective surfaces.** *Principle.* On reflective surfaces (knowledge layers, weekly status, team-roster, profile, directory), forbid risk badges, ranks, scores, flags, and computed verdicts. Status-judgment chrome belongs in PM tools, not in a knowledge layer. The Screen Time principle: present information, do not police. Source quote: *"Screen Time does not say hey Soheil get off Twitter… all it does is it builds an interface to collect information and present that information back."* Surface: `refusals.json` (new R-COMPOSE-005), `planner-taste.md` (Reflective surfaces vs status surfaces), `DESIGN.md`.

**2. R-COMPOSE-006 — No matching/relevancy/scoring on roster surfaces.** *Principle.* Roster, profile, and team-detail surfaces must not include match-summary/relevancy/interest rails alongside the artifact list — the Bumble/Hinge/Tinder aesthetic is the failure mode even when chrome is restrained. Roster surfaces in an instrument system look like crew manifests. Source: Bumble Conversations reference (`/Users/soheil/Library/Application Support/com.nexus.app/media/images/20260511-213257-79ffa7fc368d4476af2cbf9db7b558d3.png`). Surface: `refusals.json` (new R-COMPOSE-006), `planner-taste.md`.

**3. R-METRIC-002 — No per-person comparative counts.** *Principle.* `<MetricStat>` and `<DottedChart>` may not display per-person counts in a comparative or ranking shape. Person components show what was made (demos, Figma files, GitHub contributions), not how much. Counts are permitted only when self-evidently descriptive ("3 files this week") and never invite comparison. Test: *could this metric be used to compare two people on the same screen?* If yes, refusal fires. Source: *"designers… are less interested in milestones or data… more interested in the juice of the consumer experiences like demos figma files github contributions."* Surface: `refusals.json` (new R-METRIC-002), `planner-taste.md` (Person components), `MetricStat.tsx` JSDoc (future).

**4. R-VOICE-003 extension — PM/status-meeting status words.** *Clarification.* The R-VOICE-003 banned-phrase catalogue extends with `risk`, `stale`, `off track`, `no DRI`, `blocked`, `behind`, `underperforming`. Same failure mode as the 1.0 banned phrases ("we are building", "main-branch truth"), different vocabulary — these are the PM-tool vernacular for narrating state as judgment. The lint regex catches the unambiguous multi-word phrases (`off track`, `no DRI`, `underperforming`); the single-word bans (`risk`, `stale`, `blocked`, `behind`) are documented but not auto-enforced (too many false positives at info severity). Source: CDWM AGENTS.md guidance captured during onboarding. Surface: `refusals.json` (R-VOICE-003 pattern + rationale + correct), `scripts/lint.mjs` BANNED list, `planner-taste.md`.

**5. Prezzo mode is the default for executive-distance surfaces.** *Polish.* Today the contract names prezzo as "for slides, keynotes, screenshots intended to be read at presentation distance" — positioning it as an export mode. The actual best use is *any* surface where the audience is reading state as story, not as data: weekly updates, all-hands, executive readouts, team-of-teams snapshots. Same type contract, expanded practical surface area. Source: `/sous-ds` invocation this session — *"Let's get all of them a pass of our design system. Go with the presentation one."* Surface: `planner-taste.md` (Prezzo mode section), `DESIGN.md` (Prezzo guidance).

**6. R-TYPE-004 — Reference imagery does not override serif refusal.** *Polish.* The system already refuses serif fallback for display/h1 (R-TYPE-004). The clarification: this refusal carries even when reference imagery shared with the agent uses an editorial serif (e.g. Instrument Serif numbered Index). Cash Sans Display at the same size carries the editorial weight; prezzo mode collapses everything to Cash Sans anyway. Source: Direction B reference image (`20260511-212858-5ce6c11a603d489e8b3b2c20f2d1a608.png`) — variant B's implementation correctly swapped Instrument Serif for Cash Sans display, no pushback. Surface: `refusals.json` (R-TYPE-004 rationale clarification), `planner-taste.md`.

**7. Version handshake on /sous-ds invocation.** *Polish.* When `/sous-ds` is invoked, the agent must announce the version it has loaded before applying any rule (`Loaded SOUS-DS v0.11.0, v2.0 composition contract`). Forces verification that the agent has the right layer. Source: *"(make sure it's the latest version) confirm you are loading the v2 composition contract."* Surface: `SKILL.md` (new Version handshake section).

**8. Source-system wordmark chiprow.** *Polish.* Reflective surfaces need to communicate which systems back the data (Slack permalinks, Figma URLs, GitHub PRs, Linear issues, Notion docs). The minimal carrier is a mono-uppercase tracked wordmark inside a 1px-bordered chip — same shape as `<Pill variant="outline">` with semantic content. Brand-color logos are forbidden (R-COLOR-002, R-SEMANTIC-001). Source: Direction A discussion — *"It is on a white background so it looks very clean. Potentially we could even add logos for Slack or Linear or Figma."* Variant A shipped this as a wordmark chiprow. Surface: `planner-taste.md` (Source-system provenance), `GAPS.md` (build a `<Pill variant="wordmark">` later per R-FAMILY-001).

**9. AgentLog row differentiation via bracketed labels, not hue.** *Polish.* AgentLog rows differentiate event kinds (demo / decision / status / code) via the bracketed mono `[KIND]` label inside the row, never via per-row background hue or per-kind text color. The natural first move (tinting each row by kind) violates R-SEMANTIC-001 + R-COLOR-002. Variant C made this mistake first (`--demo: #B0421F; --decision: #355E3B; --status: #5A5A5A;`), then corrected during the SOUS-DS pass. Surface: `docs/specs/sous-ds-v2-composition-recipes.md` (AgentLog section), `planner-taste.md` (AgentLog row differentiation).

**10. Single-archetype pages valid with RHYTHM ≤ 3 + inline dial declaration.** *Polish.* R-COMPOSE-002/004 require recipe variance, but legitimately-single-archetype surfaces (resume index, directory, glossary) are exempt when `RHYTHM ≤ 3` is declared **inline in the renderer** — typically a header comment naming dials and the exemption rationale. The declaration is the honesty contract; reviewers check for it before citing R-COMPOSE-002. Source: Direction A reference (`20260511-212536-54a3d860ca2f49dd93bf2c27fb9da6a0.png`) — single-archetype resume layout explicitly chosen ("super simple"); variant A's renderer declares `Dials: DENSITY=4, RHYTHM=2 (single-archetype resume layout — exempt from R-COMPOSE-002/004 per the dial contract)`. Surface: `refusals.json` (R-COMPOSE-002 + R-COMPOSE-004 rationale and correct fields), `planner-taste.md` (Dial declaration honesty), `docs/specs/sous-ds-v2-composition-recipes.md`.

### Planner update

All ten blocks land in `docs/specs/planner-taste.md` (new file, shipped this release). Anchors:

- §1 → `planner-taste.md#reflective-surfaces-vs-status-surfaces` (R-COMPOSE-005)
- §2 → `planner-taste.md#reflective-surfaces-vs-status-surfaces` (R-COMPOSE-006)
- §3 → `planner-taste.md#reflective-surfaces-vs-status-surfaces` (R-METRIC-002, Person components subsection)
- §4 → `planner-taste.md#voice` (V7 extension)
- §5 → `planner-taste.md#prezzo-mode`
- §6 → `planner-taste.md#type-and-accent-clarifications` (R-TYPE-004)
- §7 → `SKILL.md` (Version handshake) — not a planner-taste rule; the planner reads its corpus on every call, the handshake is for the agent loading the skill
- §8 → `planner-taste.md#source-system-provenance`
- §9 → `planner-taste.md#agentlog-row-differentiation`
- §10 → `planner-taste.md#dial-declaration-honesty`

### System integration

- New file: `docs/specs/planner-taste.md` (Option D taste-bridge; per `docs/specs/2026-05-11-taste-bridge-design.md`).
- `refusals.json` v0.4.0: +3 rules (R-COMPOSE-005, R-COMPOSE-006, R-METRIC-002), R-VOICE-003 pattern extended, R-TYPE-004 / R-COMPOSE-002 / R-COMPOSE-004 rationale clarifications.
- `scripts/lint.mjs` ruleCO11 BANNED list extended (3 phrases auto-enforced; remaining 4 single-word bans documented but not auto-enforced).
- `SKILL.md`: planner-taste.md added to read-order; new "Version handshake" section; R-FAMILY-001 gains Step 7 (register in planner decision tree).
- `examples/generative-ui-playground.tsx`: concatenates `planner-taste.md` after the planner system prompt at boot. Browser never sees `TASTE_LOG.md`.
- `docs/specs/generative-ui-planner.md`: voice rules and refusal subset stripped; replaced with a pointer to `planner-taste.md` (concatenated at runtime).
- `DESIGN.md`: prezzo guidance reframed as executive-distance default, not just slide export.
- `docs/specs/sous-ds-v2-composition-recipes.md`: AgentLog recipe spec gains explicit "differentiate by bracketed mono label, not by hue" note.
- `GAPS.md`: `<Pill variant="wordmark">` filed as a future R-FAMILY-001 candidate.

---

## ENTRY 012 — Profile recipe (seventh recipe; R-FAMILY-001 pass on the recipes family)
**Date:** 2026-05-12
**Source:** User dogfood — prompt *"Create a card that shows me: designer name, avatar, slack handle, what they are working on, AI confidence score"* failed schema validation in v0.11.0 because no existing recipe maps to "one person." Surfaced the catalogue gap. Design doc: `docs/specs/2026-05-12-profile-recipe-design.md`.
**Type:** Composition recipe addition (the family being extended is the recipes catalogue itself)

### Why this entry exists

The Nexus session (ENTRY 011) added R-COMPOSE-006 — "no matching/relevancy chrome on roster surfaces." That refusal told the planner what *not* to do for person-shaped surfaces, but didn't propose what to use. The first user prompt against the v0.11.0 build hit the gap immediately: ajv rejected the planner's output because it had invented properties (avatar, slackHandle, confidence) that didn't fit any of the six recipes. The error was the schema doing its job; the gap was real.

### Signals extracted

**1. The recipes family has a one-person primitive shape.** The motif (Card-wrapped page section, eyebrow + title + body composed from sanctioned primitives) accommodates a new recipe whose primary primitive is an identity-head row (monogram circle + name + handle + body). The variant decision was made via the R-FAMILY-001 protocol — survey, motif, vocabulary, three same-motif variants, recommendation, glance test against ReceiptStack.

**2. Monogram circle is the in-system avatar primitive.** No raster avatars in v1 — the precision-instrument aesthetic doesn't accommodate brand/photo imagery, and the dot-family vocabulary already establishes "small bordered circle in mono" as the system's identity glyph. Monogram is two-letter initial in mono, 40px (control-md), 1px border via `--ds-line-strong`, neutral text-primary. No accent. The `imageUrl` slot is deferred to a future R-FAMILY-001 pass.

**3. `[@handle]` carries the source-system handle.** Wrapped in mono brackets (same pattern as `<InlineStatus>` and `[ID]` in ReceiptStack rows). The slot is a single optional string; parameterizing it as `{ kind, value }` was rejected as overkill for v1.

**4. Confidence is the one per-person scalar R-METRIC-002 permits.** Rendered in `Card.meta` (right of the eyebrow), `<label> <value>%` format. Self-evidently descriptive of *this* surface, never comparative across people. Multiple confidence scores or per-person count groups would violate R-METRIC-002.

**5. Profile is single-archetype.** A Profile-only page declares `RHYTHM ≤ 3` inline per the v0.11.0 dial-declaration contract. Multi-Profile pages (rosters) need a future Roster recipe; up to 3 Profiles compose inline if `RHYTHM ≥ 4`.

**6. R-FAMILY-001 Step 7 (added in v0.11.0) was exercised on this work.** Profile registers in BOTH decision trees — `SKILL.md`'s intent→component table AND `generative-ui-planner.md`'s recipe + component vocabulary tables — so the runtime planner can actually reach the primitive. This is the first R-FAMILY-001 pass to use Step 7 since it was added; the protocol held.

### Planner update

- `docs/specs/planner-taste.md` — new section `# Profile recipe (v0.12.0)` covering when to pick Profile vs. ReceiptStack vs. AgentLog, the schema shape, what it refuses, microcopy, and the single-archetype dial declaration.
- `docs/specs/generative-ui-planner.md` — new `## Profile` block in the recipe catalog, monogram entry in the component vocabulary table.
- `SKILL.md` — Profile row added to the composition-recipes table and the intent→component decision tree.

### System integration

- New schema definition: `ProfileSection` in `docs/specs/generative-ui-schema.json` — `name` (required), `eyebrow`, optional `handle` (regex `^@?[A-Za-z0-9._-]+$`), `body`, `artifacts[]` (ReceiptItem-shaped, 0–6), `confidence` (`{ label, value 0..100 }`).
- New TS type: `ProfileSection` in `components/generative-ui-types.ts`.
- New renderer branch: `renderProfile()` in `components/GenerativeRenderer.tsx` — identity head, optional artifacts subsection. Uses `Card` with `label`/`meta`; no `title` (name is part of custom identity row).
- New CSS pattern: `.ds-gen-profile-monogram`, `.ds-gen-profile-head`, `.ds-gen-profile-identity`, `.ds-gen-profile-name`, `.ds-gen-profile-body`, `.ds-gen-profile-handle`, `.ds-gen-profile-artifacts*` in `GenerativeRenderer.css`. All values via `var(--ds-*)`. No accent painted directly.
- New fixture: `profile-soheil` in `examples/generative-ui-fixtures.json` — exercises every Profile field.
- `docs/specs/sous-ds-v2-composition-recipes.md` — new "7. Profile" full spec section with JSX skeleton, microcopy template, density quotas, failure modes replaced (Bumble/Hinge profile chrome), forbidden substitutes.
- `GAPS.md` — Roster recipe filed as next R-FAMILY-001 candidate.
- `CHANGELOG.md` v0.12.0 entry.
- `package.json` version bump 0.11.0 → 0.12.0.

### Glance test (R-FAMILY-001 step 5)

Profile rendered next to ReceiptStack (the closest sibling — both end in mono `[ID] · label · [STATE] · timestamp` row stacks). Verdict: **sibling, not visitor.** Same Card chrome, same eyebrow style, same artifact-row template. Differences (identity head, monogram, handle bracket, confidence meta slot) are the distinguishing primitives of the new recipe, not drift from family discipline.
