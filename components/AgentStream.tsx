import * as React from "react";
import { typewriter, prefersReducedMotion } from "./motion";
import "./AgentStream.css";

type AgentStreamSpeed = "slow" | "normal" | "fast";

const STEP_MS: Record<AgentStreamSpeed, number> = {
  slow: 32,
  normal: 18,
  fast: 8,
};

export interface AgentStreamProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onAnimationEnd"> {
  /** The full target text. Reveal stops at this length. */
  text: string;
  /** ms-per-character pacing. Default `normal` (18ms). */
  speed?: AgentStreamSpeed;
  /** Show the trailing cursor glyph while streaming. Default `true`. */
  cursor?: boolean;
  /** Auto-start on mount. Default `true`. */
  play?: boolean;
  /** Fired once the full text has been typed. */
  onComplete?: (text: string) => void;
  /** Fired on every character update with the partial string. */
  onUpdate?: (partial: string) => void;
}

/**
 * AgentStream — token-by-token reveal of agent or model output.
 *
 * Composes the `typewriter` motion primitive. Renders inline as a span so
 * it slots into existing prose / `<ToolCall>` rows / `<Card>` bodies
 * without forcing block layout.
 *
 * Rules followed:
 *  • Mono type. Stream content is data, not editorial body.
 *  • Cursor glyph is `▍` (U+258D) — instrument-aesthetic, not the editor `|`.
 *  • Cursor blinks via opacity only (no transform), 1s linear loop.
 *  • Under prefers-reduced-motion, full text renders immediately; cursor
 *    is still shown but does not blink. Reveal is the motion the user
 *    opted out of, not the affordance.
 *  • Cancellable via unmount: AbortController stops the in-flight stream
 *    and prevents stale onUpdate calls.
 *  • No accent. The stream is not "live" in the live-dot sense; it's
 *    in-progress content.
 *
 * @example
 *   <AgentStream
 *     text="Indexing 188 Linear tickets…"
 *     speed="normal"
 *     onComplete={() => setStatus("done")}
 *   />
 */
export const AgentStream = React.forwardRef<HTMLSpanElement, AgentStreamProps>(
  function AgentStream(
    {
      text,
      speed = "normal",
      cursor = true,
      play = true,
      onComplete,
      onUpdate,
      className,
      ...rest
    },
    ref
  ) {
    const [visible, setVisible] = React.useState<string>(
      prefersReducedMotion() ? text : ""
    );
    const [streaming, setStreaming] = React.useState<boolean>(false);

    React.useEffect(() => {
      if (!play) return;
      const controller = new AbortController();
      let cancelled = false;
      setStreaming(true);

      typewriter({
        text,
        step: STEP_MS[speed],
        signal: controller.signal,
        onUpdate: (partial) => {
          if (cancelled) return;
          setVisible(partial);
          onUpdate?.(partial);
        },
      }).then(() => {
        if (cancelled) return;
        setStreaming(false);
        if (visible !== text || prefersReducedMotion()) {
          // ensure terminal frame (matters under reduced motion / instant case)
          setVisible(text);
        }
        onComplete?.(text);
      });

      return () => {
        cancelled = true;
        controller.abort();
      };
      // We intentionally do not re-stream when `onUpdate` / `onComplete`
      // identity changes — only when the text/speed/play inputs change.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed, play]);

    const showCursor = cursor && (streaming || prefersReducedMotion());

    return (
      <span
        {...rest}
        ref={ref}
        className={["ds-agent-stream", className].filter(Boolean).join(" ")}
        data-streaming={streaming || undefined}
        aria-live="polite"
      >
        <span className="ds-agent-stream__text">{visible}</span>
        {showCursor && (
          <span className="ds-agent-stream__cursor" aria-hidden="true">
            ▍
          </span>
        )}
      </span>
    );
  }
);
