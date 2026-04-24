/*
 * PulseTrail · sous-ds
 *
 * Qualitative Data Motif component — "is it alive right now?"
 *
 * Single accent-live dot sweeps left → right over a configurable cycle,
 * leaving a fading trail of prior events. Motion IS the data. Designed for
 * AI-native surfaces where presence matters more than exact counts.
 *
 * Emil-style signature motion: the head pulses on the live-dot cadence
 * (--ds-dur-live-pulse = 2000ms linear, matching LiveDot) while traversing
 * the full width on a slower loop (--loopDuration, default 6000ms). Trail
 * dots are static at positions derived from real event timestamps; opacity
 * decays left-to-right so older events look "further in the past."
 *
 * Accent carrier: permitted for --ds-accent-live (head) and --ds-accent-success
 * (trail done events). Canonical carrier for "live now" activity feel — other
 * components should compose PulseTrail rather than recreate the pattern.
 *
 * Designed under R-FAMILY-001 protocol. See
 * docs/superpowers/specs/2026-04-22-dot-motif-variants-design.md.
 */

import * as React from "react";
import "./PulseTrail.css";

export type TrailEventState = "done" | "live" | "queued";

export type TrailEvent = {
  ts: number;
  state: TrailEventState;
  /**
   * Optional magnitude for this event. When present and `valueMax`
   * is set on the parent, the dot floats higher for larger values —
   * the trail reads as a silhouette of the data, not a flat baseline.
   */
  value?: number;
};

export type PulseTrailProps = {
  /** Recent events. Last `trailLength` are rendered. Optional — empty renders just the head. */
  events?: TrailEvent[];
  /** How many trail dots to render. Default 10. */
  trailLength?: number;
  /** Visible time window in ms. Default 60_000. */
  window?: number;
  /**
   * Upper bound for `event.value` → Y-position mapping. When unset or
   * when events don't carry `value`, dots sit flush at the baseline.
   * When set, `value / valueMax` maps 0 → baseline, 1 → near-top.
   */
  valueMax?: number;
  /** Head sweep cycle duration in ms. Default 4_000 (tight enough that motion is obvious on first glance). */
  loopDuration?: number;
  /** aria-label prefix. Default "Agent activity". */
  label?: string;
  /** Show the "{window} ago · now" axis row. Default true. */
  showAxis?: boolean;
  className?: string;
};

function formatWindow(ms: number): string {
  return ms >= 60_000 ? `${Math.round(ms / 60_000)}m` : `${Math.round(ms / 1000)}s`;
}

export function PulseTrail(props: PulseTrailProps) {
  const {
    events = [],
    trailLength = 10,
    window: windowMs = 60_000,
    valueMax,
    loopDuration = 4_000,
    label = "Agent activity",
    showAxis = true,
    className,
  } = props;

  /*
   * Take up to trailLength most-recent events, sort oldest → newest, and
   * position each at an x% derived from how recent it is relative to now.
   * Older = further left (closer to 0%); most recent = further right.
   *
   * Y-position: if the parent passes `valueMax` and events carry `value`,
   * map value/valueMax into canvas height (0 → baseline, 1 → near-top).
   * Without valueMax, dots sit flush at the baseline — silhouette mode
   * is opt-in so callers with pure presence data don't get noise.
   */
  const trail = React.useMemo(() => {
    const now = Date.now();
    const recent = [...events]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, trailLength)
      .reverse(); // now oldest → newest
    return recent.map((e, i) => {
      const age = Math.max(0, Math.min(windowMs, now - e.ts));
      const xPct = (1 - age / windowMs) * 94;
      const position = recent.length > 1 ? i / (recent.length - 1) : 1;
      const opacity = 0.15 + position * 0.75;
      // Y in px from canvas bottom. Canvas is 48px; leave 4px baseline
      // padding and cap dot center at 36px from bottom (so a 6px dot
      // fits with 6px top clearance).
      const bottomPx =
        valueMax && e.value !== undefined
          ? 4 + Math.max(0, Math.min(1, e.value / valueMax)) * 32
          : 4;
      return { key: `${e.ts}-${i}`, xPct, bottomPx, opacity, state: e.state };
    });
  }, [events, trailLength, windowMs, valueMax]);

  const summary = `${label}, last ${formatWindow(windowMs)}. ${trail.length} event${
    trail.length === 1 ? "" : "s"
  } in window.`;

  const cls = className ? `ds-pulse-trail ${className}` : "ds-pulse-trail";

  // Pass loopDuration as a CSS var so the sweep keyframe picks it up.
  const containerStyle = {
    ["--ds-pulse-trail-loop" as string]: `${loopDuration}ms`,
  } as React.CSSProperties;

  return (
    <div className={cls} role="img" aria-label={summary} style={containerStyle}>
      <div className="ds-pulse-trail__canvas">
        {trail.map((d) => (
          <span
            key={d.key}
            className="ds-pulse-trail__dot"
            data-role="trail"
            data-state={d.state}
            style={{
              left: `${d.xPct}%`,
              bottom: `${d.bottomPx}px`,
              opacity: d.opacity,
            }}
            aria-hidden="true"
          />
        ))}
        <span
          className="ds-pulse-trail__dot ds-pulse-trail__head"
          data-role="head"
          aria-hidden="true"
        />
      </div>
      {showAxis && (
        <div className="ds-pulse-trail__axis" aria-hidden="true">
          <span>{formatWindow(windowMs)} ago</span>
          <span>now</span>
        </div>
      )}
    </div>
  );
}

PulseTrail.displayName = "PulseTrail";
