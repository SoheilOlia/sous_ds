import * as React from "react";
import "./LiveDot.css";
import { rotateLabels } from "./motion";

export interface LiveDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Single static label rendered beside the dot in mono. Ignored if `labels` is provided. */
  label?: string;
  /**
   * Rotating labels with typewriter animation — cycles through the list,
   * typing each in character-by-character, holding, then erasing. Use for
   * agent-state indicators where "something is happening" needs to read
   * more strongly than a single static word.
   *
   * Pass a stable reference (define outside render or memoize) — the
   * component treats a new array identity as a reason to restart the loop.
   *
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
 *    feel. Typed at `labelStep` ms/char, held for `labelHold` ms at full,
 *    then erased. A blinking caret runs during type/hold/erase phases.
 *    Under prefers-reduced-motion the typewriter collapses to instant label
 *    swaps at `labelHold` cadence; the caret stops blinking.
 *
 * Rotation drives off `rotateLabels` from `./motion` — the same primitive
 * exposed at `sous-ds/motion` so consumers can build their own surfaces
 * with the identical typewriter cadence.
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

    // Visible (typing) text and the most recently completed label.
    // fullLabel feeds the aria-live sr-only span so assistive tech hears
    // whole words, not each keystroke.
    const initialFull = rotating ? (labels as string[])[0] : "";
    const [visible, setVisible] = React.useState("");
    const [fullLabel, setFullLabel] = React.useState(initialFull);

    React.useEffect(() => {
      if (!rotating) return;
      setVisible("");
      setFullLabel((labels as string[])[0]);
      const controller = new AbortController();
      rotateLabels({
        labels: labels as string[],
        step: labelStep,
        hold: labelHold,
        onUpdate: setVisible,
        onLabelComplete: setFullLabel,
        signal: controller.signal,
      });
      return () => controller.abort();
    }, [rotating, labels, labelStep, labelHold]);

    const visibleLabel = rotating ? visible : label;
    const announceText = rotating ? fullLabel || announce : label || announce;

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
          {announceText}
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
