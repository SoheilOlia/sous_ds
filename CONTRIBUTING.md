# Contributing to sous-ds

Thanks for caring. This system is deliberately strict; that strictness is what keeps the output from drifting. Contributions that tighten the contract are welcome. Contributions that loosen it need a strong case.

---

## Principles

1. **The system wins over preference.** If you disagree with a rule, open an issue. Don't route around it.
2. **No silent forks.** Adding a token, font, variant, or component requires a PR that updates `DESIGN.md`, `design-tokens.json`, `tokens.css`, and the relevant section of `CHANGELOG.md`. All four or none.
3. **Every rule has a source.** Taste signals trace to a file, image, or linked article in `TASTE_LOG.md`. If a PR introduces a rule without a source, the PR will be asked for one.
4. **Breakage is explicit.** Any change that flips a lint rule from `pass` to `fail` against previously-compliant code is a breaking change and bumps the minor version (pre-1.0) or major (post-1.0).

---

## PR workflow

### 1. Open an issue first for anything non-trivial

"Non-trivial" means any change that touches `DESIGN.md`, `design-tokens.json`, or adds/removes a component. Typo fixes, doc clarifications, and bug fixes in component internals can skip the issue step.

### 2. Branch naming

- `feat/` new capability
- `fix/` correction of a violated rule or bug
- `docs/` prose-only
- `chore/` tooling, CI, deps
- `tokens/` changes to the token schema or values

Example: `tokens/raise-muted-to-aa`.

### 3. Commits

Conventional Commits. `type(scope): subject`.

```
feat(toast): add action slot with callback
fix(tokens): raise text-muted to 4.55:1 (WCAG AA minimum)
docs(design): document contrast guarantees table
```

### 4. Before opening the PR

```bash
# Lint the contract
npx @google/design.md lint DESIGN.md

# Lint implementations
node scripts/lint.mjs components/

# Contract diff against main (if you touched DESIGN.md)
npx @google/design.md diff main:DESIGN.md HEAD:DESIGN.md
```

All must pass locally. CI runs them on every PR and blocks merge on failure.

### 5. PR description

Required sections:

- **Why** — the problem this solves. Link the issue.
- **What changed** — a short list. Token additions, removed components, etc.
- **Rule references** — which rule IDs in `quality-evaluator.md` are affected.
- **Source** — which taste entry in `TASTE_LOG.md` motivates the change. If new, add an ENTRY in the same PR.
- **Breaking?** — yes/no, and if yes, migration note.

### 6. Review

At least one maintainer review. Changes that touch `DESIGN.md` require two.

---

## Adding a new token

Tokens are the spine. Add with care.

```jsonc
// in design-tokens.json
"surface-warning": {
  "$value": "#3A2814",
  "$type": "color",
  "$description": "Warning surface. Used on dismissible alert banners only. 12.4:1 with text-primary. AAA."
}
```

Checklist:

- [ ] Token added to `design-tokens.json` with `$description`
- [ ] Matching `--ds-*` variable added to `tokens.css` (and `[data-theme="light"]` override if needed)
- [ ] Added to `DESIGN.md` YAML front matter
- [ ] Added to the appropriate `##` section in `DESIGN.md` with contrast ratios if it's a color
- [ ] Referenced from at least one component, or else documented as "reserved for future use"
- [ ] `CHANGELOG.md` entry under `### Added`

---

## Adding a new component

```
components/
└── NewThing.tsx
    NewThing.css
```

Checklist:

- [ ] Uses `var(--ds-*)` exclusively. Zero hardcoded values.
- [ ] Forwards refs (`React.forwardRef`).
- [ ] Has TypeScript props interface exported.
- [ ] Has a JSDoc block listing which rules it follows.
- [ ] Handles `prefers-reduced-motion` at the component level (beyond the global rule).
- [ ] Handles disabled and focus-visible states.
- [ ] Renders correctly at 44×44 minimum hit area on touch.
- [ ] Added to `components/index.ts` barrel.
- [ ] Reference usage added to `preview.html`.
- [ ] `CHANGELOG.md` entry under `### Added`.

---

## Removing a rule or token

Harder than adding. Requires:

1. Justification in the PR description (why this no longer serves the system).
2. Grep of the codebase and a list of every consumer.
3. Migration note in `CHANGELOG.md` under `### Changed` or `### Removed`.
4. Two maintainer approvals.

Tokens are never deleted without a deprecation period of at least one minor version.

---

## Taste disagreements

This system encodes opinions. Some are strong:

- **"Dark-mode cards have no shadow."** Defended in `DESIGN.md` → Elevation.
- **"`accent-live` is never a CTA."** Defended in `DESIGN.md` → Colors → Accent discipline.
- **"Inter is forbidden as the primary face."** Defended in `DESIGN.md` → Typography → Forbidden typefaces.

If you disagree, open an issue with:

1. The taste signal or source that motivates your position.
2. A rendered example (screenshot or CodePen) showing why the current rule fails.
3. A proposed new rule.

The maintainers will either accept, reject with reasoning, or propose a compromise. "I don't like it" is not a case. "Here's the source that disagrees" is.

---

## Reporting bugs

Bugs in the system: rules that contradict, tokens that fail contrast, components that violate their own documentation. File under `label: bug`.

Bugs in `@google/design.md` or `emilkowalski/skill`: file upstream. This system doesn't vendor those dependencies.

---

## License

Apache 2.0. Contributions are licensed under the same terms.

---

## Code of conduct

Standard. Be respectful. Disagree on taste, not on people.
