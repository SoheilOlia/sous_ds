---
name: Taste bridge — TASTE_LOG.md → planner system prompt
status: draft
date: 2026-05-11
owner: SoheilOlia
phase: brainstorming
---

# Taste bridge — design options

## Why this exists

Sous-ds has three taste surfaces:

| Surface | Audience | Format | Status |
|---|---|---|---|
| `refusals.json` | the linter + agents | machine-readable rules (`R-*` IDs, regex patterns, severities) | **lint-enforced** |
| `TASTE_LOG.md` | humans auditing decisions | append-only narrative with `## ENTRY NNN` blocks | **read by humans only** |
| `docs/specs/generative-ui-planner.md` | the planner LLM | a single ```text``` fenced block of positive grammar | **runtime context for every plan** |

The seam: `TASTE_LOG.md` is load-bearing for humans reviewing *why* decisions were made (e.g., ENTRY 007 — "Softer Display Voice + AI-Native State") but the planner has no way to see those signals unless they're hand-copied into the planner prompt. Today, that hand-copy is exactly what happened — and it's already drifted (the planner prompt doesn't reflect ENTRY 007's "softer display voice" signal at all).

The bridge problem: **encode `TASTE_LOG.md`'s planner-relevant signals into the planner's context, without breaking `TASTE_LOG.md`'s role as the human audit trail.**

## Goals

1. **The planner sees current taste.** A new TASTE_LOG entry that touches voice, recipe selection, or refusal scope reaches the planner without a manual copy step.
2. **`TASTE_LOG.md`'s narrative voice is preserved.** It is not turned into a database. Humans still write entries in prose.
3. **The planner prompt stays readable and curate-able by humans.** Generated content is clearly demarcated.
4. **No runtime cost surprise.** Whatever the planner sees, it sees consistently — not "the whole log every call" if that bloats tokens.
5. **One source of truth per signal.** No fact lives in two places.

## Constraints

- TASTE_LOG.md is append-only. Solutions must not require rewriting old entries.
- `refusals.json` stays as-is — it is the machine corpus for the linter, not the planner's positive grammar.
- The planner system prompt is loaded by the playground via `?raw` import and shipped to Anthropic verbatim. Anything we want the planner to see must be on disk before `bun run dev` boots, not fetched at runtime.
- The planner prompt has a model token budget per request. We pay for whatever we include, every call.

## The four design options

### Option A — Tagged sections inside `TASTE_LOG.md`

**Source of truth:** `TASTE_LOG.md`, with explicit `<!-- PLANNER:START -->` / `<!-- PLANNER:END -->` markers inside entries that have planner-relevant signals.

**Build step:** A node script (`scripts/build-planner-prompt.mjs`) reads `TASTE_LOG.md`, extracts everything between `PLANNER:START` and `PLANNER:END` markers, and inserts the result into a templated `docs/specs/generative-ui-planner.md` at a specific anchor (e.g., `<!-- INSERT TASTE -->`). Runs in `prebuild` and via a separate `lint:planner-sync` check that fails CI if the prompt is out of date.

**What `TASTE_LOG.md` looks like:**

```markdown
## ENTRY 007 — Softer Display Voice + AI-Native State
**Date:** 2026-04-23
...

<!-- PLANNER:START signal=display-voice -->
- Display titles read softer when the verb leads ("Lanes recovered.") vs editorial ("Where we are going.")
- AI-native pages should hint at present-tense activity in the eyebrow.
<!-- PLANNER:END -->

### Signals extracted:
...narrative continues...
```

**What the planner prompt looks like (rendered):**

```text
You are a UI planner for the sous-ds design system. You output JSON.
...

# Taste signals (auto-generated from TASTE_LOG.md — do not edit by hand)

## display-voice (from ENTRY 007)
- Display titles read softer when the verb leads...
- AI-native pages should hint at present-tense activity...

## completion-accent (from ENTRY 009)
- `accent-success` is for goal-met endpoints, not progress filler...

# Voice rules (human-authored, stays as-is)
V1 — Terse-first sentences...
```

**Failure modes:**
- Author forgets to add `PLANNER:START` markers when writing a new entry → signal never reaches planner. Mitigation: lint rule on TASTE_LOG.md that warns if an entry's `### Signals extracted` block has no marker.
- Markers desync from entry content over time. Mitigation: include the entry ID in the marker, and lint checks both still exist.
- Generated section makes `TASTE_LOG.md` look uglier. Markers are HTML comments so they don't render in viewers like GitHub, but raw view shows them.

**When this is right:** if you want `TASTE_LOG.md` to stay the single human-facing doc, and the planner-relevant signals are a small fraction of each entry.

---

### Option B — New `taste.yml` as the canonical data model

**Source of truth:** `taste.yml` — a structured YAML file with one entry per signal. Both `TASTE_LOG.md` and the planner prompt are generated from it.

**Build step:** Two generators. `scripts/build-taste-log.mjs` renders `taste.yml` into `TASTE_LOG.md` (with a `<!-- BEGIN GENERATED ENTRIES -->` block; the file's narrative preamble stays hand-written). `scripts/build-planner-prompt.mjs` renders the planner-tagged signals into the planner prompt template.

**What `taste.yml` looks like:**

```yaml
entries:
  - id: 007
    date: 2026-04-23
    title: Softer display voice + AI-native state
    source: Inspiration drop 2026-04-23
    signals:
      - id: display-voice-softer
        planner_relevant: true
        rule: |
          Display titles read softer when the verb leads.
          Prefer "Lanes recovered." over "Where we are going."
        rationale: |
          Editorial frames ("Where we are…", "What we are…") narrate
          existence. Verb-led titles name the artifact directly.
      - id: ai-native-eyebrow
        planner_relevant: true
        rule: |
          AI-native pages hint at present-tense activity in the eyebrow.
          "LIVE — 16:42" reads as instrument; "RECENT EVENTS" reads as table.
```

**What the planner prompt looks like:**

```text
# Taste signals (generated from taste.yml — see TASTE_LOG.md for context)

## display-voice-softer (ENTRY 007)
Display titles read softer when the verb leads...

## ai-native-eyebrow (ENTRY 007)
AI-native pages hint at present-tense activity in the eyebrow...
```

**What `TASTE_LOG.md` looks like:** the entries are rendered from `taste.yml` into the existing prose format. Humans review `taste.yml` PRs; the rendered `.md` is for reading.

**Failure modes:**
- Big up-front migration cost — every existing TASTE_LOG entry needs to be translated into the YAML schema. ~10 entries, ~3 hours of careful work.
- YAML quoting / multi-line discipline becomes a friction point for the human editor. "I just want to write a paragraph" → "you have to indent it under `rule: |`."
- Two generators to keep working in sync. Lint must catch drift in both directions.
- Conflicts: if someone hand-edits `TASTE_LOG.md` (the generated file) without re-running the generator, their change vanishes on next build.

**When this is right:** if you expect dozens of new entries and want the cleanest possible data model long-term. Closer to how `refusals.json` already works.

---

### Option C — Concatenate `TASTE_LOG.md` verbatim into the planner prompt at request time

**Source of truth:** `TASTE_LOG.md` as-is.

**Build step:** None at build time. The playground's planner call reads `TASTE_LOG.md` via `?raw`, slices it to a configured token cap (e.g., last 8 entries or first N tokens of each), and concatenates into the system prompt:

```ts
const systemPrompt = `${PLANNER_PROMPT}\n\n# Taste log (raw)\n\n${tasteLog}`;
```

**What the planner sees:** the entire TASTE_LOG.md, prose voice intact, narrative noise and all — including non-planner-relevant content like "Inspiration corpus is 18 files" and HTML conflict-log scaffolding.

**Failure modes:**
- Token tax every call. `TASTE_LOG.md` is ~10K tokens today; will only grow. At Anthropic's pricing that's ~$0.03 per plan call just for the log.
- The planner sees *everything*, including history that was superseded. ENTRY 002 is explicitly marked as superseded by ENTRY 005, but a naive concat hands both to the LLM and lets it guess.
- Voice mismatch — the planner's positive-grammar prompt is in imperative voice ("Output one JSON object"). Pasting a narrative log next to it dilutes signal.
- Hand-edits to `TASTE_LOG.md` ship to the planner immediately, including typos or in-progress edits.

**When this is right:** if the planner prompt token budget is a non-issue and we trust the LLM to filter noise. (Not the case at our scale.)

---

### Option D — New `docs/specs/planner-taste.md`, planner-audience corpus

**Source of truth:** `docs/specs/planner-taste.md` — a separate, hand-authored markdown file written specifically for the planner's context. `TASTE_LOG.md` cross-references it via "see planner-taste.md §X" notes inside entries.

**Build step:** Minimal. The playground concatenates `planner-taste.md` into the system prompt at app-boot time (same `?raw` import path as the existing planner prompt). No code-generation, no template anchors. Two real files, both human-edited.

**What `planner-taste.md` looks like:**

```markdown
# Planner taste corpus

This document is the planner LLM's positive-grammar context. It is
authored for the LLM, not for humans. For the human audit trail and
the *why* behind each rule, see `TASTE_LOG.md`.

When a new TASTE_LOG entry introduces a planner-relevant signal,
the entry must include a "Planner update:" subsection naming what
rule was added here and at what anchor.

## Display voice

Verb-led, present tense. Period on declarative h1/h2. Numerals in
mono inside titles. Avoid editorial frames ("Where we are…").
*Source: TASTE_LOG.md ENTRY 007.*

## Accent placement

`accent-success` marks goal-met endpoints, not progress filler. A
half-full SegmentedBar stays neutral; only `value === total` earns
the green.
*Source: TASTE_LOG.md ENTRY 009.*

## ...
```

**What the planner prompt looks like:** the existing planner prompt + this corpus, concatenated at boot. The seam is visible — one section is imperative ("Output one JSON object"), the other is declarative ("Display voice: verb-led, present tense"). That's fine.

**Failure modes:**
- Two docs to keep in sync. A `TASTE_LOG.md` entry can ship without a planner-taste.md update if the author forgets. Mitigation: TASTE_LOG.md entry template includes a `### Planner update` heading (empty or "n/a") that's lint-checked.
- Cross-references can rot (e.g., `planner-taste.md` cites ENTRY 007 but ENTRY 007 was later edited to deprecate the signal). Mitigation: when an entry is superseded, the supersession also touches `planner-taste.md`.
- Two writing styles. The author has to switch between "narrate the decision" (TASTE_LOG) and "instruct the LLM" (planner-taste). That's an upside (each is crisp) and a downside (more cognitive load).

**When this is right:** if you want the planner to see a curated, instruction-shaped corpus rather than excerpts from the audit trail. Treats the planner as a distinct audience with its own contract — same way `refusals.json` is for the linter and not for humans.

---

## Comparison matrix

| | A (tagged) | B (yaml) | C (concat) | D (separate doc) |
|---|---|---|---|---|
| Source of truth | `TASTE_LOG.md` | `taste.yml` | `TASTE_LOG.md` | `planner-taste.md` |
| Generators needed | 1 | 2 | 0 | 0 |
| Up-front migration | low (add markers to 10 entries) | high (rewrite all entries as YAML) | none | medium (write the corpus from existing log) |
| Per-entry friction | low (add 2 markers) | high (write YAML) | none | medium (write twice) |
| Planner sees noise? | no | no | yes (whole log) | no |
| Token tax | proportional to taste signals only | same | proportional to whole log (~10K) | proportional to corpus only |
| Drift risk | medium (markers desync) | low (single source) | none (always live) | medium (manual cross-ref) |
| `TASTE_LOG.md` voice preserved? | yes | partially (generated) | yes | yes |
| Reviewer mental model | 1 file | 1 yaml + 2 generated | 1 file | 2 files |

## Recommendation

**Option D**, with the constraint that `TASTE_LOG.md` gains a small structural addition: every new entry includes a `### Planner update` subsection (empty / "n/a" / one-line pointer into `planner-taste.md`).

Reasoning:
1. **The planner is a distinct audience.** It needs instruction-shaped text, not narrative. Pretending one doc serves both creates the friction we already see in the planner prompt today (where I hand-copied half-paraphrased rules from TASTE_LOG.md and they've already drifted).
2. **No build step needed.** Options A and B introduce generators, which means a lint check, a CI gate, a "regenerate" command, and a chance of merge conflicts in the generated file. D ships none of that.
3. **No token tax for superseded content.** Option C pays for ENTRY 002 even though ENTRY 005 deprecated it. D is hand-curated.
4. **Easy to dogfood.** We write `planner-taste.md` once, then update it when a TASTE_LOG entry surfaces a planner-relevant signal. The cost of the second doc is paid lazily, only when needed.
5. **Matches the existing architecture.** `refusals.json` already separates "what the linter sees" from "what humans read in DESIGN.md." `planner-taste.md` does the same for the planner.

What we'd lose by picking D over A: a single canonical doc. But `TASTE_LOG.md` was never canonical for the planner — it's canonical for humans. The right move is to make that separation explicit rather than paper over it.

What we'd lose vs. B: the cleanest data model. B is the right answer if the system grows 10× and editorial costs dominate. For 10 entries growing to maybe 30, D is materially less work for the same correctness.

## Implementation sketch (only if D is approved)

1. **Create `docs/specs/planner-taste.md`** — hand-author from current `TASTE_LOG.md` ENTRY 007–009 + parts of ENTRY 001 + cross-cutting voice rules I already drafted in `generative-ui-planner.md`. Move the duplicated rules out of the planner prompt and into `planner-taste.md`.
2. **Update `docs/specs/generative-ui-planner.md`** — strip the inline voice rules that are now in `planner-taste.md`. Replace with a brief "See `planner-taste.md` for the taste corpus" pointer.
3. **Update `examples/generative-ui-playground.tsx`** — concatenate `plannerMarkdown + tastemarkdown` into the system prompt at boot.
4. **Update `TASTE_LOG.md` template / HOW TO READ section** — note that planner-relevant signals must also be added to `planner-taste.md`, with a `### Planner update` subsection in each new entry.
5. **Update `SKILL.md`** — add `planner-taste.md` to the "Read in this order" list, and update the R-FAMILY-001 protocol to include "Step 7 — if the new component is in the recipe catalogue, also add it to the planner's intent→component decision tree in `generative-ui-planner.md`."

Verification:
- Lint passes (no source files changed substantively, just docs)
- Boot the playground, send the adversarial prompt, confirm the planner respects the corpus
- Diff the resulting JSON against a fixture to confirm no taste regression

## Open questions for you

1. **D good, or do you want to pressure-test against A or B?** I'm confident in D but the recommendation rests on "the planner is a distinct audience" — if you disagree with that premise, B might be more right than D.
2. **What's the right anchor inside `TASTE_LOG.md` to cross-reference planner-taste.md?** Per-entry `### Planner update` heading, or a single appendix table mapping entry → planner-taste section?
3. **Scope of the initial `planner-taste.md`** — translate just the v2 voice/composition rules, or fold in the v1 motion/color/typography rules too? (I lean toward "just v2 for now; v1 lives in `refusals.json` already and the planner doesn't need to repeat it.")
4. **Where should `planner-taste.md` live in the read-order in `SKILL.md`?** Between `voice.md` and `composition-recipes.md`, or as a separate "for the planner" section at the bottom?
