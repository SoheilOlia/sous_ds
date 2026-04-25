import * as React from "react";
import "./Card.css";

type Padding = "none" | "sm" | "md" | "lg";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Internal padding. Defaults to `md` (24px). */
  padding?: Padding;
  /** Optional section number (rendered as "01") in the head row. */
  sectionNumber?: string;
  /** Optional section label (rendered after the number). */
  label?: string;
  /** Optional right-aligned meta in the head row. */
  meta?: React.ReactNode;
  /** Optional title rendered below the head row as h3. */
  title?: React.ReactNode;
  /** Card surface. `surface` (default) or `raised` for popovers. */
  surface?: "surface" | "raised";
}

/**
 * Card — reference implementation for sous-ds.
 *
 * Rules followed:
 *  • 1px border (--ds-line), no shadow. Ever.
 *  • Radius md (12px), never larger on dark surfaces.
 *  • Head row follows the "01 / LABEL" pattern seen in preview.html.
 *  • No hover state by default. A card is not a button.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    padding = "md",
    sectionNumber,
    label,
    meta,
    title,
    surface = "surface",
    children,
    className,
    ...rest
  },
  ref
) {
  const hasHead = sectionNumber || label || meta;

  return (
    <div
      {...rest}
      ref={ref}
      data-padding={padding}
      data-surface={surface}
      className={["ds-card", className].filter(Boolean).join(" ")}
    >
      {hasHead && (
        <div className="ds-card__head">
          {(sectionNumber || label) && (
            <span className="ds-card__num">
              {sectionNumber}
              {sectionNumber && label && <b>/ {label}</b>}
              {!sectionNumber && label && <b>{label}</b>}
            </span>
          )}
          {meta && <span className="ds-card__meta">{meta}</span>}
        </div>
      )}
      {title && <h3 className="ds-card__title">{title}</h3>}
      {children}
    </div>
  );
});
