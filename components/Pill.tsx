import * as React from "react";
import "./Pill.css";

type PillVariant = "filled" | "outline";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Filled = primary status (active, current, selected). Outline = secondary/impermanent (draft, future, in-progress). */
  variant?: PillVariant;
  /** Show a live dot prefix. Filled variant only. Used for "Live", "Streaming", etc. */
  live?: boolean;
}

/**
 * Pill — reference implementation for soheil-ds.
 *
 * Variants map directly to semantic status hierarchy:
 *  • filled  → current/active/urgent
 *  • outline → dashed border signals impermanence (draft, in-progress)
 *
 * Rules followed:
 *  • Pill radius always (`--ds-radius-pill`).
 *  • Mono type. Uppercase with loosened tracking.
 *  • Outline uses a dashed border, not solid. The dash is semantic.
 */
export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill(
  { variant = "outline", live = false, children, className, ...rest },
  ref
) {
  return (
    <span
      {...rest}
      ref={ref}
      data-variant={variant}
      className={["ds-pill", className].filter(Boolean).join(" ")}
    >
      {live && <span className="ds-pill__dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
