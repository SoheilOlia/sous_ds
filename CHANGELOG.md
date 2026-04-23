# Changelog

All notable changes to `sous-ds`. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/).

---

## Unreleased

### Added
- **`<DensityStrip>`** — new Data Motif component. Horizontal segmented strip for AI-native data like "N tool calls across the last 60s, some complete, some running, some queued." Per-bucket micro-bar shows density (count); fill color shows state (`accent-success` = done, `accent-live` = live, `text-muted` = queued, 6px dot at base for empty/future buckets). Companion to `<DottedChart>`, not replacement. Accepts either pre-bucketed `buckets` or raw `events` (component bucketizes). Preview includes three demo scenarios: steady, live-batch, mostly-empty.
- `DensityStrip` joins the accent-carrier allowlist for **both** `--ds-accent-live` and `--ds-accent-success` — the first component permitted to carry both, justified by the per-bucket state model (priority `live > done > queued`) that keeps the semantics isolated.
- Motion rules (Emil-grounded): state transitions on `opacity`/`background-color`/`height` via interruptible CSS transitions at `--ds-dur-standard` (220ms) with `--ds-ease-out`; live-bucket opacity pulse `1 → 0.55 → 1` via `@keyframes` at `--ds-dur-live-pulse` (2000ms, matches `<LiveDot>` cadence); tooltip asymmetric timing (140ms enter, 112ms exit) with `transform-origin: bottom center`. `prefers-reduced-motion` collapses all transitions and replaces the pulse with a static outline.
- New size tokens: `--ds-size-strip-h` (48px), `--ds-size-strip-bar-min` (4px). All other timing, easing, and dot-size values reuse existing system tokens.
- `SegmentedBar` — discrete progress for quota, credits, and task completion when the total is known.
- `SegmentedControl` — compact mode switching for filters, scopes, and tool rows.
- `InlineStatus` — bracketed mono state for queued, loading, saved, and live system feedback.
- `MetricStat` — large mono KPI readout with restrained count-up for revenue, usage, and agent metrics.
- `ToolCall` — AI-native execution row for tool invocations, duration, and explicit status.
- `R-STATE-001` in `refusals.json` plus `CO06` in the evaluator and linter, so skeleton and shimmer loading chrome are now explicitly discouraged.
- `install.sh` — non-destructive scaffold installer so the contract can land in another repo without manual file copying.
- `accent-success` (`#00E013`) — semantic completion accent for fully committed progress and closed positive endpoints.

### Changed
- Added semantic spacing aliases (`space-tight`, `space-group`, `space-section`, `space-context`) on top of the numeric scale so agents can compose by relationship, not just by raw number.
- Softened the large Geist voice by dropping display and heading weights from 600 to 500 and easing the tracking slightly open, reducing the neutral/Helvetica feel without changing the family.
- Updated `DESIGN.md`, `SKILL.md`, and the preview surface so segmented controls, segmented progress, inline status, and tool-call rows are first-class patterns instead of future ideas.
- Re-tiered headline typography: `h2` and `h3` now use `Geist Mono` as the framing voice, while display / h1 stay on `Cash Sans`. Chapter and page title specimens now render as mixed alpha + mono numerals (`Aa 0123`) to reflect the system’s data-forward title language.
- Tightened preview interactions so segmented control selection moves with a shared thumb, status toggles between playing and paused, progress can replay from click, and revenue metrics replay a restrained count-up on demand.
- Added semantic green completion states to the preview and React primitives: `SegmentedBar` can switch to `accent-success` at full completion, and `DottedChart` can mark a terminal success endpoint without turning color into hierarchy.
- Switched release/install metadata to the target GitHub remote `soheilolia/sous_ds`.

### Removed
- Stale export folders and duplicate inspiration artifacts are being retired so the repo has one working source of truth.

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
