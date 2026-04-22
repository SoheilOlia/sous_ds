import * as React from "react";
import "./LiveDot.css";

export interface LiveDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Optional label rendered beside the dot in mono. Used for "LIVE", "RECORDING", etc. */
  label?: string;
  /** Accessibility: spoken announcement for screen readers. Defaults to "Live". */
  announce?: string;
  /** Disable the opacity pulse. Use when many dots would create noise. */
  static?: boolean;
}

/**
 * LiveDot — the primary semantic accent carrier.
 *
 * Rules followed:
 *  • 6px circle. No size variants. The semantic is fixed.
 *  • Opacity pulse only. Never color or scale animation.
 *  • role="status" so screen readers announce "Live".
 *  • Accent may also appear in sanctioned semantic carriers like Pill[live]
 *    and Toast[tone="live"], but only with the same meaning inside a viewport.
 */
export const LiveDot = React.forwardRef<HTMLSpanElement, LiveDotProps>(
  function LiveDot(
    { label, announce = "Live", static: isStatic = false, className, ...rest },
    ref
  ) {
    return (
      <span
        {...rest}
        ref={ref}
        role="status"
        data-static={isStatic || undefined}
        className={["ds-livedot", className].filter(Boolean).join(" ")}
      >
        <span className="ds-livedot__mark" aria-hidden="true" />
        <span className="ds-livedot__sr">{announce}</span>
        {label && <span className="ds-livedot__label">{label}</span>}
      </span>
    );
  }
);
