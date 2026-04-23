# sous-ds

A dark-first, data-dense, restraint-led design system for AI coding agents.
Monospace for data. 1px borders over shadows. Two semantic accents only. Motion under 300ms.

```
v0.2.0 · alpha · 2026-04-22
```

Cash Sans display + Geist body + Geist Mono. WCAG AA on every foreground/background pair. Structured as a skill-ready repo.

---

## What this is

A full contract for building interfaces that feel like precision instruments instead of marketing brochures. Six files form the core:

| File | Who reads it | What it does |
|---|---|---|
| **DESIGN.md** | design agents, humans | The canonical spec. YAML tokens + prose rationale. Linted by `@google/design.md`. |
| **AGENTS.md** | coding agents | Rules for generated code. Fonts, motion, elevation, components. |
| **ANIMATION_RULES.md** | coding agents | Emil Kowalski's taste rules, extended. The motion contract. |
| **TASTE_LOG.md** | humans, auditors | Append-only taste memory. Every decision traceable to a source. |
| **quality-evaluator.md** | auditors | Rule IDs + severity. The linter behind `scripts/lint.mjs`. |
| **design-tokens.json** | tooling | DTCG-flavored machine source of truth. |

Plus: `tokens.css` (runtime CSS variables), `components/` (reference implementations), `preview.html` (visual catalog).

---

## Install

### From a local checkout (works today)

This repo contains a real root `SKILL.md` plus the rule files it points to. If your agent supports repo-backed skills, point it at the repo root and let `SKILL.md` serve as the entrypoint.

### One-line scaffold installer (release-ready)

```bash
curl -fsSL https://raw.githubusercontent.com/soheilolia/sous_ds/main/install.sh | bash
```

The same script already lives in this repo as [install.sh](./install.sh), so you can validate the install path before the public remote is live.

### As a published skill (release target)

```bash
npx skills add soheilolia/sous_ds
```

Until that release exists, use the local workflow in [INSTALL.md](./INSTALL.md).

### As a direct dependency

Copy the contract and token files into your project root, then reference `tokens.css` from your app root:

```html
<link rel="stylesheet" href="./tokens.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap">
```

`Cash Sans` is the display/page-title face. `h2`/`h3` framing and numeric runs inside chapter/page titles should use `Geist Mono`. If `Cash Sans` is installed locally or self-hosted in your product, `--ds-font-display` will pick it up automatically; otherwise those display roles fall back to Geist.

### Recommended companion

```bash
# Emil Kowalski's design engineering skill (covers animations, Sonner, component design)
npx skills add emilkowalski/skill
```

The two skills compose. Emil's provides the underlying animation taste; this one builds the system contract on top.

---

## Quickstart for an agent

A coding agent landing in a repo with this system should:

1. Read `DESIGN.md` end to end.
2. Read `AGENTS.md` for code conventions.
3. Reference `tokens.css` and use `var(--ds-*)` for every value.
4. Check `components/` for existing reference implementations before building new.
5. Run the linter before committing: `node scripts/lint.mjs components/ preview.html`.
6. Run `npm run pack:check` before cutting a release.

Never hardcode a color, size, or duration. Never use Inter. Never use a shadow with blur ≥ 25px.

---

## Verify

```bash
# Lint the contract itself
npx @google/design.md lint DESIGN.md

# Lint implementations against the rules
node scripts/lint.mjs components/ preview.html

# Verify release tarball contents
npm run pack:check

# Check regression on a contract change
npx @google/design.md diff DESIGN.md.before DESIGN.md.after

# Export Tailwind theme
npx @google/design.md tailwind DESIGN.md > tailwind.theme.json

# Export DTCG tokens
npx @google/design.md export --format dtcg DESIGN.md > tokens.dtcg.json
```

The contract lint, implementation lint, token parity check, and package integrity check run in CI. See `.github/workflows/design.yml`.

---

## File map

```
sous-ds/
├── SKILL.md                   ← root agent entrypoint
├── README.md                  ← you are here
├── DESIGN.md                  ← the contract (spec-compliant, YAML + prose)
├── AGENTS.md                  ← coding agent guide
├── ANIMATION_RULES.md         ← motion contract (Emil + extensions)
├── TASTE_LOG.md               ← append-only taste memory
├── CHANGELOG.md               ← semver history
├── CONTRIBUTING.md            ← how to evolve the system
├── INSTALL.md                 ← local-install and release-state guide
├── install.sh                 ← one-line scaffold installer
├── quality-evaluator.md       ← lint rule IDs and severities
│
├── design-tokens.json         ← DTCG machine source
├── tokens.css                 ← runtime CSS variables
│
├── components/                ← reference implementations
│   ├── index.ts               ← barrel export
│   ├── Button.tsx  / .css
│   ├── Card.tsx    / .css
│   ├── Pill.tsx    / .css
│   ├── LiveDot.tsx / .css
│   ├── InlineStatus.tsx / .css
│   ├── MetricStat.tsx / .css
│   ├── SegmentedBar.tsx / .css
│   ├── SegmentedControl.tsx / .css
│   ├── ToolCall.tsx / .css
│   ├── Toast.tsx   / .css     ← Sonner-style, Emil's conventions
│   └── DottedChart.tsx / .css ← signature data motif
│
├── scripts/
│   └── lint.mjs               ← the quality evaluator, executable
│   └── check-package.mjs      ← release-tarball integrity check
│
├── examples/
│   └── slop-vs-system.html    ← side-by-side teaching artifact
│
├── preview.html               ← single-file visual catalog
│
└── .github/workflows/
    └── design.yml             ← CI lint pipeline
```

---

## Design principles (in priority order)

1. **Restraint is the primary move.** Remove what does not inform or structure.
2. **Weight and luminance over color.** Hierarchy from type and tone, not hue.
3. **Data is a design element.** Mono, tabular, display-size. The number is the hero.
4. **Precision over softness.** 1px borders, tight radii, snappy motion.
5. **The dot motif.** Dots, dashes, pills as data encoding. Length = duration. Density = volume.
6. **Each accent has one meaning.** `#00E013` is the primary accent for success, positive highlight, and completion. `#E5533C` is the secondary attention rail for alert, anomaly, error, or urgent live-now state. Neither is a CTA.

Full rationale in `DESIGN.md`. Source references and conflict resolution in `TASTE_LOG.md`.

---

## What this is not

Not a generic SaaS marketing aesthetic. No gold stars, no gradient blobs, no glass morphism, no elevation theater. Not warm, not playful, not soft. If you need those things, this is not your system.

---

## Credits

- **Emil Kowalski** — animation taste, typography rules, the Sonner toast pattern. `npx skills add emilkowalski/skill`
- **Google Labs** — the DESIGN.md format specification. `@google/design.md`
- **VoltAgent** — the DESIGN.md + AGENTS.md pairing pattern. `awesome-design-md`

---

## License

Apache 2.0. See `LICENSE`.

## Status

**alpha / v0.2.0.** The contract is stable enough to build against; token names may shift before v1.
