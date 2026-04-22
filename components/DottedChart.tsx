import * as React from "react";
import "./DottedChart.css";

export interface DottedChartDatum {
  /** Short label rendered below the column. Kept to 3 characters for alignment. */
  label: string;
  /** Integer count of dots in this column. Clamp: 0-20 recommended. */
  value: number;
}

export interface DottedChartProps {
  data: DottedChartDatum[];
  /** Index of the "active" column (rendered with primary text color). Defaults to last. */
  activeIndex?: number;
  /** Pixel width of one column cell. Default 16 for 8pt alignment. */
  columnWidth?: number;
  /** Pixel gap between columns. Default 8. */
  columnGap?: number;
  /** Animate dots in with staggered delay on mount. Default true. */
  animate?: boolean;
  /** Optional accessible description for screen readers. */
  "aria-label"?: string;
}

/**
 * DottedChart — the signature visualization for soheil-ds.
 *
 * Rules followed:
 *  • No color hierarchy. Active = --ds-text-primary, inactive = --ds-text-muted.
 *  • Dots instead of solid rectangles. Density carries magnitude.
 *  • Mono typography on all labels. tabular-nums.
 *  • Animation: opacity 0 → 1 and scale(0.85) → 1 per dot, staggered by
 *    system motion tokens for column and item reveal.
 *  • prefers-reduced-motion: dots appear instantly.
 */
export function DottedChart({
  data,
  activeIndex,
  columnWidth = 16,
  columnGap = 8,
  animate = true,
  "aria-label": ariaLabel,
}: DottedChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const active = activeIndex ?? data.length - 1;

  return (
    <figure
      className="ds-chart"
      aria-label={ariaLabel ?? "Dotted bar chart"}
      role="img"
    >
      <div
        className="ds-chart__bars"
        style={{
          gridTemplateColumns: `repeat(${data.length}, ${columnWidth}px)`,
          gap: `${columnGap}px`,
          height: `${maxValue * 10 + 8}px`,
        }}
      >
        {data.map((d, colIndex) => (
          <div
            key={`${d.label}-${colIndex}`}
            className={`ds-chart__bar${colIndex === active ? " is-active" : ""}`}
          >
            {Array.from({ length: d.value }).map((_, dotIndex) => (
              <span
                key={dotIndex}
                className="ds-chart__dot"
                style={
                  animate
                    ? {
                        animationDelay: `calc((var(--ds-dur-stagger-column) * ${colIndex}) + (var(--ds-dur-stagger-item) * ${dotIndex}))`,
                      }
                    : { opacity: 1 }
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div
        className="ds-chart__labels"
        style={{
          gridTemplateColumns: `repeat(${data.length}, ${columnWidth}px)`,
          gap: `${columnGap}px`,
        }}
      >
        {data.map((d, i) => (
          <span
            key={`lbl-${d.label}-${i}`}
            className={`ds-chart__label${i === active ? " is-active" : ""}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
