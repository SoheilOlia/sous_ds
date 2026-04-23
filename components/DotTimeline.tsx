/*
 * DotTimeline · sous-ds
 *
 * Quantitative Data Motif component. Vertical stacks of 6px dots, one column
 * per time bucket. Dot count encodes event density; column color encodes
 * bucket state (done / live / queued / empty).
 *
 * Direct sibling of <DottedChart>. Shares the 6px dot primitive, the
 * success/live/muted state vocabulary, and the mono axis language. The only
 * axis swap is time-instead-of-category.
 *
 * Accent carrier: permitted for BOTH --ds-accent-success (done buckets) and
 * --ds-accent-live (live buckets) per DESIGN.md #accent-carriers. See CL07
 * in scripts/lint.mjs and R-SEMANTIC-001 in refusals.json.
 *
 * Designed under R-FAMILY-001 protocol. See
 * docs/superpowers/specs/2026-04-22-dot-motif-variants-design.md.
 */

import * as React from "react";
import "./DotTimeline.css";

export type BucketState = "done" | "live" | "queued";

export type Bucket = {
  /** Start timestamp of the bucket (ms since epoch). */
  ts: number;
  /** Event count in the bucket. */
  count: number;
  /** Resolved state for the bucket. */
  state: BucketState;
};

export type TimelineEvent = {
  ts: number;
  state: BucketState;
};

export type DotTimelineProps = {
  /** Pre-bucketed data. If provided, `events`/`window`/`bucketSize` are ignored. */
  buckets?: Bucket[];
  /** Raw events; component bucketizes using window + bucketSize. */
  events?: TimelineEvent[];
  /** Total window in ms. Default 60_000. */
  window?: number;
  /** Per-bucket duration in ms. Default 2_500 → 24 buckets over 60s. */
  bucketSize?: number;
  /** Tallest column renders this many dots; others scale proportionally. */
  maxDots?: number;
  /** aria-label prefix. Default "Activity". */
  label?: string;
  /** Show the "{window} ago · now" axis row. Default true. */
  showAxis?: boolean;
  className?: string;
};

function bucketize(
  events: TimelineEvent[],
  windowMs: number,
  bucketSize: number,
  nowMs: number,
): Bucket[] {
  const start = nowMs - windowMs;
  const bucketCount = Math.ceil(windowMs / bucketSize);
  const sorted = [...events].sort((a, b) => a.ts - b.ts);
  const out: Bucket[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bStart = start + i * bucketSize;
    const bEnd = bStart + bucketSize;
    const inBucket = sorted.filter((e) => e.ts >= bStart && e.ts < bEnd);
    let state: BucketState = "queued";
    if (inBucket.some((e) => e.state === "live")) {
      state = "live";
    } else if (inBucket.length > 0 && inBucket.every((e) => e.state === "done")) {
      state = "done";
    }
    out.push({ ts: bStart, count: inBucket.length, state });
  }
  return out;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatWindow(ms: number): string {
  return ms >= 60_000 ? `${Math.round(ms / 60_000)}m` : `${Math.round(ms / 1000)}s`;
}

export function DotTimeline(props: DotTimelineProps) {
  const {
    buckets: providedBuckets,
    events,
    window: windowMs = 60_000,
    bucketSize = 2_500,
    maxDots = 10,
    label = "Activity",
    showAxis = true,
    className,
  } = props;

  const resolved = React.useMemo<Bucket[]>(() => {
    if (providedBuckets) return providedBuckets;
    if (events) return bucketize(events, windowMs, bucketSize, Date.now());
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "DotTimeline: either `buckets` or `events` is required.",
      );
    }
    return [];
  }, [providedBuckets, events, windowMs, bucketSize]);

  const maxCount = React.useMemo(
    () => resolved.reduce((m, b) => Math.max(m, b.count), 1),
    [resolved],
  );

  const summary = React.useMemo(() => {
    let done = 0, live = 0, queued = 0;
    for (const b of resolved) {
      if (b.state === "done") done += b.count;
      else if (b.state === "live") live += b.count;
      else queued += b.count;
    }
    return `${label}, last ${formatWindow(windowMs)}. ${done} complete, ${live} running, ${queued} queued.`;
  }, [resolved, label, windowMs]);

  const cls = className ? `ds-dot-timeline ${className}` : "ds-dot-timeline";

  return (
    <div className={cls} role="img" aria-label={summary}>
      <div className="ds-dot-timeline__track">
        {resolved.map((bucket) => {
          const isEmpty = bucket.count === 0;
          const dotCount = isEmpty
            ? 1
            : Math.max(1, Math.round((bucket.count / maxCount) * maxDots));
          return (
            <div
              key={bucket.ts}
              className="ds-dot-timeline__col"
              data-state={bucket.state}
              data-empty={isEmpty ? "true" : undefined}
              tabIndex={0}
              aria-label={`${formatTime(bucket.ts)}, ${bucket.count} event${
                bucket.count === 1 ? "" : "s"
              }, ${bucket.state}`}
            >
              {Array.from({ length: dotCount }, (_, i) => (
                <span
                  key={i}
                  className="ds-dot-timeline__d"
                  aria-hidden="true"
                />
              ))}
            </div>
          );
        })}
      </div>
      {showAxis && (
        <div className="ds-dot-timeline__axis" aria-hidden="true">
          <span>{formatWindow(windowMs)} ago</span>
          <span>now</span>
        </div>
      )}
    </div>
  );
}

DotTimeline.displayName = "DotTimeline";
