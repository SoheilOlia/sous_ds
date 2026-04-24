---
version: alpha
name: sous-ds
description: A dark-first, data-dense, restraint-led interface system. Monospace for all data, semantic accent pair only, 1px borders over shadows, precise motion under 300ms.

colors:
  # Dark mode (default)
  bg:                "#0A0A0A"
  surface:           "#141414"
  surface-raised:    "#1C1C1C"
  line:              "rgba(255,255,255,0.08)"
  line-strong:       "rgba(255,255,255,0.14)"
  text-primary:      "#F0F0F0"
  text-secondary:    "#A0A0A0"
  text-muted:        "#888888"
  text-on-primary:   "#0A0A0A"
  text-on-accent:    "#FFFFFF"
  text-on-success:   "#0A0A0A"
  accent-live:       "#E5533C"
  accent-success:    "#00E013"

  # Light mode (alternate)
  bg-light:               "#F4F4F4"
  surface-light:          "#FFFFFF"
  line-light:             "rgba(0,0,0,0.08)"
  text-primary-light:     "#1A1A1A"
  text-secondary-light:   "#6B6B6B"
  text-muted-light:       "#767676"

typography:
  display:
    fontFamily: Cash Sans
    fontSize: 90px
    lineHeight: 86px
    fontWeight: 400
    letterSpacing: "-0.04em"
  h1:
    fontFamily: Cash Sans
    fontSize: 64px
    lineHeight: 61px
    fontWeight: 400
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Geist Mono
    fontSize: 40px
    lineHeight: 38px
    fontWeight: 400
    letterSpacing: "-0.03em"
  h3:
    fontFamily: Geist Mono
    fontSize: 28px
    lineHeight: 30px
    fontWeight: 400
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    lineHeight: 26px
    fontWeight: 400
  body:
    fontFamily: Geist
    fontSize: 15px
    lineHeight: 24px
    fontWeight: 400
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  label:
    fontFamily: Geist Mono
    fontSize: 11px
    lineHeight: 16px
    fontWeight: 500
    letterSpacing: "0.08em"
  mono-xl:
    fontFamily: Geist Mono
    fontSize: 48px
    lineHeight: 56px
    fontWeight: 500
    fontFeature: "tnum"
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
    fontFeature: "tnum"

rounded:
  none: 0
  xs:   4px
  sm:   8px
  md:   12px
  lg:   16px
  pill: 9999px

spacing:
  "0":  0
  "1":  2px
  "2":  4px
  "3":  8px
  "4":  12px
  "5":  16px
  "6":  24px
  "7":  32px
  "8":  48px
  "9":  64px
  "10": 96px
  "11": 128px

components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
    rounded:         "{rounded.sm}"
    padding:         "12px 16px"
    height:          40px
    typography:      "{typography.body-sm}"
  button-primary-active:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
  button-secondary:
    backgroundColor: transparent
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.sm}"
    padding:         "12px 16px"
    height:          40px
  button-ghost:
    backgroundColor: transparent
    textColor:       "{colors.text-secondary}"
    padding:         "12px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.md}"
    padding:         24px
  pill-filled:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
    rounded:         "{rounded.pill}"
    padding:         "4px 10px"
  pill-outline:
    backgroundColor: transparent
    textColor:       "{colors.text-secondary}"
    rounded:         "{rounded.pill}"
    padding:         "4px 10px"
  dot-live:
    backgroundColor: "{colors.accent-live}"
    size:            6px
    rounded:         "{rounded.pill}"
  input:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.sm}"
    height:          40px
    padding:         "10px 12px"
  modal:
    backgroundColor: "{colors.surface-raised}"
    rounded:         "{rounded.md}"
    padding:         32px
  toast:
    backgroundColor: "{colors.surface-raised}"
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.md}"
    padding:         "12px 16px"
---

## Overview

### Visual theme

Terminal gravity meets editorial restraint. The interface feels like a precision instrument, not a brochure. Dark by default, near-black rather than charcoal. Monospace carries all data. The system is monochrome first: blacks, grays, and whites carry the structure; green is the primary semantic accent for positive emphasis, while red is a secondary rail for attention, anomaly, error, or urgent live-now state. Cards float on contrast, not shadow. Every element justifies its presence or it gets removed.

### Principles (in priority order)

1. **Restraint is the primary move.** If it does not carry information or structure, remove it.
2. **Weight and value over color.** Hierarchy comes from font weight, size, and luminance. Color is reserved for semantics.
3. **Data is a design element.** Numbers, times, and metrics are set in mono at display size. The value is the hero, not the label.
4. **Precision over softness.** 1px borders, tight radii, snappy motion. Nothing blurs or glows unless it must.
5. **The dot motif.** Dots, dashes, and pill-shapes as data encoding. Length = duration. Darkness = intensity. Density = volume. This is the system's visual signature.
6. **Each accent has one meaning.** `accent-success` (#00E013) is the primary accent for positive highlight, completion, and committed outcomes. `accent-live` (#E5533C) is the secondary attention rail for anomaly, alert, error, or urgent live-now state. Neither is a CTA or decoration.

### What this is not

Not a SaaS marketing aesthetic. No gold stars, no gradient hero blobs, no glass morphism, no elevation theater. Not warm, not playful, not soft. Not a generic dashboard.

---

## Colors

### Palette and roles

| Role | Token | Dark value | Light value | Usage |
|---|---|---|---|---|
| Page background | `bg` | `#0A0A0A` | `#F4F4F4` | Root canvas |
| Card surface | `surface` | `#141414` | `#FFFFFF` | Cards, panels, sheets |
| Raised surface | `surface-raised` | `#1C1C1C` | `#FFFFFF` | Popovers, menus, modals |
| Border | `line` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Card borders. The primary separator. Replaces shadows |
| Strong border | `line-strong` | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.14)` | Inputs, emphasized separators |
| Primary text | `text-primary` | `#F0F0F0` | `#1A1A1A` | Headings, body, filled button bg |
| Secondary text | `text-secondary` | `#A0A0A0` | `#6B6B6B` | Sub-headings, captions |
| Muted text | `text-muted` | `#888888` | `#767676` | Labels, timestamps, meta |
| Accent (success) | `accent-success` | `#00E013` | `#00E013` | Success, positive highlight, complete, committed, goal-met, resolved |
| Accent (attention) | `accent-live` | `#E5533C` | `#E5533C` | Alert, anomaly, error, urgent live-now, negative variance |

### Contrast guarantees (WCAG)

Every foreground/background pair in this palette passes AA minimum. Computed, not estimated:

| Pair | Ratio | Grade |
|---|---|---|
| `text-primary` on `bg` (dark) | 18.9:1 | AAA |
| `text-secondary` on `bg` (dark) | 7.58:1 | AAA |
| `text-muted` on `bg` (dark) | 5.58:1 | AA |
| `text-primary-light` on `bg-light` | 15.8:1 | AAA |
| `text-secondary-light` on `bg-light` | 5.33:1 | AA |
| `text-muted-light` on `bg-light` | 4.55:1 | AA (min) |
| `text-on-accent` on `accent-live` | 5.31:1 | AA |
| `text-on-success` on `accent-success` | 11.0:1 | AAA |

### Accent discipline

The accent pair is semantic, not decorative:

- `✓` `accent-success` for positive emphasis, completion, committed state, or a deliberately spotlighted good outcome
- `✓` `accent-live` for alert, anomaly, error, negative variance, or urgent live-now state
- `✓` Sanctioned success carriers: `SegmentedBar` when `value === total`, `DottedChart` endpoint marked as a closed positive result, a `DotTimeline` column in `done` state, a `TetrisLoader` row flash on line-clear, or another explicitly documented completion state
- `✓` Sanctioned attention carriers: `LiveDot`, `InlineStatus` in `tone="live"`, a live-pill prefix, a live-tone toast marker, a sparse `DottedChart` point marking anomaly/attention, a `DotTimeline` column in `live` state, or the head dot of `PulseTrail`
- **`PulseTrail` note:** `PulseTrail` is the canonical carrier for the "live now" agent-activity feel — a single accent-live dot sweeping left→right with a fading trail of prior events. Other components should compose `<PulseTrail>` rather than recreate the trailing-dot pattern.
- **`DotTimeline` note:** This is one of two components (alongside `PulseTrail`) permitted to carry both accents simultaneously. Each column holds a single state, so the two accents never overlap within one column; the component enforces state priority `live > done > queued` at bucketization time
- `✗` Primary CTA button color
- `✗` Link color
- `✗` Any decorative or branding use
- `✗` Letting the accent pair do the neutral palette's structural work

If green and red appear together, the semantic split must be explicit: green marks positive resolution or highlight, red marks attention or downside, and the neutral palette still carries the layout. If the cluster reads like a holiday theme instead of an instrument panel, one of the accents is wrong.

---

## Typography

### Type scale

| Role | Family | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display` | Cash Sans | 90 / 86 | 400 | -0.04em | Hero chapter title, marquee statement |
| `h1` | Cash Sans | 64 / 61 | 400 | -0.035em | Page title |
| `h2` | Geist Mono | 40 / 38 | 400 | -0.03em | Section title, instrument framing |
| `h3` | Geist Mono | 28 / 30 | 400 | -0.02em | Card title, compact system framing |
| `body-lg` | Geist | 17 / 26 | 400 | 0 | Editorial body |
| `body` | Geist | 15 / 24 | 400 | 0 | Default UI body |
| `body-sm` | Geist | 13 / 20 | 400 | 0 | Dense UI, buttons |
| `label` | Geist Mono | 11 / 16 | 500 | 0.08em | UPPERCASE labels, meta |
| `mono-xl` | Geist Mono | 48 / 56 | 500 | -0.02em | Display numbers, times, metrics |
| `mono` | Geist Mono | 13 / 20 | 400 | 0 | Data cells, timestamps, code |

### Typography rules (canonical, non-negotiable)

1. **Body caps at `65ch`.** Never stretch full viewport width. Source: Emil Kowalski.
2. **All numeric display uses mono + `tabular-nums`.** Columns align. No exceptions.
3. **Use `…` not `...`** for truncation.
4. **Uppercase labels need loosened tracking.** 0.06em minimum, 0.08em default.
5. **Superscript units** on display numbers. `+326%` sets the % in lighter weight, smaller size, baseline-aligned. `7HR 48MIN` sets `HR` and `MIN` at half size beside the numerals.
6. **Weight over color for emphasis.** Bold for UI stress. Italic only for citations and prose.
7. **Underlines are for links only.**
8. **Declare a fallback stack with matching x-height** to prevent layout shift on font load.
9. **Headline voice is tiered, not flat.** `display` and `h1` use Cash Sans; `h2` and `h3` pivot into the mono/data voice. Body stays on Geist.
10. **Numerals inside display or page titles switch to mono.** When a chapter or page title includes a number, set the numeric run in mono with `tabular-nums` so the title reads as `Aa 0123`, not as a marketing headline with decorative digits.

### Forbidden typefaces

Inter, Roboto, system-ui, Helvetica, Arial, Open Sans, Lato, Nunito, Poppins. These are the AI-default stack and will be flagged by the Quality Evaluator.

---

## Layout

### Grid and spacing

8pt base grid. Scale: 0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Named `space-0` through `space-11`.

All padding, margin, and gap values must snap to this scale. `15px`, `20px`, `18px` are never acceptable. If the design calls for something off-grid, the design is wrong.

Semantic aliases sit on top of the numeric scale and speed up composition decisions:

- `space-tight` = 8px. Use when elements belong together: icon + label, value + unit, inline metadata.
- `space-group` = 16px. Use for siblings inside the same component or tool row.
- `space-section` = 32px. Use when a new card section or data group begins.
- `space-context` = 64px. Use when the page changes context entirely.

### Composition

- **Asymmetric bentos** are preferred over uniform grids. Different card heights carry hierarchy without color.
- **Two-column layouts**: label left (muted), content right (primary). Useful for settings, specs, metadata blocks.
- **Numbered lists** in dense content (`01`, `02`, `03`) with the numeral in muted, the name in primary. No bullets, no dashes.
- **Dashed vertical timelines** as structural element for time-ordered content. Not solid lines.

### Responsive behavior

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | 640px | Single column. Stack all bento. Sheet-style modals |
| `md` | 768px | Two-column split where useful |
| `lg` | 1024px | Full bento grid |
| `xl` | 1280px | Max content width caps at 1280px. Never full-bleed text |

**Touch targets**: 44px minimum hit area on mobile. If visual button is smaller, extend via `::before` pseudo-element. Source: Emil Kowalski.

---

## Elevation & Depth

Elevation is the most abused part of most systems. This one resolves the contradiction explicitly: **in dark mode, cards never cast shadows.**

| Level | Token | Value | Where |
|---|---|---|---|
| 0 | `elev-0` | `none` | Cards, panels, default state. 1px border does the separation |
| 1 | `elev-1` | `0 1px 2px rgba(0,0,0,0.3)` | Floating menus, toasts only |
| 2 | `elev-2` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, drawers only |

### Forbidden shadow values

Any shadow with blur ≥ 25px. This is the AI-slop shadow. The Quality Evaluator flags it automatically. Values like `0 25px 50px rgba(0,0,0,0.25)` are rejected at lint time.

### Surface hierarchy via luminance

Cards float on dark-on-dark contrast. `bg (#0A0A0A)` → `surface (#141414)` → `surface-raised (#1C1C1C)`. Each step is 6 luminance points. The 1px border on each card crisps the edge. No blur, no glow, no gradient.

---

## Shapes

Tight radii. Precision over softness.

| Token | Value | Use |
|---|---|---|
| `rounded.none` | 0 | Tables, data grids, ruler lines |
| `rounded.xs` | 4px | Chips, tags, tight controls |
| `rounded.sm` | 8px | Buttons, inputs |
| `rounded.md` | 12px | Cards (default), panels |
| `rounded.lg` | 16px | Large marketing cards only |
| `rounded.pill` | 9999px | Status pills, avatars, live dots |

**Never** use a radius above `rounded.lg` on a dark card. Light-mode references often use 20px; our dark system tightens this to preserve the precision feel.

---

## Components

### Button

Three variants. No more. No ghost-with-border, no glass button, no gradient button.

**Primary** — solid `text-primary` background, `text-on-primary` foreground. Used for the one primary action per view.

**Secondary** — transparent background, 1px `line-strong` border, `text-primary` foreground. Used for secondary actions alongside a primary.

**Ghost** — transparent, no border, `text-secondary` foreground. Used for tertiary actions, nav links.

All buttons:
- `md`: 40px height, 12px × 16px padding. Default for primary actions.
- `sm`: 32px height, 12px horizontal padding. Use only in dense toolbars, tables, and secondary utility rows.
- Radius `sm` (8px)
- Type `body-sm` at weight 500
- Hit area 44px minimum (extend via pseudo-element on mobile)
- `:active` applies `transform: scale(0.97)`, 100ms ease
- Hover changes opacity or background luminance, never color
- Focus ring: 2px `line-strong` offset by 2px. Never blue system default

### Card

Single variant. Background `surface`, 1px `line` border, radius `md`, no shadow. 24px padding default. Title uses `h3`, body uses `body`. Label above title in `label` style, muted.

### Pill / Badge

Two variants, mapped to status hierarchy:

- **Filled** (`#F0F0F0` bg, `#0A0A0A` fg, radius `pill`) — primary status. Urgent, current, selected.
- **Outline** (transparent bg, dashed `line-strong` border, `text-secondary` fg) — secondary status. Draft, future, in-progress. The dashed border is deliberate and signals impermanence.

### Dot (live indicator)

6px circle, `accent-live` fill, radius `pill`. Optionally pulses opacity `1 → 0.5 → 1` on a 2000ms linear loop. Never scale, never color change. The primary carrier is `LiveDot`; the same accent may also appear in `InlineStatus tone="live"`, a live-pill prefix, or a live-tone toast marker when every visible accent instance expresses the same semantic state.

### Input

Background `surface`, 1px `line-strong` border, radius `sm`, 40px height. Numeric inputs use mono. Focus state lifts border to `text-primary`. No colored focus glow.

### Segmented control

Compact mode switching for filters, tabs, and scope changes. Surface background, 1px `line` border, radius `pill`. Internal buttons are 32px tall inside a 44px minimum hit target. Selected state uses a filled chip; unselected state stays transparent and muted. Never more than five options per row.

### Segmented bar

Discrete progress meter. Progress is communicated through segment count, not a continuous fill sweep. Active segments use `text-primary`; pending segments use `line-strong`. When the meter reaches `value === total`, the completed state may switch to `accent-success` to mark terminal success. Use for quotas, usage, credit burn, and task progress when the total is known.

### Inline status

Bracketed mono status for explicit system state: `[QUEUED]`, `[LOADING 00:03]`, `[SAVED]`. Uses `label` typography, optional live dot only when the state is truly live. Completion should stay monochrome unless the state is the terminal success carrier for the cluster. Prefer this over placeholder chrome or atmospheric loading UI.

### Tool call

AI-native execution row for tool invocation surfaces. Background `surface-raised`, 1px `line` border, radius `md`, 12px × 16px padding. Title uses `body-sm` at weight 500. Duration stays mono. Status is rendered with `InlineStatus`. Detail copy uses `body-sm` secondary and wraps naturally.

### Modal / Drawer

Background `surface-raised`, radius `md`, elevation level 2, 32px padding. Max-width 560px for dialogs, full-height sheet for drawers. Enter: opacity 0 → 1, scale 0.95 → 1, 280ms `ease-out`. Exit: same values reversed, 220ms (~20% faster than entry).

### Toast (Sonner pattern)

Background `surface-raised`, radius `md`, elevation 1, 12px × 16px padding. Stack bottom-right. Enter from below (translateY 8px, opacity 0 → 1, 220ms `ease-out`). Dismiss on swipe or timeout. Live region for screen readers. Credit: Emil Kowalski's Sonner.

### Loaders

First-class loading vocabulary — not placeholder chrome. Every loader in the system must be **active, inspectable, and percussive**. No skeleton outlines, no shimmer gradients, no atmospheric blur (forbidden by `R-STATE-001` / `CO06`). Allowed forms:

- **Bracketed mono** — `<InlineStatus tone="active">[LOADING…]</InlineStatus>`. The quietest option; use when the UI already has other motion and the loader is a small status badge.
- **Segmented progress** — `<SegmentedBar>` with discrete square-ended blocks. Use when `value / total` is known. Signature form from Nothing's motion language — hardware-instrument honesty.
- **`<TetrisLoader>`** — mechanical, percussive indeterminate loader. A miniature Tetris self-plays: seven tetrominoes fall on a fixed cadence, lock into the grid, full rows flash `accent-success` for one `--ds-dur-standard` beat before clearing, stack resets when the ceiling threatens. Rules it obeys: every motion stepped (no continuous rotation), no springs, no opacity-pulse placeholder chrome. Sizes `sm` / `md` / `lg`; speeds `slow` (300ms/row) / `normal` (220ms/row) / `fast` (140ms/row). Pieces paint in three grayscale tiers (`I`/`O` primary, `T`/`L`/`J` secondary, `S`/`Z` muted) so the grid reads varied without introducing hue. Pair with the bracketed `[Loading…]` label below the grid. Under `prefers-reduced-motion` the game loop is disabled — label alone carries the signal. With `interactive` (default `true`), the grid becomes keyboard-steerable on focus: `←`/`→` move, `↑` rotate, `↓` soft-drop, `Space` hard-drop.
- **`<BoxLoader>`** — four isometric cubes cycle through a 3×2 grid on a 2-second infinite loop (`ease-in-out`). Each cube is a real CSS 3D box; faces are shaded in three grays — top=`text-primary` (lit from above), front=`text-secondary`, right=`text-muted` — so the cubes read three-dimensional without introducing any hue. Stage uses `perspective: 400px` + `transform-style: preserve-3d`. Under `prefers-reduced-motion`, boxes are parked at their starting cells; no animation.
- **`<DotLoader>`** — 7×7 dot grid driven by a frame list. Required prop `frames: number[][]` — each frame is a list of active cell indices (0–48). The component advances through frames at `duration` ms per step (default 100ms). Inactive dots render in `--ds-line-strong` (ghosted); active dots in `--ds-text-primary`. No CSS transition between states — each frame snaps, matching the percussive frame-accurate feel. `isPlaying` toggles the loop; `repeatCount` caps total passes (default `-1` = forever) and calls `onComplete` when reached. Hand-author a frame sequence to depict whatever loading motif the host needs (walking dot, snake, pulse).
- **`<ThinkingCube>`** — alternative indicator for rotating agent-state labels (sibling of `<LiveDot labels={...}>`). Single 16×16 CSS 3D cube at a low iso tilt (`-8deg` X, `-12deg` Y base — reads as a cube, not the diamond silhouette of `<BoxLoader>`). Cube ticks through discrete 90° face-flips on a 2000ms loop (stepped keyframes, not smooth spin) while the label types through its `labels` prop via `rotateLabels()` from the motion primitive. Grayscale face shading matches the rest of the system (top=`text-primary`, front=`text-secondary`, side/back/bottom=`text-muted`). Canonical indicator for agent-thinking surfaces remains `<LiveDot labels={...}>` (red pulse); `<ThinkingCube>` is the dimensional alternative for surfaces that want a 3D indicator instead.
- **`<SquareLoader>`** — seven white squares chasing each other around an eight-position path on a 3×3 grid (top-left → top-mid → top-right → mid-right → CENTER → bottom-mid → bottom-left → mid-left → loop). Every square runs the identical keyframe with a per-square stagger (negative delay = −(cycle / 7) per square) so the seven of them form an evenly-spaced trail at any given frame. Default cycle is ten seconds, `infinite` (exempt from the 300ms ceiling per the system's continuous-motion rule). Axis-aligned (no diamond rotation) so the silhouette reads as a box. `transform: translate()` keyframes — GPU-accelerated. Grayscale only: squares paint in `--ds-text-primary`. Default cell 12px gives a 48px outer — compact enough to sit inline with mono body copy or in a toolbar slot; tunable via `--ds-square-loader-*` custom properties. `prefers-reduced-motion` parks each square at its home cell so the composed shape still reads, minus motion.

Loaders categorically don't use `accent-live` unless the loading state is *also* an attention state (user waiting on something that might fail). Keep them in `text-primary` / `accent-success` by default.

### Motion primitive (`sous-ds/motion`)

A small first-party motion module that every component and every consumer pulls from. **Zero runtime dependencies** — we deliberately did not take a dependency on Framer Motion or any other animation library. Reasons:

1. The system ships into projects of every shape (Next.js, Vite, Astro, RSC, plain HTML, Figma Make). A React-only motion library locks the whole design system to a single runtime and version matrix. CSS plus a ~200-line RAF primitive is universal.
2. Taste propagates by being drop-in. Zero deps mean zero version conflicts; the system installs frictionlessly in every future project.
3. A design-system API surface that invites `whileHover={anything}` invites deviation. Tokenized helpers (`tween`, `typewriter`, `rotateLabels`, `stagger`) enforce the system's cadence at the API boundary instead of relying on convention.
4. "AI-native" means tools generate UIs in multiple frameworks. CSS primitives and small RAF helpers are emittable by any generation tool; a Framer Motion API is React-specific dead weight for every other target.

The vocabulary:

- **`tween({ from, to, duration, easing, onUpdate, signal })`** — RAF-driven numeric interpolation, returns a cancellable `Promise<void>`. Used for count-ups, position drift, any "X to Y" motion.
- **`typewriter({ text, step, onUpdate, signal })`** — character-by-character reveal at `step` ms/char.
- **`rotateLabels({ labels, step, hold, onUpdate, onLabelComplete, signal })`** — LiveDot-style forever loop: type, hold, erase, advance. Used by `<LiveDot labels={[...]} />`.
- **`stagger({ count, step, onStep, signal })`** — for JS-driven staggered sequences where CSS `animation-delay` doesn't apply.
- **`easings`** — named easing functions (`easeOutCubic`, `easeInOutSine`, `easeOutStrong`, `easeInOutStrong`) that approximate the CSS `var(--ds-ease-*)` tokens.
- **`prefersReducedMotion()`** — plain function returning the media-query result; every animator above short-circuits internally when true so callers don't need to branch.

Invariants the module enforces on every call site:
- GPU-accelerated properties only (`transform`, `opacity`).
- `prefers-reduced-motion` short-circuits to the terminal frame.
- Every animator is cancellable via `AbortSignal` so in-flight sequences can be interrupted cleanly (e.g., user hovers while auto-scrub is mid-drift).

Consume via `import { tween } from "sous-ds"` or tree-shake via `import { tween } from "sous-ds/motion"`.

### Data motif: dotted bar chart

The system's signature data visualization. Bars are rendered as columns of dots rather than solid rectangles. Dot count = bar value. Active column uses `text-primary` dots; inactive columns use `text-muted`. `accent-success` is reserved for a closed positive endpoint or highlighted good result; `accent-live` may appear sparingly on a negative or attention-worthy outlier. Neutral tone should still do most of the work. See `preview.html` for a working implementation.

---

## Do's and Don'ts

### Do

- Use `text-primary` for filled buttons and primary emphasis
- Use `accent-success` as the primary accent for positive emphasis and `accent-live` as the secondary attention rail
- Show data in mono with `tabular-nums`
- Reach for 1px border before shadow
- Keep motion under 300ms
- Start entry scale from 0.95 or higher, never 0
- Make exits 20% faster than entries
- Set `transform-origin` explicitly on popovers
- Use terse mono loading text or segmented progress when loading state must be visible
- Add `will-change: transform` on anything testing jittery
- Use the `…` ellipsis character, not three periods
- Cap body at 65ch

### Don't

- Use `transition: all`
- Use a shadow with blur ≥ 25px (the AI-slop shadow)
- Transition `color` on hover (use opacity or weight)
- Use Inter, Roboto, system-ui, Helvetica, or Arial as the primary face
- Use `scale(0)` as an animation start value
- Use gradient fills on buttons, cards, or backgrounds
- Use purple, teal, green, or gold as decorative color
- Use elevation to simulate a lit room (no "floating UI" theater)
- Spray green and red across the same cluster without a crisp positive/attention mapping
- Use skeleton loading placeholders or shimmer chrome
- Use full-width body text
- Use colored focus rings that differ from the system value
- Use drop shadow and 1px border on the same element

---

## Agent prompt guide

When a coding agent reads this file, it should use the following prompt scaffolds:

**For a new page:**
> "Build this using sous-ds. Dark mode by default. Reference `DESIGN.md` tokens via `tokens.css`. Use `Cash Sans` for display and page-title roles, `Geist Mono` for h2/h3 framing plus all data, labels, and code, and `Geist` for body and UI copy. No Inter. No shadows on cards. Body caps at 65ch. Use the bento pattern for multi-card layouts. Keep the palette monochrome-first. Use `accent-success` as the primary accent for positive highlight and completion, and `accent-live` only as a secondary attention rail."

**For a component:**
> "Use the tokens defined in `DESIGN.md`. Button height 40px, radius `sm`. Active state `scale(0.97)`. Animation under 220ms with `ease-out`. `will-change: transform` if the component animates. Set `transform-origin` to trigger location if it's a popover."

**Quick color reference:**
- Background: `#0A0A0A`
- Text: `#F0F0F0`
- Muted: `#888888`
- Accents (semantic only): `#E5533C` live, `#00E013` success
- Font: `Cash Sans` for display/page titles, `Geist Mono` for section/card titles and data, `Geist` for body

---

## System metadata

- Tokens source: `design-tokens.json`
- CSS implementation: `tokens.css`
- Animation rules: `ANIMATION_RULES.md`
- Taste ground truth: `TASTE_LOG.md`
- Quality evaluator: `quality-evaluator.md`
- Coding agent guide: `AGENTS.md`
- Visual reference: `preview.html`

Lint this file with: `npx @google/design.md lint DESIGN.md`
