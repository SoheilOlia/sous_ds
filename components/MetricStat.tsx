import * as React from "react";
import "./MetricStat.css";

export interface MetricStatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "prefix"> {
  /** Small uppercase label above the value. */
  label: React.ReactNode;
  /** Numeric value rendered in mono. */
  value: number;
  /** Optional leading sign or symbol. */
  prefix?: React.ReactNode;
  /** Optional trailing unit or suffix. */
  suffix?: React.ReactNode;
  /** Optional supporting context line. */
  delta?: React.ReactNode;
  /** Decimal precision. */
  decimals?: number;
  /** Animate numeric changes. */
  animated?: boolean;
  /** Count-up duration in milliseconds. */
  durationMs?: number;
}

/**
 * MetricStat — large tabular metric with restrained count-up support.
 *
 * Rules followed:
 *  • Mono + tabular numerals; the value is the hero.
 *  • No decorative color. Hierarchy comes from size and luminance.
 *  • Count-up is brief and informative, not theatrical.
 */
export const MetricStat = React.forwardRef<HTMLDivElement, MetricStatProps>(
  function MetricStat(
    {
      label,
      value,
      prefix = "+",
      suffix,
      delta,
      decimals = 0,
      animated = true,
      durationMs = 680,
      className,
      ...rest
    },
    ref
  ) {
    const [displayValue, setDisplayValue] = React.useState(value);
    const valueRef = React.useRef(value);

    React.useEffect(() => {
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!animated || reducedMotion) {
        valueRef.current = value;
        setDisplayValue(value);
        return;
      }

      let frame = 0;
      const from = valueRef.current;
      const to = value;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = from + (to - from) * eased;
        setDisplayValue(nextValue);

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        } else {
          valueRef.current = to;
        }
      };

      frame = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(frame);
    }, [animated, durationMs, value]);

    const formattedValue = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(displayValue);

    return (
      <div
        {...rest}
        ref={ref}
        className={["ds-metric-stat", className].filter(Boolean).join(" ")}
      >
        <span className="ds-metric-stat__label">{label}</span>
        <div className="ds-metric-stat__value" data-tabular>
          {prefix && <span className="ds-metric-stat__prefix">{prefix}</span>}
          <span className="ds-metric-stat__number">{formattedValue}</span>
          {suffix && <span className="ds-metric-stat__suffix">{suffix}</span>}
        </div>
        {delta && <div className="ds-metric-stat__delta">{delta}</div>}
      </div>
    );
  }
);
