import * as React from "react";
import { InlineStatus } from "./InlineStatus";
import "./ToolCall.css";

type ToolCallTone = "default" | "live";

export interface ToolCallProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tool or function name. Keep terse and code-like. */
  name: React.ReactNode;
  /** Optional explicit status, rendered as an InlineStatus. */
  status?: React.ReactNode;
  /** Status tone. `live` is the only accented state. */
  statusTone?: ToolCallTone;
  /** Optional mono duration or timestamp. */
  duration?: React.ReactNode;
  /** Secondary explanatory text under the head row. */
  detail?: React.ReactNode;
}

/**
 * ToolCall — AI-native execution row for tool invocations.
 *
 * Rules followed:
 *  • Surface-raised + 1px line border, no excess shadow.
 *  • Name is body-sm at 500. Duration stays mono.
 *  • Status is explicit and terse via InlineStatus.
 *  • Enter motion is a small fade/translate for spatial continuity.
 */
export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  function ToolCall(
    {
      name,
      status,
      statusTone = "default",
      duration,
      detail,
      children,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <div
        {...rest}
        ref={ref}
        className={["ds-tool-call", className].filter(Boolean).join(" ")}
      >
        <div className="ds-tool-call__head">
          <span className="ds-tool-call__name">{name}</span>
          {(duration || status) && (
            <div className="ds-tool-call__meta">
              {duration && (
                <span className="ds-tool-call__duration" data-tabular>
                  {duration}
                </span>
              )}
              {status && <InlineStatus tone={statusTone}>{status}</InlineStatus>}
            </div>
          )}
        </div>
        {detail && <p className="ds-tool-call__detail">{detail}</p>}
        {children && <div className="ds-tool-call__body">{children}</div>}
      </div>
    );
  }
);
