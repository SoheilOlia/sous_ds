# DensityStrip — Design Spec

**Status:** Approved (4-question brainstorm, user confirmed each section)
**Date:** 2026-04-22
**Component:** `<DensityStrip>` — new member of the Data Motif family
**Relationship to existing:** Companion to `<DottedChart>`, not replacement.

---

## Purpose

A horizontal segmented strip that shows **distribution + density + progression** in one glance. Built for AI-native data — "N tool calls over the last 60s, some complete, some running, some queued." Reads as a pipeline ruler plus a density chart at once.

## Data model

```ts
type BucketState = 'done' | 'live' | 'queued';

type Bucket = { ts: number; count: number; state: BucketState };
type Event  = { ts: number; state: BucketState };

type DensityStripProps = {
  // One of these is required. buckets is pre-computed; events gets bucketized.
  buckets?: Bucket[];
  events?:  Event[];

  // Used only when passing `events`.
  window?:     number;   // default 60_000 ms
  bucketSize?: number;   // default  2_500 ms   → 24 buckets over 60s

  label?:    string;     // default "Activity" — aria-label prefix
  showAxis?: boolean;    // default true
  className?: string;
};
```

Validation: runtime error if neither `buckets` nor `events` provided.

### Bucketization rules

When deriving buckets from events:
1. Events outside `[now - window, now]` are dropped.
2. Events are grouped into buckets of `bucketSize` ms each.
3. Bucket state is derived by priority: `live` > `done` (all events done, count > 0) > `queued` (default).
4. If `window` does not divide evenly by `bucketSize`, the most recent bucket is partial width (rendered as `flex: N fr`).
5. Empty buckets (count 0) render a 6px muted dot at the base — the dot motif retained so the strip reads as time-aware even with no data.

---

## Visual architecture

```
.ds-strip                  role="img" aria-label=...
  .ds-strip__track         flex row, align-items: flex-end, height: --ds-size-strip-h (48px)
    .ds-strip__bucket      flex: 1, relative, tabindex=0, data-state, data-empty
      .ds-strip__bar       width: --ds-size-strip-bar-w (6px)
                           height: N% of container (density)
                           background: state-driven
      .ds-strip__dot       (when count = 0) 6px muted dot at base
      .ds-strip__tooltip   absolute, above bucket, mono, tabular-nums
  .ds-strip__axis          flex row, space-between, text-muted mono
    .ds-strip__axis-start  "60s ago"
    .ds-strip__axis-end    "now"
```

## State rendering

| State | Visual | Notes |
|---|---|---|
| `done`, count > 0 | Solid bar, `accent-success` fill, opacity 1 | Height proportional to max count in window |
| `live`, count > 0 | Solid bar, `accent-live` fill, opacity pulse `1 → 0.55 → 1` on 2000ms linear infinite | Matches `<LiveDot>` cadence — they read as siblings |
| `queued`, count > 0 | Muted bar, `text-muted` at 50% opacity | Bar present but low-emphasis |
| any state, count = 0 | 6px muted dot at bar base, 35% opacity | Dot motif retained for empty/future slots |

## Motion (Emil-locked)

Easing: **`cubic-bezier(0.23, 1, 0.32, 1)`** — stronger ease-out than stock CSS. Defined as `--ds-ease-strong`.

| Moment | Motion |
|---|---|
| State transition (bar color / height) | 220ms `--ds-ease-strong`, transitions on transform/opacity/background |
| Live bucket pulse | `@keyframes` opacity `1 → 0.55 → 1`, 2000ms linear infinite (matches LiveDot) |
| New bucket enter (when data stream extends) | `opacity 0 → 1` + `translateX(4px → 0)`, 140ms `--ds-ease-strong`, via `@starting-style` |
| Batch commit (future — v2) | 40ms stagger left→right between committing buckets |
| Tooltip enter | `opacity 0 → 1` + `translateY(4px → 0)`, 140ms `--ds-ease-strong`, `transform-origin: bottom center` |
| Tooltip exit | 112ms (80% of enter — Emil's asymmetric timing) |

### Per Emil's principles:
- Use **CSS transitions** on state-driven changes (interruptible when data refreshes)
- Use **keyframes** only for infinite/continuous motion (the live pulse)
- **`:active` press state** on bucket: `transform: scale(0.97)` for responsive feel (low priority — buckets are typically not clicked, but the affordance is cheap)

### `prefers-reduced-motion: reduce`
- All transitions → 0ms
- Live pulse animation removed
- Live state becomes a static `outline: 2px solid var(--ds-accent-live); outline-offset: -1px` on the bar

## Axis + chrome

- **Axis (default shown):** endpoints only — mono text-muted label under left edge (`{window} ago`) and right edge (`now`). No intermediate ticks. Window label auto-formatted: `<60s` → `Ns`, `≥60s` → `Nm`.
- **Legend:** none. Color meaning is implicit; caller composes `<Pill>` above if needed.
- **No title internal to the strip** — caller provides semantic wrapper.

## Sizing

- **Width:** responsive, fills container via flex.
- **Height:** `--ds-size-strip-h` = 48px (8pt scale).
- **Bar width inside bucket:** `--ds-size-strip-bar-w` = 6px (matches dot motif).
- **Min bar height when count > 0:** `--ds-size-strip-bar-min` = 4px (so a "1 call" bucket is still visible).

## Accessibility

- Container `role="img"` with `aria-label` summarizing the entire window: `"{label}, last {window}s. {done} complete, {live} running, {queued} queued."`
- Each bucket `tabindex="0"` with `aria-label` summarizing its own bucket: `"HH:MM:SS, N events, {state}"`.
- Focus ring on bucket: 2px `accent-live` outline, offset 2px, matching Button focus rule.
- Tooltip content also exposed inline via visible text inside `.ds-strip__tooltip` when focused.
- `prefers-reduced-motion` handled at CSS level — no JS branch needed.

## Contract/rule updates

- **DESIGN.md:** Extend "Accent carriers" — `<DensityStrip>` may carry **both** `accent-success` and `accent-live`. It's the first component allowed to carry accent-success and accent-live simultaneously; justified by semantic distinctness per-bucket (state of one bucket never conflicts with another).
- **SKILL.md:** Mirror carrier update.
- **refusals.json:** `R-SEMANTIC-001.allowedFiles` += `components/DensityStrip.css`.
- **scripts/lint.mjs:** `ruleCL07_accentCarrier` allowlist += same.
- **quality-evaluator.md:** CL07 row updated.

## Tokens added

```
--ds-size-strip-h:        48px
--ds-size-strip-bar-w:     6px
--ds-size-strip-bar-min:   4px
--ds-dur-strip-pulse:   2000ms
--ds-dur-strip-commit:   220ms
--ds-dur-strip-enter:    140ms
--ds-ease-strong:       cubic-bezier(0.23, 1, 0.32, 1)
```

## Edge cases

| Case | Behavior |
|---|---|
| No data (0 events) | Full strip of dotted empty buckets |
| Single bucket | Renders single full-width bucket with bar |
| Outlier high count | Tallest in window = 100%; others scaled relatively. Tooltip always shows exact count. |
| Out-of-order events | Sorted by `ts` internally before bucketization |
| Partial last bucket | Renders at proportional flex width |
| All `queued` state | Strip reads as "dim forest" — muted bars/dots throughout |
| All `done` state | Solid green histogram — "work complete" moment |
| Props drift (pass both buckets and events) | `buckets` wins, `events` ignored silently (documented) |

## Testing approach

- **Visual:** preview.html renders 3 demo strips side-by-side (steady, live-batch, mostly-empty) under Section 08 Data Motif next to DottedChart
- **Lint:** existing CL07 rule passes after allowlist update
- **Keyboard:** manual — tab traverses buckets, each shows tooltip
- **Reduced motion:** manual — set OS preference, verify pulse stops, outline appears

## Files changed

1. `components/DensityStrip.tsx` (NEW, ~170 lines)
2. `components/DensityStrip.css` (NEW, ~170 lines)
3. `components/index.ts` (export DensityStrip, types)
4. `tokens.css` (add 7 tokens)
5. `design-tokens.json` (DTCG entries for tokens)
6. `DESIGN.md` (accent carriers section + component doc)
7. `SKILL.md` (carriers list mirror)
8. `refusals.json` (R-SEMANTIC-001 allowedFiles)
9. `scripts/lint.mjs` (CL07 allowlist)
10. `quality-evaluator.md` (CL07 row)
11. `preview.html` (new demo section in Data Motif)

## Out of scope (for v2)

- Batch commit stagger (40ms cascade) — static data demo doesn't need it
- Click-to-drill-in interaction
- Zoomable time window (pinch or double-click)
- Multi-series overlay (e.g., compare two streams)
- Horizon-style stacked bars for very-high-density data

## Non-goals explicitly

- This is **not** a general-purpose chart library. Only these four states are supported. If you need more states, compose multiple strips or use a different component.
- This is **not** a replacement for DottedChart. DottedChart is for continuous value-over-time; DensityStrip is for bucketed event-counts-with-state.
