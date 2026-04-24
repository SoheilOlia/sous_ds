/*
 * BoxLoader · sous-ds
 *
 * Four isometric cubes cycle through a 3×2 grid on a 2-second loop.
 * Each cube is a real CSS 3D box (front + right + top faces visible);
 * faces are shaded in three grays — top = primary (lit from above),
 * front = secondary (mid tone), right = muted (in shadow) — so the
 * cubes read three-dimensional without introducing any hue.
 *
 * Adapted from a community Tailwind snippet. The original pasted only
 * the keyframes and HTML — not the 3D face-positioning CSS, which is
 * required for the cubes to actually be cubes. Reconstructed from the
 * standard CSS isometric-cube idiom (transform-style: preserve-3d +
 * per-face translateZ/rotate*).
 */

import * as React from "react";
import "./BoxLoader.css";

export interface BoxLoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Show the bracketed `[Loading…]` caption under the boxes. Default true. */
  showLabel?: boolean;
  /** Label text (rendered inside `[ ]`). Default "Loading". */
  label?: string;
  /** Accessibility announcement. Default mirrors `label`. */
  "aria-label"?: string;
}

export function BoxLoader(props: BoxLoaderProps) {
  const {
    showLabel = true,
    label = "Loading",
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const rootClassName = ["ds-box-loader", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={rootClassName}
      role="status"
      aria-label={ariaLabel ?? label}
    >
      <div className="ds-box-loader__stage" aria-hidden="true">
        <div className="ds-box-loader__field">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`ds-box-loader__box ds-box-loader__box--${n}`}
            >
              <span className="ds-box-loader__face ds-box-loader__face--top" />
              <span className="ds-box-loader__face ds-box-loader__face--front" />
              <span className="ds-box-loader__face ds-box-loader__face--right" />
              <span className="ds-box-loader__face ds-box-loader__face--back" />
            </div>
          ))}
        </div>
      </div>
      {showLabel && (
        <div className="ds-box-loader__label" aria-hidden="true">
          [{label}…]
        </div>
      )}
    </div>
  );
}

BoxLoader.displayName = "BoxLoader";
