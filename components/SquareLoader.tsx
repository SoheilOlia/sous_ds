/*
 * SquareLoader · sous-ds
 *
 * Seven squares chase each other around an eight-position path on a
 * 3×3 grid, with the whole grid rotated 45° so the shape reads as a
 * rotating diamond. Every square runs the identical ten-second
 * keyframe on a staggered delay (negative one-seventh of the cycle
 * per square) so at any given frame they're evenly spaced around the
 * loop — producing a smooth chasing trail that never collides.
 *
 * Adapted from a community Tailwind snippet. Logic preserved; only
 * the styling layer is rewritten to vanilla CSS against `--ds-*`
 * tokens. The upstream demo wrapped the loader in a dark/light
 * toggle harness and a dot-grid background — both are host-level
 * concerns, not part of the loader, and are stripped.
 */

import * as React from "react";
import "./SquareLoader.css";

export interface SquareLoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Show the bracketed `[Loading…]` caption under the grid. Default true. */
  showLabel?: boolean;
  /** Label text (rendered inside `[ ]`). Default "Loading". */
  label?: string;
  /** Accessibility announcement. Default mirrors `label`. */
  "aria-label"?: string;
}

export function SquareLoader(props: SquareLoaderProps) {
  const {
    showLabel = true,
    label = "Loading",
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const rootClassName = ["ds-square-loader", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={rootClassName}
      role="status"
      aria-label={ariaLabel ?? label}
    >
      <div className="ds-square-loader__stage" aria-hidden="true">
        <div className="ds-square-loader__grid">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span
              key={n}
              className={`ds-square-loader__square ds-square-loader__square--${n}`}
            />
          ))}
        </div>
      </div>
      {showLabel && (
        <div className="ds-square-loader__label" aria-hidden="true">
          [{label}…]
        </div>
      )}
    </div>
  );
}

SquareLoader.displayName = "SquareLoader";
