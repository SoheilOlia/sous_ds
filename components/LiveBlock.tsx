/*
 * LiveBlock · sous-ds
 *
 * A live indicator — sibling of <LiveDot>. Same inline layout, same
 * mono label voice, same rotating-typewriter mechanics. Where
 * <LiveDot> shows a 6px `accent-live` dot that pulses, <LiveBlock>
 * shows a tiny chasing-blocks animation — the same path used by the
 * full-size <BlockLoader>, scaled down for inline use. Blocks paint
 * neutral (`--ds-text-primary`), not `accent-live`: <LiveDot> earns
 * the red because a single static dot needs hue to carry "live", but
 * here the chasing motion already carries the signal, so the color
 * stays neutral. No extra opacity pulse on top.
 *
 * Renamed from `<LiveCube>` in v0.4.0 — the new indicator is a
 * dimensional grid of moving blocks rather than a single 3D cube,
 * and the name keeps it lexically adjacent to `<BlockLoader>`.
 *
 * Label rotation delegates to `rotateLabels()` from `./motion`, so
 * the typewriter cadence is identical to <LiveDot labels={...}>.
 */

import * as React from "react";
import "./LiveBlock.css";
import { rotateLabels } from "./motion";

export interface LiveBlockProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Single static label rendered beside the indicator. Ignored if `labels` is provided. */
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
  /** Disable the chasing motion. Use when many indicators would create noise. */
  static?: boolean;
}

export const LiveBlock = React.forwardRef<HTMLSpanElement, LiveBlockProps>(
  function LiveBlock(
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
        className={["ds-liveblock", className].filter(Boolean).join(" ")}
      >
        <span className="ds-liveblock__stage" aria-hidden="true">
          <span className="ds-liveblock__grid">
            <span className="ds-liveblock__block ds-liveblock__block--1" />
            <span className="ds-liveblock__block ds-liveblock__block--2" />
            <span className="ds-liveblock__block ds-liveblock__block--3" />
            <span className="ds-liveblock__block ds-liveblock__block--4" />
            <span className="ds-liveblock__block ds-liveblock__block--5" />
            <span className="ds-liveblock__block ds-liveblock__block--6" />
            <span className="ds-liveblock__block ds-liveblock__block--7" />
          </span>
        </span>
        <span className="ds-liveblock__sr" aria-live="polite">
          {announceText}
        </span>
        {visibleLabel !== undefined && (
          <span
            className="ds-liveblock__label"
            aria-hidden={rotating ? true : undefined}
          >
            {visibleLabel}
            {rotating && (
              <span className="ds-liveblock__caret" aria-hidden="true" />
            )}
          </span>
        )}
      </span>
    );
  },
);
