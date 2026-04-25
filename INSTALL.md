# Install

`sous-ds` ships three install paths, one for each consumer type. Pick the one that matches what you're building.

---

## 1. React app (most common)

Install the npm package. Components are tree-shakeable ESM with full TypeScript types; styles are one bundled CSS file.

```bash
npm install sous-ds
# or: pnpm add sous-ds / yarn add sous-ds / bun add sous-ds
```

Load the stylesheet once at the app root (the tokens + every component's CSS, in the right order):

```tsx
// app/layout.tsx or src/main.tsx or similar
import "sous-ds/styles.css";
```

Then use components anywhere:

```tsx
import { Button, Card, LiveDot, DottedChart } from "sous-ds";

export function Panel() {
  return (
    <Card sectionNumber="01" label="Agents" title="Running now">
      <LiveDot labels={["AGENTING", "WORKING", "THINKING"]} />
      <Button variant="primary">Run again</Button>
    </Card>
  );
}
```

If you only want the token layer and plan to author your own components, import `sous-ds/tokens.css` instead of `sous-ds/styles.css`.

### Peer dependency

React 18 or 19. `npm` will warn if missing; your app almost certainly already has it.

### Subpath imports

| Subpath | Purpose |
|---|---|
| `sous-ds` | Everything (components + motion primitive) |
| `sous-ds/components` | Same as root — exists for explicit intent |
| `sous-ds/motion` | Motion primitive only (tween, typewriter, rotateLabels, stagger, easings) |
| `sous-ds/styles.css` | Every component's CSS, concatenated. Import once |
| `sous-ds/tokens.css` | Just the `--ds-*` custom properties |
| `sous-ds/tailwind` | Tailwind preset (see below) |
| `sous-ds/tokens` | DTCG JSON tokens (machine-readable source) |
| `sous-ds/refusals` | Machine-readable refusal corpus for agent linting |
| `sous-ds/skill` | SKILL.md path for agent tooling |

---

## 2. Tailwind CSS app

Extend your Tailwind config with the preset. Every `--ds-*` token becomes a theme value (e.g. `bg-ds-surface`, `text-ds-primary`, `gap-ds-5`, `rounded-ds-md`, `duration-ds-standard`).

```js
// tailwind.config.cjs
const sousPreset = require("sous-ds/tailwind");

module.exports = {
  presets: [sousPreset],
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
};
```

Load the token layer once:

```css
/* src/global.css */
@import "sous-ds/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Now you can write `className="bg-ds-surface text-ds-text-primary rounded-ds-md p-ds-5"` and every class resolves to a `var(--ds-*)` at runtime — overriding a token in CSS propagates through every utility automatically.

Using both the Tailwind preset and the React components? Import `sous-ds/styles.css` for component styles and `sous-ds/tokens.css` gets picked up by the Tailwind utilities — or use only `sous-ds/styles.css` (it includes the tokens).

---

## 3. Agent skill (Claude Code / Codex / Goose / etc.)

The contract lives in these files:

- `SKILL.md` — agent entrypoint
- `DESIGN.md` — canonical design contract
- `AGENTS.md` — code-generation rules
- `ANIMATION_RULES.md` — motion contract
- `TASTE_LOG.md` — taste memory
- `refusals.json` — machine-readable refusal corpus
- `design-tokens.json` + `tokens.css` — tokens
- `components/` — reference implementations
- `quality-evaluator.md` — lint rule IDs

### Option A: One-line installer

```bash
curl -fsSL https://raw.githubusercontent.com/SoheilOlia/sous_ds/main/install.sh | bash
```

Drops the contract files into the current directory. Set `SOUS_DS_DEST=./design-system` to install into a subdirectory. Set `SOUS_DS_INCLUDE_CI=1` to also copy `.github/workflows/design.yml`.

### Option B: npm (works for Goose, Codex, Claude Code)

If the agent already has access to an npm-installed project, everything the agent needs to read is inside the published package:

```bash
npm install sous-ds
```

Point the agent at `node_modules/sous-ds/SKILL.md` (or add a symlink at repo root). Every contract file ships with the package.

### Option C: Clone

```bash
git clone https://github.com/SoheilOlia/sous_ds.git
```

Then point your agent's skill loader at the clone.

---

## Verification

Run before shipping any change that touches the system:

```bash
npm run lint          # contract lint + implementation lint
npm run pack:check    # verify release tarball contents
npm run build         # produce dist/
```

---

## Publishing (maintainers)

```bash
npm run build         # build dist/
npm run verify        # lint + pack check
npm publish           # requires 2FA for public packages
git push --tags       # after version bump
```

`prepublishOnly` runs the build automatically if you forget.
