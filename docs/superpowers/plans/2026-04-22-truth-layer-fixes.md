# Sous_DS Truth-Layer Fixes — Priority 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Sous_DS repo match its own documentation, fix three verified contract-vs-reference contradictions, and unblock installation as a global skill.

**Architecture:** Three work streams, sequenced to avoid thrash.
1. **Foundation** — init git, add LICENSE/package.json/SKILL.md, reorganize flat root into declared folder structure, update lint.mjs + design.yml paths.
2. **Contract integrity** — resolve three verified bugs: accent-carrier contradiction, hardcoded values in "zero hardcoded" components, Button `sm` spec drift.
3. **Reference hygiene** — fix Toast accessibility (hit areas + focus), Pill tracking, stale TASTE_LOG source path.

**Tech Stack:** Node scripts (lint.mjs), plain CSS/TSX components, DTCG tokens (design-tokens.json → tokens.css), GitHub Actions YAML, `@google/design.md` CLI.

**Three things explicitly out of scope (tracked for Priority 2/3):**
- AI-native primitives (AgentStream, ToolCall, Citation, Transcript, TokenMeter)
- Visual regression, axe-core, Figma Code Connect
- Truth-layer lint rule (the "file path in docs must exist on disk" check) — queued as first task of Priority 3

---

## File Structure After This Plan

```
Sous_DS/
├── .git/                                  (new)
├── .github/workflows/
│   └── design.yml                         (moved from root)
├── components/                            (new dir, files moved)
│   ├── index.ts                           (moved from root)
│   ├── Button.tsx    / Button.css
│   ├── Card.tsx      / Card.css
│   ├── Pill.tsx      / Pill.css           (tracking fix)
│   ├── LiveDot.tsx   / LiveDot.css        (comment correction)
│   ├── Toast.tsx     / Toast.css          (a11y fix + token replacements)
│   └── DottedChart.tsx / DottedChart.css  (token replacements)
├── scripts/
│   └── lint.mjs                           (moved from root; path asserts updated)
├── examples/
│   └── slop-vs-system.html                (moved from root)
├── docs/superpowers/plans/
│   └── 2026-04-22-truth-layer-fixes.md    (this file)
├── Inspiration/                           (unchanged)
├── SKILL.md                               (new)
├── LICENSE                                (new — Apache-2.0)
├── package.json                           (new)
├── README.md                              (unchanged — already matches target layout)
├── DESIGN.md                              (accent-carrier rule updated)
├── AGENTS.md
├── ANIMATION_RULES.md
├── TASTE_LOG.md                           (L45 stale path + count fixed; ENTRY 006 appended)
├── CHANGELOG.md                           (v0.2.0 entry)
├── CONTRIBUTING.md
├── quality-evaluator.md                   (rule CL07 added for accent carriers)
├── design-tokens.json                     (new token IDs added)
├── tokens.css                             (new CSS vars added, matching DTCG)
└── preview.html                           (unchanged)
```

**Sous_DS_v1.0/** — older snapshot with stale state. Decision deferred to the user at end of plan (archive, delete, or keep as historical).

---

## Task 1: Initialize git repo and baseline commit

**Files:**
- Create: `.git/`, `.gitignore`

- [ ] **Step 1: Verify current state is not a git repo**

Run: `git -C /Users/soheil/Sous_DS rev-parse --is-inside-work-tree 2>&1`
Expected: error "not a git repository"

- [ ] **Step 2: Initialize git**

Run: `git -C /Users/soheil/Sous_DS init -b main`
Expected: `Initialized empty Git repository in /Users/soheil/Sous_DS/.git/`

- [ ] **Step 3: Write .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
.env
.env.local
```

- [ ] **Step 4: Baseline commit of current (flawed) state so diff review is possible**

Run:
```
git -C /Users/soheil/Sous_DS add -A
git -C /Users/soheil/Sous_DS commit -m "chore: baseline before truth-layer fixes"
```
Expected: commit created, all current files tracked.

---

## Task 2: Add LICENSE (Apache-2.0)

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Write Apache-2.0 license text**

Use the canonical text from https://www.apache.org/licenses/LICENSE-2.0.txt with copyright line:
`Copyright 2026 Soheil Yasrebi`

- [ ] **Step 2: Verify README reference resolves**

Run: `grep -n "LICENSE" /Users/soheil/Sous_DS/README.md`
Expected: README.md line ~172 references `LICENSE` — file now exists.

- [ ] **Step 3: Commit**

```
git add LICENSE
git commit -m "chore: add Apache-2.0 LICENSE referenced by README"
```

---

## Task 3: Create SKILL.md

**Files:**
- Create: `SKILL.md`

- [ ] **Step 1: Draft frontmatter**

```markdown
---
name: sous-ds
description: Use when building UI, components, dashboards, data displays, agent/LLM interfaces, or any visual surface in a React/Tailwind/web project. Enforces dark-first, monospace-for-data, single-semantic-accent (#E5533C for live/now/active only, never CTA), 1px borders over shadows, sub-300ms motion, WCAG AA floor. Triggers on: "design", "UI", "component", "build page", "dashboard", "agent UI", Figma URLs, screenshots of interfaces.
---
```

- [ ] **Step 2: Draft body**

Body must:
- Instruct agent to read in order: DESIGN.md → AGENTS.md → ANIMATION_RULES.md → TASTE_LOG.md → quality-evaluator.md
- List the refusal set (gradients, rounded-20px dark cards, Inter as primary, shadow blur ≥25px, `transition: all`, CTA with `--ds-accent-live`, two live dots with different meanings in one viewport, etc.) — copy from AGENTS.md section "What you should refuse to generate"
- State the token discipline: `var(--ds-*)` for every color/size/radius/duration/ease; never inline; never hardcode
- Tell agent: if a value needed is not a token, propose a token — do not improvise
- Instruct to run `node scripts/lint.mjs components/ examples/` before committing

- [ ] **Step 3: Verify lint.mjs SKIP_FILES already includes SKILL.md**

Run: `grep -n '"SKILL.md"' /Users/soheil/Sous_DS/lint.mjs`
Expected: one match (already present from original implementation).

- [ ] **Step 4: Commit**

```
git add SKILL.md
git commit -m "feat: add SKILL.md entry point for npx skills install"
```

---

## Task 4: Reorganize flat root into declared folder structure

**Files:**
- Move: `Button.*`, `Card.*`, `Pill.*`, `LiveDot.*`, `Toast.*`, `DottedChart.*`, `index.ts` → `components/`
- Move: `lint.mjs` → `scripts/lint.mjs`
- Move: `slop-vs-system.html` → `examples/slop-vs-system.html`
- Move: `design.yml` → `.github/workflows/design.yml`

- [ ] **Step 1: Create target directories**

Run:
```
mkdir -p /Users/soheil/Sous_DS/components
mkdir -p /Users/soheil/Sous_DS/scripts
mkdir -p /Users/soheil/Sous_DS/examples
mkdir -p /Users/soheil/Sous_DS/.github/workflows
```

- [ ] **Step 2: Move component files using `git mv` to preserve history**

Run (from repo root):
```
git mv Button.tsx Button.css Card.tsx Card.css Pill.tsx Pill.css LiveDot.tsx LiveDot.css Toast.tsx Toast.css DottedChart.tsx DottedChart.css index.ts components/
git mv lint.mjs scripts/lint.mjs
git mv slop-vs-system.html examples/slop-vs-system.html
git mv design.yml .github/workflows/design.yml
```

- [ ] **Step 3: Verify no files remain misplaced**

Run: `ls /Users/soheil/Sous_DS/*.tsx /Users/soheil/Sous_DS/*.css /Users/soheil/Sous_DS/lint.mjs 2>&1`
Expected: all results say "No such file or directory" (three failures = success).

Run: `ls /Users/soheil/Sous_DS/components/`
Expected: 13 files (6 .tsx + 6 .css + index.ts).

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "refactor: move files into declared folder structure (components/, scripts/, examples/, .github/workflows/)"
```

---

## Task 5: Update lint.mjs path assumptions

**Files:**
- Modify: `scripts/lint.mjs`

- [ ] **Step 1: Search lint.mjs for hardcoded path guards**

Run: `grep -n "components/\|scripts/\|examples/" /Users/soheil/Sous_DS/scripts/lint.mjs`

Expected: identify any rules that only fire when path matches `components/` (the prior critique flagged some).

- [ ] **Step 2: Remove or generalize path guards**

For each rule that had a path check: replace with scanning whatever the CLI args resolve to. Rules should run on every file passed in, not conditionally on folder name.

Rationale: the rules are about CSS/TSX content, not about directory. A hardcoded path guard means the rule silently skips misnamed-but-identical files.

- [ ] **Step 3: Update usage example in file header**

```
 * Usage:
 *   node scripts/lint.mjs components/
 *   node scripts/lint.mjs components/ examples/
 *   node scripts/lint.mjs --format text components/
```

(paths already correct — verify they are and leave as-is if so)

- [ ] **Step 4: Smoke-test**

Run: `node /Users/soheil/Sous_DS/scripts/lint.mjs /Users/soheil/Sous_DS/components/`
Expected: JSON output listing current violations (the ones Task 8, 9, 10, 11, 12 will fix). Exit code 1.

Record the list of findings here as the "before" state for Task 14 verification.

- [ ] **Step 5: Commit**

```
git add scripts/lint.mjs
git commit -m "fix(lint): remove path guards; rules now run on any file passed in"
```

---

## Task 6: Update design.yml CI paths

**Files:**
- Modify: `.github/workflows/design.yml`

- [ ] **Step 1: Read current design.yml**

Run: `cat /Users/soheil/Sous_DS/.github/workflows/design.yml`

Identify any references to old flat paths (e.g. `node lint.mjs` should become `node scripts/lint.mjs`). Identify paths-filter triggers.

- [ ] **Step 2: Update paths**

For each step that runs a script: ensure the path matches new layout.
- `node scripts/lint.mjs components/ examples/`
- `npx @google/design.md lint DESIGN.md`
- Token-parity check: verify script location

- [ ] **Step 3: Update `on.paths` triggers**

If the workflow has `on: pull_request: paths: [...]`, ensure the glob covers `components/**`, `scripts/**`, `tokens.css`, `design-tokens.json`, `DESIGN.md`.

- [ ] **Step 4: Commit**

```
git add .github/workflows/design.yml
git commit -m "fix(ci): update paths to match new folder structure"
```

---

## Task 7: Add package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "@soheil/sous-ds",
  "version": "0.2.0",
  "description": "Dark-first, data-dense, restraint-led design system for AI coding agents. Monospace for data, 1px borders over shadows, one semantic accent, motion under 300ms.",
  "license": "Apache-2.0",
  "author": "Soheil Yasrebi",
  "type": "module",
  "main": "components/index.ts",
  "bin": {
    "sous-lint": "./scripts/lint.mjs"
  },
  "exports": {
    ".": "./components/index.ts",
    "./tokens.css": "./tokens.css",
    "./tokens": "./design-tokens.json",
    "./skill": "./SKILL.md"
  },
  "files": [
    "SKILL.md",
    "DESIGN.md",
    "AGENTS.md",
    "ANIMATION_RULES.md",
    "TASTE_LOG.md",
    "quality-evaluator.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "tokens.css",
    "design-tokens.json",
    "components/",
    "scripts/",
    "examples/",
    "preview.html",
    "LICENSE"
  ],
  "scripts": {
    "lint": "node scripts/lint.mjs components/ examples/",
    "lint:contract": "npx @google/design.md lint DESIGN.md"
  },
  "keywords": ["design-system", "tokens", "dtcg", "ai-agent", "skill", "dark-mode"],
  "repository": { "type": "git", "url": "https://github.com/soheil/sous-ds" }
}
```

Version bumps to `0.2.0` because the folder reorganization is a breaking change to anyone who imported from root.

- [ ] **Step 2: Verify `bin` path is executable**

Run: `head -1 /Users/soheil/Sous_DS/scripts/lint.mjs`
Expected: `#!/usr/bin/env node`

Run: `chmod +x /Users/soheil/Sous_DS/scripts/lint.mjs`

- [ ] **Step 3: Commit**

```
git add package.json
git commit -m "feat: add package.json for npm distribution (@soheil/sous-ds)"
```

---

## Task 8: Resolve accent-carrier contradiction

**Root cause:** [LiveDot.tsx:14](../../LiveDot.tsx) and [LiveDot.css:2](../../LiveDot.css) claim exclusive rights to `--ds-accent-live`, but [Pill.css:41](../../Pill.css) and [Toast.css:93](../../Toast.css) also use it. Verified.

**Resolution:** Allowed carriers pattern, not exclusive primitive. Document three explicit carriers; everything else violates.

**Files:**
- Modify: `DESIGN.md` (around line 218, 363, 390, 411)
- Modify: `components/LiveDot.tsx` (line 14 comment)
- Modify: `components/LiveDot.css` (line 2 comment)
- Modify: `quality-evaluator.md` (add rule CL07)
- Modify: `scripts/lint.mjs` (implement rule CL07)

- [ ] **Step 1: Write failing lint test for CL07**

Add to scripts/lint.mjs a rule that:
- Scans any CSS file for `var(--ds-accent-live)`
- Passes only if the filename is one of: `LiveDot.css`, `Pill.css`, `Toast.css`
- Else: error severity, message `CL07: --ds-accent-live used outside allowed carriers (LiveDot, Pill, Toast)`

Create a fixture in `scripts/__fixtures__/bad-accent.css`:
```css
.random { background: var(--ds-accent-live); }
```

- [ ] **Step 2: Run rule against fixture — expect fail**

Run: `node scripts/lint.mjs scripts/__fixtures__/bad-accent.css`
Expected: exit 1, finding CL07 on `bad-accent.css`.

- [ ] **Step 3: Run rule against real components — expect pass**

Run: `node scripts/lint.mjs components/`
Expected: CL07 does not fire on LiveDot.css, Pill.css, or Toast.css.

- [ ] **Step 4: Update DESIGN.md accent section**

Edit the "One accent, one meaning" section (around L218, L363, L390, L411). Add explicit block:

```markdown
### Accent carriers (exhaustive list)

`accent-live` (#E5533C) may only appear as a background on:
- `LiveDot` — the 6px dot marking "now/live/active"
- `Pill[live]` — status pill marking an active temporal state (`data-live` attribute)
- `Toast[tone="live"]` — toasts reporting live state changes

Any other use is a violation. Generating new components that carry the accent
requires a PR updating this list and the `CL07` rule in `quality-evaluator.md`.
```

- [ ] **Step 5: Update LiveDot.tsx and LiveDot.css comments**

Replace the "the only place" claim in both files with:

```
LiveDot — the canonical accent carrier. Pill[live] and Toast[tone="live"]
are also permitted carriers under the same semantic rule (see DESIGN.md
"Accent carriers"). Any other use of --ds-accent-live is a CL07 violation.
```

- [ ] **Step 6: Update quality-evaluator.md**

Add rule under Color section:
```markdown
### CL07 — Accent carrier
**Severity:** error
**Rule:** `--ds-accent-live` may appear only in `LiveDot.css`, `Pill.css`, `Toast.css`.
**Why:** The accent has one semantic meaning (live/active/now). Carriers are an exhaustive list.
**Fix:** Remove the accent from the violating file. If the component legitimately needs to express "live" status, compose with `<LiveDot>` or use the `data-live` / `tone="live"` variant on Pill/Toast.
```

- [ ] **Step 7: Verify no regression**

Run: `node scripts/lint.mjs components/ examples/`
Expected: CL07 does not fire anywhere in components/ or examples/.

- [ ] **Step 8: Commit**

```
git add DESIGN.md components/LiveDot.tsx components/LiveDot.css quality-evaluator.md scripts/lint.mjs scripts/__fixtures__/
git commit -m "fix(contract): resolve accent-carrier contradiction; add CL07 lint rule"
```

---

## Task 9: Tokenize hardcoded values in "zero hardcoded" components

**Root cause:** [Button.css:3](../../Button.css) claims "Every value is a token." Verified violations:
- Button.css: `100ms` (L33), `14px` ×2 (L105-106, L122-123)
- Toast.css: `6px` ×2 (L89-90), `100ms` (L136), `16px` (L147), `18px` (L118)
- DottedChart.css: `6px` (L26-27), `9px` (L46)
- DottedChart.tsx: `55ms`, `18ms` (L32/38)

**Resolution:** Add tokens for each repeated/semantic literal; replace usages.

**Files:**
- Modify: `design-tokens.json` (add 6 new tokens)
- Modify: `tokens.css` (add matching CSS vars)
- Modify: `components/Button.css`
- Modify: `components/Toast.css`
- Modify: `components/DottedChart.css`
- Modify: `components/DottedChart.tsx`

- [ ] **Step 1: Add tokens to design-tokens.json**

```json
{
  "duration": {
    "press":    { "$value": "100ms", "$type": "duration",
                  "$description": "Press state feedback. Shorter than --dur-micro; the visual 'click' of a button." }
  },
  "size": {
    "icon-xs":  { "$value": "6px",  "$type": "dimension",
                  "$description": "Dot motif diameter (LiveDot, DottedChart cells, Toast status dot)." },
    "icon-sm":  { "$value": "14px", "$type": "dimension",
                  "$description": "Icon inside button/toast action." },
    "icon-md":  { "$value": "16px", "$type": "dimension",
                  "$description": "Toast leading icon." }
  },
  "stagger": {
    "col":      { "$value": "55ms", "$type": "duration",
                  "$description": "DottedChart per-column reveal stagger." },
    "row":      { "$value": "18ms", "$type": "duration",
                  "$description": "DottedChart per-row reveal stagger." }
  },
  "type": {
    "chart-label": { "$value": "9px", "$type": "dimension",
                     "$description": "DottedChart axis label; only dimension below label/11px, reserved for compact chart axes." }
  }
}
```

(Nest these under the existing DTCG groups; adjust the JSON path to match current file structure.)

- [ ] **Step 2: Add matching CSS vars to tokens.css**

```css
/* Durations — additions */
--ds-dur-press:    100ms;

/* Icon sizes — additions */
--ds-icon-xs:      6px;
--ds-icon-sm:      14px;
--ds-icon-md:      16px;

/* Stagger — additions */
--ds-stagger-col:  55ms;
--ds-stagger-row:  18ms;

/* Type — addition */
--ds-type-chart-label-size: 9px;
```

- [ ] **Step 3: Replace literals in Button.css**

- Replace `100ms` in the transition list with `var(--ds-dur-press)`
- Replace `width: 14px; height: 14px;` (both occurrences on icon rules) with `width: var(--ds-icon-sm); height: var(--ds-icon-sm);`

- [ ] **Step 4: Replace literals in Toast.css**

- `width: 6px; height: 6px;` → `width: var(--ds-icon-xs); height: var(--ds-icon-xs);`
- `transform 100ms ease` → `transform var(--ds-dur-press) var(--ds-ease-out)`
- `font-size: 16px;` → `font-size: var(--ds-icon-md);` (if it's the icon rule) OR tokenize as body-md if it's body text — verify context
- `line-height: 18px;` — check if this pairs with a tokenized font-size; if standalone, tokenize as `--ds-type-body-sm-line` (if that token exists) or inline-match the body-sm line-height variable

- [ ] **Step 5: Replace literals in DottedChart.css**

- `width: 6px; height: 6px;` → `var(--ds-icon-xs)` both
- `font-size: 9px;` → `var(--ds-type-chart-label-size)`

- [ ] **Step 6: Replace literals in DottedChart.tsx**

In the stagger computation at line 32/38, replace the literals:
```tsx
const delay = `${col * 55 + row * 18}ms`;
```
with token references via CSS custom properties:
```tsx
style={{
  animationDelay: `calc(${col} * var(--ds-stagger-col) + ${row} * var(--ds-stagger-row))`
}}
```

- [ ] **Step 7: Run lint — expect zero hardcoded-value findings in these files**

Run: `node scripts/lint.mjs components/`
Expected: rules TY/MO/LY that detect literal `px`/`ms` outside of tokens.css no longer fire on Button.css, Toast.css, DottedChart.css, DottedChart.tsx.

- [ ] **Step 8: Run contract lint**

Run: `npx @google/design.md lint /Users/soheil/Sous_DS/DESIGN.md`
Expected: pass (no schema violations from new tokens — DESIGN.md's YAML front matter does not need to include these since they aren't promoted to the contract yet; they live only in design-tokens.json + tokens.css).

- [ ] **Step 9: Commit**

```
git add design-tokens.json tokens.css components/Button.css components/Toast.css components/DottedChart.css components/DottedChart.tsx
git commit -m "fix(tokens): tokenize hardcoded durations, icon sizes, stagger timings, chart label"
```

---

## Task 10: Resolve Button `size="sm"` spec drift

**Root cause:** [Button.css:52](../../Button.css) ships `sm` at 32px but DESIGN.md canonical height is 40px with no `sm` variant documented.

**Decision required:** keep or remove `sm`?

**Recommendation:** keep and document. 32px is a real dense-UI need (table rows, toolbar chrome). Snaps to spacing scale (space-7 = 32). Removing would break downstream.

**Files:**
- Modify: `DESIGN.md` (button section around L343)

- [ ] **Step 1: Update DESIGN.md button section**

Add `sm` to the height rule. Example prose:

```markdown
### Button

Heights (exhaustive):
- `md` (default) — 40px. Primary use.
- `sm` — 32px. Dense surfaces only: table rows, toolbars, inline controls.
  Minimum hit area still enforced via invisible padding to 44px on touch.

Padding: `md` = 16px horizontal; `sm` = 12px horizontal.

Focus: see "Focus" section; identical ring for both sizes.
```

- [ ] **Step 2: Verify Button.css hit-area rule**

Read: Button.css around L46. Expected existing rule: `height: max(100%, 44px);` inside a touch/pointer media query. Confirm this rule applies to `sm` as well (no data-size override below it).

If missing, add:
```css
@media (pointer: coarse) {
  .ds-btn[data-size="sm"] { height: 44px; padding-block: calc((44px - 32px) / 2); }
}
```

- [ ] **Step 3: Run contract lint**

Run: `npx @google/design.md lint DESIGN.md`
Expected: pass.

- [ ] **Step 4: Commit**

```
git add DESIGN.md components/Button.css
git commit -m "fix(contract): document Button size=sm (32px); enforce 44px touch hit area"
```

---

## Task 11: Fix Toast accessibility (hit areas + focus)

**Root cause:** [Toast.css:131](../../Toast.css) action is 24px tall. [Toast.css:149-150](../../Toast.css) close is 20×20 with no `:focus-visible`. Fails AGENTS.md floor.

**Resolution:** visual size stays (24px action, 20px close icon), but hit-target padded to 44×44 via negative-margin-inside or padding pattern. Add explicit `:focus-visible` ring matching Button.

**Files:**
- Modify: `components/Toast.css`
- Modify: `components/Toast.tsx` (if focus target needs a wrapper button)

- [ ] **Step 1: Inspect current Toast action/close markup**

Read: components/Toast.tsx. Identify the action button and close button elements.

- [ ] **Step 2: Update Toast.css for action button**

Change height `24px` rule: keep visual 24px via background/line-height, but ensure the clickable element is `min-height: 44px` with invisible padding. Pattern:

```css
.ds-toast__action {
  min-height: 44px;
  padding-block: calc((44px - 24px) / 2);
  padding-inline: var(--ds-space-4);
  /* ... existing styling */
}

.ds-toast__action:focus-visible {
  outline: 2px solid var(--ds-accent-live);
  outline-offset: 2px;
  border-radius: var(--ds-radius-sm);
}
```

Use the same focus ring pattern as Button. Confirm the ring color — check Button.css for the canonical rule. The ring uses `--ds-accent-live` (this is one of the few places other than the three carriers where the accent is used; document as CL07 exception or use `--ds-text-primary` for focus).

**Decision on focus color:** accent is the canonical focus ring across the system per DESIGN.md `$description`s. Focus is a transient state carrier, not content. Document as CL07 exception: "CL07 excludes `outline`/`box-shadow` focus properties in any `:focus-visible` selector."

Update lint rule CL07 (Task 8 Step 6) to include this exception.

- [ ] **Step 3: Update Toast.css for close button**

```css
.ds-toast__close {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  /* icon glyph remains 20×20 via the inner svg/span */
}

.ds-toast__close svg,
.ds-toast__close > span {
  width: 20px;
  height: 20px;
}

.ds-toast__close:focus-visible {
  outline: 2px solid var(--ds-accent-live);
  outline-offset: 2px;
  border-radius: var(--ds-radius-sm);
}
```

- [ ] **Step 4: Re-run CL07 lint after adding focus-ring exception**

Run: `node scripts/lint.mjs components/`
Expected: CL07 does not fire on Toast.css for the new focus rules.

- [ ] **Step 5: Visual smoke test**

Open preview.html in a browser. Tab into a toast. Verify:
- Close button receives visible focus ring
- Action button receives visible focus ring
- Click hit area feels ≥44px on a phone-sized viewport (use devtools device emulation)

- [ ] **Step 6: Commit**

```
git add components/Toast.css components/Toast.tsx quality-evaluator.md scripts/lint.mjs
git commit -m "fix(a11y): Toast action/close meet 44x44 hit area + visible focus ring (matches Button)"
```

---

## Task 12: Fix Pill letter-spacing 0.04em → 0.08em

**Root cause:** [Pill.css:18](../../Pill.css) uses 0.04em. Label token is 0.08em. Pills are uppercase; rule says "uppercase labels need loosened tracking."

**Resolution:** use the label token directly — don't duplicate the value.

**Files:**
- Modify: `components/Pill.css`

- [ ] **Step 1: Verify label letter-spacing token exists**

Run: `grep -n "letter-spacing\|letterSpacing" /Users/soheil/Sous_DS/tokens.css`

If a `--ds-type-label-tracking: 0.08em;` var exists, use it. If not, add:

```css
--ds-type-label-tracking: 0.08em;
```
to tokens.css. And matching entry in design-tokens.json under typography.label.

- [ ] **Step 2: Update Pill.css**

Replace `letter-spacing: 0.04em;` with `letter-spacing: var(--ds-type-label-tracking);`

- [ ] **Step 3: Visual smoke test**

Open preview.html, look at Pill rendering. Confirm tracking visually loosened — uppercase text should feel "uncramped."

- [ ] **Step 4: Commit**

```
git add components/Pill.css tokens.css design-tokens.json
git commit -m "fix(pill): uppercase tracking from 0.04em to 0.08em (matches label contract)"
```

---

## Task 13: Fix TASTE_LOG.md stale path + count; append ENTRY 006

**Root cause:** [TASTE_LOG.md:45](../../TASTE_LOG.md) says `/Users/soheil/Desktop/Inspiration` (8 images). Actual: `Inspiration/` inside repo, 18 files.

**Resolution:** The file is append-only. Do not rewrite ENTRY 002. Add ENTRY 006 (or 007, whatever's next) that explicitly supersedes the stale fact, with a cross-reference line inserted at L45.

**Files:**
- Modify: `TASTE_LOG.md`

- [ ] **Step 1: Determine next ENTRY number**

Run: `grep -n "^## ENTRY" /Users/soheil/Sous_DS/TASTE_LOG.md`
Expected: list of existing entries. Use the next sequential number.

- [ ] **Step 2: Insert superseding annotation at L45**

TASTE_LOG is append-only for content, but a single-line annotation pointing to the superseding entry is acceptable (precedent: v1.1 correction pattern already in the file). Add on the line below L45:

```markdown
**Source:** `/Users/soheil/Desktop/Inspiration` (8 images)
> _Superseded by ENTRY 00N — actual source is `Inspiration/` inside the repo; 18 files (17 JPEG + 1 GIF)._
```

- [ ] **Step 3: Append ENTRY 00N at end of file**

```markdown
## ENTRY 00N — Inspiration provenance correction
**Date:** 2026-04-22
**Type:** Correction
**Supersedes:** ENTRY 002 source/count

### What changed
ENTRY 002 stated the inspiration source as `/Users/soheil/Desktop/Inspiration` with 8 images. Actual state on 2026-04-22: inspiration lives at `Inspiration/` inside the repo, 18 files (17 .jpg + 1 .gif), each content-addressed by filename hash.

### Why this matters
Taste provenance must be auditable. Agents grounding in "the 8 desktop images" will miss 10 files and lose the synthesis they represent.

### What did not change
The cross-image synthesis in ENTRY 002 (the canonical taste principles derived from the set) still holds. The expanded count reinforces the pattern rather than contradicting it — manual re-audit of the extra 10 files showed the same dot motif, mono-for-data, restraint signals.

### File inventory (2026-04-22)
Run `ls Inspiration/` to enumerate. 18 total: 17 `.jpg`, 1 `.gif`, 1 `.png` (videoframe).

### Correction to the unblock table (ENTRY 004 / L148)
- Emil's full skill output: `emil-design-eng` skill is installed globally at `~/.claude/skills/emil-design-eng`. Status remains "ingestion pending" because the repo has not extracted the component-design rules into TASTE_LOG. Skill installation ≠ content ingestion. Keep this in the pending table.
```

- [ ] **Step 4: Commit**

```
git add TASTE_LOG.md
git commit -m "docs(taste-log): correct Inspiration path/count via ENTRY 00N; clarify Emil skill status"
```

---

## Task 14: Final verification pass

**Goal:** Confirm every change holds together. No task-completion claims without running the actual check.

- [ ] **Step 1: Run implementation lint on all scannable paths**

Run: `node /Users/soheil/Sous_DS/scripts/lint.mjs /Users/soheil/Sous_DS/components/ /Users/soheil/Sous_DS/examples/`
Expected: JSON output. No `"severity": "error"` entries. Warnings acceptable.

Compare to the "before" state recorded in Task 5 Step 4. Show deltas.

- [ ] **Step 2: Run contract lint**

Run: `npx @google/design.md lint /Users/soheil/Sous_DS/DESIGN.md`
Expected: pass.

- [ ] **Step 3: Run token parity check**

For every token in design-tokens.json, verify a matching CSS var exists in tokens.css. Quick check:

```bash
node -e '
const fs = require("fs");
const json = JSON.parse(fs.readFileSync("/Users/soheil/Sous_DS/design-tokens.json","utf8"));
const css  = fs.readFileSync("/Users/soheil/Sous_DS/tokens.css","utf8");
const flatKeys = (obj, prefix="") => Object.entries(obj).flatMap(([k,v]) =>
  v && typeof v === "object" && "$value" in v ? [`${prefix}${k}`] :
  v && typeof v === "object" ? flatKeys(v, `${prefix}${k}-`) : []);
const keys = flatKeys(json);
const missing = keys.filter(k => !css.includes(`--ds-${k}`));
console.log(missing.length === 0 ? "parity-ok" : { missing });
'
```
Expected: `parity-ok`.

- [ ] **Step 4: Verify no fictional paths in README**

For each path mentioned in README's file map, check existence:

```bash
for p in SKILL.md DESIGN.md AGENTS.md ANIMATION_RULES.md TASTE_LOG.md CHANGELOG.md CONTRIBUTING.md quality-evaluator.md design-tokens.json tokens.css components/index.ts components/Button.tsx components/Button.css components/Card.tsx components/Card.css components/Pill.tsx components/Pill.css components/LiveDot.tsx components/LiveDot.css components/Toast.tsx components/Toast.css components/DottedChart.tsx components/DottedChart.css scripts/lint.mjs examples/slop-vs-system.html preview.html .github/workflows/design.yml LICENSE package.json; do
  [ -f "/Users/soheil/Sous_DS/$p" ] && echo "✓ $p" || echo "✗ $p MISSING"
done
```
Expected: every line starts with `✓`. Any `✗` is a regression and blocks completion.

- [ ] **Step 5: Bump CHANGELOG.md**

Append v0.2.0 entry summarizing:
- Folder reorganization (breaking)
- Accent-carrier rule clarified; CL07 added
- Hardcoded values tokenized
- Toast a11y fixes
- Pill tracking fix
- TASTE_LOG ENTRY 00N correction
- SKILL.md / LICENSE / package.json added

- [ ] **Step 6: Final commit**

```
git add CHANGELOG.md
git commit -m "chore: release v0.2.0 — truth-layer fixes, installable skill package"
git tag v0.2.0
```

- [ ] **Step 7: Surface remaining decisions to the user**

Report to user:
- `Sous_DS_v1.0/` sibling folder still exists with stale state. Decision: archive, delete, or keep?
- Priority 2 (AI-native primitives) and Priority 3 (enforcement loops) are next plans.
- Truth-layer lint rule (verify docs file-paths match disk) — first task of Priority 3 plan.

---

## Out of scope (explicit)

These are valuable but deferred to Priority 2 and 3 plans:

- **AI-native primitives:** AgentStream, ToolCall, Citation, Transcript, TokenMeter, ConfidenceBar, DiffBlock, Thinking
- **Visual regression:** Storybook/Ladle + Playwright screenshot diffs + Chromatic
- **A11y automation:** axe-core in CI, automated contrast pair computation, VoiceOver smoke scripts
- **Figma integration:** Code Connect `.figma.ts` files, Figma variables sync via MCP
- **Semantic token tier:** raw → semantic → component tiering with generated TypeScript types
- **Multi-framework:** SwiftUI (Arcade-parity), Jetpack Compose, shadcn adapter, Tailwind plugin
- **Multi-agent distribution:** Goose recipe, Codex-specific manifest, `install.sh` that drops correct file per agent
- **Taste modes:** splitting inspiration into `instrument-dark`, `editorial-grid-light`, `soft-paper-mobile` variants with shared tokens but divergent surface rules
- **Truth-layer lint rule:** first task of Priority 3. Scans .md files for referenced file paths; fails if any path doesn't exist on disk. Would have prevented this entire audit chain.
- **npm publish workflow:** GitHub Actions release workflow using `changesets` for semver bumps and `npm publish` on tag.

---

## Rollback

Every task commits independently. To roll back any single fix:

```
git log --oneline
git revert <hash>
```

The baseline commit (Task 1 Step 4) lets you diff the whole plan's effect:

```
git diff <baseline-hash>..HEAD
```
