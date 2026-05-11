# sous-ds

A dark-first, data-dense, restraint-led design system for AI coding agents.
Monospace for data. 1px borders over shadows. Two semantic accents only. Motion under 300ms.

```
v0.6.0 · auto-onboarding · 2026-04-25
```

---

## Install

In any React project — new or existing — run these two commands:

```bash
npm install sous-ds && npx sous-ds init
```

That's it. After those two commands every AI assistant configured for the project (**Cursor · Claude Code · Codex · Goose**, plus anything else that reads `AGENTS.md`) automatically follows the contract: no further prompting required.

Then in your code:

```tsx
// app/layout.tsx — once at the app root
import "sous-ds/styles.css";

// anywhere
import { Button, Card, LiveDot, BlockLoader } from "sous-ds";
```

Peer dep: React 18 or 19. Ships ESM + CJS + full TypeScript types.

### Tailwind users

```js
// tailwind.config.cjs
const sousPreset = require("sous-ds/tailwind");
module.exports = { presets: [sousPreset], content: ["./src/**/*.{ts,tsx}"] };
```

Every `--ds-*` token becomes a Tailwind utility (`bg-ds-surface`, `text-ds-primary`, `gap-ds-5`, `rounded-ds-md`, `duration-ds-standard`, ...). All utilities resolve to CSS variables, so overriding a token cascades through every class automatically.

### What `npx sous-ds init` actually writes

It drops one bootstrap file at each agent's expected location, pointing back at the installed package:

| Path | Read by |
|---|---|
| `AGENTS.md` (root, managed block) | Codex CLI, Goose, the `agents.md` spec |
| `CLAUDE.md` (root, managed block) | Claude Code |
| `.cursor/rules/sous-ds.mdc` | Cursor |
| `.claude/skills/sous-ds/SKILL.md` | Claude Code per-project skills |

Idempotent (safe to re-run after upgrading) and never clobbers user content — managed-block markers preserve text above and below. `--dry-run` shows the plan, `--force` overwrites owned files.

### Other entry points

- **Plain HTML / no bundler:** `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sous-ds@latest/dist/styles.css">`
- **Standalone agent skill (no React):** `curl -fsSL https://raw.githubusercontent.com/SoheilOlia/sous_ds/main/install.sh | bash`
- **Global skill install:** `npx sous-ds install-global` wires `/sous-ds` and "Learn from this project" across Claude, Codex, Goose, and Cursor user-level skill/command locations.
- **Full subpath reference and per-consumer details:** [INSTALL.md](./INSTALL.md)

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

Cash Sans display + Geist body + Geist Mono. WCAG AA on every foreground/background pair.

### Recommended companion

```bash
npx skills add emilkowalski/skill
```

Emil Kowalski's skill provides the underlying animation taste; this one builds the system contract on top.

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

### Learning from a finished project

When a finished UI teaches the system something, use the global skill phrase:

```text
/sous-ds Learn from this project
```

or:

```text
Learn from this project for SOUS-DS.
```

The agent must compare the project against source truth, extract only durable system lessons, and route each update to the right file: tokens, components, recipes, refusals, motion rules, voice rules, installer, or `TASTE_LOG.md`. Project-specific copy, PR IDs, and brand styling stay in the project.

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

**beta / v0.6.0 — auto-onboarding.** Published to npm with `npm install sous-ds` + `npx sous-ds init`. Wires the contract into Cursor / Claude Code / Codex / Goose for any project in two commands. React components ship as ESM + CJS + types, Tailwind preset exposes every token as a utility. The contract is stable; token names may shift before v1.
