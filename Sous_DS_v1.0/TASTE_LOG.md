# TASTE_LOG.md
> Canonical taste memory for the design system.
> Append-only. Never silently overwrite. Each entry is timestamped and sourced.
> Last updated: 2026-04-21 (v1.1)

---

## HOW TO READ THIS FILE

Each entry records what was learned, from what source, and what it means for the system.
Conflicts between entries are flagged explicitly, never silently resolved.
The Quality Evaluator uses this file as ground truth for taste signals.

---

## ENTRY 001 — Emil Kowalski Skill
**Date:** 2026-04-21
**Source:** https://emilkowal.ski/ui/agents-with-taste + `npx skills add emilkowalski/skill`
**Type:** Principle reference

### Signals extracted:
- Animation taste is articulable. Every "this feels right" has a logical reason. Find it. Encode it.
- `scale(0)` is always wrong. Start from `scale(0.95)` minimum. Even a deflated balloon has shape.
- `ease-out` is the default easing for everything. Everything else is a deliberate override.
- Exit animations should be ~20% faster than entrance. Asymmetry feels natural.
- UI animations must stay under 300ms. Hard ceiling, no exceptions.
- `will-change: transform` on anything that was jittery in testing.
- `transform-origin` must be set explicitly on popovers and dropdowns. Default center is wrong.
- Sequential tooltips: skip delay/animation after the first one. Repetition kills it.
- Animate child elements, not parents. Hover on parent causes flicker.
- Body text caps at ~65ch. Not full width.
- `tabular-nums` on all data/price/metric columns.
- Ellipsis character (`…`) not three dots (`...`).
- Uppercase labels need loosened letter-spacing. Tight uppercase reads cramped.
- Underlines are for links only.
- Bold for UI emphasis. Italic for citations and prose only.

### System integration:
See `ANIMATION_RULES.md` for full encoding.

---

## ENTRY 002 — Inspiration Image Analysis
**Date:** 2026-04-21
**Source:** `/Users/soheil/Desktop/Inspiration` (8 images)
**Type:** Visual reference

*Content unchanged from v1.0. Full per-image analysis retained as is. Summary of cross-image synthesis below.*

### Cross-image synthesis (canonical taste principles)

Patterns that appeared in 3 or more of the 8 images and are now canonical:

1. **Dot/dash as data motif** (5/8 images). Dots, dashes, and pill-shapes as data encoding. Length = duration. Darkness = intensity. Density = volume. This is the system's defining visual signature.

2. **Single red-orange accent #E5533C** (3/8 images). Always semantic, never decorative. Reserved for: live/active state, alert, current moment, primary status.

3. **Monospace for all data** (4/8 images). Times, metrics, percentages, numbered lists, data values. `tabular-nums` always on.

4. **Large display number as content anchor** (3/8 images). The number is the hero. `+326%`, `7HR 48MIN`, `15:39`. Display at 48px+ with mixed-weight unit superscripts.

5. **Dark card on dark background** (2/8 images, core system pattern). Differentiated by surface luminance and 1px border, not shadow. No elevation theater.

6. **Restraint as the primary move** (across all 8). Every element justifies its presence or gets removed.

7. **Weight hierarchy without color** (Images 02, 06). Primary text bold, secondary muted gray. Color is never used to create hierarchy.

---

## ENTRY 003 — DESIGN.md Convention
**Date:** 2026-04-21
**Source:** https://github.com/google-labs-code/design.md, https://github.com/VoltAgent/awesome-design-md
**Type:** Structural reference

### What this is:
DESIGN.md is a Google Stitch / Google Labs convention. A markdown file with YAML front matter (machine-readable tokens) and prose body (human-readable rationale). The spec defines canonical section order, token types, component schema, and linting rules. VoltAgent's collection extends it with Responsive Behavior and Agent Prompt Guide sections.

### System integration:
- `DESIGN.md` is the primary contract consumed by coding and design agents
- `design-tokens.json` is the W3C DTCG-flavored machine layer
- `tokens.css` is the runtime CSS implementation
- `AGENTS.md` is the paired coding-agent guide (VoltAgent pattern)
- Linting: `npx @google/design.md lint DESIGN.md` in CI
- Regression check: `npx @google/design.md diff before.md after.md` on contract PRs

---

## ENTRY 005 — Cash Sans restored as the primary face
**Date:** 2026-04-22
**Source:** Direct directive from system owner
**Type:** Correction (supersedes ENTRY 004 item 8)

### What changed and why

**Reverted the Cash Sans → Geist swap from ENTRY 004 item 8.**

Prior rationale (ENTRY 004): "Cash Sans licensing concern for any deployment outside Cash App." That rationale was my caution, not a directive. The system owner has the font license for their deployment context, so Cash Sans is the correct primary face.

### Migration performed

- `--ds-font-sans`: `"Cash Sans", ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif`
- `--ds-font-mono`: `"Cash Sans Mono", ui-monospace, "SF Mono", "JetBrains Mono", monospace`
- Added `@font-face` block in `tokens.css` (commented by default; uncomment when font files are placed in `./fonts/`)
- Removed Google Fonts `<link>` tags from `preview.html` and `setup.html` (Cash Sans is not on Google Fonts)
- Kept Inter loading in `examples/slop-vs-system.html` since that file demonstrates TY01 slop
- Updated every `fontFamily` reference in `DESIGN.md`, `design-tokens.json`, `AGENTS.md`, `SKILL.md`, `ANIMATION_RULES.md`, `README.md`, `INSTALL.md`, `CHANGELOG.md`

### Fallback stack rationale

Cash Sans is a humanist sans-serif. `-apple-system` and `BlinkMacSystemFont` have matching x-height, so substitution during font load does not cause visible layout shift. Per Emil's typography rule 5.

### Implications

- Projects using this system must self-host Cash Sans + Cash Sans Mono. Font files are not redistributed in the repo.
- Users without access to Cash Sans see the fallback stack (system sans). The system still functions; it just reads as system-ui until the fonts load.
- For open-source projects that cannot obtain Cash Sans, a forked `--ds-font-sans` override is the supported path. The override should keep the same type scale and tracking values.

### Claim I walked back

In ENTRY 004 I wrote: "Cash Sans can be swapped in by projects that own a license." That framed Cash Sans as optional. It is not optional. Cash Sans is the system's identity. Projects that cannot use it fork the typography layer explicitly.

---

## ENTRY 004 — v1.1 Corrections and Gaps Closed
**Date:** 2026-04-21
**Source:** Internal audit against Google Labs spec + WCAG contrast checks + internal consistency review
**Type:** Correction log

### What changed and why

**1. Raised `text-muted` color to pass WCAG AA**
- Prior value (light mode): `#999999`. Contrast on white: 2.85:1. **Fails AA** for normal text (required 4.5:1) and **fails AA** for large text (required 3:1).
- New value (light mode): `#767676`. Contrast on white: 4.55:1. Passes AA minimum.
- New value (dark mode): `#888888` on `#0A0A0A`. Contrast 5.58:1. Passes AA comfortably.
- Impact: every instance of muted gray in the codebase needs to be migrated to the new token.

**2. Removed card shadow token**
- Prior: `--card-shadow: 0 1px 2px rgba(0,0,0,0.4)` existed as a token.
- Conflict: Image 01 analysis explicitly stated "1px border instead of shadow, no drop shadows on cards in dark mode."
- Resolution: shadows are now scoped to floating surfaces only (menus, toasts, modals). Cards use `--ds-line` border. `--ds-elev-0` is `none`.

**3. Resolved Image 07 verdict**
- Prior: dismissed as "generic SaaS" but then included "bento grid with dark card contrast" in what-to-take. Contradiction.
- Resolution: separate the pattern from its execution. Bento grid with a dark contrast card = good pattern, adopted. Gold stars, green-availability-dot, and rating-card aesthetic = rejected execution.

**4. Cleaned up the anti-pattern table**
- Prior: conflated "not seen in reference" with "rejected." Absence of evidence is not evidence of absence.
- Resolution: anti-patterns are now listed with their taste-based reasoning, not their absence from references. See `DESIGN.md` → Do's and Don'ts.

**5. Added `prefers-reduced-motion` contract**
- Prior: animation rules had no degradation path for users who opt out. Accessibility gap.
- Resolution: global rule in `tokens.css` collapses all animation/transition durations to ~0ms under `prefers-reduced-motion: reduce`. Opacity changes still permitted for state legibility.

**6. Added complete type scale**
- Prior: fonts and tracking defined, no sizes.
- Resolution: 10 type roles defined (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `body-sm`, `label`, `mono-xl`, `mono`). See `DESIGN.md` → Typography.

**7. Added spacing, radius scales**
- Prior: neither existed.
- Resolution: 12-step 8pt spacing scale, 6-step radius scale. See `DESIGN.md`.

**8. Removed Cash Sans dependency**
- Prior: Cash Sans specified as primary face. Licensing concern for any deployment outside Cash App. No fallback stack.
- Resolution: primary face is now Geist, mono face is Geist Mono. Both free, both on Google Fonts, both with defined fallback stacks that match x-height to prevent FOUT layout shift.

**9. Defined components that were only implicit**
- Button (primary/secondary/ghost with states)
- Card (single variant, no shadow)
- Pill (filled vs outline, dashed border for "impermanent" states)
- Dot-live (the accent-bearing element)
- Input, Modal, Toast, Dotted bar chart

**10. Built reference implementations**
- `components/Button.tsx` — canonical button with all states
- `preview.html` — single-file visual catalog
- These are the ground truth agents pattern-match against.

---

## PENDING INGESTION

| Source | Type | Status | Unblock path |
|--------|------|--------|--------------|
| https://pin.it/4khCrB7hx | Pinterest board | ⏳ Not yet ingested | Use a Pinterest-to-image export tool or manually screenshot each pin at 2x. Drop images into chat, append as ENTRY 005. |
| Emil's full skill output | npx package | ⏳ Only animation rules extracted | Run `npx skills add emilkowalski/skill` locally, read every `SKILL.md` in the returned directory, extract component-design and Sonner rules as ENTRY 006. |
| VoltAgent reference DESIGN.md files | Repo | ⏳ Structure referenced, content not mined | Clone the repo. Read DESIGN.md for Linear, Vercel, Expo, VoltAgent itself. Extract section-structure and token-organization patterns as ENTRY 007. |

---

## CONFLICT LOG

| Date | New signal | Conflicts with | Proposed resolution | Status |
|------|-----------|----------------|---------------------|--------|
| 2026-04-21 | Card shadow token existed | Image 01 analysis: no shadows on dark cards | Remove shadow token from cards. Restrict shadows to menus/modals only. | ✓ Resolved in v1.1 |
| 2026-04-21 | Bento grid "dismissed" but also "taken" | Internal contradiction | Separate pattern from execution. Pattern = adopted. Execution of Image 07 = rejected. | ✓ Resolved in v1.1 |
| 2026-04-21 | `#999` muted gray failed WCAG AA | Accessibility contract | Raise to `#767676` light / `#888` dark. Document contrast ratios in DESIGN.md. | ✓ Resolved in v1.1 |
| 2026-04-21 | Cash Sans not universally licensed | Deployability | Switch to Geist + Geist Mono as system default. Cash Sans can be swapped in by projects that own a license, via token override. | ✓ Resolved in v1.1 |
