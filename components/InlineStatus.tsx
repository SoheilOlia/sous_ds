import * as React from "react";
import "./InlineStatus.css";

type InlineStatusTone = "default" | "active" | "live";

export interface InlineStatusProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** `live` is the only accented state. Everything else stays monochrome. */
  tone?: InlineStatusTone;
}

/**
 * InlineStatus — bracketed mono state for explicit system feedback.
 *
 * Examples:
 *  • [QUEUED]
 *  • [PLAYING]
 *  • [LOADING 00:03]
 *  • [SAVED]
 *  • [LIVE]
 *
 * Rules followed:
 *  • Mono label typography, uppercase, loosened tracking.
 *  • `active` promotes the label to primary text without introducing accent.
 *  • Accent only when the status is truly live.
 *  • Prefer explicit status text over placeholder loading chrome.
 */
export const InlineStatus = React.forwardRef<HTMLSpanElement, InlineStatusProps>(
  function InlineStatus(
    { tone = "default", children, className, ...rest },
    ref
  ) {
    return (
      <span
        {...rest}
        ref={ref}
        className={["ds-inline-status", className].filter(Boolean).join(" ")}
        data-tone={tone}
        role={rest.role ?? "status"}
        aria-live={rest["aria-live"] ?? "polite"}
      >
        <span className="ds-inline-status__bracket" aria-hidden="true">
          [
        </span>
        {tone === "live" && (
          <span className="ds-inline-status__dot" aria-hidden="true" />
        )}
        <span className="ds-inline-status__label">{children}</span>
        <span className="ds-inline-status__bracket" aria-hidden="true">
          ]
        </span>
      </span>
    );
  }
);
