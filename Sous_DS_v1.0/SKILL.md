---
name: soheil-ds
description: Use this skill whenever building, styling, or auditing UI in any project that uses the soheil-ds design system. Triggers include any UI component creation (buttons, cards, forms, dashboards, landing pages, data visualizations), any styling task mentioning dark mode, monospace data, restrained aesthetics, or the dot/dash motif, and any task where DESIGN.md, tokens.css, or the `soheil-ds` name appears in the repo. Also use when auditing existing UI for WCAG contrast, forbidden fonts (Inter, Roboto, system-ui), forbidden shadows (blur ≥ 25px), `transition: all`, or `scale(0)` animations.
license: Apache-2.0
---

# soheil-ds

A dark-first, data-dense, restraint-led design system. This skill gives coding agents the full ruleset so generated UI matches the system's taste automatically.

## Read before writing any code

1. Open `DESIGN.md` in the project root. Read the YAML front matter (tokens) and the prose body (rationale).
2. Open `AGENTS.md` for code conventions.
3. Open `ANIMATION_RULES.md` for motion rules.
4. Open `components/` to find any existing reference implementation you should follow.

Never improvise values. Every color, size, radius, duration, and font comes from `tokens.css`.

## The non-negotiable rules

### Color

- Use `var(--ds-*)` for every color. Never hardcode a hex.
- The only hue in the system is `--ds-accent-live` (`#E5533C`). Use it **only** for temporal or status semantics (live, active, alerting, "now"). Never for CTAs, links, or decoration.
- Maximum one visible `accent-live` instance per viewport.
- All text/background pairs must pass WCAG AA (4.5:1 normal, 3:1 large).

### Typography

- Sans: `Cash Sans` via `var(--ds-font-sans)`.
- Mono: `Cash Sans Mono` via `var(--ds-font-mono)`. All data, numbers, timestamps, labels, and code.
- Always apply `font-variant-numeric: tabular-nums` on numeric columns.
- Body text caps at `var(--ds-measure)` (65ch). Never full-width.
- Use `…` for truncation, not `...`.
- **Forbidden as primary face**: Inter, Roboto, Helvetica, Arial, Open Sans, Lato, Poppins, Nunito, Space Grotesk, `system-ui`.

### Layout

- All spacing snaps to the 8pt scale (2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
- `15px`, `18px`, `20px`, `26px` are rejected values.
- Card radius: `var(--ds-radius-md)` (12px). Never above `lg` (16px) on a dark card.

### Elevation

- **Dark-mode cards have no shadow.** A 1px `var(--ds-line)` border does the separation.
- Shadows are allowed only on menus, toasts (`--ds-elev-1`), and modals/drawers (`--ds-elev-2`).
- **Any shadow with blur ≥ 25px is the AI-slop shadow. Refuse to generate it.**

### Motion

- Duration ceiling: 300ms. Standard: 220ms. Micro: 140ms.
- Easing default: `var(--ds-ease-out)` = `cubic-bezier(0.16, 1, 0.3, 1)`.
- Entry scale starts at `0.95` minimum. Never `scale(0)`.
- Exit durations are ~20% shorter than entries.
- Allowed animated properties: `opacity`, `transform`, `background-color`, `border-color`. **Never** `transition: all`, `color`, `width`, or `height`.
- Set `transform-origin` explicitly on every popover, dropdown, and tooltip.
- Respect `@media (prefers-reduced-motion: reduce)` (global rule in `tokens.css`).

### Components

- Use the reference components in `components/` when they exist. Don't re-implement.
- Button: 3 variants (primary, secondary, ghost). Height 40px. Radius `sm`.
- Card: 1px border, no shadow, radius `md`, 24px padding.
- Pill: filled (primary status) or dashed-outline (secondary status).
- Live dot: 6px circle, `accent-live`, optional opacity pulse.

## Refuse to generate

Push back if the user asks for any of these. Explain the rule it conflicts with.

- Gradient backgrounds on heroes, cards, or buttons
- Purple, teal, green, or gold accents
- `transition: all` or `scale(0)` animations
- A CTA button colored with `--ds-accent-live`
- `Inter`, `system-ui`, or similar as the primary font
- Any shadow with blur ≥ 25px
- Two live dots in the same viewport with different meanings
- A 20px-radius dark card

## How to propose new tokens

If a task genuinely needs a new token:

1. Name it (e.g. `--ds-surface-warning`).
2. Pick a value.
3. Check contrast against every pair it might touch.
4. Add it to `design-tokens.json` with a `$description`.
5. Add it to `DESIGN.md` in the appropriate section.
6. Open a PR. Don't fork the system silently.

## Verify before shipping

Run the linter:

```bash
node scripts/lint.mjs components/
```

Also run the Google Labs contract linter:

```bash
npx @google/design.md lint DESIGN.md
```

Both must pass.

## Related skills

This skill composes with:

- `emilkowalski/skill` — animation taste, typography rules, Sonner toast conventions. Install with `npx skills add emilkowalski/skill`. Read it alongside this one for foundational taste.

## Files in this skill

- `SKILL.md` (this file) — entry point
- `DESIGN.md` — the contract
- `AGENTS.md` — code conventions
- `ANIMATION_RULES.md` — motion rules
- `TASTE_LOG.md` — source-traced taste memory
- `quality-evaluator.md` — lint rule set
- `tokens.css` — CSS custom properties
- `design-tokens.json` — DTCG machine source
- `components/` — reference implementations
- `preview.html` — visual catalog
- `examples/slop-vs-system.html` — side-by-side corrections

## Philosophy

Restraint is the primary move. If an element does not carry information or structure, remove it. Weight and luminance beat color. Data is the design. Precision over softness. One accent, one meaning.
