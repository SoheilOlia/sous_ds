/*
 * DensityStrip · sous-ds
 *
 * Horizontal segmented strip showing distribution + density + progression
 * in one glance. Companion to DottedChart (same Data Motif family).
 *
 * Each bucket is a fixed time window. Bar height inside the bucket = density
 * (event count). Bar color = state:
 *   - accent-success  → done (terminal, committed)
 *   - accent-live     → live (currently running; opacity pulse 2s linear)
 *   - text-muted      → queued (low-opacity bar)
 *   - empty (count=0) → 6px muted dot at base (dot motif retained)
 *
 * Accent carriers: per DESIGN.md #accent-carriers, DensityStrip is the one
 * component permitted to carry BOTH accent-success AND accent-live — each
 * marks a semantically distinct per-bucket state and the two never collide.
 *
 * Motion: see DensityStrip.css. Emil-aligned: transitions for interruptible
 * state changes, keyframes only for the infinite live pulse, strong ease-out
 * curve for all state transitions.
 */

import * as React from "react";
import "./DensityStrip.css";

export type BucketState = "done" | "live" | "queued";

export type Bucket = {
  /** Start timestamp of the bucket (ms since epoch). */
  ts: number;
  /** Event count in the bucket. */
  count: number;
  /** Resolved state for the bucket. */
  state: BucketState;
};

export type StripEvent = {
  ts: number;
  state: BucketState;
};

export type DensityStripProps = {
  /** Pre-bucketed data. If provided, `events`/`window`/`bucketSize` are ignored. */
  buckets?: Bucket[];
  /** Raw events; component bucketizes them using window + bucketSize. */
  events?: StripEvent[];
  /** Total window size in ms. Default 60_000. Only used when passing `events`. */
  window?: number;
  /** Per-bucket duration in ms. Default 2_500 → 24 buckets over 60s. */
  bucketSize?: number;
  /** aria-label prefix. Default "Activity". */
  label?: string;
  /** Show the "{window} ago · now" axis row. Default true. */
  showAxis?: boolean;
  className?: string;
};

function bucketize(
  events: StripEvent[],
  window: number,
  bucketSize: number,
  nowMs: number,
): Bucket[] {
  const start = nowMs - window;
  const bucketCount = Math.ceil(window / bucketSize);
  const buckets: Bucket[] = [];
  const sorted = [...events].sort((a, b) => a.ts - b.ts);

  for (let i = 0; i < bucketCount; i++) {
    const bStart = start + i * bucketSize;
    const bEnd = bStart + bucketSize;
    const inBucket = sorted.filter((e) => e.ts >= bStart && e.ts < bEnd);

    // State priority: live > done (all events done) > queued
    let state: BucketState = "queued";
    if (inBucket.some((e) => e.state === "live")) {
      state = "live";
    } else if (inBucket.length > 0 && inBucket.every((e) => e.state === "done")) {
      state = "done";
    } else if (inBucket.length > 0) {
      state = "queued";
    }

    buckets.push({ ts: bStart, count: inBucket.length, state });
  }

  return buckets;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatWindowLabel(ms: number): string {
  if (ms >= 60_000) {
    const mins = Math.round(ms / 60_000);
    return `${mins}m`;
  }
  return `${Math.round(ms / 1000)}s`;
}

export function DensityStrip(props: DensityStripProps) {
  const {
    buckets: providedBuckets,
    events,
    window: windowMs = 60_000,
    bucketSize = 2_500,
    label = "Activity",
    showAxis = true,
    className,
  } = props;

  const resolved = React.useMemo<Bucket[]>(() => {
    if (providedBuckets) return providedBuckets;
    if (events) return bucketize(events, windowMs, bucketSize, Date.now());
    // Dev-time guard: surface the misuse clearly.
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "DensityStrip: either `buckets` or `events` is required.",
      );
    }
    return [];
  }, [providedBuckets, events, windowMs, bucketSize]);

  // Tallest count across the window drives the height-% scale.
  const maxCount = React.useMemo(
    () => resolved.reduce((m, b) => Math.max(m, b.count), 1),
    [resolved],
  );

  const summary = React.useMemo(() => {
    let done = 0;
    let live = 0;
    let queued = 0;
    for (const b of resolved) {
      if (b.state === "done") done += b.count;
      else if (b.state === "live") live += b.count;
      else queued += b.count;
    }
    return `${label}, last ${formatWindowLabel(windowMs)}. ${done} complete, ${live} running, ${queued} queued.`;
  }, [resolved, label, windowMs]);

  const axisStart = formatWindowLabel(windowMs);
  const cls = className ? `ds-strip ${className}` : "ds-strip";

  return (
    <div className={cls} role="img" aria-label={summary}>
      <div className="ds-strip__track">
        {resolved.map((bucket) => {
          const isEmpty = bucket.count === 0;
          const heightPct = isEmpty
            ? 0
            : Math.max(8, (bucket.count / maxCount) * 100);

          return (
            <div
              key={bucket.ts}
              className="ds-strip__bucket"
              data-state={bucket.state}
              data-empty={isEmpty ? "true" : undefined}
              tabIndex={0}
              aria-label={`${formatTime(bucket.ts)}, ${bucket.count} event${
                bucket.count === 1 ? "" : "s"
              }, ${bucket.state}`}
            >
              {isEmpty ? (
                <span className="ds-strip__dot" aria-hidden="true" />
              ) : (
                <span
                  className="ds-strip__bar"
                  style={
                    {
                      ["--ds-strip-h-pct" as string]: `${heightPct}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              )}
              <span className="ds-strip__tooltip" role="tooltip">
                {formatTime(bucket.ts)} · {bucket.count}{" "}
                {bucket.count === 1 ? "call" : "calls"} · {bucket.state}
              </span>
            </div>
          );
        })}
      </div>
      {showAxis && (
        <div className="ds-strip__axis" aria-hidden="true">
          <span className="ds-strip__axis-start">{axisStart} ago</span>
          <span className="ds-strip__axis-end">now</span>
        </div>
      )}
    </div>
  );
}

DensityStrip.displayName = "DensityStrip";
