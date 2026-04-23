import * as React from "react";
import "./LiveDot.css";

export interface LiveDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Single static label rendered beside the dot in mono. Ignored if `labels` is provided. */
  label?: string;
  /**
   * Rotating labels with typewriter animation — cycles through the list,
   * typing each in character-by-character, holding, then erasing. Use for
   * agent-state indicators where "something is happening" needs to read
   * more strongly than a single static word.
   * Example: `labels={["AGENTING","WORKING","THINKING","REASONING"]}`.
   */
  labels?: string[];
  /** Per-character typing/erasing interval in ms. Default 50. */
  labelStep?: number;
  /** Hold duration at the fully-typed label before erasing. Default 2000ms. */
  labelHold?: number;
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
 *  • `labels={[...]}` enables rotating typewriter states for agent "alive"
 *    feel. Typed character-by-character at `labelStep` ms, held for
 *    `labelHold` ms at full, then erased. A blinking caret runs during
 *    type/hold/erase phases. Under prefers-reduced-motion the typewriter
 *    collapses to instant label swaps at `labelHold` cadence; the caret
 *    stops blinking.
 */
export const LiveDot = React.forwardRef<HTMLSpanElement, LiveDotProps>(
  function LiveDot(
    {
      label,
      labels,
      labelStep = 50,
      labelHold = 2000,
      announce = "Live",
      static: isStatic = false,
      className,
      ...rest
    },
    ref
  ) {
    const rotating = !!(labels && labels.length > 0);
    const [index, setIndex] = React.useState(0);
    const [visible, setVisible] = React.useState("");
    const [phase, setPhase] = React.useState<"typing" | "holding" | "erasing">("typing");

    // Resolve reduced-motion once per mount; effect re-runs won't thrash it.
    const reduced = React.useMemo(
      () =>
        typeof window !== "undefined" && typeof window.matchMedia === "function"
          ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
          : false,
      [],
    );

    React.useEffect(() => {
      if (!rotating) return;
      const list = labels as string[];
      const current = list[index % list.length];

      if (reduced) {
        // Skip the typewriter: show full label, hold, advance.
        setVisible(current);
        setPhase("holding");
        const id = window.setTimeout(() => {
          setIndex((i) => (i + 1) % list.length);
          setPhase("typing");
          setVisible("");
        }, labelHold);
        return () => window.clearTimeout(id);
      }

      let id: number | undefined;
      if (phase === "typing") {
        if (visible.length < current.length) {
          id = window.setTimeout(
            () => setVisible(current.slice(0, visible.length + 1)),
            labelStep,
          );
        } else {
          setPhase("holding");
          id = window.setTimeout(() => setPhase("erasing"), labelHold);
        }
      } else if (phase === "erasing") {
        if (visible.length > 0) {
          id = window.setTimeout(
            () => setVisible(visible.slice(0, -1)),
            labelStep,
          );
        } else {
          setIndex((i) => (i + 1) % list.length);
          setPhase("typing");
        }
      }
      return () => {
        if (id !== undefined) window.clearTimeout(id);
      };
    }, [rotating, labels, index, phase, visible, labelStep, labelHold, reduced]);

    const visibleLabel = rotating ? visible : label;
    const fullLabel = rotating
      ? (labels as string[])[index % (labels as string[]).length]
      : label;

    return (
      <span
        {...rest}
        ref={ref}
        role="status"
        data-static={isStatic || undefined}
        data-rotating={rotating || undefined}
        className={["ds-livedot", className].filter(Boolean).join(" ")}
      >
        <span className="ds-livedot__mark" aria-hidden="true" />
        <span className="ds-livedot__sr" aria-live="polite">
          {fullLabel || announce}
        </span>
        {visibleLabel !== undefined && (
          <span
            className="ds-livedot__label"
            aria-hidden={rotating ? true : undefined}
          >
            {visibleLabel}
            {rotating && <span className="ds-livedot__caret" aria-hidden="true" />}
          </span>
        )}
      </span>
    );
  },
);
