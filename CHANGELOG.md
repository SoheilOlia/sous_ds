# Changelog

All notable changes to `sous-ds`. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/).

---

## [0.3.8] — 2026-04-24

New `<LiveCube>` component — dimensional sibling of `<LiveDot>`.

### Added
- **`<LiveCube>`** — 4×4 CSS 3D cube live indicator. Same inline-flex
  row layout as `<LiveDot>`, same `labels` / `labelStep` / `labelHold`
  / `label` / `announce` / `static` API, same delegation to
  `rotateLabels()` from the motion primitive. Drop-in swap for
  `<LiveDot labels={...}>` when the surface warrants a dimensional
  read.
- All six faces paint in `--ds-accent-live`. Per-face opacity tiers
  (top 1.0 / front–back 0.85–0.9 / left–right 0.65 / bottom 0.55)
  produce a soft 3D lighting read at 4×4 without introducing any hue
  variation. Whole cube pulses opacity `1 → 0.5 → 1` on the system's
  2000ms live-pulse cadence; parent opacity compounds with per-face
  opacity so the lighting is preserved through the pulse.
- §08 Components demo gains a "Live cube" row directly under the
  existing "Live dot" row, so the two vocabularies sit adjacent for
  comparison. Same typewriter labels (AGENTING / WORKING / THINKING /
  REASONING) drive both.
- `<LiveCube>` added to the `--ds-accent-live` sanctioned carrier
  allowlist across `scripts/lint.mjs` (CL07 rule), `refusals.json`
  (R-SEMANTIC-001 `allowedFiles`), `quality-evaluator.md` CL07
  description, and DESIGN.md `#accent-carriers`.
- DESIGN.md Components section grows a "Cube (dimensional live
  indicator)" subsection documenting the component and when to reach
  for it vs `<LiveDot>`.

---

## [0.3.7] — 2026-04-24

### Changed
- **`<SquareLoader>` default cell: 24px → 12px.** Whole grid now
  48px outer (was 84px). Keeps the 4px gap; step drops from 28px
  to 16px. At this scale the loader sits inline with mono body
  copy or in a toolbar slot. The keyframe math is driven by the
  custom properties so it scales automatically — no keyframe
  changes needed. DESIGN.md bullet updated.

---

## [0.3.6] — 2026-04-24

`<SquareLoader>` resize + un-rotation pass.

### Changed
- **`<SquareLoader>` no longer rotates 45°.** The diamond silhouette
  read as off-style next to the axis-aligned siblings in §11; un-
  rotated, the loader now reads as a plain box. The
  rotation-bounding-box `* 1.45` stage scale is gone since there's
  nothing to expand for.
- **Default cell shrunk from 28px to 24px.** With the 4px gap, the
  whole grid lands at 84px outer (was 96px) — matches the visual
  scale of `<TetrisLoader>` / `<BoxLoader>` / `<DotLoader>`.
- §11 caption updated: "diamond rotation" → "staggered chase".
- DESIGN.md `<SquareLoader>` bullet rewritten to drop diamond
  references and document the 8-position path explicitly.

Tunables (`--ds-square-loader-cell` / `--ds-square-loader-gap`) work
unchanged — consumers who want the diamond-rotated look back can
re-add `transform: rotate(45deg)` on `.ds-square-loader__grid` from
their own CSS.

---

## [0.3.5] — 2026-04-24

Reverts the §08 LiveDot→ThinkingCube swap from v0.3.4 (the red pulse
is back where it belongs) and adds **`<SquareLoader>`** as the fourth
loader in §11.

### Added
- **`<SquareLoader>`** — seven white squares chasing each other around
  an eight-position path on a 3×3 grid, with the grid rotated 45° so
  the silhouette reads as a diamond. Every square runs the identical
  keyframe with a per-square stagger (negative delay = -(cycle / 7))
  so the seven of them form an evenly-spaced trail at any frame.
  Default ten-second cycle, `infinite` (exempt from the 300ms ceiling).
  `transform: translate()` keyframes — GPU-accelerated. Grayscale
  only: squares paint in `--ds-text-primary`. Tunable cell / gap via
  `--ds-square-loader-*` custom properties. `prefers-reduced-motion`
  parks each square at its home cell so the diamond silhouette still
  reads minus the motion.
- §11 Loaders gains a fourth row alongside Tetris / Box / Dot.
- Adapted from a community Tailwind snippet. Logic preserved (8-
  position path, 7-square stagger, ease-in-out cycle); only the
  styling rewritten to vanilla CSS against `--ds-*` tokens. The
  upstream demo's dark/light toggle harness and dot-grid background
  were stripped — those are host-level concerns, not part of the
  loader.

### Changed
- **§08 Components row reverted to `<LiveDot>`.** v0.3.4 had swapped
  the red-pulse indicator for `<ThinkingCube>`; that wasn't the right
  call for the canonical agent-thinking row. LiveDot with rotating
  AGENTING / WORKING / THINKING / REASONING labels is back. Same
  typewriter mechanics, same IDs (`livedot-demo*`).
- DESIGN.md `<ThinkingCube>` entry softened from "canonical" to
  "alternative indicator" — `<LiveDot labels={...}>` is the canonical
  agent-thinking surface; `<ThinkingCube>` ships as the dimensional
  alternative for callers who want it.
- Removed the now-unused ThinkingCube inline CSS mirror from
  preview.html. The component itself still ships from `sous-ds`.

---

## [0.3.4] — 2026-04-24

New `<ThinkingCube>` agent-thinking indicator + §11 row alignment fix.

### Added
- **`<ThinkingCube>`** — single 16×16 CSS 3D cube paired with a
  rotating mono label. Replaces the red-dot `<LiveDot labels={...}>`
  pattern as the canonical agent-thinking indicator. The cube ticks
  through discrete 90° face-flips on a 2000ms loop (stepped keyframes
  — percussive, not smooth-spin) while labels type through
  `["AGENTING", "WORKING", "THINKING", "REASONING"]` via
  `rotateLabels()` from the motion primitive. Shares the typewriter
  cadence with `<LiveDot>` verbatim.
- Low iso tilt (`-8deg` X, `-12deg` Y base) — cube reads as a cube,
  not the diamond-silhouette full iso view that `<BoxLoader>` uses.
  Grayscale face shading matches the rest of the system
  (top=`text-primary`, front=`text-secondary`, side/back/bottom
  =`text-muted`). No hues.
- `prefers-reduced-motion`: cube freezes at its base angle; labels
  snap between states at the hold interval.
- Exported from `sous-ds` and `sous-ds/components`.

### Changed
- **§08 Components demo**: the `Live dot` row swapped to
  `Thinking cube`. Same typewriter labels (AGENTING / WORKING /
  THINKING / REASONING) drive the new cube indicator. `<LiveDot>` the
  component still ships — it's just no longer the shown indicator in
  the preview's agent-state row.
- **§11 Loaders row alignment**: `.loader-row { align-items: center }`
  → `align-items: start`. With each loader having a different visual
  height, centered alignment put name/meta captions at different Y
  positions across rows, breaking horizontal rhythm. Top-align keeps
  the three rows in sync.
- **§11 DotLoader** demo now includes a `[Loading…]` label beneath
  its grid, matching the Tetris/Box visual structure. Same mono
  uppercase label vocabulary.

---

## [0.3.3] — 2026-04-24

Third loader — **DotLoader** — plus a §11 consistency sweep.

### Added
- **`<DotLoader>`** — 7×7 dot grid driven by a frame list. Required
  prop `frames: number[][]`; each frame is an array of active cell
  indices (0–48). Advances through frames at `duration` ms per step
  (default 100). Inactive dots paint in `--ds-line-strong` (ghosted);
  active dots in `--ds-text-primary`. **No CSS transition between
  states** — each frame snaps, preserving the percussive frame-
  accurate feel the upstream snippet was going for (and matching
  Nothing's "click, not swoosh" motion language the rest of the
  system follows). Supports `isPlaying`, `repeatCount` (`-1` = loop
  forever, default), and `onComplete` callback.
- §11 Loaders gains a third row: `<DotLoader>` showing a 16-frame
  Snake-style sequence (the demo-game data from the upstream
  snippet), seeded from vanilla JS in the preview so the rendering
  path matches what React consumers get.
- Adapted from a community Tailwind / `cn` snippet. Logic preserved
  verbatim; only the styling layer rewritten to vanilla CSS against
  `--ds-*` tokens so the component runs without Tailwind or a
  classnames utility.

### Changed
- **Consistency sweep.** `.loader-row__controls` renamed to
  `.loader-row__meta` — only TetrisLoader has actual controls; the
  same slot under Box/Dot carries a description. Generic name fits
  both uses. Both rows updated to the new class.
- Removed orphaned `.variant__note` and `.variant__note code` CSS
  rules left over from the v0.3.1 §10 prose trim. No HTML referenced
  them anymore.

---

## [0.3.2] — 2026-04-24

Second loader — **BoxLoader**.

### Added
- **`<BoxLoader>`** — four CSS-3D isometric cubes cycle through a 3×2
  grid on a 2-second infinite `ease-in-out` loop. Stage uses
  `perspective: 400px` + `transform-style: preserve-3d`. Each cube
  has four faces; the three visible ones (top, front, right) are
  shaded in three grays (`text-primary` top, `text-secondary` front,
  `text-muted` right) so the cubes read three-dimensional without
  introducing any hue. Grayscale lighting, no gradients.
- **§11 Loaders** gains a second row for the BoxLoader demo next to
  the existing TetrisLoader. `.loader-row` now has a 1px top divider
  between siblings.
- Adapted from a community Tailwind snippet. The original paste
  omitted the 3D face-positioning CSS (only provided HTML + four
  keyframes); reconstructed here using the standard CSS isometric-
  cube idiom so the cubes actually render as cubes.

### Decision log
- Kept the exact keyframe math from the upstream snippet so the
  cyclic-rotation logic (each cube moves into another's cell each
  loop) matches the original. Only the face-positioning, coloring,
  stage perspective, and reduced-motion fallback are new.
- No `interactive` / size / speed props this round — BoxLoader is
  intentionally simpler than TetrisLoader. If we add variants later,
  they'd follow the same `data-size="sm|md|lg"` pattern.

---

## [0.3.1] — 2026-04-23

Tetris becomes playable, PulseTrail carries data vertically, and the
chart stops looking like a marketing pitch.

### Added
- **`<TetrisLoader interactive>`** is now keyboard-steerable on focus.
  `←` / `→` move the falling piece, `↑` rotates, `↓` soft-drops, `Space`
  hard-drops. Auto-fall continues at the base cadence while the user
  steers horizontally/rotation — the loader just becomes responsive to
  player intent. Focus ring on the frame. Reduced-motion users don't
  get a game loop, so they don't get keyboard steering either.
  `interactive` defaults to `true`; pass `interactive={false}` for
  pure loader mode.
- **Tri-shade piece palette.** Seven tetrominoes are now distributed
  across three grayscale tiers: `I` and `O` paint in `--ds-text-primary`
  (near-white hero pieces), `T`/`L`/`J` in `--ds-text-secondary`,
  `S`/`Z` in `--ds-text-muted`. Grayscale only — no decorative hues.
  Line-clear flash still overrides to `--ds-accent-success` regardless
  of the original shade.
- **`<PulseTrail valueMax={n}>`** + optional `value` field on
  `TrailEvent`. When both are set, each dot's `bottom` is derived from
  `value / valueMax` so the trail reads as a silhouette of recent
  reads instead of a flat baseline. Omit `valueMax` and dots continue
  to sit flush at the baseline (presence-only surfaces).

### Changed
- **§09 DottedChart monthly data** replaced the monotonic ramp
  `[4,5,5,6,7,6,8,9,10,11,12,14]` with a real walk
  `[6,4,7,9,5,3,8,11,7,10,6,14]` — some months dip, Jun still reads as
  the low-attention month, Dec recovers to the peak. Not a marketing
  graph anymore.
- **§09 revenue counter bias** dropped from 70% positive to 50/50.
  Down-quarters are now as common as up-quarters; the stat reads as a
  real quarterly swing.
- **§10 PulseTrail** dots now float at Y positions derived from the
  scrubber's emitted value (max = 14). Trail forms a silhouette of
  recent reads. `bottom` transitions at `--ds-dur-standard` so slot
  reassignments glide.
- **§10 + §11 body copy trimmed.** The long paragraph descriptions in
  the Live Activity and Loaders sections were outliers — the rest of
  the page lets components speak for themselves. §10 drops its prose
  note entirely; §11 swaps the prose for a mono `← → move / ↑ rotate
  / ↓ drop / space hard-drop` controls caption that also advertises
  the new keyboard affordance.

---

## [0.3.0] — 2026-04-23

New component surface — the first of the "Loaders" section. Motion
direction: Nothing Phone's percussive, stepped language.

### Added
- **`<TetrisLoader>`** — mechanical, percussive indeterminate loader.
  A miniature Tetris self-plays forever: seven canonical tetrominoes
  fall one row per tick, lock into the grid, full rows flash
  `accent-success` for one `--ds-dur-standard` beat and drop, the
  stack resets when its ceiling fills. Every motion is stepped — no
  continuous rotation, no springs, no opacity-pulse placeholder
  chrome. Reads as an instrument, not a marquee.
  - Props: `size: "sm" | "md" | "lg"`, `speed: "slow" | "normal" | "fast"`,
    `showLabel`, `label`. Default: `md` / `normal` / `Loading`.
  - Row cadences (ms per fall step): `slow` 300, `normal` 220, `fast` 140.
    Deliberately slower than game Tetris — this is a loader.
  - Bracketed mono `[Loading…]` caption under the grid by default, per
    R-STATE-001's preferred loading vocabulary.
  - `prefers-reduced-motion`: the game loop is disabled; the `[Loading…]`
    label alone carries the signal. No residual animation.
  - Adapted from a community shadcn/Tailwind snippet — game logic
    preserved, styling layer rewritten to vanilla CSS against `--ds-*`
    tokens so the component runs in any React environment without
    Tailwind or a "use client" directive.
- **§11 / Loaders** section in `preview.html` — first demo shows
  `<TetrisLoader size="sm" speed="normal">` alongside an editorial
  description in the manifesto body voice. §12 Do & Don't renumbered.
- `<TetrisLoader>` added to the `--ds-accent-success` sanctioned
  carrier allowlist across `scripts/lint.mjs` (CL07 rule),
  `refusals.json` (R-SEMANTIC-001 `allowedFiles`), `quality-evaluator.md`
  CL07 description, and DESIGN.md #accent-carriers.
- New **Loaders** subsection in DESIGN.md under Components,
  documenting the allowed loading vocabulary (bracketed mono,
  segmented progress, TetrisLoader) and restating the ban on
  skeleton/shimmer chrome per R-STATE-001.

### Decision log
- The upstream snippet targeted a shadcn-cli `components/ui/` path
  with Tailwind classes. sous-ds is the *source* library (the role
  shadcn plays for downstream apps), not a consumer; all components
  live flat in `components/`. Tailwind was not adopted — it would
  break the zero-dep stance and require migrating every existing
  component. Instead the component was adapted to the system's own
  patterns (component + paired `.css`, `--ds-*` tokens, `data-size`
  attribute for variants, `prefersReducedMotion()` from the motion
  primitive for a11y). Same visual intent, system-native delivery.

---

## [0.2.11] — 2026-04-23

First-class motion primitive. The system's animation taste is now a
named, zero-dep module instead of patterns scattered across components.

### Added
- **`sous-ds/motion`** subpath (`./components/motion.ts`) — a ~200-line
  zero-dependency motion primitive that every component and every
  downstream consumer pulls from. Exports:
  - `tween({ from, to, duration, easing, onUpdate, signal })` — RAF
    numeric interpolation, cancellable via `AbortSignal`.
  - `typewriter({ text, step, onUpdate, signal })` — character reveal.
  - `rotateLabels({ labels, step, hold, onUpdate, onLabelComplete,
    signal })` — LiveDot-style type-hold-erase-advance loop.
  - `stagger({ count, step, onStep, signal })` — JS-driven staggered
    sequences.
  - `easings` — named curves approximating the system's CSS
    cubic-beziers (`easeOutCubic`, `easeOutStrong`, `easeInOutSine`,
    `easeInOutStrong`).
  - `prefersReducedMotion()` — plain function; every animator short-
    circuits internally when true.
- Consumers can import from the convenience barrel
  (`import { tween } from "sous-ds"`) or the tree-shakeable subpath
  (`import { tween } from "sous-ds/motion"`).
- New "Motion primitive" subsection in `DESIGN.md` documenting the
  vocabulary + the rationale for not taking a framer-motion
  dependency (system ethos of "restraint-led ... motion under 300ms",
  runtime-agnostic AI-native generation, zero-deps-for-propagation).

### Changed
- `<LiveDot>` now delegates its typewriter rotation loop to
  `rotateLabels()` from the motion primitive. Removed the three-phase
  state machine (typing / holding / erasing) — one `useEffect` +
  `AbortController` replaces ~40 lines of imperative state juggling,
  and the rotation cadence matches exactly what any consumer gets when
  they call `rotateLabels()` directly.

### Decision log
- Evaluated `framer-motion` as a dependency for "upgrade all animations
  and micro-interactions." Rejected in favor of the first-party motion
  primitive. Leverage reasoning: a zero-dep system installs in any
  environment (Next.js, Vite, RSC, plain HTML, Astro, Figma Make), a
  React-only library locks the whole design system to a single runtime
  and version matrix. Taste propagation comes from tokenized helpers
  (`tween`, `typewriter`) enforcing cadence at the API boundary, not
  from an imperative `whileHover={anything}` escape hatch. And "AI-
  native" generation tools emit UIs in multiple frameworks — CSS +
  small RAF helpers are universal, framer-motion is dead weight
  everywhere except React. See DESIGN.md "Motion primitive" for the
  full rationale.

---

## [0.2.10] — 2026-04-23

§10 redesigned as a live activity feed coupled to the §09 scrubber.

### Changed
- `<DotTimeline>` retired from the preview showcase. Next to
  `<DottedChart>` above it read as the same grammar twice (dot-stack
  columns); `<PulseTrail>` is the more distinctive motif and carries
  §10 alone. Component files + exports are untouched — direct
  consumers can still import `<DotTimeline>`.
- §10 is now a single coupled demo, not an A/B variant showcase. The
  `.variants` subgrid container, the `.variant__letter` A/B markers,
  and the dual-chart baseline alignment were all removed.

### Added
- **§09 scrubber emits `scrubber:month` CustomEvents on window** every
  time it lands on a column (auto-advance or hover). Detail carries
  `{ label, value, index }`.
- **§10 `<PulseTrail>` listens for those events and streams in trail
  dots** — each scrubber land adds a new event at the right edge with
  a bloom, older events fade leftward, oldest drops off once the
  10-slot FIFO fills. Real data, not hardcoded positions.
- **`.ds-pulse-trail__dot.is-arriving` bloom keyframe**: scale 1.6 → 1.0
  with an accent-success halo flash over `var(--ds-dur-standard)` as
  each event lands. One-shot; removed when the animation ends.
  `prefers-reduced-motion` skips the bloom.
- **`.variant__caption`** row echoes the scrubber caption vocabulary
  (live-pulse dot + mono uppercase label) and shows the latest event
  label (`DEC · 14`). `aria-live="polite"`.

---

## [0.2.9] — 2026-04-23

Tighter body-voice match + slower animation cadence.

### Changed
- `.variant__note` now byte-for-byte matches `.site-copy` (§01
  manifesto): `max-width: 38ch`, `line-height: 1.1`, `margin: 0`.
  v0.2.8 was close but drifted on line-height and max-width — enough
  that the two body surfaces didn't read as the same voice.
- §09 revenue counter slowed: `CYCLE` 1500 → 3000 (3 seconds between
  target picks) and `COUNT_DURATION` 680 → 1500 (the count animation
  itself is 1.5 seconds). The stat dwells long enough after each
  count that the destination value is legible before the next cycle
  begins.
- §09 scrubber slowed: `HOLD_BASE` 500 → 1500; `HOLD_JITTER`
  200 → 300; `TYPE_STEP` 35 → 60 for the caption typewriter. Head
  auto-drift between months is now 1500ms (from 260ms). Hover snaps
  the head instantly so manual scrubbing stays responsive — the
  slow pacing is for the auto-read, not user input.

### Technical
- Scrubber head motion moved off CSS `transition: transform` (capped
  at 300ms by the MO04 lint rule) onto a requestAnimationFrame tween
  driving the `--x` custom property through an ease-in-out sine
  curve. Only the opacity fade-in still uses a CSS transition.

---

## [0.2.8] — 2026-04-23

Preview voice alignment + live revenue counter.

### Changed
- **§10 variant descriptions now use the system's manifesto body voice.**
  `.variant__note` was 15px Geist sans — functional but generic. Now
  matches `.site-copy` (§01 manifesto), the only long-form body copy
  actually applied elsewhere on the page: Cash Sans display (Geist
  fallback), 22px, 1.2 line-height, -0.0075em tracking, secondary ink.
  Reads editorial. Inline `<code>` inside keeps Geist Mono at 0.82em
  so token names like `accent-live` still read as identifiers.

### Added
- **§09 revenue counter auto-cycles.** Every 1500ms the stat picks a
  new target (biased positive ~70%, with occasional down-quarter reads)
  and counts from the current value to the new target over 680ms using
  the existing ease-out cubic. Sign prefix flips `+` ↔ `−` (U+2212,
  same visual width as `+` in mono) and `data-tone` flips
  `success` ↔ `attention` so the value color tracks the sign:
  `accent-success` green for up-reads, `accent-live` red for down.
  Tone and prefix are set upfront to the destination value so color
  doesn't flash mid-count. Click the stat to restart 0 → +326 and
  resume auto. `prefers-reduced-motion` pins at +326 green with no
  cycling. New CSS: `data-tone="attention"` on `.chart-stat-trigger`
  maps `.value` color to `--ds-accent-live`, completing the pair.

---

## [0.2.7] — 2026-04-23

Second Emil-pass on the Data Motif row. Subgrid alignment + organic
scrubber motion — no API changes.

### Changed
- **`.variants` uses subgrid to align the A/B cards across rows.** The
  parent now owns three rows (head / chart / axis) and each `.variant`
  inherits them via `grid-template-rows: subgrid` + `grid-row: span 3`,
  so unequal description lengths no longer push the chart slots to
  different Y positions. Under 880px the grid collapses to single-
  column and subgrid is disabled.
- **DottedChart scrubber head** now uses `cubic-bezier(0.77, 0, 0.175, 1)`
  at 260ms — a strong ease-in-out. Emil's framework for on-screen
  movement (as opposed to entry/exit) is ease-in-out: the head
  accelerates out of each column and decelerates into the next, rather
  than the start-fast ease-out that read as mechanical click-click.
- **DottedChart columns gain a scrubber "wake":** asymmetric transitions
  — 120ms attack when `.is-focus` lands, 280ms release when it leaves —
  so the motion leaves a fading trail of attention behind it. Uses the
  `background` shorthand so the lint dodges its `\bcolor\b` false-
  positive; 280ms sits at the MO04 ceiling.
- **Scrubber dwell picks up ±200ms jitter** around a 500ms base so the
  cycle doesn't feel like a metronome. Perfect regularity reads robotic;
  tiny variation reads organic.

---

## [0.2.6] — 2026-04-23

Polish pass on the v0.2.5 Data Motif surfaces via the emil-design-eng
lens. No API changes — only motion quality, alignment, and microcopy
scale.

### Changed
- **DottedChart scrubber head** animates via `transform: translateX()`
  driven by a `--x` CSS variable instead of `transition: left`. GPU-
  accelerated, interruptible, and honors Emil's 300ms UI ceiling
  (duration 320ms → 200ms). The head now also fades in with
  `opacity: 0 → .is-ready` once JS has positioned it, so it no longer
  sits parked at the left edge during the startup window. Startup
  delay shortened (900ms → 450ms) so the first sweep is visible almost
  immediately after entry animations settle.
- **Axis microcopy** on `<DotTimeline>` and `<PulseTrail>` (`60s ago`/
  `now`) dropped from 11px to 9px — matches the existing
  `.bar-labels` microcopy in §09. 11px was reading at the `.label`
  voice; 9px whispers, which is right for axis text.
- **`<PulseTrail>` dots bottom-align to the canvas baseline.** Dots
  were centered at `top: 50%` which, in the 48px canvas bottom-aligned
  inside a 96px chart slot, placed them at slot y≈72 — "passing" over
  `<DotTimeline>`'s bottom dots at y≈86–92. Now positioned with
  `bottom: 4px` (trail) / `bottom: 3px` (head) so both data-motif
  components share the same visual baseline. Hover-pulse keyframes
  updated to drop the obsolete `translateY` component.

---

## [0.2.5] — 2026-04-23

Preview polish + first AI-native interaction on `<DottedChart>`. The
data-motif surfaces (`<DottedChart>`, `<DotTimeline>`, `<PulseTrail>`)
now share a consistent interaction vocabulary — inspect any element on
hover; the system reads itself aloud.

### Added
- **DottedChart Agent Scrubber** (preview §09). An `accent-live` read-
  head sweeps left→right across the 12 month columns on ~1.2s per
  month, pausing on each. As it passes a column, the column lights up
  (gray dots → primary text color; accent columns keep their accents)
  and a typewriter caption below reports `MONTH · VALUE`. Reuses the
  PulseTrail head (8px, 3px halo, LiveDot-cadence pulse) and the
  `<LiveDot labels={...}>` typewriter from v0.2.3. A faint linear-
  gradient scrub line descends from the head through the chart so the
  column being read is visually crosshaired. Hover any column pauses
  auto-scrub and snaps the head there; mouseleave resumes from the
  current position. `prefers-reduced-motion` pins the head at Dec with
  its caption shown statically.
- `<DotTimeline>` columns pulse on hover at the LiveDot cadence, so
  every past bucket is individually inspectable — matches the
  `<PulseTrail>` trail-dot affordance shipped in v0.2.4. Reduced
  motion: hovered columns lift to full opacity statically.
- `.variant__chart` slot with `min-height: var(--ds-space-10)` so the
  baseline of `<DotTimeline>` (96px track) and `<PulseTrail>` (48px
  canvas) line up at the same Y even though their internal chart
  heights differ.

### Changed
- Preview §10 variant names dropped the `<angle brackets>` and the
  all-caps treatment in favor of plain CamelCase `DotTimeline` /
  `PulseTrail`, bumped to 13px/20px mono with −0.01em tracking so the
  CamelCase sits right.
- Preview §10 axis microcopy (`60s ago` / `now`) picked up the canonical
  `.label` line-height and weight, and moved the uppercase to CSS so
  HTML source is single-case.
- `<DotTimeline>` preview demo data rebalanced: was 13 `done` (green)
  buckets out of 24 reading as a green wall; now one peak bucket
  (count 10) is green, one 1-dot bucket near "now" is red live, rest
  are muted queued. Matches the `<DottedChart>` grammar of mostly-
  neutral with single success + attention markers.

---

## [0.2.4] — 2026-04-22

Second-look pass on v0.2.3. The compact bar variant shipped one day
and didn't hold up visually — removed before it hardens into a
pattern. Two small polish items landed alongside.

### Added
- `<PulseTrail>` trail dots now pulse on hover at the `<LiveDot>`
  cadence (`--ds-dur-live-pulse` = 2000ms) with a 1.15× scale lift,
  so each prior event marker is individually inspectable. Scoped to
  `@media (hover: hover) and (pointer: fine)`; `prefers-reduced-motion`
  swaps to a static "lifted" state (no animation, full opacity).

### Changed
- Preview §10 typography aligned with the page voice: `.variant__name`
  dropped from Cash Sans display 22px to mono 11px uppercase 500
  (matches `.label`); `.variant__note` line-height bumped to 24px
  (matches `.t-body`); letter square shrunk from 32px to 24px and
  re-styled as small uppercase metadata. The `<DotTimeline>` and
  `<PulseTrail>` headings now read as named component rows rather
  than section pull-quotes.

### Removed
- **`<DotTimeline density="compact">`** bar variant, retracted one
  revision after it shipped. Its thin-bar read didn't hold up visually;
  keeping DotTimeline as one thing (per-bucket dot stack, direct
  sibling of `<DottedChart>`) preserves the dot-motif family grammar.
  The prop, its CSS, and the preview A' demo block are fully removed.
  If a denser read is needed later, R-FAMILY-001 directs that toward
  a new in-family component rather than a mode switch on this one.

---

## [0.2.3] — 2026-04-22

Polish pass on the v0.2.2 Data Motif siblings based on first-read
feedback. Density now reads as a direct sibling of `<DottedChart>`,
motion is legible from a still frame, and `<LiveDot>` picks up the
AI-native rotating-agent-state pattern.

### Added
- `<DotTimeline density="compact">` — new prop. Same component, same
  data, same state colors, same live-pulse cadence, but each bucket
  collapses from a vertical dot stack to a single thin bar whose height
  encodes count. Preferred read at full container width or for
  high-rate streams where dot stacks would overlap. Standard dot-stack
  mode remains the default.
- `<LiveDot labels={[...]} />` — rotating typewriter agent-state
  indicator. New props `labels: string[]`, `labelStep` (per-char
  interval, default 50ms), and `labelHold` (hold at full, default
  2000ms). Cycles through each label with type → hold → erase →
  advance; a 1px caret renders after the visible text and blinks on a
  1s cycle so the "something is happening" signal reads even between
  rotations. Accessibility: visible label is `aria-hidden` during
  rotation; a separate `aria-live="polite"` sr-only span updates with
  the full current label so assistive tech hears "AGENTING" not
  "A, AG, AGE...". Reduced motion collapses to instant swaps at the
  hold cadence. Preview demo shows `[AGENTING, WORKING, THINKING,
  REASONING]`.
- `Section 10 / Data Motif — Two New Siblings` in `preview.html`. The
  `<DotTimeline>` + `<PulseTrail>` block was a subsection inside §09
  with its own larger heading typography that fought the page voice;
  promoted to its own section using the canonical `.section-head`
  pattern so the hierarchy reads as siblings to every other section.

### Changed
- `<DotTimeline>` column layout switched from `flex: 1 1 0` (stretch to
  fill) to CSS grid with fixed `var(--ds-size-dot)` (6px) column widths
  and `var(--ds-space-3)` (8px) gap — direct match for the
  `<DottedChart>` rhythm. Inter-dot vertical gap bumped from 2px to
  `var(--ds-space-2)` (4px) to match DottedChart's stack rhythm.
  Preview shows the two siblings side-by-side at half-width (stacks
  below 880px) so 24 buckets sit tight.
- `<PulseTrail>` head is now visually distinct from trail dots so the
  "this one is moving" signal reads from a still frame, not just from
  seeing the animation: 6px → 8px diameter, soft accent-live halo ring
  via `box-shadow` at 18% opacity, and default `loopDuration` tightened
  from 6000ms → 4000ms so in-flight motion is obvious on first glance.
  Reduced-motion fallback keeps the halo (bumped to 28% opacity) and
  pins the head at "now".
- Renumbered `§10 Do & Don't` → `§11`; animation-delay bumped from
  360ms → 400ms to stay ordered after the new §10.

### Removed
- `.variant-head` CSS class in `preview.html` (the now-unused subsection
  header that lived between the bento wrap and the variants grid).
- Static "STREAMING · 02:41:17" duration counter in the Live-dot
  preview row, superseded by the rotating typewriter demo.

---

## [0.2.2] — 2026-04-22

Data-motif expansion. Two new in-family siblings to `<DottedChart>` —
`<DotTimeline>` for "how much / when" and `<PulseTrail>` for "alive
right now" — replace the DensityStrip exploration that would have
broken the dot-motif family grammar. The R-FAMILY-001 protocol added
in this release makes that class of mistake unrepeatable.

### Added
- **`<DotTimeline>`** — dot-stack timeline. Direct dot-motif sibling of `<DottedChart>` for quantitative time-bucketed data. 24 buckets default over a 60s window; each bucket renders a vertical stack of 1–10 6px dots where dot count encodes event density and column color encodes bucket state (done / live / queued). Accepts either pre-bucketed `buckets` or raw `events` with a `window` + `bucketSize`; component bucketizes and resolves state with priority `live > done > queued`.
- **`<PulseTrail>`** — Emil-style signature motion. Single `accent-live` dot sweeps left → right over a configurable loop (default 6s) while pulsing on the `<LiveDot>` cadence (2s); trail dots mark prior events at decaying opacity. Motion IS the data — for AI-native surfaces where presence matters more than exact counts. Canonical carrier for the "alive now" agent-activity feel; other components should compose `<PulseTrail>` rather than recreate the pattern.
- **`R-FAMILY-001`** component-family protocol (`SKILL.md` → "Extending a component family — non-negotiables"). Six required-and-ordered steps when adding a new member to an existing family: read every sibling, state the motif, name the vocabulary (primitive shape, state coloring, motion cadence, axis language, typography), propose only in-family options, never swap the primitive, and document the family in `DESIGN.md` once two members exist. Mirrored as `R-FAMILY-001` in `refusals.json` and `FA01` in the linter and evaluator.
- `<DotTimeline>` and `<PulseTrail>` join the accent-carrier allowlist for **both** `--ds-accent-live` and `--ds-accent-success`. Each element in each component holds a single state value, so the two accents never collide within one rendered element; this is explicitly documented in `DESIGN.md`, `SKILL.md`, `refusals.json`, `scripts/lint.mjs`, and `quality-evaluator.md`.
- `<SegmentedBar>` — discrete progress for quota, credits, and task completion when the total is known.
- `<SegmentedControl>` — compact mode switching for filters, scopes, and tool rows.
- `<InlineStatus>` — bracketed mono state for queued, loading, saved, and live system feedback.
- `<MetricStat>` — large mono KPI readout with restrained count-up for revenue, usage, and agent metrics.
- `<ToolCall>` — AI-native execution row for tool invocations, duration, and explicit status.
- `R-STATE-001` in `refusals.json` plus `CO06` in the evaluator and linter, so skeleton and shimmer loading chrome are now explicitly discouraged.
- `install.sh` — non-destructive scaffold installer so the contract can land in another repo without manual file copying.
- `accent-success` (`#00E013`) — semantic completion accent for fully committed progress and closed positive endpoints.
- Semantic spacing aliases (`space-tight`, `space-group`, `space-section`, `space-context`) on top of the numeric scale so agents can compose by relationship, not just raw number.

### Changed
- **`<DensityStrip>` retired before public release.** Its solid-bar primitive broke the Data Motif family grammar (the motif is dots, not bars). R-FAMILY-001 was added in this same release to prevent that class of mistake from recurring; `<DotTimeline>` is the in-family successor that preserves the quantitative "density over time" read.
- Accent-carrier allowlists in `DESIGN.md`, `SKILL.md`, `refusals.json`, `scripts/lint.mjs`, and `quality-evaluator.md` swap DensityStrip out for `<DotTimeline>` + `<PulseTrail>`.
- Softened the large Geist voice by dropping display and heading weights from 600 to 500 and easing the tracking slightly open, reducing the neutral/Helvetica feel without changing the family.
- Updated `DESIGN.md`, `SKILL.md`, and the preview surface so segmented controls, segmented progress, inline status, and tool-call rows are first-class patterns instead of future ideas.
- Re-tiered headline typography: `h2` and `h3` now use `Geist Mono` as the framing voice, while display / h1 stay on `Cash Sans`. Chapter and page title specimens render as mixed alpha + mono numerals (`Aa 0123`) to reflect the system's data-forward title language.
- Tightened preview interactions so segmented control selection moves with a shared thumb, status toggles between playing and paused, progress can replay from click, and revenue metrics replay a restrained count-up on demand.
- Added semantic green completion states to the preview and React primitives: `<SegmentedBar>` switches to `accent-success` at full completion, and `<DottedChart>` can mark a terminal success endpoint without turning color into hierarchy.
- Switched release/install metadata to the target GitHub remote `soheilolia/sous_ds`.

### Removed
- `<DensityStrip>` component files (`components/DensityStrip.tsx`, `components/DensityStrip.css`) and the strip-only size tokens `--ds-size-strip-h` and `--ds-size-strip-bar-min`. Never reached a public tag; retired per R-FAMILY-001.
- Stale `Sous_DS_v1.0/` export folder and duplicate inspiration artifacts so the repo has one working source of truth.

## [0.2.0] — 2026-04-22

Truth-layer release. The repo now matches its own documentation, three verified contract-vs-reference contradictions are resolved, the system ships as an installable skill package, and the taste corpus is machine-readable.

### Added
- `SKILL.md` — A+ skill entrypoint with trigger grammar, refusal summary pointing at `refusals.json`, allowed-carrier allowlist, prompt→action mapping, and the AI-native primitive roadmap (AgentStream, ToolCall, Citation, Transcript, TokenMeter, DiffBlock, ConfidenceBar).
- `refusals.json` — machine-readable refusal corpus. Every "never do X" rule has a stable id (`R-*`), regex pattern, severity, rationale, exception, canonical alternative, and source pointer. The refusal set is now enforceable by any tool, not just `lint.mjs`.
- `components/index.ts` as the barrel the docs already described.
- `package.json` + `LICENSE` + `INSTALL.md` + `scripts/check-package.mjs` so the repo is a real distributable artifact. `sous-lint` binary exposed via `bin`.
- CL07 lint rule (`scripts/lint.mjs`) + rule entry in `quality-evaluator.md`: `--ds-accent-live` may only appear in sanctioned carrier files (LiveDot, Pill, Toast, tokens.css, preview showcase, slop example, refusals, SKILL). Focus-ring `:focus-visible` exempt.

### Changed
- Package identity from `soheil-ds` to `sous-ds` across tokens.css comment, lint.mjs header, quality-evaluator system prompt, package.json name. Version bumped to 0.2.0 since the folder reorganization is breaking for anyone importing from the old root.
- Realigned file layout with the documented contract: reference components now live in `components/`, the evaluator lives in `scripts/lint.mjs`, and the teaching artifact lives in `examples/slop-vs-system.html`.
- Tokenized shared interaction values used by the reference components: press duration, live pulse cadence, spinner duration, stagger timings, shared dot/icon/control sizes, and toast min width. The "every value is a token" claim in component headers is now true, not aspirational.
- Clarified semantic accent carriers in the design contract and SKILL. `LiveDot` is the primary carrier; `Pill live` and `Toast tone="live"` are permitted carriers when they express the same semantic state. The prior "sole home" claim in LiveDot was internally contradicted by Pill.css and Toast.css usage and has been corrected in DESIGN.md, LiveDot source comments, and quality-evaluator.md.
- Tightened release hygiene: the npm package ships from an explicit whitelist; package integrity is checked via `scripts/check-package.mjs`; `lint:ui` scans `components/` and `preview.html` only (not `examples/`, which hosts intentional slop for teaching).

### Fixed
- `Card` default padding now matches the documented 24px default (was 32px / `--ds-space-7`; now `--ds-space-6`).
- `Pill` letter-spacing now references `--ds-type-label-track` (0.08em) instead of a hardcoded 0.04em.
- `Toast` action and dismiss controls now meet the 44×44 hit-area floor via the `max(100%, var(--ds-size-interactive-min))` pattern, and show `:focus-visible` rings matching the Button focus contract.
- `TASTE_LOG.md` ENTRY 002 inspiration source path corrected (was `/Users/soheil/Desktop/Inspiration` with 8 images; actual is `Inspiration/` at repo root with 18 files — 17 JPEG + 1 GIF). Per the append-only principle, ENTRY 002 is untouched; a single superseding annotation references ENTRY 005 §5 which supersedes.
- Root-level `design.yml` duplicate removed. CI now reads the canonical `.github/workflows/design.yml` only.

---

## [0.1.0] — 2026-04-21

First alpha cut. The contract is stable enough to build against; token names may shift before `v1.0.0`.

### Added
- **`DESIGN.md`** — spec-compliant to `@google/design.md`, extended with VoltAgent's Responsive Behavior and Agent Prompt Guide sections.
- **`AGENTS.md`** — coding-agent companion covering hard rules, file layout, PR conventions, and refusal criteria for out-of-system requests.
- **`ANIMATION_RULES.md` v1.1** — Emil Kowalski's taste rules encoded, plus a `prefers-reduced-motion` contract and the Sonner toast pattern (`ANIMATION_RULES` v1.1 supersedes any earlier draft).
- **`TASTE_LOG.md` v1.1** — taste memory with resolved conflict log (see Fixed below).
- **`quality-evaluator.md`** — 30+ lint rule IDs across 7 rule groups with severity and structured JSON output format.
- **`design-tokens.json`** — DTCG-flavored machine source of truth.
- **`tokens.css`** — runtime CSS custom properties with dark default and `[data-theme="light"]` override.
- **`SKILL.md`** — adds the root skill entrypoint required for installation from a checkout or published repo.
- **`preview.html`** — single-file visual catalog showing palette, type scale, spacing, radii, elevation, motion lab, components, and the dotted chart motif.
- **Reference components** — `Button`, `Card`, `Pill`, `LiveDot`, `Toast` (Sonner-style with provider + hook), `DottedChart` (the signature data motif).
- **`scripts/lint.mjs`** — executable Quality Evaluator implementation.
- **`examples/slop-vs-system.html`** — side-by-side teaching artifact: rejected rendering next to compliant rendering for each rule category.
- **`.github/workflows/design.yml`** — CI pipeline running both `@google/design.md lint` and the implementation linter.
- **`CONTRIBUTING.md`** — governance.

### Fixed (from prior drafts)
- **`text-muted` contrast**. Prior value `#999999` on white was 2.85:1, failing WCAG AA. Raised to `#767676` in light mode (4.55:1, AA minimum) and `#888888` in dark mode (5.58:1, AA).
- **Card shadow contradiction**. A `--card-shadow` token existed despite the principle "cards use 1px border, not shadow." Token removed. Shadows now scoped to menus/toasts (`--ds-elev-1`) and modals only (`--ds-elev-2`).
- **Bento-grid verdict contradiction**. Image 07 was simultaneously dismissed as "generic SaaS" and adopted as "bento with dark-card contrast." Resolved by separating pattern (kept) from execution (rejected).
- **Anti-pattern logic**. The prior anti-pattern table conflated "absent from references" with "rejected." Rebuilt to list rules with taste-based reasoning.

### Changed
- **Primary face** from Cash Sans to **Geist** (free, Google Fonts, well-licensed). Mono face from Cash Sans Mono to **Geist Mono**. Projects with a Cash Sans license can restore it by overriding `--ds-font-sans` and `--ds-font-mono` in a `:root` block that loads after `tokens.css`.

### Security / accessibility
- Added global `@media (prefers-reduced-motion: reduce)` rule to `tokens.css` collapsing all animation and transition durations to 0.01ms.
- Added component-level reduced-motion handling in `Pill`, `LiveDot`, `Toast`, `DottedChart`.
- Every documented color pair now has a computed WCAG contrast ratio in `DESIGN.md` Colors section.

### Known gaps (tracked in `TASTE_LOG.md` → Pending Ingestion)
- Pinterest board `pin.it/4khCrB7hx` not yet ingested. Needs manual screenshot + append as ENTRY 005.
- Emil's skill: only animation + typography sections mined. Component design and Sonner rules remain (though `Toast.tsx` captures the core Sonner conventions from his public writing).
- VoltAgent reference DESIGN.md files (Linear, Vercel, etc.) cited but not deeply studied. Pending as ENTRY 007.

---

## Roadmap

Planned (post-`v0.2.2`):
- Slot-pattern variants of `Card` (no-head, data-centric, dense)
- Full `Modal` and `Drawer` components
- `Tooltip` with explicit `transform-origin` calculation
- Light-mode visual catalog (`preview-light.html`)
- Tailwind preset package (`@sous/tailwind`)
- Figma library sync via Tokens Studio
- Batch-commit stagger on `<DotTimeline>` (40ms cascade left→right) once real streaming data is wired

Planned for `v1.0.0`:
- Token naming frozen
- DTCG export parity (`@google/design.md export --format dtcg` produces a complete file)
- Complete example app (dashboard reference) in `examples/`
- Screenshot-mode linter (evaluate rendered images against rule IDs)

---

[0.1.0]: Release URL to be added when the repository is published.
