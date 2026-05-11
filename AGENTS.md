# AGENTS.md

Guide for coding agents (Claude Code, Cursor, Codex, Goose, Aider) working in a repo that uses this design system. Paired with `DESIGN.md`.

## The two-file contract

- `DESIGN.md` — how the UI looks. Read this for every visual decision.
- `AGENTS.md` — how to build. Read this for project setup, file layout, conventions.

When these two disagree, `DESIGN.md` wins on appearance, `AGENTS.md` wins on structure.

## Before you write code

1. Read `DESIGN.md` end-to-end. Tokens are in its YAML front matter.
2. Check `ANIMATION_RULES.md` for the motion contract.
3. Load `tokens.css` into the page root. Never redefine tokens in component files.
4. Never inline CSS colors or font families. Use `var(--ds-*)` exclusively.

## File layout

```
/
├── DESIGN.md                 # design contract (do not edit without PR review)
├── AGENTS.md                 # this file
├── ANIMATION_RULES.md        # motion contract
├── TASTE_LOG.md              # taste memory, append-only
├── design-tokens.json        # machine source of truth
├── tokens.css                # CSS custom properties (generated from json)
├── quality-evaluator.md      # lint rules for UI review
├── preview.html              # visual catalog of the system
└── components/               # reference implementations
    └── Button.tsx
```

## Hard rules for generated code

These match the Quality Evaluator. Violating any of them fails review automatically.

### Tokens
- Use `var(--ds-*)` for every color, size, radius, duration, and easing
- Never hardcode a hex value in a component
- If a needed value isn't a token, open a PR to add it; do not improvise

### Typography
- Display + page titles: `var(--ds-font-display)` (Cash Sans when available, Geist fallback)
- `h2` / section framing and `h3` / card titles: `var(--ds-font-mono)` (Geist Mono) with `font-variant-numeric: tabular-nums`
- Primary face: `var(--ds-font-sans)` (Geist) for UI and body copy
- Data, labels, timestamps, code: `var(--ds-font-mono)` (Geist Mono) with `font-variant-numeric: tabular-nums`
- Forbidden: Inter, Roboto, Helvetica, Arial, Open Sans, Lato, Nunito, Poppins, Space Grotesk, `system-ui` as the primary face
- Body text: `max-width: var(--ds-measure)` (65ch). Never full-width.
- Use the `…` character for truncation, not `...`

### Color
- Semantic accents only: `--ds-accent-success` (`#00E013`) is the primary accent for success, positive highlight, and completion; `--ds-accent-live` (`#E5533C`) is the secondary attention rail for alert, anomaly, error, or urgent live-now state
- Green and red may coexist inside one chart or workflow only when the semantic split is explicit and sparse. If the neutral palette stops carrying the structure, you are overusing accent.
- Never use color to create hierarchy; use weight and luminance
- Contrast minimum: WCAG AA (4.5:1). Run contrast checks before committing

### Layout
- Spacing must snap to the 8pt scale (`--ds-space-0` through `--ds-space-11`)
- `15px`, `18px`, `20px`, `26px` are rejected values
- Card radius: `var(--ds-radius-md)` (12px). Never above `rounded.lg` on a dark card.

### Motion
- No `transition: all` anywhere. Enumerate properties.
- No transitions on `color` for hover states. Use `opacity` or `background-color`.
- Duration ceiling: 300ms. Standard: 220ms (`--ds-dur-standard`). Micro: 140ms.
- Easing default: `var(--ds-ease-out)`. Anything else is a deliberate override with justification in a comment.
- Entry animations start from `scale(0.95)` minimum. Never `scale(0)`.
- Exits are ~20% faster than entries.
- Set `transform-origin` explicitly on every popover, dropdown, and tooltip.
- Wrap any animated component with the `prefers-reduced-motion` contract (already global in `tokens.css`).

### Elevation
- Dark-mode cards: 1px border (`var(--ds-line)`), no shadow
- Shadows allowed only on: floating menus/toasts (`--ds-elev-1`) and modals (`--ds-elev-2`)
- Any shadow with blur ≥ 25px is rejected

### Components
- Check `components/` for an existing reference before building new
- If creating a new component, mirror the conventions of the Button reference (variants, state tokens, focus visibility)

## React / framework guidance

- Use CSS custom properties. No CSS-in-JS runtime libraries (emotion, styled-components) for tokens.
- Tailwind is fine when configured with `theme.extend` pulled from `design-tokens.json` via `npx @google/design.md tailwind DESIGN.md`.
- Class names: keep utility-first, component-class in Tailwind. Otherwise use `data-*` attributes for variant selectors rather than class strings.
- Framer Motion / Motion is allowed but defaults still apply. Duration, easing, and scale rules do not change because the library supports more.

## Accessibility floor

- All interactive elements have a visible focus ring. Use the system focus style, not browser default.
- Hit areas ≥ 44×44 CSS pixels on touch.
- Color contrast passes AA on every text/background pair. Use the computed values in `DESIGN.md` as references.
- `prefers-reduced-motion: reduce` collapses all animation (handled globally in `tokens.css`, do not override).
- `aria-live="polite"` on toasts, `role="status"` on live dots when standalone.
- All buttons are real `<button>` elements. All links are real `<a>`.

## Commit and PR conventions

- PR titles: `[type] scope: subject` e.g. `[feat] button: add ghost variant`
- Any change that touches `design-tokens.json` requires a matching `DESIGN.md` update in the same PR
- Run `npx @google/design.md lint DESIGN.md` in CI. Errors block merge
- Run `npx @google/design.md diff DESIGN.md.before DESIGN.md.after` on PRs touching the contract. Regressions block merge
- New tokens need a one-line rationale in the JSON `$description` field

## What you should refuse to generate

If a prompt asks you to produce any of these, push back rather than comply:

- A gradient background for a hero or card
- A purple/teal/orange accent for non-semantic decoration
- A shadow with blur ≥ 25px
- `transition: all`
- An `Inter` or `system-ui` stack as the primary font
- A CTA button colored with `--ds-accent-live` or `--ds-accent-success`
- Red and green sprayed across one component cluster without a clear positive/attention mapping
- A rounded-20px dark card
- A full-width paragraph of body text

Explain which rule in `DESIGN.md` the request conflicts with. Offer the system-correct alternative.

## When the user's ask is outside the system

If the ask genuinely requires a new token (a new accent color for an illustration, a new radius for a specialized surface), propose:

1. The token name and value
2. The rule it lives under in `DESIGN.md`
3. The contrast/accessibility implications
4. A migration note if it replaces an existing token

Do not add the token silently. Do not fork the system.

## Useful commands

```bash
# Lint DESIGN.md
npx @google/design.md lint DESIGN.md

# Generate Tailwind config from tokens
npx @google/design.md tailwind DESIGN.md > tailwind.theme.json

# Export W3C DTCG format
npx @google/design.md export --format dtcg DESIGN.md > tokens.dtcg.json

# Install Emil Kowalski's design engineering skill for Claude Code
npx skills add emilkowalski/skill

# Install SOUS-DS globally for Claude / Codex / Goose / Cursor
npx sous-ds install-global
```
