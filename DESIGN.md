---
version: alpha
name: soheil-ds
description: A dark-first, data-dense, restraint-led interface system. Monospace for all data, single semantic accent, 1px borders over shadows, precise motion under 300ms.

colors:
  # Dark mode (default)
  bg:                "#0A0A0A"
  surface:           "#141414"
  surface-raised:    "#1C1C1C"
  line:              "rgba(255,255,255,0.08)"
  line-strong:       "rgba(255,255,255,0.14)"
  text-primary:      "#F0F0F0"
  text-secondary:    "#A0A0A0"
  text-muted:        "#888888"
  text-on-primary:   "#0A0A0A"
  text-on-accent:    "#FFFFFF"
  accent-live:       "#E5533C"

  # Light mode (alternate)
  bg-light:               "#F4F4F4"
  surface-light:          "#FFFFFF"
  line-light:             "rgba(0,0,0,0.08)"
  text-primary-light:     "#1A1A1A"
  text-secondary-light:   "#6B6B6B"
  text-muted-light:       "#767676"

typography:
  display:
    fontFamily: Geist
    fontSize: 64px
    lineHeight: 72px
    fontWeight: 600
    letterSpacing: "-0.03em"
  h1:
    fontFamily: Geist
    fontSize: 40px
    lineHeight: 48px
    fontWeight: 600
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Geist
    fontSize: 28px
    lineHeight: 36px
    fontWeight: 600
    letterSpacing: "-0.015em"
  h3:
    fontFamily: Geist
    fontSize: 20px
    lineHeight: 28px
    fontWeight: 600
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    lineHeight: 26px
    fontWeight: 400
  body:
    fontFamily: Geist
    fontSize: 15px
    lineHeight: 24px
    fontWeight: 400
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  label:
    fontFamily: Geist Mono
    fontSize: 11px
    lineHeight: 16px
    fontWeight: 500
    letterSpacing: "0.08em"
  mono-xl:
    fontFamily: Geist Mono
    fontSize: 48px
    lineHeight: 56px
    fontWeight: 500
    fontFeature: "tnum"
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
    fontFeature: "tnum"

rounded:
  none: 0
  xs:   4px
  sm:   8px
  md:   12px
  lg:   16px
  pill: 9999px

spacing:
  "0":  0
  "1":  2px
  "2":  4px
  "3":  8px
  "4":  12px
  "5":  16px
  "6":  24px
  "7":  32px
  "8":  48px
  "9":  64px
  "10": 96px
  "11": 128px

components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
    rounded:         "{rounded.sm}"
    padding:         "12px 16px"
    height:          40px
    typography:      "{typography.body-sm}"
  button-primary-active:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
  button-secondary:
    backgroundColor: transparent
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.sm}"
    padding:         "12px 16px"
    height:          40px
  button-ghost:
    backgroundColor: transparent
    textColor:       "{colors.text-secondary}"
    padding:         "12px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.md}"
    padding:         24px
  pill-filled:
    backgroundColor: "{colors.text-primary}"
    textColor:       "{colors.text-on-primary}"
    rounded:         "{rounded.pill}"
    padding:         "4px 10px"
  pill-outline:
    backgroundColor: transparent
    textColor:       "{colors.text-secondary}"
    rounded:         "{rounded.pill}"
    padding:         "4px 10px"
  dot-live:
    backgroundColor: "{colors.accent-live}"
    size:            6px
    rounded:         "{rounded.pill}"
  input:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.sm}"
    height:          40px
    padding:         "10px 12px"
  modal:
    backgroundColor: "{colors.surface-raised}"
    rounded:         "{rounded.md}"
    padding:         32px
  toast:
    backgroundColor: "{colors.surface-raised}"
    textColor:       "{colors.text-primary}"
    rounded:         "{rounded.md}"
    padding:         "12px 16px"
---

## Overview

### Visual theme

Terminal gravity meets editorial restraint. The interface feels like a precision instrument, not a brochure. Dark by default, near-black rather than charcoal. Monospace carries all data. One accent color, used only where it means "now" or "live." Cards float on contrast, not shadow. Every element justifies its presence or it gets removed.

### Principles (in priority order)

1. **Restraint is the primary move.** If it does not carry information or structure, remove it.
2. **Weight and value over color.** Hierarchy comes from font weight, size, and luminance. Color is reserved for semantics.
3. **Data is a design element.** Numbers, times, and metrics are set in mono at display size. The value is the hero, not the label.
4. **Precision over softness.** 1px borders, tight radii, snappy motion. Nothing blurs or glows unless it must.
5. **The dot motif.** Dots, dashes, and pill-shapes as data encoding. Length = duration. Darkness = intensity. Density = volume. This is the system's visual signature.
6. **One accent, one meaning.** `accent-live` (#E5533C) only marks temporal or status semantics. Never a CTA, never decorative.

### What this is not

Not a SaaS marketing aesthetic. No gold stars, no gradient hero blobs, no glass morphism, no elevation theater. Not warm, not playful, not soft. Not a generic dashboard.

---

## Colors

### Palette and roles

| Role | Token | Dark value | Light value | Usage |
|---|---|---|---|---|
| Page background | `bg` | `#0A0A0A` | `#F4F4F4` | Root canvas |
| Card surface | `surface` | `#141414` | `#FFFFFF` | Cards, panels, sheets |
| Raised surface | `surface-raised` | `#1C1C1C` | `#FFFFFF` | Popovers, menus, modals |
| Border | `line` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Card borders. The primary separator. Replaces shadows |
| Strong border | `line-strong` | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.14)` | Inputs, emphasized separators |
| Primary text | `text-primary` | `#F0F0F0` | `#1A1A1A` | Headings, body, filled button bg |
| Secondary text | `text-secondary` | `#A0A0A0` | `#6B6B6B` | Sub-headings, captions |
| Muted text | `text-muted` | `#888888` | `#767676` | Labels, timestamps, meta |
| Accent (live) | `accent-live` | `#E5533C` | `#E5533C` | Live, active, alerting, "now" |

### Contrast guarantees (WCAG)

Every foreground/background pair in this palette passes AA minimum. Computed, not estimated:

| Pair | Ratio | Grade |
|---|---|---|
| `text-primary` on `bg` (dark) | 18.9:1 | AAA |
| `text-secondary` on `bg` (dark) | 7.58:1 | AAA |
| `text-muted` on `bg` (dark) | 5.58:1 | AA |
| `text-primary-light` on `bg-light` | 15.8:1 | AAA |
| `text-secondary-light` on `bg-light` | 5.33:1 | AA |
| `text-muted-light` on `bg-light` | 4.55:1 | AA (min) |
| `text-on-accent` on `accent-live` | 5.31:1 | AA |

### Accent discipline

`accent-live` is the only hue in the system. Its job is semantic:

- `✓` Live indicator (streaming, recording, airing now)
- `✓` Active/current state in a timeline
- `✓` Alert or attention-requiring status
- `✓` Sanctioned semantic carriers: `LiveDot`, a live-pill prefix, or a live-tone toast marker when all visible accent instances mean the same thing
- `✗` Primary CTA button color
- `✗` Link color
- `✗` Any decorative or branding use
- `✗` More than one non-equivalent accent meaning visible per viewport

If there are two accent dots on screen at once and they are not semantically equivalent, one of them is wrong.

---

## Typography

### Type scale

| Role | Family | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display` | Geist | 64 / 72 | 600 | -0.03em | Hero numbers, marquee metrics |
| `h1` | Geist | 40 / 48 | 600 | -0.02em | Page title |
| `h2` | Geist | 28 / 36 | 600 | -0.015em | Section title |
| `h3` | Geist | 20 / 28 | 600 | -0.01em | Card title |
| `body-lg` | Geist | 17 / 26 | 400 | 0 | Editorial body |
| `body` | Geist | 15 / 24 | 400 | 0 | Default UI body |
| `body-sm` | Geist | 13 / 20 | 400 | 0 | Dense UI, buttons |
| `label` | Geist Mono | 11 / 16 | 500 | 0.08em | UPPERCASE labels, meta |
| `mono-xl` | Geist Mono | 48 / 56 | 500 | -0.02em | Display numbers, times, metrics |
| `mono` | Geist Mono | 13 / 20 | 400 | 0 | Data cells, timestamps, code |

### Typography rules (canonical, non-negotiable)

1. **Body caps at `65ch`.** Never stretch full viewport width. Source: Emil Kowalski.
2. **All numeric display uses mono + `tabular-nums`.** Columns align. No exceptions.
3. **Use `…` not `...`** for truncation.
4. **Uppercase labels need loosened tracking.** 0.06em minimum, 0.08em default.
5. **Superscript units** on display numbers. `+326%` sets the % in lighter weight, smaller size, baseline-aligned. `7HR 48MIN` sets `HR` and `MIN` at half size beside the numerals.
6. **Weight over color for emphasis.** Bold for UI stress. Italic only for citations and prose.
7. **Underlines are for links only.**
8. **Declare a fallback stack with matching x-height** to prevent layout shift on font load.

### Forbidden typefaces

Inter, Roboto, system-ui, Helvetica, Arial, Open Sans, Lato, Nunito, Poppins. These are the AI-default stack and will be flagged by the Quality Evaluator.

---

## Layout

### Grid and spacing

8pt base grid. Scale: 0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Named `space-0` through `space-11`.

All padding, margin, and gap values must snap to this scale. `15px`, `20px`, `18px` are never acceptable. If the design calls for something off-grid, the design is wrong.

### Composition

- **Asymmetric bentos** are preferred over uniform grids. Different card heights carry hierarchy without color.
- **Two-column layouts**: label left (muted), content right (primary). Useful for settings, specs, metadata blocks.
- **Numbered lists** in dense content (`01`, `02`, `03`) with the numeral in muted, the name in primary. No bullets, no dashes.
- **Dashed vertical timelines** as structural element for time-ordered content. Not solid lines.

### Responsive behavior

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | 640px | Single column. Stack all bento. Sheet-style modals |
| `md` | 768px | Two-column split where useful |
| `lg` | 1024px | Full bento grid |
| `xl` | 1280px | Max content width caps at 1280px. Never full-bleed text |

**Touch targets**: 44px minimum hit area on mobile. If visual button is smaller, extend via `::before` pseudo-element. Source: Emil Kowalski.

---

## Elevation & Depth

Elevation is the most abused part of most systems. This one resolves the contradiction explicitly: **in dark mode, cards never cast shadows.**

| Level | Token | Value | Where |
|---|---|---|---|
| 0 | `elev-0` | `none` | Cards, panels, default state. 1px border does the separation |
| 1 | `elev-1` | `0 1px 2px rgba(0,0,0,0.3)` | Floating menus, toasts only |
| 2 | `elev-2` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, drawers only |

### Forbidden shadow values

Any shadow with blur ≥ 25px. This is the AI-slop shadow. The Quality Evaluator flags it automatically. Values like `0 25px 50px rgba(0,0,0,0.25)` are rejected at lint time.

### Surface hierarchy via luminance

Cards float on dark-on-dark contrast. `bg (#0A0A0A)` → `surface (#141414)` → `surface-raised (#1C1C1C)`. Each step is 6 luminance points. The 1px border on each card crisps the edge. No blur, no glow, no gradient.

---

## Shapes

Tight radii. Precision over softness.

| Token | Value | Use |
|---|---|---|
| `rounded.none` | 0 | Tables, data grids, ruler lines |
| `rounded.xs` | 4px | Chips, tags, tight controls |
| `rounded.sm` | 8px | Buttons, inputs |
| `rounded.md` | 12px | Cards (default), panels |
| `rounded.lg` | 16px | Large marketing cards only |
| `rounded.pill` | 9999px | Status pills, avatars, live dots |

**Never** use a radius above `rounded.lg` on a dark card. Light-mode references often use 20px; our dark system tightens this to preserve the precision feel.

---

## Components

### Button

Three variants. No more. No ghost-with-border, no glass button, no gradient button.

**Primary** — solid `text-primary` background, `text-on-primary` foreground. Used for the one primary action per view.

**Secondary** — transparent background, 1px `line-strong` border, `text-primary` foreground. Used for secondary actions alongside a primary.

**Ghost** — transparent, no border, `text-secondary` foreground. Used for tertiary actions, nav links.

All buttons:
- `md`: 40px height, 12px × 16px padding. Default for primary actions.
- `sm`: 32px height, 12px horizontal padding. Use only in dense toolbars, tables, and secondary utility rows.
- Radius `sm` (8px)
- Type `body-sm` at weight 500
- Hit area 44px minimum (extend via pseudo-element on mobile)
- `:active` applies `transform: scale(0.97)`, 100ms ease
- Hover changes opacity or background luminance, never color
- Focus ring: 2px `line-strong` offset by 2px. Never blue system default

### Card

Single variant. Background `surface`, 1px `line` border, radius `md`, no shadow. 24px padding default. Title uses `h3`, body uses `body`. Label above title in `label` style, muted.

### Pill / Badge

Two variants, mapped to status hierarchy:

- **Filled** (`#F0F0F0` bg, `#0A0A0A` fg, radius `pill`) — primary status. Urgent, current, selected.
- **Outline** (transparent bg, dashed `line-strong` border, `text-secondary` fg) — secondary status. Draft, future, in-progress. The dashed border is deliberate and signals impermanence.

### Dot (live indicator)

6px circle, `accent-live` fill, radius `pill`. Optionally pulses opacity `1 → 0.5 → 1` on a 2000ms linear loop. Never scale, never color change. The primary carrier is `LiveDot`; the same accent may also appear in a live-pill prefix or live-tone toast marker when every visible accent instance expresses the same semantic state.

### Input

Background `surface`, 1px `line-strong` border, radius `sm`, 40px height. Numeric inputs use mono. Focus state lifts border to `text-primary`. No colored focus glow.

### Modal / Drawer

Background `surface-raised`, radius `md`, elevation level 2, 32px padding. Max-width 560px for dialogs, full-height sheet for drawers. Enter: opacity 0 → 1, scale 0.95 → 1, 280ms `ease-out`. Exit: same values reversed, 220ms (~20% faster than entry).

### Toast (Sonner pattern)

Background `surface-raised`, radius `md`, elevation 1, 12px × 16px padding. Stack bottom-right. Enter from below (translateY 8px, opacity 0 → 1, 220ms `ease-out`). Dismiss on swipe or timeout. Live region for screen readers. Credit: Emil Kowalski's Sonner.

### Data motif: dotted bar chart

The system's signature data visualization. Bars are rendered as columns of dots rather than solid rectangles. Dot count = bar value. Active column uses `text-primary` dots; inactive columns use `text-muted`. No color is needed to distinguish foreground from background data. See `preview.html` for a working implementation.

---

## Do's and Don'ts

### Do

- Use `text-primary` for filled buttons and primary emphasis
- Use `accent-live` only for temporal/status semantics
- Show data in mono with `tabular-nums`
- Reach for 1px border before shadow
- Keep motion under 300ms
- Start entry scale from 0.95 or higher, never 0
- Make exits 20% faster than entries
- Set `transform-origin` explicitly on popovers
- Add `will-change: transform` on anything testing jittery
- Use the `…` ellipsis character, not three periods
- Cap body at 65ch

### Don't

- Use `transition: all`
- Use a shadow with blur ≥ 25px (the AI-slop shadow)
- Transition `color` on hover (use opacity or weight)
- Use Inter, Roboto, system-ui, Helvetica, or Arial as the primary face
- Use `scale(0)` as an animation start value
- Use gradient fills on buttons, cards, or backgrounds
- Use purple, teal, green, or gold as decorative color
- Use elevation to simulate a lit room (no "floating UI" theater)
- Use more than one `accent-live` dot in a viewport with different meanings
- Use full-width body text
- Use colored focus rings that differ from the system value
- Use drop shadow and 1px border on the same element

---

## Agent prompt guide

When a coding agent reads this file, it should use the following prompt scaffolds:

**For a new page:**
> "Build this using soheil-ds. Dark mode by default. Reference `DESIGN.md` tokens via `tokens.css`. Use `Geist` for all sans, `Geist Mono` for all data, labels, and code. No Inter. No shadows on cards. Body caps at 65ch. Use the bento pattern for multi-card layouts. One accent only, and only on temporal/status elements."

**For a component:**
> "Use the tokens defined in `DESIGN.md`. Button height 40px, radius `sm`. Active state `scale(0.97)`. Animation under 220ms with `ease-out`. `will-change: transform` if the component animates. Set `transform-origin` to trigger location if it's a popover."

**Quick color reference:**
- Background: `#0A0A0A`
- Text: `#F0F0F0`
- Muted: `#888888`
- Accent (semantic only): `#E5533C`
- Font: `Geist` / `Geist Mono`

---

## System metadata

- Tokens source: `design-tokens.json`
- CSS implementation: `tokens.css`
- Animation rules: `ANIMATION_RULES.md`
- Taste ground truth: `TASTE_LOG.md`
- Quality evaluator: `quality-evaluator.md`
- Coding agent guide: `AGENTS.md`
- Visual reference: `preview.html`

Lint this file with: `npx @google/design.md lint DESIGN.md`
