# Changelog

All notable changes to `sous-ds`. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/).

---

## [0.2.0] — 2026-04-22

Truth-layer release. The repo now matches its own documentation, three verified contract-vs-reference contradictions are resolved, the system ships as an installable skill package, and the taste corpus is machine-readable.

### Added
- `SKILL.md` — A+ skill entrypoint with trigger grammar, refusal summary pointing at `refusals.json`, allowed-carrier allowlist, prompt→action mapping, and the AI-native primitive roadmap (AgentStream, ToolCall, Citation, Transcript, TokenMeter, DiffBlock, ConfidenceBar).
- `refusals.json` — machine-readable refusal corpus. Every "never do X" rule has a stable id (`R-*`), regex pattern, severity, rationale, exception, canonical alternative, and source pointer. The refusal set is now enforceable by any tool, not just `lint.mjs`.
- `components/index.ts` as the barrel the docs already described.
- `package.json` + `LICENSE` + `INSTALL.md` + `scripts/check-package.mjs` so the repo is a real distributable artifact. `sous-lint` binary exposed via `bin`.
- CL07 lint rule (`scripts/lint.mjs`) + rule entry in `quality-evaluator.md`: `--ds-accent-live` may only appear in sanctioned carrier files (LiveDot, Pill, Toast, tokens.css, preview showcase, slop example, refusals, SKILL). Focus-ring `:focus-visible` exempt.

### Changed
- Package identity from `soheil-ds` to `sous-ds` across tokens.css comment, lint.mjs header, quality-evaluator system prompt, package.json name. Version bumped to 0.2.0 since the folder reorganization is breaking for anyone importing from the old root.
- Realigned file layout with the documented contract: reference components now live in `components/`, the evaluator lives in `scripts/lint.mjs`, and the teaching artifact lives in `examples/slop-vs-system.html`.
- Tokenized shared interaction values used by the reference components: press duration, live pulse cadence, spinner duration, stagger timings, shared dot/icon/control sizes, and toast min width. The "every value is a token" claim in component headers is now true, not aspirational.
- Clarified semantic accent carriers in the design contract and SKILL. `LiveDot` is the primary carrier; `Pill live` and `Toast tone="live"` are permitted carriers when they express the same semantic state. The prior "sole home" claim in LiveDot was internally contradicted by Pill.css and Toast.css usage and has been corrected in DESIGN.md, LiveDot source comments, and quality-evaluator.md.
- Tightened release hygiene: the npm package ships from an explicit whitelist; package integrity is checked via `scripts/check-package.mjs`; `lint:ui` scans `components/` and `preview.html` only (not `examples/`, which hosts intentional slop for teaching).

### Fixed
- `Card` default padding now matches the documented 24px default (was 32px / `--ds-space-7`; now `--ds-space-6`).
- `Pill` letter-spacing now references `--ds-type-label-track` (0.08em) instead of a hardcoded 0.04em.
- `Toast` action and dismiss controls now meet the 44×44 hit-area floor via the `max(100%, var(--ds-size-interactive-min))` pattern, and show `:focus-visible` rings matching the Button focus contract.
- `TASTE_LOG.md` ENTRY 002 inspiration source path corrected (was `/Users/soheil/Desktop/Inspiration` with 8 images; actual is `Inspiration/` at repo root with 18 files — 17 JPEG + 1 GIF). Per the append-only principle, ENTRY 002 is untouched; a single superseding annotation references ENTRY 005 §5 which supersedes.
- Root-level `design.yml` duplicate removed. CI now reads the canonical `.github/workflows/design.yml` only.

---

## [0.1.0] — 2026-04-21

First alpha cut. The contract is stable enough to build against; token names may shift before `v1.0.0`.

### Added
- **`DESIGN.md`** — spec-compliant to `@google/design.md`, extended with VoltAgent's Responsive Behavior and Agent Prompt Guide sections.
- **`AGENTS.md`** — coding-agent companion covering hard rules, file layout, PR conventions, and refusal criteria for out-of-system requests.
- **`ANIMATION_RULES.md` v1.1** — Emil Kowalski's taste rules encoded, plus a `prefers-reduced-motion` contract and the Sonner toast pattern (`ANIMATION_RULES` v1.1 supersedes any earlier draft).
- **`TASTE_LOG.md` v1.1** — taste memory with resolved conflict log (see Fixed below).
- **`quality-evaluator.md`** — 30+ lint rule IDs across 7 rule groups with severity and structured JSON output format.
- **`design-tokens.json`** — DTCG-flavored machine source of truth.
- **`tokens.css`** — runtime CSS custom properties with dark default and `[data-theme="light"]` override.
- **`SKILL.md`** — adds the root skill entrypoint required for installation from a checkout or published repo.
- **`preview.html`** — single-file visual catalog showing palette, type scale, spacing, radii, elevation, motion lab, components, and the dotted chart motif.
- **Reference components** — `Button`, `Card`, `Pill`, `LiveDot`, `Toast` (Sonner-style with provider + hook), `DottedChart` (the signature data motif).
- **`scripts/lint.mjs`** — executable Quality Evaluator implementation.
- **`examples/slop-vs-system.html`** — side-by-side teaching artifact: rejected rendering next to compliant rendering for each rule category.
- **`.github/workflows/design.yml`** — CI pipeline running both `@google/design.md lint` and the implementation linter.
- **`CONTRIBUTING.md`** — governance.

### Fixed (from prior drafts)
- **`text-muted` contrast**. Prior value `#999999` on white was 2.85:1, failing WCAG AA. Raised to `#767676` in light mode (4.55:1, AA minimum) and `#888888` in dark mode (5.58:1, AA).
- **Card shadow contradiction**. A `--card-shadow` token existed despite the principle "cards use 1px border, not shadow." Token removed. Shadows now scoped to menus/toasts (`--ds-elev-1`) and modals only (`--ds-elev-2`).
- **Bento-grid verdict contradiction**. Image 07 was simultaneously dismissed as "generic SaaS" and adopted as "bento with dark-card contrast." Resolved by separating pattern (kept) from execution (rejected).
- **Anti-pattern logic**. The prior anti-pattern table conflated "absent from references" with "rejected." Rebuilt to list rules with taste-based reasoning.

### Changed
- **Primary face** from Cash Sans to **Geist** (free, Google Fonts, well-licensed). Mono face from Cash Sans Mono to **Geist Mono**. Projects with a Cash Sans license can restore it by overriding `--ds-font-sans` and `--ds-font-mono` in a `:root` block that loads after `tokens.css`.

### Security / accessibility
- Added global `@media (prefers-reduced-motion: reduce)` rule to `tokens.css` collapsing all animation and transition durations to 0.01ms.
- Added component-level reduced-motion handling in `Pill`, `LiveDot`, `Toast`, `DottedChart`.
- Every documented color pair now has a computed WCAG contrast ratio in `DESIGN.md` Colors section.

### Known gaps (tracked in `TASTE_LOG.md` → Pending Ingestion)
- Pinterest board `pin.it/4khCrB7hx` not yet ingested. Needs manual screenshot + append as ENTRY 005.
- Emil's skill: only animation + typography sections mined. Component design and Sonner rules remain (though `Toast.tsx` captures the core Sonner conventions from his public writing).
- VoltAgent reference DESIGN.md files (Linear, Vercel, etc.) cited but not deeply studied. Pending as ENTRY 007.

---

## Unreleased

Planned for `v0.2.0`:
- Slot-pattern variants of `Card` (no-head, data-centric, dense)
- Full `Modal` and `Drawer` components
- `Tooltip` with explicit `transform-origin` calculation
- Light-mode visual catalog (`preview-light.html`)
- Tailwind preset package (`@soheil/tailwind`)
- Figma library sync via Tokens Studio

Planned for `v1.0.0`:
- Token naming frozen
- DTCG export parity (`@google/design.md export --format dtcg` produces a complete file)
- Complete example app (dashboard reference) in `examples/`
- Screenshot-mode linter (evaluate rendered images against rule IDs)

---

[0.1.0]: Release URL to be added when the repository is published.
