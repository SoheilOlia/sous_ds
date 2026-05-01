import * as React from "react";
import "./Citation.css";

export interface CitationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "id"> {
  /** Source identifier shown inside the chip — e.g. "1", "#16", "PR-22". */
  id: React.ReactNode;
  /** Source name shown in the popover head — e.g. "PR #16: Smoke matrix". */
  source: React.ReactNode;
  /** Optional href; renders the chip as `<a>` and adds underline-on-hover. */
  href?: string;
  /** Optional rich preview body shown inside the popover (one or two lines). */
  preview?: React.ReactNode;
  /** Optional metadata line shown beneath the source — e.g. timestamp. */
  meta?: React.ReactNode;
}

/**
 * Citation — inline source chip with hover/focus preview.
 *
 * Extends the `<Pill>` filled-monospace shape so a chain of citations reads
 * as the same family ([1] [2] [3] [#16]). On hover or keyboard focus, a
 * popover surfaces the source name + optional preview + optional metadata.
 *
 * Rules followed:
 *  • Mono type. Citation IDs are data, not editorial labels.
 *  • Pill-radius outline shape; filled when interactive (hover/focus).
 *  • Popover uses `surface-raised` + 1px `line` border, no shadow ≥ 25px.
 *  • Popover enter is opacity + 4px translate, 220ms ease-out, scale ≥ 0.95.
 *  • Under prefers-reduced-motion, popover snaps in/out without translate.
 *  • Popover is keyboard-accessible: focus on the chip opens it; Esc dismisses.
 *  • No accent color. A citation isn't "live" or "successful"; it's reference.
 *
 * Replaces the 1.0 footgun of file paths inline in body prose
 * (R-VOICE-001) — citations carry the path/source in the popover, the
 * body keeps reading clean.
 */
export const Citation = React.forwardRef<HTMLElement, CitationProps>(
  function Citation(
    { id, source, href, preview, meta, className, onKeyDown, ...rest },
    ref
  ) {
    const [open, setOpen] = React.useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "Escape" && open) {
        setOpen(false);
        (e.currentTarget as HTMLElement).blur();
      }
    };

    const triggerProps = {
      ...rest,
      ref: ref as React.Ref<never>,
      className: ["ds-citation", className].filter(Boolean).join(" "),
      "data-open": open || undefined,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        rest.onMouseEnter?.(e);
        setOpen(true);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        rest.onMouseLeave?.(e);
        setOpen(false);
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        rest.onFocus?.(e);
        setOpen(true);
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        rest.onBlur?.(e);
        setOpen(false);
      },
      onKeyDown: handleKeyDown,
      "aria-describedby": open ? "ds-citation-popover" : undefined,
      "aria-expanded": open,
    };

    const content = (
      <>
        <span className="ds-citation__id">{id}</span>
        <span
          className="ds-citation__popover"
          role="tooltip"
          id="ds-citation-popover"
          aria-hidden={!open}
        >
          <span className="ds-citation__popover-source">{source}</span>
          {meta && <span className="ds-citation__popover-meta">{meta}</span>}
          {preview && (
            <span className="ds-citation__popover-body">{preview}</span>
          )}
        </span>
      </>
    );

    if (href) {
      return (
        <a
          {...(triggerProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href}
          rel={rest.role === "link" ? undefined : "noopener"}
        >
          {content}
        </a>
      );
    }

    return (
      <span
        {...(triggerProps as React.HTMLAttributes<HTMLSpanElement>)}
        tabIndex={0}
        role="button"
      >
        {content}
      </span>
    );
  }
);
