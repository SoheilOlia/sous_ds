/*
 * ThinkingCube · sous-ds
 *
 * A single 16×16 CSS 3D cube that ticks through discrete 90° face-flips
 * on a 2s loop. Pairs with rotating mono labels (AGENTING / WORKING /
 * THINKING / REASONING by default) to carry the "the agent is doing
 * something right now" signal — same role that <LiveDot labels={...}>
 * played before, but with a 3D cube indicator instead of a red dot.
 *
 * Design choices:
 * - Very low iso tilt (-8deg X, -12deg Y base). The cube reads as a
 *   cube, not the diamond-silhouette full iso view. A bit of the top
 *   is visible; faces come around as Y rotates.
 * - Stepped rotation (0, 90, 180, 270, 360 at 20/25/45/50/... beats)
 *   with holds — matches BoxLoader's percussive cadence rather than a
 *   continuous smooth spin.
 * - Grayscale faces only: top = --ds-text-primary (lit from above),
 *   front = --ds-text-secondary (mid), side = --ds-text-muted
 *   (shadowed). No hues, consistent with BoxLoader and the rest of
 *   the system's restraint.
 * - Label rotation delegates to `rotateLabels()` from `./motion` so
 *   the typewriter cadence stays identical to <LiveDot labels={...}>.
 * - prefers-reduced-motion: cube freezes at its base angle; labels
 *   snap between states at the hold interval (no typewriter).
 */

import * as React from "react";
import "./ThinkingCube.css";
import { rotateLabels } from "./motion";

export interface ThinkingCubeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "aria-label"> {
  /**
   * Rotating labels typed out next to the cube. Pass a stable array
   * reference (define outside render or memoize) — a new array
   * identity restarts the loop.
   * Default: ["AGENTING", "WORKING", "THINKING", "REASONING"].
   */
  labels?: string[];
  /** Per-character typing/erasing interval in ms. Default 50. */
  labelStep?: number;
  /** Hold duration at the full label before erasing. Default 2000ms. */
  labelHold?: number;
  /**
   * Single static label (when you don't want rotation). Ignored if
   * `labels` is provided.
   */
  label?: string;
  /** Accessibility announcement. Default "Thinking". */
  announce?: string;
  /** Disable the cube rotation. Use when many cubes would create noise. */
  static?: boolean;
}

const DEFAULT_LABELS: string[] = [
  "AGENTING",
  "WORKING",
  "THINKING",
  "REASONING",
];

export const ThinkingCube = React.forwardRef<HTMLSpanElement, ThinkingCubeProps>(
  function ThinkingCube(
    {
      labels = DEFAULT_LABELS,
      labelStep = 50,
      labelHold = 2000,
      label,
      announce = "Thinking",
      static: isStatic = false,
      className,
      ...rest
    },
    ref,
  ) {
    const rotating = !!(labels && labels.length > 0);

    const initialFull = rotating ? labels[0] : "";
    const [visible, setVisible] = React.useState("");
    const [fullLabel, setFullLabel] = React.useState(initialFull);

    React.useEffect(() => {
      if (!rotating) return;
      setVisible("");
      setFullLabel(labels[0]);
      const controller = new AbortController();
      rotateLabels({
        labels,
        step: labelStep,
        hold: labelHold,
        onUpdate: setVisible,
        onLabelComplete: setFullLabel,
        signal: controller.signal,
      });
      return () => controller.abort();
    }, [rotating, labels, labelStep, labelHold]);

    const visibleLabel = rotating ? visible : label;
    const announceText = rotating ? fullLabel || announce : label || announce;

    return (
      <span
        {...rest}
        ref={ref}
        role="status"
        data-static={isStatic || undefined}
        data-rotating={rotating || undefined}
        className={["ds-thinking-cube", className].filter(Boolean).join(" ")}
      >
        <span className="ds-thinking-cube__stage" aria-hidden="true">
          <span className="ds-thinking-cube__cube">
            <span className="ds-thinking-cube__face ds-thinking-cube__face--top" />
            <span className="ds-thinking-cube__face ds-thinking-cube__face--front" />
            <span className="ds-thinking-cube__face ds-thinking-cube__face--right" />
            <span className="ds-thinking-cube__face ds-thinking-cube__face--back" />
            <span className="ds-thinking-cube__face ds-thinking-cube__face--left" />
            <span className="ds-thinking-cube__face ds-thinking-cube__face--bottom" />
          </span>
        </span>
        <span className="ds-thinking-cube__sr" aria-live="polite">
          {announceText}
        </span>
        {visibleLabel !== undefined && (
          <span
            className="ds-thinking-cube__label"
            aria-hidden={rotating ? true : undefined}
          >
            {visibleLabel}
            {rotating && (
              <span className="ds-thinking-cube__caret" aria-hidden="true" />
            )}
          </span>
        )}
      </span>
    );
  },
);
