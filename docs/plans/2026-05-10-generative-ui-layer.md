---
name: sous-ds generative UI layer
status: draft
date: 2026-05-10
owner: SoheilOlia + Claude
target_version: v0.10.0
brief: ../../docs/plans/generative-ui-brief.md (inline in chat)
parent_specs:
  - docs/specs/sous-ds-v2.md
  - docs/specs/sous-ds-v2-composition-recipes.md
  - docs/specs/sous-ds-v2-voice.md
---

# Plan — sous-ds → Generative UI

## Goal

Add a runtime generative-UI layer to sous-ds so a plain-language prompt produces a live, on-brand page composed from existing components, and follow-up prompts update sections in place. No new visual primitives; new contract between an LLM planner and a deterministic renderer.

## Architecture (one paragraph)

Three layers, deterministic boundaries:

1. **Schema** (`docs/specs/generative-ui-schema.json`) — JSON Schema draft-07. The wire contract between planner and renderer. Per-recipe shapes, every string length-bounded, voice rules encoded as `pattern` constraints where machine-checkable.
2. **Planner system prompt** (`docs/specs/generative-ui-planner.md`) — self-contained markdown / system prompt. Encodes the six recipes, the design dials, the intent→component decision tree, the voice rules, and the refusal corpus subset. Output: schema-valid JSON, nothing else.
3. **Renderer** (`components/GenerativeRenderer.tsx` + `.css`) — typed React component. Switches on `recipe`; each branch composes sous-ds components. No dynamic import, no LLM at render time. All styling via `var(--ds-*)`. Accent carriers only through sanctioned components (CL07-safe).

Plus a **demo playground** (`examples/generative-ui-playground.*`) that wires the planner (via Anthropic API) to the renderer.

## Drift from the brief, reconciled

The brief is a few weeks out of date in places. Per its own "if recipe spec contradicts the brief, spec wins" clause:

| Brief says | Reality | Plan adopts |
|---|---|---|
| Ship as v0.8.0 | HEAD is v0.9.0 | **v0.10.0** |
| `state: done\|active\|queued` | `DotTimeline.BucketState = done\|live\|queued` | `done\|live\|queued` in schema |
| `<Toast tone="error" message=...>` | `useToast().show({tone: "neutral"\|"live"})` | toast helper, tone="live" for errors |
| `<InlineStatus tone="active" label=...>` | InlineStatus uses children | `<InlineStatus tone="active">…</InlineStatus>` |
| `<LiveBlock state="amber">` | LiveBlock has no `state` prop | RAGStatus renders state word in mono display type + sanctioned carrier per color |
| `<ToolCall tone="done">`, `<ToolCall tone="live" head>` | ToolCall uses `statusTone`; no `head` prop | `statusTone="live"\|"default"`; PulseTrail used separately as the "live head" |
| MetricStat per-item `tone: neutral\|live\|success` | MetricStat has no tone; accenting metrics = R-SEMANTIC-001 | **drop `tone` from MetricWall schema** |
| SegmentedBar progress 0–100 | SegmentedBar takes `value` / `total` counts | Schema stays 0–100; renderer converts to value=round(progress/10), total=10 |
| Stage dots painted in `--ds-accent-success` for done in custom CSS | CL07 forbids `--ds-accent-*` outside sanctioned files | Renderer routes accent through `<LiveDot>` for active; uses neutral text-primary dots for done; line-strong hollow for queued |
| RAGStatus AMBER as accent | No AMBER accent in the system | Schema keeps `RED\|AMBER\|GREEN`; RED → Pill `live`, GREEN → neutral Pill + SegmentedBar full as success carrier, AMBER → neutral mono callout (no accent) |

GAPS surfaced (logged in `GAPS.md`, no new components built):

- LiveBlock could grow a `state` prop in a future minor; not required for this work.
- ToolCall could grow `head` as a structural slot; not required.
- A labeled stage-strip primitive could graduate from inline composition; not required.

## Files

| File | Status | Purpose |
|---|---|---|
| `docs/specs/generative-ui-schema.json` | create | JSON Schema draft-07 for composition JSON |
| `docs/specs/generative-ui-planner.md` | create | Planner system prompt + design notes |
| `components/GenerativeRenderer.tsx` | create | Typed deterministic renderer |
| `components/GenerativeRenderer.css` | create | Layout, dial overrides, entry motion (tokens only) |
| `components/index.ts` | modify | Export `GenerativeRenderer` + types |
| `examples/generative-ui-playground.<runtime>` | create | Demo wiring planner → renderer (runtime per decision below) |
| `examples/generative-ui-fixtures.json` | create | 4–6 example compositions for offline demo + tests |
| `GAPS.md` | create | Track aspirational APIs surfaced during this work |
| `CHANGELOG.md` | modify | v0.10.0 entry |
| `SKILL.md` | modify (small) | One paragraph + link to the schema for agents that need to compose at runtime |
| `package.json` | maybe modify | Version bump; possibly add dev deps for playground (depends on runtime decision) |

## Decisions locked

- **Schema state vocabulary:** `done | live | queued` everywhere (matches DotTimeline canonical).
- **Accent discipline:** renderer paints no accent directly. `<LiveDot>`, `<PulseTrail>`, `<Pill live>`, `<InlineStatus tone="live">`, `<SegmentedBar completeTone="success">` carry all semantic color.
- **MetricStat tone:** removed from schema. Metrics stay neutral.
- **Body voice:** schema enforces `body` strings ≤120 chars and rejects multi-segment file paths via regex. Planner system prompt repeats V1–V7 inline.
- **PipelineMap rendering:** inline stage strip — per-stage dot + label below + 1px connector between. Active stage gets `<LiveDot>`; done stage gets a filled `text-primary` 6px square; queued gets a 6px `line-strong` hollow ring. No accent on done — keeps semantic discipline.
- **Voice in error states:** unknown recipe renders `<InlineStatus tone="live">[UNKNOWN RECIPE: name]</InlineStatus>`. Invalid composition shows a toast via `useToast().show({tone: "live", title: "Planner output invalid", description: "Raw response logged to console."})`.
- **Section animation:** `transform: scale(0.97) → 1`, `opacity 0 → 1`, `var(--ds-dur-standard)` (220ms), `var(--ds-ease-out)`, stagger `var(--ds-stagger-column)` (60ms). Reduced-motion: opacity only, instant. Identical sections (same content hash) skip re-animation on follow-up prompts.
- **Dials → CSS custom properties:** root element gets `--ds-gen-density`, `--ds-gen-rhythm`, `--ds-gen-voice` as numeric inputs. Density maps to `--ds-gen-card-pad` and `--ds-gen-card-gap`. Rhythm maps to `--ds-gen-section-gap`. Voice clamps body string length on the planner side, not renderer.
- **Schema versioning:** `$id` includes `v1`. Future schema changes bump.

## Decision pending (one user input)

**Playground runtime.** Brief says "must run with `npm run dev` or equivalent." Repo currently has no bundler / no react-dom / no Anthropic SDK. Three viable paths — surfaced to user in the next message. Plan completes after pick.

## Implementation steps

### Step 1 — Schema (`docs/specs/generative-ui-schema.json`)

JSON Schema draft-07. Single file. Structure:

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://sous-ds.dev/schema/generative-ui.v1.json",
  "title": "sous-ds generative-UI composition",
  "type": "object",
  "additionalProperties": false,
  "required": ["pageTitle", "sections"],
  "properties": {
    "pageTitle": { "type": "string", "minLength": 1, "maxLength": 60 },
    "dials": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "density": { "type": "integer", "minimum": 1, "maximum": 10 },
        "rhythm": { "type": "integer", "minimum": 1, "maximum": 10 },
        "voice":  { "type": "integer", "minimum": 1, "maximum": 10 }
      },
      "default": { "density": 6, "rhythm": 6, "voice": 4 }
    },
    "sections": {
      "type": "array", "minItems": 1, "maxItems": 8,
      "items": { "$ref": "#/definitions/Section" }
    },
    "_reasoning": { "type": "string", "description": "Planner notes; stripped before render." }
  },
  "definitions": {
    "Section": {
      "type": "object",
      "discriminator": "recipe",
      "oneOf": [
        { "$ref": "#/definitions/MetricWallSection" },
        { "$ref": "#/definitions/RAGStatusSection" },
        { "$ref": "#/definitions/PipelineMapSection" },
        { "$ref": "#/definitions/MilestoneStripSection" },
        { "$ref": "#/definitions/AgentLogSection" },
        { "$ref": "#/definitions/ReceiptStackSection" }
      ]
    },
    /* per-recipe shapes follow */
  }
}
```

Per-recipe shapes:

- **MetricWallSection** — `recipe: "MetricWall"`, `eyebrow` (≤30, uppercase enforced via pattern `^[A-Z0-9 ·—–-]+$`), `title?` (≤60), `metrics: [{label≤24, value (string), unit?≤8, delta?≤16}]` length 2–4.
- **RAGStatusSection** — `recipe: "RAGStatus"`, `eyebrow` (≤30), `status: enum [RED, AMBER, GREEN]`, `title?` (≤60), `body` (≤120, must not match `(?:[A-Za-z0-9_-]+/){2,}` to avoid R-VOICE-001 file paths).
- **PipelineMapSection** — `recipe: "PipelineMap"`, `eyebrow` (≤30), `title` (≤60), `stages: [{label≤24, state: enum [done, live, queued]}]` length 2–7.
- **MilestoneStripSection** — `recipe: "MilestoneStrip"`, `eyebrow` (≤30), `title` (≤60), `phases: [{label≤8, title?≤24, date?≤16, progress: 0..100 int, state: enum [done, live, queued]}]` length 2–6.
- **AgentLogSection** — `recipe: "AgentLog"`, `eyebrow` (≤30), `title` (≤60), `isLive: bool`, `items: [{tool≤24, label≤80, duration?≤16, status: enum [done, live, queued]}]` length 1–8.
- **ReceiptStackSection** — `recipe: "ReceiptStack"`, `eyebrow` (≤30), `title` (≤60), `body?` (≤120, same file-path guard), `items: [{id≤16, label≤80, state≤16, timestamp?≤24}]` length 1–10.

Verification step 1:
```bash
node -e 'const s=JSON.parse(require("fs").readFileSync("docs/specs/generative-ui-schema.json","utf8")); require("ajv");console.log("schema parses; ids:", Object.keys(s.definitions))'
```
If `ajv` not installed yet, fall back to `node -e 'JSON.parse(require("fs").readFileSync(...))'` and validate fixtures with ajv after step 3 dep install.

### Step 2 — Fixtures (`examples/generative-ui-fixtures.json`)

Array of 4 compositions, each a valid composition JSON:
1. **trust-review-dashboard** — MetricWall + RAGStatus + AgentLog (3 recipes, default dials)
2. **fraud-investigation** — PipelineMap + ReceiptStack + MetricWall (process-shaped)
3. **agent-live-feed** — AgentLog + RAGStatus + MetricWall (RHYTHM=7 leaning)
4. **adversarial-prompt-response** — what the planner outputs when asked for "purple glass morphism" — a valid neutral composition that silently complies. Proves silent-correction path.

Used by: playground quick-pick chips, renderer smoke test, schema-validation test.

### Step 3 — Renderer (`components/GenerativeRenderer.tsx` + `.css`)

`.tsx` structure:

```tsx
import { Card, Pill, LiveDot, PulseTrail, InlineStatus, MetricStat,
         ToolCall, SegmentedBar, Toast /* via useToast */ } from "./index";
import type { /* generated CompositionJSON types */ } from "./generative-ui-types";
import "./GenerativeRenderer.css";

export interface GenerativeRendererProps {
  composition: CompositionJSON;
  onSectionClick?: (sectionIndex: number) => void;
}

export function GenerativeRenderer({ composition, onSectionClick }: GenerativeRendererProps) {
  // 1) apply dials → CSS custom properties on root
  // 2) memo sections by content-hash; new hash → re-animate
  // 3) render pageTitle (display, Cash Sans via --ds-font-display)
  // 4) sections.map → <section data-recipe={s.recipe} style={animationDelay}>renderRecipe(s)</section>
}

function renderMetricWall(s: MetricWallSection) { /* Card + row of MetricStat */ }
function renderRAGStatus(s: RAGStatusSection)   { /* Card + state word + Pill + body */ }
function renderPipelineMap(s: PipelineMapSection) { /* Card + horizontal stage strip */ }
function renderMilestoneStrip(s: MilestoneStripSection) { /* Card + vertical phase rows + SegmentedBar */ }
function renderAgentLog(s: AgentLogSection) { /* Card + ToolCall stack; isLive → PulseTrail head row */ }
function renderReceiptStack(s: ReceiptStackSection) { /* Card + mono row stack */ }
function renderUnknown(s: UnknownSection) {
  return <InlineStatus tone="live">{`UNKNOWN RECIPE: ${(s as any).recipe}`}</InlineStatus>;
}
```

Types: hand-write `CompositionJSON` and per-section types in a small `components/generative-ui-types.ts`. (json-schema-to-typescript is overkill for this surface.)

CSS structure (`.css`):

- Root: CSS custom properties for dials (`--ds-gen-density`, `--ds-gen-rhythm`, `--ds-gen-voice`) with derived values (`--ds-gen-card-pad: calc(var(--ds-space-3) + var(--ds-gen-density) * 2px)` etc., snapped to 8pt where the brief allows — verify with lint).
- `.ds-gen-root` page container: max-width `var(--ds-measure)` × 1.5 (≈98ch), centered.
- `.ds-gen-section` section animation:
  ```css
  .ds-gen-section {
    opacity: 0;
    transform: scale(0.97);
    animation: ds-gen-section-enter var(--ds-dur-standard) var(--ds-ease-out) forwards;
    animation-delay: calc(var(--ds-gen-section-index, 0) * var(--ds-stagger-column));
  }
  @keyframes ds-gen-section-enter { to { opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) {
    .ds-gen-section { opacity: 0; animation: ds-gen-section-fade var(--ds-dur-micro) linear forwards; transform: none; }
    @keyframes ds-gen-section-fade { to { opacity: 1; } }
  }
  ```
  *Note: enumerated property animation — no `transition: all`. Duration under 300ms ceiling. Entry from 0.97 (above the 0.95 minimum).*
- `.ds-gen-page-title` uses `font-family: "Cash Sans", var(--ds-font-mono)` per R-TYPE-004; weight 400 default → mono fallback at 600 if Cash Sans absent.
- `.ds-gen-eyebrow` uses `var(--ds-font-mono)`, uppercase, `var(--ds-text-muted)`.
- PipelineMap stage strip:
  ```css
  .ds-gen-stage-row { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: var(--ds-space-5); align-items: center; }
  .ds-gen-stage { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-3); position: relative; }
  .ds-gen-stage::after { content: ""; position: absolute; top: 3px; left: 50%; right: -50%; height: 1px; background: var(--ds-line); }
  .ds-gen-stage:last-child::after { display: none; }
  .ds-gen-stage__dot--done    { width: 6px; height: 6px; background: var(--ds-text-primary); border-radius: var(--ds-radius-pill); }
  .ds-gen-stage__dot--queued  { width: 6px; height: 6px; border: 1px solid var(--ds-line-strong); border-radius: var(--ds-radius-pill); }
  /* active stage renders <LiveDot /> as the child — no custom accent CSS */
  ```

Verification step 3:
```bash
node scripts/lint.mjs components/GenerativeRenderer.tsx components/GenerativeRenderer.css
```
Must pass with zero errors and zero new warnings.

### Step 4 — Index export

Add to `components/index.ts`:
```ts
export { GenerativeRenderer } from "./GenerativeRenderer";
export type { GenerativeRendererProps } from "./GenerativeRenderer";
export type {
  CompositionJSON, Section, MetricWallSection, RAGStatusSection,
  PipelineMapSection, MilestoneStripSection, AgentLogSection, ReceiptStackSection,
  Dials, RecipeName,
} from "./generative-ui-types";
```

### Step 5 — Planner system prompt (`docs/specs/generative-ui-planner.md`)

Sections in the markdown:

1. **System prompt** (fenced code block, ~200 lines, copy-pasteable):
   - Role: "You are a UI planner for the sous-ds design system. You output composition JSON."
   - Output rules: JSON only, no prose, no markdown fences, schema-compliant, ambiguous → make defensible inference, never ask.
   - Component catalog (derived from SKILL.md intent→component decision tree) — only what the renderer actually maps.
   - Six recipes with one-line intent + microcopy template + when to use.
   - Dials: how to infer DENSITY / RHYTHM / VOICE from intent.
   - Voice V1–V7 inline with examples.
   - Refusal subset: R-COMPOSE-001..004, R-SEMANTIC-001, R-METRIC-001, R-VOICE-001..003 — and what to do (silent-correct + note in `_reasoning`).
   - Iteration rules: when receiving a current composition + new prompt, output full updated JSON, preserve unchanged sections.

2. **Worked examples** (3 short prompt → JSON pairs).

3. **Iteration examples** (1 follow-up prompt that preserves 2 sections and rewrites 1).

4. **Notes on integration**: how to feed the schema as `response_format` or as additional system content; recommended max_tokens; model recommendation (Claude Sonnet 4.6 or 4.7 per knowledge cutoff).

### Step 6 — Playground (`examples/generative-ui-playground.*`)

Implementation defers to user decision (next message). All three paths produce the same UX:

- Fixed top bar: "sous-ds generative UI" display + version badge + live dial readout
- Left sidebar (320px): textarea + "Plan UI" button + history + "Clear page" button + ghost chips for the 4 fixture prompts
- Main area: `<GenerativeRenderer>` full-height, scroll if overflow
- API error → Toast via `useToast()`
- Invalid JSON → Toast + raw response in console
- Setup comment at top of file with install/run instructions

### Step 7 — GAPS.md

```md
# GAPS

Aspirational APIs surfaced by the generative-UI work that don't yet exist
in the component catalog. None block the v0.10.0 ship.

- `<LiveBlock state>` — recipe spec uses `<LiveBlock state="amber">` but
  LiveBlock currently has no `state` prop. RAGStatus renders state word
  inline; consider promoting if a future surface needs the LiveBlock motion.
- `<ToolCall head>` — recipe spec uses `<ToolCall ... head>`. Currently
  composed by placing `<PulseTrail>` above the ToolCall stack. Consider a
  structural `head` slot if AgentLog adoption grows.
- Labeled stage-strip primitive — PipelineMap composes one inline via
  `<LiveDot>` + neutral dots. If the pattern recurs, graduate to a
  component under R-FAMILY-001.
- `<Citation>` integration — Citation exists but the renderer doesn't yet
  thread citations through `body` strings. Out of scope for v0.10.0.
```

### Step 8 — CHANGELOG entry

Single entry under top heading:

```md
## v0.10.0 — generative UI layer (2026-05-10)

Adds a runtime generative-UI contract on top of the v2 composition system.
A natural-language prompt produces composition JSON; a deterministic
renderer turns the JSON into a live sous-ds page. Follow-up prompts update
the page in place. No new visual primitives. All accent carriers route
through sanctioned components per R-SEMANTIC-001.

**Added**
- `docs/specs/generative-ui-schema.json` — JSON Schema for composition JSON
- `docs/specs/generative-ui-planner.md` — copy-paste planner system prompt
- `components/GenerativeRenderer.tsx` / `.css` — typed renderer over the six v2 recipes
- `components/generative-ui-types.ts` — TS types matching the schema
- `examples/generative-ui-playground.<runtime>` — live demo
- `examples/generative-ui-fixtures.json` — seed compositions

**Notes**
- Schema state vocabulary is `done | live | queued` (matches DotTimeline).
- Renderer carries `--ds-accent-*` only through `<LiveDot>`, `<PulseTrail>`,
  `<Pill live>`, `<InlineStatus tone="live">`, and `<SegmentedBar completeTone="success">`.
- MetricStat per-item tone removed from schema; neutral metrics only.
- AMBER in RAGStatus renders neutrally — there is no AMBER accent token.
```

### Step 9 — SKILL.md (small touch)

Append one paragraph under the "Composition recipes (page level — 2.0)" section pointing to the schema for runtime composition. ~3 lines + a link.

## Test steps

After each implementation step:

1. **Schema parses + fixtures validate.** `node -e` + ajv after deps land.
2. **Lint passes on all new files.**
   ```bash
   node scripts/lint.mjs components/GenerativeRenderer.tsx components/GenerativeRenderer.css
   node scripts/lint.mjs components/  # full sweep, must stay green
   ```
   Verdict must be `pass`, zero errors, ≤3 warnings.
3. **TypeScript compiles.** `npx tsc --noEmit` (strict mode per existing tsconfig).
4. **Renderer smoke test.** Render all 4 fixtures into a JSDOM document via a minimal test script (or skip if no test runner — playground load is the smoke test).
5. **Playground manual QA** (after step 6):
   - Each of 4 chip prompts produces a valid render in ≤5s.
   - Adversarial prompt ("make it purple with glass morphism") produces a valid composition with no purple, no glass.
   - Follow-up prompt updates the page without resetting unchanged sections.
   - Reduced-motion: `prefers-reduced-motion: reduce` in browser → no scale animation.
   - Light mode toggle: `data-theme="light"` on the root → page reads correctly (semantic accents unchanged).
6. **Full repo lint.** `npm run lint` — must stay green.

## Verification (definition of done, per brief)

- [ ] All four deliverable files exist and pass `node scripts/lint.mjs`
- [ ] Playground runs locally; a chip prompt produces a render in ≤5s
- [ ] A follow-up prompt updates the page without resetting unchanged sections
- [ ] Adversarial prompt produces a valid neutral page (no purple, no glass, no crash)
- [ ] `CHANGELOG.md` has a v0.10.0 entry
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Schema + 4 fixtures validate via ajv
- [ ] `git status` clean except the new files

## Non-goals (explicit)

- Building new visual primitives (no new dot-family member, no new accent carrier).
- Adding LiveBlock `state`, ToolCall `head`, MetricStat `tone`. These go in GAPS.md.
- Server-side proxy for the Anthropic API. Browser-side `dangerouslyAllowBrowser: true` is acceptable for the local playground; loud comment marking it dev-only.
- Citation integration in body strings.
- More than the six v2 recipes.
- Streaming JSON (planner returns full JSON; renderer animates the diff).
- Prezzo mode in the generative UI (it composes automatically via `[data-mode="prezzo"]`; out of scope to test exhaustively this round).
- Tailwind preset integration.
- Bundling the playground for production. It's a dev-mode demo.

## Risks

1. **Browser API key exposure.** Mitigated by loud README comment + `.env.local.example`. Real prod would proxy through a backend; out of scope.
2. **Schema/spec drift.** The recipe spec uses some aspirational APIs (LiveBlock state, ToolCall head). The schema is the authoritative contract; the spec is the design intent. Document this in the planner prompt and GAPS.md.
3. **Lint regressions.** Cards are tight on the 8pt scale; dial-derived padding must snap to tokens, not interpolate continuously. Mitigation: derive `--ds-gen-card-pad` from a small lookup table, not a math expression that lands off-grid.
4. **Playground bloat.** Adding Vite + react-dom + Anthropic SDK to a library repo grows node_modules ~50MB. If user picks Option A, document that dev deps are not shipped in the npm package (already excluded via `files` in package.json).
5. **R-COMPOSE-002 / -004 at runtime.** Planner can produce a single-recipe page or repeat one recipe. Mitigation: schema enforces ≥1 section but planner system prompt encodes "≥3 distinct recipes when RHYTHM ≥ 4." Runtime lint of generated JSON is out of scope; planner is best-effort.

## Sequence

1. Get user decision on playground runtime.
2. Schema (step 1) + types + fixtures (steps 2, 4-types) — pure data, no runtime.
3. Renderer (step 3) + index export.
4. Planner system prompt (step 5).
5. Playground (step 6) — runtime-specific.
6. GAPS.md (step 7) + CHANGELOG (step 8) + SKILL.md (step 9).
7. Full verification (test steps).
8. Commit + receipt.

Estimated work: ~1 working session for steps 2–7. Step 6 (playground) is ~30 min if Option B/C, ~60 min if Option A.
