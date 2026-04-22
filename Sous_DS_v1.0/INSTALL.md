# Install soheil-ds

Three ways to drop this system into a project. Pick the one that fits.

---

## 1. `npx` (recommended for Node projects)

```bash
npm create soheil-ds@latest
# or equivalently
npx create-soheil-ds@latest
```

Flags:

```bash
npx create-soheil-ds --minimal       # only DESIGN.md + tokens (no components)
npx create-soheil-ds --force         # overwrite existing files
npx create-soheil-ds --dest packages/ui
```

Installs into the current directory by default. Refuses to clobber existing files unless `--force` is passed.

---

## 2. `curl` one-liner (no Node required)

```bash
curl -fsSL https://raw.githubusercontent.com/soheil/soheil-ds/main/install.sh | bash
```

Or a specific version / destination:

```bash
SOHEIL_DS_VERSION=v0.1.0 \
SOHEIL_DS_DEST=./design-system \
  curl -fsSL https://raw.githubusercontent.com/soheil/soheil-ds/main/install.sh | bash
```

The installer downloads a tagged release tarball, copies the contract files and `components/`, `scripts/`, and offers to drop in the CI workflow.

---

## 3. Wizard (generate a customized bundle)

Open `setup.html` in a browser (locally or hosted). Fill in:

- Company name and blurb
- Optional: GitHub repo, local folder, `.fig` file, fonts/logos/assets
- Any other notes

The wizard generates a `BRAND.md` that extends the base `DESIGN.md` plus a `tokens.brand.css` override scoped to your brand. Download the bundle, drop it next to the base install.

The wizard does **not** fork the system. It produces a brand layer that loads on top.

---

## What gets installed

| File | Purpose |
|---|---|
| `DESIGN.md` | The spec-compliant design contract (YAML tokens + prose) |
| `AGENTS.md` | Coding-agent rules |
| `ANIMATION_RULES.md` | Motion contract |
| `SKILL.md` | Entry point for `npx skills` loading |
| `TASTE_LOG.md` | Append-only taste memory |
| `CHANGELOG.md` | Version history |
| `CONTRIBUTING.md` | Governance |
| `quality-evaluator.md` | Lint rule IDs |
| `design-tokens.json` | DTCG source of truth |
| `tokens.css` | Runtime CSS custom properties |
| `components/` | 6 reference components (Button, Card, Pill, LiveDot, Toast, DottedChart) |
| `scripts/lint.mjs` | Executable Quality Evaluator |
| `examples/slop-vs-system.html` | Teaching artifact |
| `preview.html` | Visual catalog |

Optional: `.github/workflows/design.yml` for CI lint.

---

## After install

### 1. Wire up `tokens.css`

```html
<link rel="stylesheet" href="./tokens.css">
```

Place Cash Sans font files in `./fonts/` and uncomment the `@font-face` block at the top of `tokens.css`. Cash Sans is proprietary and must be self-hosted. Without the font files, the system falls back to the declared sans/mono stack.

### 2. Tell your agents about it

Add one line to your `README.md` or `AGENTS.md`:

> This project uses `soheil-ds`. Read `DESIGN.md` before generating any UI. Read `AGENTS.md` for code conventions.

Claude Code, Cursor, and Codex will pick it up automatically.

### 3. Verify

```bash
# Contract lint
npx @google/design.md lint DESIGN.md

# Implementation lint
node scripts/lint.mjs components/
```

Both should exit 0.

---

## Uninstall

```bash
rm -rf DESIGN.md AGENTS.md ANIMATION_RULES.md SKILL.md TASTE_LOG.md \
       CHANGELOG.md CONTRIBUTING.md quality-evaluator.md \
       design-tokens.json tokens.css \
       components scripts examples
rm -rf .github/workflows/design.yml
```

The system owns only the listed files. Nothing else.

---

## Updating

```bash
# npx path
npm create soheil-ds@latest -- --force

# curl path
curl -fsSL https://raw.githubusercontent.com/soheil/soheil-ds/main/install.sh | bash
```

Run the contract diff to see what changed:

```bash
npx @google/design.md diff DESIGN.md.backup DESIGN.md
```

---

## Troubleshooting

**"Files already exist"** — the installer refuses to overwrite. Either delete first, install into a subdir (`SOHEIL_DS_DEST=./ds`), or run with `--force`.

**"Could not find extracted tarball root"** — version tag doesn't exist. Check [releases](https://github.com/soheil/soheil-ds/releases).

**`lint.mjs` reports errors in your existing code** — that's the point. Fix the violations or update the rule in `quality-evaluator.md` with justification.
