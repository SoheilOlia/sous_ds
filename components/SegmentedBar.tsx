import * as React from "react";
import "./SegmentedBar.css";

export interface SegmentedBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Active segment count. Clamped between 0 and total. */
  value: number;
  /** Total segment count. Minimum 1. */
  total: number;
  /** Animate the initial segment reveal with a short stagger. Defaults to true. */
  animated?: boolean;
  /** Optional terminal tone when the meter reaches full completion. */
  completeTone?: "default" | "success";
  /** Accessible label for the meter. */
  "aria-label"?: string;
}

/**
 * SegmentedBar — discrete progress for instrument-style interfaces.
 *
 * Rules followed:
 *  • Uses pattern and luminance before color.
 *  • Segments snap to the system spacing scale.
 *  • Active state is immediate; no fill sweep animation.
 *  • `accent-success` is allowed only when the meter is fully complete.
 *  • Meter semantics for screen readers.
 */
export const SegmentedBar = React.forwardRef<HTMLDivElement, SegmentedBarProps>(
  function SegmentedBar(
    {
      value,
      total,
      animated = true,
      completeTone = "default",
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const segmentTotal = Math.max(1, Math.floor(total));
    const activeCount = Math.max(0, Math.min(segmentTotal, Math.floor(value)));

    return (
      <div
        {...rest}
        ref={ref}
        className={["ds-segmented-bar", className].filter(Boolean).join(" ")}
        data-animated={animated || undefined}
        data-complete-tone={completeTone === "success" && activeCount === segmentTotal ? "success" : undefined}
        role="meter"
        aria-label={ariaLabel ?? "Segmented progress"}
        aria-valuemin={0}
        aria-valuemax={segmentTotal}
        aria-valuenow={activeCount}
        style={style}
      >
        {Array.from({ length: segmentTotal }).map((_, index) => (
          <span
            key={index}
            className={`ds-segmented-bar__segment${index < activeCount ? " is-active" : ""}`}
            aria-hidden="true"
            style={
              animated
                ? ({ "--ds-segment-index": index } as React.CSSProperties)
                : undefined
            }
          />
        ))}
      </div>
    );
  }
);
