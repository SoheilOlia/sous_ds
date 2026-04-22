---
name: soheil-ds
description: Use when building, styling, reviewing, or refining UI in projects that use the soheil-ds design system. Applies to components, pages, dashboards, data displays, previews, screenshots, and design audits that mention DESIGN.md, AGENTS.md, tokens.css, restrained dark UI, monospace data, semantic live accents, or the dot and dash motif.
---

# soheil-ds

Use this skill whenever UI work should match the soheil-ds contract.

## Read in this order

1. `DESIGN.md` for the visual and semantic contract.
2. `AGENTS.md` for implementation rules.
3. `ANIMATION_RULES.md` for motion.
4. `components/` for the current reference implementation before creating anything new.

## Non-negotiables

- Use `var(--ds-*)` tokens for colors, spacing, radii, durations, easing, and shared sizes.
- Use `Geist` for sans and `Geist Mono` for data, labels, timestamps, and code.
- Keep body text capped at `65ch`.
- Use `--ds-accent-live` only for temporal or status meaning. Never for CTAs or decoration.
- Keep dark cards border-led, not shadow-led.
- Never use `transition: all`, `scale(0)`, or hover transitions on `color`.
- Respect `prefers-reduced-motion`.

## Allowed accent carriers

The accent is not a general branding color. It may appear only in sanctioned semantic carriers with a single meaning inside a viewport:

- `LiveDot`
- `Pill` when `live` is true
- `Toast` when `tone="live"`

If two accent-bearing elements mean different things on the same screen, the design is wrong.

## Refuse to generate

- Gradient hero or card backgrounds
- Accent-colored CTA buttons
- Decorative purple, teal, green, or gold
- Shadows with blur `>= 25px`
- Full-width body copy
- Inter, Roboto, Helvetica, Arial, or `system-ui` as the primary face

## Verify before shipping

```bash
npx @google/design.md lint DESIGN.md
node scripts/lint.mjs components/ preview.html
```
