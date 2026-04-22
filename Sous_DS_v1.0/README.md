# soheil-ds

A dark-first, data-dense, restraint-led design system for AI coding agents.
Monospace for data. 1px borders over shadows. One semantic accent. Motion under 300ms.

```
v0.1.0 · alpha · 2026-04-21
```

Cash Sans + Cash Sans Mono. WCAG AA on every foreground/background pair. Installable as a skill.

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

### As a skill (Claude Code, Cursor, any agent with `npx skills`)

```bash
npx skills add soheil/soheil-ds
```

This installs `SKILL.md` plus every rule file. Agents read the skill at the start of any UI task and follow its rules automatically.

### As a direct dependency

```bash
# Copy the contract and token files into your project root
curl -L https://github.com/soheil/soheil-ds/archive/v0.1.0.tar.gz | tar -xz
cp soheil-ds-0.1.0/{DESIGN.md,AGENTS.md,ANIMATION_RULES.md,tokens.css,design-tokens.json} .
```

Then reference `tokens.css` from your app root, and place your Cash Sans font files in `./fonts/` (see the `@font-face` block at the top of `tokens.css`):

```html
<link rel="stylesheet" href="./tokens.css">
```

Cash Sans is proprietary and must be self-hosted. The system falls back to the declared sans/mono stack when the fonts are not present.

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
5. Run the linter before committing: `node scripts/lint.mjs`.

Never hardcode a color, size, or duration. Never use Inter. Never use a shadow with blur ≥ 25px.

---

## Verify

```bash
# Lint the contract itself
npx @google/design.md lint DESIGN.md

# Lint implementations against the rules
node scripts/lint.mjs components/

# Check regression on a contract change
npx @google/design.md diff DESIGN.md.before DESIGN.md.after

# Export Tailwind theme
npx @google/design.md tailwind DESIGN.md > tailwind.theme.json

# Export DTCG tokens
npx @google/design.md export --format dtcg DESIGN.md > tokens.dtcg.json
```

All three lint steps run in CI. See `.github/workflows/design.yml`.

---

## File map

```
soheil-ds/
├── SKILL.md                   ← makes the system installable via npx skills
├── README.md                  ← you are here
├── DESIGN.md                  ← the contract (spec-compliant, YAML + prose)
├── AGENTS.md                  ← coding agent guide
├── ANIMATION_RULES.md         ← motion contract (Emil + extensions)
├── TASTE_LOG.md               ← append-only taste memory
├── CHANGELOG.md               ← semver history
├── CONTRIBUTING.md            ← how to evolve the system
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
│   ├── Toast.tsx   / .css     ← Sonner-style, Emil's conventions
│   └── DottedChart.tsx / .css ← signature data motif
│
├── scripts/
│   └── lint.mjs               ← the quality evaluator, executable
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
6. **One accent, one meaning.** `#E5533C` marks live/now/active only. Never a CTA.

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

**alpha / v0.1.0.** The contract is stable enough to build against; token names may shift before v1.
