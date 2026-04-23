import * as React from "react";
import "./Pill.css";

type PillVariant = "filled" | "outline";
type PillTone = "default" | "draft" | "progress";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Filled = primary status (active, current, selected). Outline = secondary/impermanent (draft, future, in-progress). */
  variant?: PillVariant;
  /** Outline tones clarify whether the state is inactive (`draft`) or actively moving (`progress`). */
  tone?: PillTone;
  /** Show a live dot prefix. Filled variant only. Used for "Live", "Streaming", etc. */
  live?: boolean;
}

/**
 * Pill — reference implementation for sous-ds.
 *
 * Variants map directly to semantic status hierarchy:
 *  • filled  → current/active/urgent
 *  • outline → dashed border signals impermanence (draft, in-progress)
 *  • tone=draft keeps the state quieter than tone=progress
 *
 * Rules followed:
 *  • Pill radius always (`--ds-radius-pill`).
 *  • Mono type. Uppercase with loosened tracking.
 *  • Outline uses a dashed border, not solid. The dash is semantic.
 */
export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill(
  {
    variant = "outline",
    tone = "default",
    live = false,
    children,
    className,
    ...rest
  },
  ref
) {
  return (
    <span
      {...rest}
      ref={ref}
      data-variant={variant}
      data-tone={tone}
      className={["ds-pill", className].filter(Boolean).join(" ")}
    >
      {live && <span className="ds-pill__dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
