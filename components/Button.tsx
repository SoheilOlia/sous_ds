import * as React from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual hierarchy. Defaults to `secondary`. */
  variant?: ButtonVariant;
  /** Height. `md` (40px) is default. `sm` (32px) for dense UI. */
  size?: ButtonSize;
  /** Optional leading icon. Kept small to not compete with label. */
  iconLeft?: React.ReactNode;
  /** Optional trailing icon. */
  iconRight?: React.ReactNode;
  /** Shows a spinner, disables press, keeps width stable. */
  loading?: boolean;
}

/**
 * Button — reference implementation for soheil-ds.
 *
 * Rules followed (do not deviate):
 *  • `:active` applies scale(0.97), var(--ds-dur-press), ease
 *  • 44px hit area via ::before pseudo-element
 *  • No color transitions on hover. Uses opacity and background-color only
 *  • Focus ring uses --ds-line-strong, not browser default
 *  • Disabled state is visible (40% opacity) and keyboard-inert
 *  • prefers-reduced-motion collapses press feedback (handled globally in tokens.css)
 *  • Mono labels use tabular-nums when the label is purely numeric
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      iconLeft,
      iconRight,
      loading = false,
      disabled,
      children,
      className,
      type = "button",
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={["ds-btn", className].filter(Boolean).join(" ")}
      >
        {loading ? (
          <span className="ds-btn__spinner" aria-hidden="true" />
        ) : (
          iconLeft && <span className="ds-btn__icon">{iconLeft}</span>
        )}
        <span className="ds-btn__label">{children}</span>
        {iconRight && !loading && (
          <span className="ds-btn__icon">{iconRight}</span>
        )}
      </button>
    );
  }
);
