/*
 * LiveCube · sous-ds
 *
 * A live indicator — sibling of <LiveDot>. Same inline layout, same
 * mono label voice, same rotating-typewriter mechanics. Only the
 * indicator shape is different: where <LiveDot> shows a 6px
 * `accent-live` dot that pulses, <LiveCube> shows a 4×4 CSS 3D
 * cube whose faces are all `accent-live`, with per-face opacity
 * tiers giving the cube a subtle 3D read at that tiny size.
 *
 * Use when you want the "attention / live / now" semantic carried by
 * a dimensional indicator instead of a flat dot. Same accent-live
 * carrier role; just a different glyph.
 *
 * Label rotation delegates to `rotateLabels()` from `./motion`, so
 * the typewriter cadence is identical to <LiveDot labels={...}>.
 */

import * as React from "react";
import "./LiveCube.css";
import { rotateLabels } from "./motion";

export interface LiveCubeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Single static label rendered beside the cube. Ignored if `labels` is provided. */
  label?: string;
  /**
   * Rotating labels with typewriter animation — cycles through the
   * list, typing each in character-by-character, holding, then
   * erasing. Pass a stable reference.
   */
  labels?: string[];
  /** Per-character typing/erasing interval in ms. Default 50. */
  labelStep?: number;
  /** Hold duration at the fully-typed label before erasing. Default 2000ms. */
  labelHold?: number;
  /** Accessibility announcement. Default "Live". */
  announce?: string;
  /** Disable the cube's live pulse. Use when many indicators would create noise. */
  static?: boolean;
}

export const LiveCube = React.forwardRef<HTMLSpanElement, LiveCubeProps>(
  function LiveCube(
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
    ref,
  ) {
    const rotating = !!(labels && labels.length > 0);

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
        className={["ds-livecube", className].filter(Boolean).join(" ")}
      >
        <span className="ds-livecube__stage" aria-hidden="true">
          <span className="ds-livecube__cube">
            <span className="ds-livecube__face ds-livecube__face--front" />
            <span className="ds-livecube__face ds-livecube__face--right" />
            <span className="ds-livecube__face ds-livecube__face--top" />
            <span className="ds-livecube__face ds-livecube__face--back" />
            <span className="ds-livecube__face ds-livecube__face--left" />
            <span className="ds-livecube__face ds-livecube__face--bottom" />
          </span>
        </span>
        <span className="ds-livecube__sr" aria-live="polite">
          {announceText}
        </span>
        {visibleLabel !== undefined && (
          <span
            className="ds-livecube__label"
            aria-hidden={rotating ? true : undefined}
          >
            {visibleLabel}
            {rotating && (
              <span className="ds-livecube__caret" aria-hidden="true" />
            )}
          </span>
        )}
      </span>
    );
  },
);
