import * as React from "react";
import "./SegmentedControl.css";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
}

/**
 * SegmentedControl — dense mode switching for filters, scopes, and tabs.
 *
 * Rules followed:
 *  • 32px control height inside a larger 44px interactive hit area.
 *  • Filled selected state, muted inactive state.
 *  • Press feedback uses scale(0.97) only.
 */
export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  { options, value, onValueChange, className, ...rest },
  ref
) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [thumbStyle, setThumbStyle] = React.useState<React.CSSProperties>({
    width: "0px",
    transform: "translateX(0px)",
  });

  React.useLayoutEffect(() => {
    const selectedButton = buttonRefs.current.get(value);
    if (!selectedButton) return;

    const width = `${selectedButton.offsetWidth}px`;
    const transform = `translateX(${selectedButton.offsetLeft}px)`;

    setThumbStyle((current) => {
      if (current.width === width && current.transform === transform) {
        return current;
      }

      return { width, transform };
    });
  }, [options, value]);

  React.useEffect(() => {
    const root = localRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const updateThumb = () => {
      const selectedButton = buttonRefs.current.get(value);
      if (!selectedButton) return;

      setThumbStyle({
        width: `${selectedButton.offsetWidth}px`,
        transform: `translateX(${selectedButton.offsetLeft}px)`,
      });
    };

    updateThumb();

    const observer = new ResizeObserver(updateThumb);
    observer.observe(root);
    buttonRefs.current.forEach((button) => {
      if (button) observer.observe(button);
    });

    return () => observer.disconnect();
  }, [options, value]);

  return (
    <div
      {...rest}
      ref={(node) => {
        localRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={["ds-segmented-control", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={rest["aria-label"] ?? "Segmented control"}
    >
      <span
        className="ds-segmented-control__thumb"
        aria-hidden="true"
        style={thumbStyle}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.value, node);
              } else {
                buttonRefs.current.delete(option.value);
              }
            }}
            type="button"
            className="ds-segmented-control__button"
            data-selected={selected || undefined}
            aria-pressed={selected}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) onValueChange?.(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
