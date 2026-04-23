# Ship A + B — DotTimeline and PulseTrail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two dot-motif data-viz components (`<DotTimeline>`, `<PulseTrail>`) as new members of the Data Motif family, retire the solid-bar `<DensityStrip>` that broke family grammar, and update all contract surfaces (DESIGN.md, SKILL.md, refusals.json, lint.mjs, quality-evaluator.md) accordingly.

**Architecture:** Two separate single-responsibility components sharing the 6px dot primitive (`--ds-size-dot`) with DottedChart. `<DotTimeline>` handles quantitative "how much over time" (dot-stack per bucket). `<PulseTrail>` handles qualitative "alive right now" (single moving dot + decaying trail). No shared code; no base component — each file stands on its own, linkable and copyable.

**Tech Stack:** React + CSS custom properties (no runtime CSS libs). Motion via CSS transitions for interruptible state + CSS `@keyframes` for the infinite pulse. `prefers-reduced-motion: reduce` fallback is non-negotiable.

**Decision log (from this session's verbalized-sampling synthesis):**
- A + B over all-three because C overlaps A (both show density-over-time; A shows it more precisely)
- B is the AI-native differentiator; A is the utility floor
- Retiring `DensityStrip` name because the solid-bar primitive it described is gone

---

## File structure after this plan

```
components/
├── DotTimeline.tsx                 (NEW — replaces DensityStrip)
├── DotTimeline.css                 (NEW)
├── PulseTrail.tsx                  (NEW)
├── PulseTrail.css                  (NEW)
├── DensityStrip.tsx                (DELETED)
├── DensityStrip.css                (DELETED)
└── index.ts                        (MODIFIED — swap exports)

docs/superpowers/specs/
└── 2026-04-22-dot-motif-variants-design.md   (NEW — supersedes density-strip-design.md)

(existing files modified:)
preview.html                        (variants playground → real component demos)
DESIGN.md                           (accent carriers swapped)
SKILL.md                            (accent carriers mirrored)
refusals.json                       (R-SEMANTIC-001 allowedFiles)
scripts/lint.mjs                    (CL07 allowlists)
quality-evaluator.md                (CL07 row)
CHANGELOG.md                        (Unreleased section)
```

---

## Task 1: Supersede old spec + write new spec

**Files:**
- Modify: `docs/superpowers/specs/2026-04-22-density-strip-design.md` (prepend superseded notice)
- Create: `docs/superpowers/specs/2026-04-22-dot-motif-variants-design.md`

- [ ] **Step 1: Prepend superseded notice to old spec**

Add at the very top of the old density-strip-design.md:

```markdown
> **⚠️ SUPERSEDED** — this spec described the solid-bar DensityStrip, which
> broke the Data Motif family grammar (DottedChart uses dots; this used
> rectangles). The review that followed produced R-FAMILY-001 (see
> SKILL.md "Extending a component family"), a three-variant dot-based
> re-exploration, and the decision to ship A + B as `<DotTimeline>` and
> `<PulseTrail>`. This document is preserved for history.
>
> **Current spec:** [2026-04-22-dot-motif-variants-design.md](./2026-04-22-dot-motif-variants-design.md)
```

- [ ] **Step 2: Write new spec document**

Cover: motif statement, vocabulary table, two component specs (props / states / motion / tokens / a11y / contract updates / edge cases), file list. Target ~150–200 lines.

- [ ] **Step 3: Commit**

```
git add docs/superpowers/specs/2026-04-22-density-strip-design.md \
       docs/superpowers/specs/2026-04-22-dot-motif-variants-design.md
git commit -m "spec: DotTimeline + PulseTrail (supersede DensityStrip solid-bar spec)"
```

---

## Task 2: Create DotTimeline.tsx + .css

**Files:**
- Create: `components/DotTimeline.tsx`
- Create: `components/DotTimeline.css`

- [ ] **Step 1: Write component**

Accept the same data-model as the old DensityStrip (`buckets` | `events + window + bucketSize`) but render each bucket as a vertical stack of 6px dots. Props:

```ts
type DotTimelineProps = {
  buckets?: Bucket[];
  events?: TimelineEvent[];
  window?: number;       // default 60_000 ms
  bucketSize?: number;   // default 2_500 ms (→ 24 buckets)
  maxDots?: number;      // default 10 — tallest bucket = this many dots, others scaled
  label?: string;
  showAxis?: boolean;
  className?: string;
};
```

State rendering (priority `live > done > queued`):
- `done` → `var(--ds-accent-success)`, opacity 1
- `live` → `var(--ds-accent-live)`, opacity 1 + 2s linear pulse keyframe matching LiveDot
- `queued count > 0` → `var(--ds-text-muted)`, opacity 0.55
- `count = 0` → single `var(--ds-text-muted)` dot at 0.3 opacity (empty-bucket marker)

Scale dots: `dotCount = max(1, round(count / maxCount * maxDots))` when `count > 0`.

A11y: container `role="img"` with `aria-label` summarizing the window; each column `tabindex="0"` with per-bucket aria-label (time + count + state); focus ring via `:focus-visible` matching Button.

- [ ] **Step 2: Write CSS**

- Container: flex row, `align-items: flex-end`, `gap: var(--ds-space-2)`, height ~120px
- Column: `flex: 1`, `flex-direction: column-reverse` (stack from bottom), `gap: 3px`
- Dot: 6px circle, state-driven background
- Transition on state change: `var(--ds-dur-standard)` with `var(--ds-ease-out)` on background-color + opacity only
- `@keyframes dot-timeline-pulse` for live state
- `@media (prefers-reduced-motion: reduce)`: disable pulse, use static outline for live marker

- [ ] **Step 3: Verify lint passes**

Run: `node scripts/lint.mjs components/`
Expected: 0 errors, 0 warnings.

---

## Task 3: Create PulseTrail.tsx + .css

**Files:**
- Create: `components/PulseTrail.tsx`
- Create: `components/PulseTrail.css`

- [ ] **Step 1: Write component**

Single accent dot sweeps left→right; fading trail of past events. Props:

```ts
type PulseTrailProps = {
  events?: TrailEvent[];          // { ts, state } — last N rendered as trail
  trailLength?: number;           // default 10 — how many trail dots to show
  window?: number;                // default 60_000 — visible time range in ms
  loopDuration?: number;          // default 6_000 ms — sweep duration
  label?: string;
  showAxis?: boolean;
  className?: string;
};
```

Rendering:
- Trail: up to `trailLength` dots positioned at `xPct = (1 - (now - event.ts) / window) * 100`; color by event.state; opacity decays linearly from 1 at right → 0.15 at left
- Head: single pulsing `--ds-accent-live` dot animated left→right via CSS keyframe over `loopDuration` ms (linear ease-strong curve from Emil's --ds-ease-out)
- Reduced motion: head animation disabled; head pinned at right edge; trail static

A11y: container `role="img"` with `aria-label` like `"Agent activity trail, last 60 seconds, 8 events in window."` Head and trail are `aria-hidden` (decorative).

- [ ] **Step 2: Write CSS**

- Container: relative, `height: 48px`, `border-bottom: 1px solid var(--ds-line)`
- Trail dot: absolute, transform-centered on its coordinates
- Head dot: absolute, `@keyframes pulse-trail-sweep` 0→100% `left` over `loopDuration`
- Head pulse: concurrent keyframe on opacity (1→0.55→1) matching LiveDot cadence (independent of sweep, both run on head)
- Prefers-reduced-motion: both animations disabled, head pinned

- [ ] **Step 3: Verify lint**

Run: `node scripts/lint.mjs components/`
Expected: pass.

---

## Task 4: Retire DensityStrip

**Files:**
- Delete: `components/DensityStrip.tsx`
- Delete: `components/DensityStrip.css`

- [ ] **Step 1: Remove files**

```
git rm components/DensityStrip.tsx components/DensityStrip.css
```

- [ ] **Step 2: Grep repo to confirm nothing still imports DensityStrip**

Run: `grep -rn "DensityStrip" . --include="*.tsx" --include="*.ts" --include="*.css" --include="*.md" --include="*.html" --include="*.json" --include="*.mjs" | grep -v docs/superpowers`

Expected: every remaining reference is in a doc file explicitly talking about the retirement. If any code reference remains, fix it in the appropriate later task.

---

## Task 5: Update components/index.ts

**Files:**
- Modify: `components/index.ts`

- [ ] **Step 1: Swap exports**

Replace:
```ts
export { DensityStrip } from "./DensityStrip";
export type { DensityStripProps, Bucket, BucketState, StripEvent } from "./DensityStrip";
```

With:
```ts
export { DotTimeline } from "./DotTimeline";
export type { DotTimelineProps, Bucket, BucketState, TimelineEvent } from "./DotTimeline";

export { PulseTrail } from "./PulseTrail";
export type { PulseTrailProps, TrailEvent } from "./PulseTrail";
```

- [ ] **Step 2: Update the docstring usage example in the file**

Drop `DensityStrip` from the example import; add `DotTimeline` and `PulseTrail`.

---

## Task 6: Update contract surfaces (accent carriers + CL07)

**Files:**
- Modify: `DESIGN.md`
- Modify: `SKILL.md`
- Modify: `refusals.json`
- Modify: `scripts/lint.mjs`
- Modify: `quality-evaluator.md`

- [ ] **Step 1: DESIGN.md — swap DensityStrip for DotTimeline + PulseTrail in carrier lists**

Replace every mention of `DensityStrip` in the accent-carrier sections with the appropriate carrier:
- `accent-live`: add `<PulseTrail>` (head dot); drop `<DensityStrip>` references
- `accent-success`: add `<DotTimeline>` (done buckets); drop `<DensityStrip>` references
- `accent-live` stacks: `<DotTimeline>` can also carry accent-live (running buckets), but `<PulseTrail>` is the canonical carrier for "live now" activity

- [ ] **Step 2: SKILL.md — mirror the carrier list change**

Same swap in the "Accent carriers (exhaustive)" section.

- [ ] **Step 3: refusals.json — update R-SEMANTIC-001.allowedFiles**

Replace `components/DensityStrip.css` with BOTH `components/DotTimeline.css` and `components/PulseTrail.css`.

- [ ] **Step 4: scripts/lint.mjs — update both CL07 allowlists**

In `ruleCL07_accentCarrier` accentRules array, for both `--ds-accent-live` and `--ds-accent-success`, replace `components/DensityStrip.css` with `components/DotTimeline.css` and `components/PulseTrail.css`.

- [ ] **Step 5: quality-evaluator.md — update CL07 row**

Rephrase the CL07 description to reference `DotTimeline` and `PulseTrail`; remove `DensityStrip`.

- [ ] **Step 6: Verify lint still passes after carrier updates**

Run: `node scripts/lint.mjs components/ preview.html`
Expected: pass.

---

## Task 7: Update preview.html

**Files:**
- Modify: `preview.html`

- [ ] **Step 1: Replace the three-variants exploration with two real component demos**

The current `.variants` block contains A + B + C as proposals. Replace with two sections:

1. **DotTimeline demo** — single representative strip (24 buckets, mixed states, one live cluster). Inline the component's markup + CSS (preview.html is portable static HTML).
2. **PulseTrail demo** — single trail with animated head.

Keep the unified section-aside updated: `Dot stacks · Pulse trails · Two in-family variants of the dot motif.`

- [ ] **Step 2: Update inline CSS + JS**

Rename `.ds-stack` → `.dot-timeline`, `.ds-trail` → `.pulse-trail` in the preview's inlined CSS. Rename the JS renderer functions to match. Delete variant-C code.

- [ ] **Step 3: Verify**

Run: `curl -s http://127.0.0.1:8765/preview.html | grep -c "dot-timeline\|pulse-trail"`
Expected: >= 2.

---

## Task 8: CHANGELOG + final lint + commit + tag

- [ ] **Step 1: Add CHANGELOG entry under "Unreleased"**

```markdown
### Added
- **`<DotTimeline>`** — dot-stack timeline. Direct dot-motif sibling of
  DottedChart for "how much / when" data. 24 buckets default, each a
  vertical stack of 1–10 6px dots; color marks state (done / live / queued).
- **`<PulseTrail>`** — Emil-style signature motion. Single accent-live dot
  sweeps left→right over a configurable loop, trailing 10 decaying prior
  events. For "is the agent alive right now?" feel; minimal chrome.

### Changed
- `<DensityStrip>` retired. Its solid-bar primitive broke the Data Motif
  family grammar (DottedChart is dots); the R-FAMILY-001 protocol added
  in this same release prevents that class of mistake from recurring.
- Accent-carrier allowlists (DESIGN.md, SKILL.md, refusals.json,
  scripts/lint.mjs, quality-evaluator.md) swap DensityStrip out for
  DotTimeline + PulseTrail.
```

- [ ] **Step 2: Final lint + pack check**

Run:
```
node scripts/lint.mjs components/ preview.html
npx --yes @google/design.md lint DESIGN.md
```
Expected: both pass.

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat: ship <DotTimeline> + <PulseTrail>, retire <DensityStrip>"
```

- [ ] **Step 4: Tag**

```
git tag v0.2.2
git log --oneline | head -5
```

---

## Out of scope

- Batch-commit stagger on DotTimeline (40ms cascade left→right). Deferred until real streaming data is wired.
- Click-to-drill-in / tooltip on trail dots. Deferred.
- Canvas-backed PulseTrail for very-high-event-rate scenarios. Current DOM approach fine for typical AI agent call rates.
- A shared `<DotMotif>` base component. Explicitly rejected — premature abstraction. Each component stands alone.

## Rollback

Every task commits independently (except the final rollup in Task 8). To revert a single change, `git revert <hash>`.
