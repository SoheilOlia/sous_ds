# ANIMATION_RULES.md
> Source: Emil Kowalski — "Agents with Taste" (https://emilkowal.ski/ui/agents-with-taste)
> Ingested: 2026-04-21
> Updated: 2026-04-21 (v1.1)
> Status: CANONICAL. Enforced by the Quality Evaluator.

---

## Core philosophy

Animation taste is articulable. Every "this feels right" decision has a logical reason.
The job is to find that reason and encode it as a rule, not leave it as instinct.
Agents follow rules. Give them the right rules and they produce elite output.

---

## Easing decision flowchart

Use this to pick easing. Do not guess. Do not invent.

```
Is the element entering or exiting the viewport?
├── Yes → ease-out
└── No
    ├── Is it moving or morphing on screen?
    │   └── Yes → ease-in-out
    └── Is it a hover change?
        ├── Yes → ease
        └── Is it constant motion?
            ├── Yes → linear
            └── Default → ease-out
```

**Rule:** `ease-out` is the default. Everything else is a deliberate override with written justification.

---

## Duration guidelines

| Element Type | Duration | Token |
|---|---|---|
| Micro-interactions | 100–150ms | `--ds-dur-micro` (140ms) |
| Standard UI (tooltips, dropdowns) | 150–250ms | `--ds-dur-standard` (220ms) |
| Modals, drawers | 200–300ms | `--ds-dur-deliberate` (280ms) |

**Hard rules:**
- UI animations must stay under 300ms. No exceptions.
- Larger elements animate slower than smaller ones.
- Exit animations are ~20% faster than entrance animations.
- Match duration to travel distance. Longer distance = longer duration.

---

## Practical tips (anti-pattern library)

| Scenario | Wrong | Right |
|---|---|---|
| Button feedback on press | No state change | `transform: scale(0.97)` on `:active` |
| Element appears from nowhere | `scale(0)`, looks teleported | Start from `scale(0.95)` or higher |
| Shaky or jittery animations | Pure CSS transform, no hint | Add `will-change: transform` |
| Hover causes parent flicker | Animate parent | Animate child element |
| Popover scales from wrong origin | Default center | Set `transform-origin` to trigger |
| Sequential tooltips feel sluggish | Same delay every time | Skip delay/animation after the first |
| Small buttons hard to tap | Hit area = visual size | 44px minimum via `::before` |
| Something still feels off | Ship it | Add subtle blur under 20px to mask |

**The scale principle:**
Never animate from `scale(0)`. Even a deflated balloon has visible shape. Start from `scale(0.95)` minimum. It makes motion feel gentle, natural, grounded.

---

## Typography rules (from Emil's skill)

These apply to all generated UI. Non-negotiable.

1. Cap body text at `65ch`. Do not stretch full width.
2. Apply `tabular-nums` to every price, metric, or data column.
3. Use the `…` character, not `...`, for truncation.
4. Loosen letter-spacing on uppercase labels. Tight uppercase reads cramped.
5. Declare a fallback font stack with matching x-height.
6. Reserve underlines for links only.
7. Bold for UI emphasis. Italic for citations and prose only.

---

## System overrides and extensions

### Font contract
- Primary face: `Geist` (via `--ds-font-sans`)
- Mono face: `Geist Mono` (via `--ds-font-mono`)
- Forbidden as primary: Inter, Roboto, Helvetica, Arial, system-ui, Open Sans, Lato, Poppins
- Tracking: display `-0.03em`, headings `-0.015em` to `-0.02em`. Tighter than Emil's defaults because Geist runs wide at large sizes.

### Motion tokens (use the CSS variables)
- Micro: `var(--ds-dur-micro)` = 140ms
- Standard: `var(--ds-dur-standard)` = 220ms
- Deliberate: `var(--ds-dur-deliberate)` = 280ms
- Ease-out: `var(--ds-ease-out)` = `cubic-bezier(0.16, 1, 0.3, 1)`
- Ease-in-out: `var(--ds-ease-in-out)` = `cubic-bezier(0.65, 0, 0.35, 1)`

### Allowed animated properties
`opacity`, `transform` (`translate`, `scale`, `rotate`). That's it.

**Forbidden transitions:**
- `transition: all`
- `transition: color`
- `transition: width`, `transition: height` (use transform scale instead)
- Any property involving layout recalculation

### Scale rule application
- Cards entering view: `scale(0.97)` → `1`, 140ms, `ease-out`
- Modals and drawers: `scale(0.95)` → `1`, 280ms, `ease-out`
- Dropdowns and popovers: `scale(0.95)` → `1`, 220ms, `transform-origin` set to trigger
- Button press: `scale(0.97)` on `:active`, 100ms, `ease`

### Elevation contract (updated v1.1)

Previous version listed a card shadow token. Removed. Cards in dark mode use a 1px border for edge separation, never a shadow.

- `--ds-elev-0` = `none`. Default for all cards, panels, and static surfaces.
- `--ds-elev-1` = `0 1px 2px rgba(0,0,0,0.3)`. Floating menus, toasts only.
- `--ds-elev-2` = `0 8px 24px rgba(0,0,0,0.5)`. Modals and drawers only.

**Forbidden:** any shadow with blur ≥ 25px. This is the AI-slop shadow signal. Quality Evaluator auto-flags.

---

## The `prefers-reduced-motion` contract (new in v1.1)

Users who have opted out of motion get a degraded version that still communicates state but does not animate.

### Global rule

The following block is already in `tokens.css` and applies to every element:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:   0.01ms !important;
    animation-iteration-count: 1  !important;
    transition-duration:  0.01ms !important;
    scroll-behavior:      auto   !important;
  }
}
```

### Component-level degradation

In addition to the global cap, components must behave correctly when motion is reduced:

- Entry animations: collapse to instant appearance. Do not rely on the animation to establish presence.
- Dismissal animations: same.
- The "live" dot: opacity pulse disabled. Dot remains visible at full opacity. Semantic meaning preserved.
- Spinners: prefer a static "loading" label with a counter (e.g. `00:03`) over a rotating shape.
- Parallax: disabled entirely.
- Autoplay carousels: paused, use step controls instead.

### What is still allowed under reduced motion

- Opacity changes for state (focus, hover) if they are instantaneous
- Cursor style changes
- Color changes for state legibility (within the color contract)

---

## Toast pattern (Sonner conventions)

The toast component follows Emil's Sonner library conventions. Emil authored Sonner, so its patterns are canonical here.

- Stack position: bottom-right (or bottom-center on mobile)
- Max visible: 3. Older toasts slide down in the stack and fade.
- Enter: `translateY(8px) → 0`, `opacity 0 → 1`, 220ms, `ease-out`
- Exit: same values reversed, 180ms (~20% faster than entry)
- Dismiss: swipe right on touch, click on desktop, timeout at 5s default
- Stack collapse: on hover, spread the stack to show all toasts. 140ms.
- `aria-live="polite"` on the region, `role="status"` per toast
- Under `prefers-reduced-motion`: enter and exit are instant, no translateY, only opacity

---

## Anti-slop quick checklist

Before any animation is shipped, the Quality Evaluator checks:

- [ ] No `transition: all` anywhere in the file
- [ ] No `scale(0)` as an animation start point
- [ ] No duration above 300ms
- [ ] No color transitions on hover (opacity/transform only)
- [ ] `will-change: transform` present on any animated element that was jittery
- [ ] `transform-origin` explicitly set on every popover, dropdown, tooltip
- [ ] Exit durations are ~20% shorter than entrance durations
- [ ] Button `:active` has `scale(0.97)` feedback
- [ ] No shadow with blur ≥ 25px
- [ ] Easing follows the flowchart, no arbitrary `cubic-bezier` without a comment
- [ ] `@media (prefers-reduced-motion: reduce)` respected (handled globally but verify component-level)
- [ ] Cards use 1px border, not shadow
- [ ] All durations referenced via CSS variables, not hardcoded

---

## Pending ingestion

| Source | Status |
|--------|--------|
| Emil's full skill (`npx skills add emilkowalski/skill`) | ⏳ Only animation + typography sections extracted. Component design, Sonner, color theory, and icon sections remain to be ingested. |
| Pinterest board `pin.it/4khCrB7hx` | ⏳ Needs manual screenshot + drop |
