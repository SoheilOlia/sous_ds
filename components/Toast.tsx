import * as React from "react";
import "./Toast.css";

/* ============================================================
   Toast — Sonner-style implementation
   Follows Emil Kowalski's conventions (he is the author of Sonner).
   Stack bottom-right. Max 3 visible. Swipe to dismiss.
   Enter: translateY(8px) → 0, opacity 0 → 1, 220ms ease-out.
   Exit: same reversed, 180ms (~20% faster than entry).
   prefers-reduced-motion: instant, opacity only.
   ============================================================ */

type ToastTone = "neutral" | "live";

interface ToastInput {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends Required<Omit<ToastInput, "description" | "action">> {
  id: string;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  exiting: boolean;
}

interface ToastContextValue {
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 5000;
const ENTER_MS = 220;
const EXIT_MS = 180;

/**
 * ToastProvider — mounts the stack region. Wrap your app once.
 *
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = React.useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone ?? "neutral",
        duration: input.duration ?? DEFAULT_DURATION,
        action: input.action,
        exiting: false,
      };

      setItems((prev) => [...prev, item]);

      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  React.useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ show, dismiss }), [show, dismiss]);

  const visible = items.slice(-MAX_VISIBLE);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="ds-toast-region"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {visible.map((item, i) => (
          <Toast
            key={item.id}
            item={item}
            position={i}
            total={visible.length}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** useToast — returns `show` and `dismiss` helpers. Must be inside ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

/* ---- Toast item -------------------------------------------- */

function Toast({
  item,
  position,
  total,
  onDismiss,
}: {
  item: ToastItem;
  position: number;
  total: number;
  onDismiss: (id: string) => void;
}) {
  const depth = total - 1 - position; // 0 = front, 1 = behind, 2 = deepest
  const [dragX, setDragX] = React.useState(0);
  const startX = React.useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx > 0) setDragX(dx);
  }
  function onPointerUp() {
    if (dragX > 80) {
      onDismiss(item.id);
    } else {
      setDragX(0);
    }
    startX.current = null;
  }

  return (
    <div
      className="ds-toast"
      data-tone={item.tone}
      data-exiting={item.exiting || undefined}
      data-depth={depth}
      role="status"
      aria-atomic="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        transform:
          dragX > 0
            ? `translate(${dragX}px, 0) scale(1)`
            : undefined,
        opacity: dragX > 0 ? Math.max(0.3, 1 - dragX / 200) : undefined,
      }}
    >
      {item.tone === "live" && <span className="ds-toast__dot" aria-hidden="true" />}
      <div className="ds-toast__content">
        <div className="ds-toast__title">{item.title}</div>
        {item.description && (
          <div className="ds-toast__desc">{item.description}</div>
        )}
      </div>
      {item.action && (
        <button
          type="button"
          className="ds-toast__action"
          onClick={() => {
            item.action!.onClick();
            onDismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      )}
      <button
        type="button"
        className="ds-toast__close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
      >
        ×
      </button>
    </div>
  );
}
