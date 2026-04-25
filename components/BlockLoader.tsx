/*
 * BlockLoader · sous-ds
 *
 * Seven blocks chase each other around an eight-position path on a
 * 3×3 grid. Every block runs the identical ten-second keyframe on a
 * staggered delay (negative one-seventh of the cycle per block) so at
 * any given frame they're evenly spaced around the loop — producing
 * a smooth chasing trail that never collides.
 *
 * Adapted from a community Tailwind snippet. Logic preserved; only
 * the styling layer is rewritten to vanilla CSS against `--ds-*`
 * tokens. The upstream demo wrapped the loader in a dark/light
 * toggle harness and a dot-grid background — both are host-level
 * concerns, not part of the loader, and are stripped.
 *
 * Renamed from `<SquareLoader>` in v0.4.0 — the visual is a chasing
 * row of small block elements, and the new name keeps it lexically
 * adjacent to `<LiveBlock>`, which uses the same animation shrunk
 * down for inline use.
 */

import * as React from "react";
import "./BlockLoader.css";

export interface BlockLoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Show the bracketed `[Loading…]` caption under the grid. Default true. */
  showLabel?: boolean;
  /** Label text (rendered inside `[ ]`). Default "Loading". */
  label?: string;
  /** Accessibility announcement. Default mirrors `label`. */
  "aria-label"?: string;
}

export function BlockLoader(props: BlockLoaderProps) {
  const {
    showLabel = true,
    label = "Loading",
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const rootClassName = ["ds-block-loader", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={rootClassName}
      role="status"
      aria-label={ariaLabel ?? label}
    >
      <div className="ds-block-loader__stage" aria-hidden="true">
        <div className="ds-block-loader__grid">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span
              key={n}
              className={`ds-block-loader__block ds-block-loader__block--${n}`}
            />
          ))}
        </div>
      </div>
      {showLabel && (
        <div className="ds-block-loader__label" aria-hidden="true">
          [{label}…]
        </div>
      )}
    </div>
  );
}

BlockLoader.displayName = "BlockLoader";
