# DotTimeline + PulseTrail — Design Spec

**Status:** Approved (verbalized-sampling synthesis → A + B decision)
**Date:** 2026-04-22
**Supersedes:** `2026-04-22-density-strip-design.md` (solid-bar primitive — broke family grammar)
**Protocol:** Designed under `R-FAMILY-001` (SKILL.md "Extending a component family")

---

## The motif (one sentence)

**Data Motif = bars and fields built from stacked 6px dots, one color accent per column, mono labels, restraint.**

## Vocabulary (shared across the family)

| Axis | Vocabulary |
|---|---|
| Primitive | 6px circle via `--ds-size-dot`, radius 50% |
| State colors | `accent-success` (done), `accent-live` (running/live), `text-muted` (queued/empty) |
| Motion cadence | Pulse `1 → 0.55 → 1` on `--ds-dur-live-pulse` (2000ms linear infinite); state transitions `--ds-dur-standard` with `--ds-ease-out` |
| Axis language | Mono `text-muted`, `UPPERCASE`, endpoints-only (`{window} AGO` · `NOW`) |
| Typography | `--ds-font-mono` for axes and tooltips; `--ds-font-display` for section titles |

Both new components speak this vocabulary. No other primitive is permitted.

---

## Component 1 — `<DotTimeline>`

**Role:** quantitative / "how much, when." Direct sibling of `<DottedChart>` with a time axis instead of category axis.

**Data model:**

```ts
type BucketState = 'done' | 'live' | 'queued';
type Bucket = { ts: number; count: number; state: BucketState };
type TimelineEvent = { ts: number; state: BucketState };

type DotTimelineProps = {
  buckets?: Bucket[];
  events?: TimelineEvent[];
  window?: number;       // default 60_000 ms
  bucketSize?: number;   // default  2_500 ms → 24 buckets
  maxDots?: number;      // default 10 — tallest = this many dots, others scaled
  label?: string;        // aria-label prefix; default "Activity"
  showAxis?: boolean;    // default true
  className?: string;
};
```

Either `buckets` (pre-computed) OR `events` (component bucketizes) is required. Runtime error if both are missing.

**Bucketization:**
1. Drop events outside `[now − window, now]`.
2. Group into buckets of `bucketSize` ms.
3. State priority: `live > done (all events done, count > 0) > queued`.
4. If `bucketSize` doesn't divide `window`, the most-recent bucket is partial-width.

**Per-column rendering:**
- `count > 0`: column of `max(1, round(count / maxCount * maxDots))` stacked 6px dots, gap 3px.
- `count = 0`: single `text-muted` dot at 0.3 opacity (empty marker — dot motif retained even for future buckets).
- State color applied per-dot (the whole column shares state, so the column reads as monochrome).

**Motion:**
- State change: `transition: background-color var(--ds-dur-standard) var(--ds-ease-out), opacity var(--ds-dur-standard) var(--ds-ease-out);` on the dot.
- Live state: `@keyframes dot-timeline-pulse { 0%,100% {opacity:1} 50% {opacity:0.55} }` over `--ds-dur-live-pulse` linear infinite on each dot in the column.
- `prefers-reduced-motion: reduce`: pulse removed; live columns get a 2px `accent-live` outline inside the dot stack to retain semantic distinctness.

**A11y:**
- Container `role="img"` with `aria-label` summarizing `"{label}, last {window}s. N complete, N running, N queued."`
- Each column `tabindex="0"`, with per-column `aria-label` summarizing `"{HH:MM:SS}, N events, {state}"`.
- Focus ring: 2px `accent-live` outline, offset 2px, radius `xs`. Matches Button focus contract.

**Sizing:**
- Height: `~120px` (room for 10 dots + gaps + padding).
- Width: responsive, fills container.
- Dot size: `--ds-size-dot` (6px), gap: 3px.

---

## Component 2 — `<PulseTrail>`

**Role:** qualitative / "is it alive right now." Emil-style signature motion. Single moving dot + fading trail. Reads as presence, not measurement.

**Data model:**

```ts
type TrailEvent = { ts: number; state: BucketState };

type PulseTrailProps = {
  events?: TrailEvent[];   // recent events — last `trailLength` rendered
  trailLength?: number;    // default 10
  window?: number;         // default 60_000 — time range covered by trail
  loopDuration?: number;   // default 6_000 ms — head sweep cycle
  label?: string;          // default "Activity"
  showAxis?: boolean;      // default true
  className?: string;
};
```

`events` is optional; a fully-empty PulseTrail still renders the sweeping head (activity placeholder).

**Rendering:**
- **Trail:** up to `trailLength` dots positioned at `xPct = (1 − (now − event.ts) / window) * 100`; color per `event.state`; opacity linear-decays from `1` at right edge to `0.15` at left. Older events appear more faded further left.
- **Head:** single `--ds-accent-live` dot, vertically centered, positioned by CSS animation. Pulses on its own opacity cycle.

**Motion:**
- Head sweep: `@keyframes pulse-trail-sweep { 0% { left: 0% } 100% { left: 100% } }` over `loopDuration` linear infinite.
- Head pulse: concurrent `@keyframes pulse-trail-head { 0%,100% { opacity:1 } 50% { opacity:0.55 } }` over `--ds-dur-live-pulse` linear infinite. Two animations layered on the same element.
- Trail dots: static positions (no animation). They DECAY via opacity — the illusion of motion is the head moving past them.
- `prefers-reduced-motion: reduce`: both head animations disabled; head pinned at right edge; trail static.

**A11y:**
- Container `role="img"` with `aria-label` like `"Agent activity trail, last 60 seconds, 8 events in window."`
- Head + trail dots are `aria-hidden="true"` (decorative; the container label carries the semantic).
- No per-dot focusability — trail dots represent already-elapsed events, not interactive surfaces.

**Sizing:**
- Height: `48px` (compact — trail is a thin line).
- Width: responsive, fills container.
- Head + trail dots: `--ds-size-dot` (6px).

---

## Contract updates (both components)

- **DESIGN.md #accent-carriers:**
  - `accent-success`: sanctioned carriers now include `<DotTimeline>` done dots.
  - `accent-live`: sanctioned carriers now include `<DotTimeline>` live dots AND `<PulseTrail>` head dot. `<PulseTrail>` is the canonical "live now" carrier — other components should compose it when they need activity-feel, not recreate the pattern.
  - Remove all references to `<DensityStrip>` (retired).
- **SKILL.md:** mirror the carrier list change.
- **refusals.json R-SEMANTIC-001.allowedFiles:** replace `components/DensityStrip.css` with `components/DotTimeline.css` AND `components/PulseTrail.css`.
- **scripts/lint.mjs ruleCL07_accentCarrier:** same swap in both allowlists.
- **quality-evaluator.md CL07 row:** phrasing updated to reference both new components.

## Tokens

No new tokens needed. Reuses:
- `--ds-size-dot` (6px) — the primitive
- `--ds-accent-success`, `--ds-accent-live`, `--ds-text-muted` — state colors
- `--ds-dur-live-pulse` (2000ms) — pulse cadence (same as LiveDot)
- `--ds-dur-standard` (220ms) — state transition duration
- `--ds-ease-out` (cubic-bezier(0.16, 1, 0.3, 1)) — default easing
- `--ds-space-2` (4px), `--ds-space-5` (16px) — container padding

## Edge cases

| Case | Behavior |
|---|---|
| No data | DotTimeline renders row of empty-marker dots; PulseTrail renders just the sweeping head |
| Single event | Both components render correctly; DotTimeline shows one column with one dot |
| Outlier high counts | DotTimeline scales column-by-column to `maxCount` in window; tallest = `maxDots` dots |
| Out-of-order events | Sorted internally by `ts` before bucketization (DotTimeline) / rendering (PulseTrail) |
| Partial last bucket | DotTimeline renders last bucket at proportional flex width |
| Long event stream (> trailLength) | PulseTrail shows only the most recent `trailLength` events |
| Time drift (event in future) | Clamped to now (treated as current event) |

## Testing

- **Visual:** preview.html renders one canonical demo of each component next to DottedChart in Section 09 (Data Motif). Sibling test confirmed via screenshot.
- **Lint:** `node scripts/lint.mjs components/ preview.html` passes with 0 errors. CL07 rule verifies accent usage.
- **Keyboard (DotTimeline only):** tab traverses columns; each shows focus ring + tooltip.
- **Reduced motion:** manual — set OS preference, verify pulses disappear, head pins at right, outline appears on live DotTimeline columns.

## Files

| Change | Path |
|---|---|
| NEW | `components/DotTimeline.tsx` (~160 lines) |
| NEW | `components/DotTimeline.css` (~120 lines) |
| NEW | `components/PulseTrail.tsx` (~130 lines) |
| NEW | `components/PulseTrail.css` (~90 lines) |
| DELETE | `components/DensityStrip.tsx` |
| DELETE | `components/DensityStrip.css` |
| MOD | `components/index.ts` (swap exports) |
| MOD | `preview.html` (variants exploration → real demos) |
| MOD | `DESIGN.md`, `SKILL.md`, `refusals.json`, `scripts/lint.mjs`, `quality-evaluator.md` (accent-carrier update) |
| MOD | `CHANGELOG.md` (Unreleased section) |

## Out of scope (deferred)

- Sparkline variant (was variant C in exploration). Overlapped DotTimeline's intent; dropped per verbalized-sampling synthesis.
- Batch-commit stagger on DotTimeline (40ms left-to-right cascade when multiple buckets resolve together). Needs real streaming data to tune; deferred.
- Click-to-drill-in on trail dots. Product integration concern, not a DS concern.
- Canvas-backed PulseTrail for very-high-frequency event streams. Current DOM approach fine up to ~10 events/sec.
- A shared `<DotMotif>` base component. Explicitly rejected as premature abstraction — each component stands alone.
