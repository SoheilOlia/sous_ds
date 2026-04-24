/*
 * DotLoader · sous-ds
 *
 * 7×7 dot grid driven by an array of frames. Each frame is a list of
 * cell indices (0–48) that should be "active" on that tick; the
 * loader advances through the frames at `duration` ms per step.
 *
 * Pair with a hand-authored frame sequence to build a loading motif
 * (a walking dot, a snake, a pulse) or drop in an interpretation of
 * whatever loading state the host surface is in. Zero-dep; no CSS
 * transition between frames — state changes snap, which is the
 * percussive, frame-accurate feel Nothing's language calls for.
 *
 * Adapted from a community Tailwind/`cn` snippet. The logic is kept
 * verbatim; only the styling layer is rewritten to vanilla CSS
 * against `--ds-*` tokens so the component runs without Tailwind or
 * a classnames utility.
 */

import * as React from "react";
import "./DotLoader.css";

export interface DotLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered frames. Each frame is a list of active cell indices (0–48). */
  frames: number[][];
  /** Additional class on every dot (useful for custom sizing/colors). */
  dotClassName?: string;
  /** Toggle the animation loop. Default true. */
  isPlaying?: boolean;
  /** ms per frame. Default 100. */
  duration?: number;
  /**
   * How many full passes through the frames to play. -1 means loop
   * forever. Default -1.
   */
  repeatCount?: number;
  /** Called when repeatCount is reached (never fires for -1). */
  onComplete?: () => void;
}

const GRID_SIZE = 49; // 7 × 7

export function DotLoader(props: DotLoaderProps) {
  const {
    frames,
    isPlaying = true,
    duration = 100,
    dotClassName,
    className,
    repeatCount = -1,
    onComplete,
    ...rest
  } = props;

  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const currentIndex = React.useRef(0);
  const repeats = React.useRef(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const applyFrameToDots = React.useCallback(
    (dots: HTMLDivElement[], frameIndex: number) => {
      const frame = frames[frameIndex];
      if (!frame) return;
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", frame.includes(index));
      });
    },
    [frames],
  );

  // Reset pointers whenever the frame list changes.
  React.useEffect(() => {
    currentIndex.current = 0;
    repeats.current = 0;
  }, [frames]);

  React.useEffect(() => {
    if (isPlaying) {
      if (currentIndex.current >= frames.length) currentIndex.current = 0;
      const dotElements = gridRef.current?.children;
      if (!dotElements) return;
      const dots = Array.from(dotElements) as HTMLDivElement[];

      intervalRef.current = setInterval(() => {
        applyFrameToDots(dots, currentIndex.current);
        if (currentIndex.current + 1 >= frames.length) {
          if (repeatCount !== -1 && repeats.current + 1 >= repeatCount) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete?.();
          }
          repeats.current += 1;
        }
        currentIndex.current = (currentIndex.current + 1) % frames.length;
      }, duration);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frames, isPlaying, applyFrameToDots, duration, repeatCount, onComplete]);

  const rootClassName = ["ds-dot-loader", className]
    .filter(Boolean)
    .join(" ");
  const dotClass = ["ds-dot-loader__dot", dotClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      ref={gridRef}
      className={rootClassName}
      role="status"
      aria-label={rest["aria-label"] ?? "Loading"}
    >
      {Array.from({ length: GRID_SIZE }).map((_, i) => (
        <div key={i} className={dotClass} aria-hidden="true" />
      ))}
    </div>
  );
}

DotLoader.displayName = "DotLoader";
