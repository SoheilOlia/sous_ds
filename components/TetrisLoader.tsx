/*
 * TetrisLoader · sous-ds
 *
 * Mechanical, percussive loader. A miniature Tetris self-plays forever:
 * pieces fall one row per tick, full lines flash and clear, the grid
 * resets if it fills up. Every motion is stepped — no continuous
 * rotation, no springs, no placeholder-pulse chrome. The loader reads
 * as an instrument, not a marquee.
 *
 * Design source: Nothing Phone's motion language ("percussive, not
 * fluid — click not swoosh"). Implemented within sous-ds's restraint
 * tokens: dot primary fills, accent-success for line-clear flash,
 * bracketed mono label `[LOADING…]` per R-STATE-001.
 *
 * Adapted from a community Tailwind/Next component (shadcn-style) —
 * logic preserved, styling layer rewritten to vanilla CSS with
 * `--ds-*` tokens so the loader works in any runtime.
 */

import * as React from "react";
import "./TetrisLoader.css";
import { prefersReducedMotion } from "./motion";

type Shape = number[][];

// Seven canonical tetrominoes — I, O, T, L, S, Z, J.
const PIECES: Shape[] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
];

type Cell = { filled: boolean; clearing?: boolean };
type FallingPiece = { shape: Shape; x: number; y: number; id: string };

export type TetrisLoaderSize = "sm" | "md" | "lg";
export type TetrisLoaderSpeed = "slow" | "normal" | "fast";

export interface TetrisLoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Cell size preset. Default "md". */
  size?: TetrisLoaderSize;
  /**
   * Fall cadence per row. Values are deliberately slower than the
   * typical Tetris cadence — this is a loader, not a game.
   * Default "normal".
   */
  speed?: TetrisLoaderSpeed;
  /** Show the `[LOADING…]` label under the grid. Default true. */
  showLabel?: boolean;
  /** Label text (rendered inside `[ ]`). Default "Loading". */
  label?: string;
  /** Accessibility announcement. Default mirrors `label`. */
  "aria-label"?: string;
}

const SIZE_CONFIG: Record<TetrisLoaderSize, { cols: number; rows: number }> = {
  sm: { cols: 8, rows: 14 },
  md: { cols: 10, rows: 18 },
  lg: { cols: 10, rows: 20 },
};

// Per-step delay: one row of fall takes this many ms. Slow enough to
// read as a loader; fast enough that grid completes cycles visibly.
const SPEED_MS: Record<TetrisLoaderSpeed, number> = {
  slow: 300,
  normal: 220,
  fast: 140,
};

function rotate(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  const out: Shape = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      out[j][rows - 1 - i] = shape[i][j];
    }
  }
  return out;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function makeEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ filled: false })),
  );
}

export function TetrisLoader(props: TetrisLoaderProps) {
  const {
    size = "md",
    speed = "normal",
    showLabel = true,
    label = "Loading",
    className,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const { cols, rows } = SIZE_CONFIG[size];
  const stepMs = SPEED_MS[speed];

  const reduced = React.useMemo(prefersReducedMotion, []);

  const [grid, setGrid] = React.useState<Cell[][]>(() =>
    makeEmptyGrid(rows, cols),
  );
  const [piece, setPiece] = React.useState<FallingPiece | null>(null);
  const [clearing, setClearing] = React.useState(false);

  const frameRef = React.useRef<number | null>(null);
  const lastRef = React.useRef(0);

  const makePiece = React.useCallback((): FallingPiece => {
    const base = PIECES[Math.floor(Math.random() * PIECES.length)];
    let shape = base;
    const r = Math.floor(Math.random() * 4);
    for (let i = 0; i < r; i++) shape = rotate(shape);
    const maxX = cols - shape[0].length;
    return {
      shape,
      x: Math.floor(Math.random() * (maxX + 1)),
      y: -shape.length,
      id: randomId(),
    };
  }, [cols]);

  const canPlace = React.useCallback(
    (p: FallingPiece, nx: number, ny: number): boolean => {
      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (!p.shape[r][c]) continue;
          const gx = nx + c;
          const gy = ny + r;
          if (gx < 0 || gx >= cols || gy >= rows) return false;
          if (gy >= 0 && grid[gy][gx].filled) return false;
        }
      }
      return true;
    },
    [cols, rows, grid],
  );

  const placePiece = React.useCallback(
    (p: FallingPiece) => {
      setGrid((prev) => {
        const next = prev.map((row) => row.map((c) => ({ ...c })));
        for (let r = 0; r < p.shape.length; r++) {
          for (let c = 0; c < p.shape[r].length; c++) {
            if (!p.shape[r][c]) continue;
            const gx = p.x + c;
            const gy = p.y + r;
            if (gy >= 0 && gy < rows && gx >= 0 && gx < cols) {
              next[gy][gx] = { filled: true };
            }
          }
        }
        return next;
      });
    },
    [cols, rows],
  );

  const clearFullLines = React.useCallback(() => {
    setGrid((prev) => {
      const fullRows: number[] = [];
      prev.forEach((row, i) => {
        if (row.every((c) => c.filled)) fullRows.push(i);
      });
      if (fullRows.length === 0) return prev;

      setClearing(true);

      // Flash the rows about to be cleared with `data-clearing` — CSS
      // handles the outline flash (accent-success). No opacity pulse,
      // per R-STATE-001 (no placeholder-chrome patterns).
      const flashed = prev.map((row, i) =>
        fullRows.includes(i) ? row.map((c) => ({ ...c, clearing: true })) : row,
      );

      window.setTimeout(() => {
        setGrid((curr) => {
          const remaining = curr.filter((_, i) => !fullRows.includes(i));
          const empty = Array.from({ length: fullRows.length }, () =>
            Array.from({ length: cols }, () => ({ filled: false })),
          );
          setClearing(false);
          return [...empty, ...remaining];
        });
      }, 220);

      return flashed;
    });
  }, [cols]);

  const checkReset = React.useCallback((): boolean => {
    const top = grid.slice(0, 4);
    const tooFull = top.some(
      (row) => row.filter((c) => c.filled).length > cols * 0.7,
    );
    if (!tooFull) return false;

    setClearing(true);
    window.setTimeout(() => {
      setGrid(makeEmptyGrid(rows, cols));
      setPiece(null);
      setClearing(false);
    }, 300);
    return true;
  }, [grid, cols, rows]);

  // Game loop. Under reduced motion, the loop is disabled — the grid
  // stays empty and the `[LOADING…]` label carries the loading signal.
  React.useEffect(() => {
    if (reduced) return;

    const loop = (t: number) => {
      if (t - lastRef.current >= stepMs) {
        lastRef.current = t;
        if (!clearing && !checkReset()) {
          setPiece((prev) => {
            if (!prev) return makePiece();
            const ny = prev.y + 1;
            if (canPlace(prev, prev.x, ny)) return { ...prev, y: ny };
            placePiece(prev);
            window.setTimeout(clearFullLines, 50);
            return makePiece();
          });
        }
      }
      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    reduced,
    stepMs,
    clearing,
    checkReset,
    canPlace,
    placePiece,
    clearFullLines,
    makePiece,
  ]);

  // Compose display grid = settled cells + overlaid falling piece.
  const display = React.useMemo(() => {
    const copy = grid.map((row) => row.map((c) => ({ ...c })));
    if (piece && !clearing) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (!piece.shape[r][c]) continue;
          const gx = piece.x + c;
          const gy = piece.y + r;
          if (gy >= 0 && gy < rows && gx >= 0 && gx < cols) {
            copy[gy][gx] = { filled: true };
          }
        }
      }
    }
    return copy;
  }, [grid, piece, clearing, rows, cols]);

  const rootClassName = ["ds-tetris-loader", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={rootClassName}
      data-size={size}
      role="status"
      aria-label={ariaLabel ?? label}
    >
      <div className="ds-tetris-loader__frame" aria-hidden="true">
        {display.map((row, r) => (
          <div key={r} className="ds-tetris-loader__row">
            {row.map((cell, c) => (
              <span
                key={c}
                className="ds-tetris-loader__cell"
                data-filled={cell.filled || undefined}
                data-clearing={cell.clearing || undefined}
              />
            ))}
          </div>
        ))}
      </div>
      {showLabel && (
        <div className="ds-tetris-loader__label" aria-hidden="true">
          [{label}…]
        </div>
      )}
    </div>
  );
}

TetrisLoader.displayName = "TetrisLoader";
