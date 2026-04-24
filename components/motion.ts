/*
 * sous-ds / motion
 *
 * Zero-dep motion primitives. The system's motion taste encoded as
 * functions rather than a library dependency, so the same vocabulary
 * ships to React consumers AND runs in any vanilla-JS context — the
 * file://-served preview, a Next.js page, a Svelte component, a Figma
 * Make artifact, or a plain HTML page.
 *
 * Why no framer-motion dependency:
 * - The system's declared ethos is "restraint-led ... motion under 300ms."
 *   A 45KB motion-library dep contradicts that.
 * - Design systems propagate by being drop-in. Zero deps = zero version-
 *   matrix friction in every new project.
 * - "AI-native" means generation tools emit UI in many runtimes. CSS +
 *   small RAF helpers are universal; framer-motion is React-only.
 * - The primitives below are ~200 lines total. Framer Motion's value for
 *   this surface is not worth the coupling.
 *
 * Design invariants (enforce at every entry point):
 * - GPU-accelerated properties only (transform, opacity). Never animate
 *   width/height/top/left/color.
 * - Every animator respects prefers-reduced-motion by short-circuiting
 *   to the terminal frame. Callers don't need to branch.
 * - Every animator returns a cancellable Promise. Pass `signal:
 *   AbortSignal` to interrupt mid-flight cleanly.
 * - Durations in ms to match the token system.
 * - Exported easings approximate the CSS cubic-beziers used elsewhere
 *   in the system (var(--ds-ease-out), var(--ds-ease-in-out)) so the
 *   JS-driven motion reads the same as the CSS-driven motion.
 */

/* ============================================================
   Easings
   ============================================================ */

export type EasingFn = (t: number) => number;

export const easings: Record<string, EasingFn> = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  /** Stronger than easeOutCubic; matches the system's --ds-ease-out feel. */
  easeOutStrong: (t) => 1 - Math.pow(1 - t, 5),
  /** Natural acceleration + deceleration; for on-screen movement. */
  easeInOutSine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  /** Strong ease-in-out; approximates cubic-bezier(0.77, 0, 0.175, 1). */
  easeInOutStrong: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

/* ============================================================
   Reduced-motion detection
   ============================================================ */

/**
 * True if the user has opted into reduced motion via OS/browser settings.
 * Every exported animator checks this internally and short-circuits to
 * the terminal frame — callers don't need to branch.
 *
 * Safe on the server (returns false outside a browser).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ============================================================
   tween — RAF-driven numeric interpolation
   ============================================================ */

export type TweenOptions = {
  /** Starting value. */
  from: number;
  /** Ending value. */
  to: number;
  /** Duration in ms. Values <= 0 resolve immediately at `to`. */
  duration: number;
  /** Easing function. Default: easings.easeOutCubic. */
  easing?: EasingFn;
  /** Called every frame with (current value, progress 0..1). */
  onUpdate: (value: number, progress: number) => void;
  /** AbortSignal to cancel mid-flight. */
  signal?: AbortSignal;
};

/**
 * Interpolates `from` to `to` over `duration` ms via requestAnimationFrame,
 * calling `onUpdate` on every frame. Returns a Promise that resolves when
 * the animation completes, or immediately if the signal aborts or the user
 * prefers reduced motion.
 *
 * Used by: scrubber head drift, revenue counter count-up, any numeric
 * "from X to Y" motion.
 *
 * @example
 *   await tween({
 *     from: 0, to: 326, duration: 1500,
 *     easing: easings.easeOutCubic,
 *     onUpdate: (v) => el.textContent = Math.round(v).toString(),
 *   });
 */
export function tween(opts: TweenOptions): Promise<void> {
  const {
    from,
    to,
    duration,
    easing = easings.easeOutCubic,
    onUpdate,
    signal,
  } = opts;

  if (signal?.aborted) return Promise.resolve();
  if (duration <= 0 || prefersReducedMotion()) {
    onUpdate(to, 1);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();
    let frame = 0;
    let done = false;

    const abortHandler = () => {
      if (done) return;
      done = true;
      if (frame) cancelAnimationFrame(frame);
      resolve();
    };
    signal?.addEventListener("abort", abortHandler, { once: true });

    const step = (now: number) => {
      if (done) return;
      const t = Math.min(1, (now - start) / duration);
      onUpdate(from + (to - from) * easing(t), t);
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        done = true;
        signal?.removeEventListener("abort", abortHandler);
        resolve();
      }
    };
    frame = requestAnimationFrame(step);
  });
}

/* ============================================================
   typewriter — character-by-character reveal
   ============================================================ */

export type TypewriterOptions = {
  /** Full target string. */
  text: string;
  /** ms per character. */
  step: number;
  /** Called after each character with the partial string. */
  onUpdate: (partial: string) => void;
  /** AbortSignal to cancel mid-flight. */
  signal?: AbortSignal;
};

/**
 * Reveals `text` one character at a time at `step` ms per char. Resolves
 * when the full text is visible. Under reduced motion, shows the full
 * string immediately.
 *
 * Used by: LiveDot rotating labels, DottedChart scrubber caption.
 */
export function typewriter(opts: TypewriterOptions): Promise<void> {
  const { text, step, onUpdate, signal } = opts;

  if (signal?.aborted) return Promise.resolve();
  if (prefersReducedMotion()) {
    onUpdate(text);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let done = false;

    const abortHandler = () => {
      if (done) return;
      done = true;
      if (timer !== null) clearTimeout(timer);
      resolve();
    };
    signal?.addEventListener("abort", abortHandler, { once: true });

    const advance = () => {
      if (done) return;
      if (i >= text.length) {
        done = true;
        signal?.removeEventListener("abort", abortHandler);
        resolve();
        return;
      }
      i++;
      onUpdate(text.slice(0, i));
      timer = setTimeout(advance, step);
    };
    advance();
  });
}

/* ============================================================
   rotateLabels — typewriter rotation loop (LiveDot vocabulary)
   ============================================================ */

export type RotateLabelsOptions = {
  /** Labels to cycle through. */
  labels: string[];
  /** ms per char for both typing and erasing. Default 50. */
  step?: number;
  /** ms to hold at the full label before erasing. Default 2000. */
  hold?: number;
  /** Called after every visible-text change. */
  onUpdate: (visible: string) => void;
  /** Called when a label finishes typing (before the hold). */
  onLabelComplete?: (label: string) => void;
  /** AbortSignal to stop the loop. */
  signal?: AbortSignal;
};

/**
 * Runs a LiveDot-style label rotation forever: types each label, holds,
 * erases, advances. Resolves when the signal aborts. Under reduced motion,
 * each label is shown statically for `hold` ms before advancing (no
 * typewriter).
 *
 * Used by: `<LiveDot labels={[...]} />`.
 */
export async function rotateLabels(opts: RotateLabelsOptions): Promise<void> {
  const {
    labels,
    step = 50,
    hold = 2000,
    onUpdate,
    onLabelComplete,
    signal,
  } = opts;

  if (!labels.length || signal?.aborted) return;

  const reduced = prefersReducedMotion();
  let idx = 0;

  while (!signal?.aborted) {
    const label = labels[idx];

    if (reduced) {
      onUpdate(label);
      onLabelComplete?.(label);
      await delay(hold, signal);
    } else {
      await typewriter({ text: label, step, onUpdate, signal });
      if (signal?.aborted) break;
      onLabelComplete?.(label);
      await delay(hold, signal);
      if (signal?.aborted) break;
      for (let len = label.length; len > 0; len--) {
        if (signal?.aborted) break;
        onUpdate(label.slice(0, len - 1));
        await delay(step, signal);
      }
    }

    idx = (idx + 1) % labels.length;
  }
}

/* ============================================================
   stagger — run a callback N times with spacing
   ============================================================ */

export type StaggerOptions = {
  /** How many times to call onStep. */
  count: number;
  /** ms between calls. */
  step: number;
  /** Called with the zero-based index. */
  onStep: (i: number) => void;
  /** AbortSignal to cancel mid-flight. */
  signal?: AbortSignal;
};

/**
 * Calls `onStep(i)` for i in [0, count), spacing calls by `step` ms.
 * For JS-driven staggered sequences where CSS `animation-delay` doesn't
 * apply (e.g., imperative DOM updates, coordinated tweens).
 *
 * Under reduced motion, fires all callbacks synchronously.
 */
export function stagger(opts: StaggerOptions): Promise<void> {
  const { count, step, onStep, signal } = opts;

  if (count <= 0 || signal?.aborted) return Promise.resolve();

  if (prefersReducedMotion()) {
    for (let i = 0; i < count; i++) onStep(i);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let done = false;

    const abortHandler = () => {
      if (done) return;
      done = true;
      if (timer !== null) clearTimeout(timer);
      resolve();
    };
    signal?.addEventListener("abort", abortHandler, { once: true });

    const tick = () => {
      if (done) return;
      if (i >= count) {
        done = true;
        signal?.removeEventListener("abort", abortHandler);
        resolve();
        return;
      }
      onStep(i);
      i++;
      timer = setTimeout(tick, step);
    };
    tick();
  });
}

/* ============================================================
   Internal
   ============================================================ */

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout>;
    const abortHandler = () => {
      clearTimeout(timer);
      resolve();
    };
    timer = setTimeout(() => {
      signal?.removeEventListener("abort", abortHandler);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abortHandler, { once: true });
  });
}
