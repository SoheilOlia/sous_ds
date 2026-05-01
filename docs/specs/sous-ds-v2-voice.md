---
name: sous-ds 2.0 voice contract
status: draft
date: 2026-05-01
parent: sous-ds-v2.md
---

# Voice Contract — sous-ds 2.0

1.0 has no voice contract. AGENTS.md, DESIGN.md, and SKILL.md are silent on prose. As a result, the test page produced phrasings like:

- "The compiler spine and validation gates are real on this branch. The project is not green because too much evidence is still draft PR, working-tree, generated artifact, or externally blocked truth."
- "Render contract v1 and fallback tables landed on origin/main. Contract proof only. Next: emit runtime provenance and resolve non-FormBlocker paths."
- "Receipts: consent_orders/docs/receipts/2026-04-28-smoke-matrix-expansion-receipt.md, consent_orders/docs/receipts/2026-04-29-quick-wins-receipt.md, and consent_orders/handoffs/canonical-freshness-manifest.json."

These are technically true and entirely unreadable. They are status-meeting transcripts, not interface copy.

The 2.0 voice contract names a single voice — **terse instrument-readout** — and binds every recipe's microcopy to it.

## The voice in one sentence

> The system speaks like a precision instrument that has learned English: present tense, active voice, numerals in mono, no narration of its own existence, no phrase that survives unchanged from a status meeting.

## The seven voice rules (canonical)

### V1 — Terse-first sentences

Open every section, every card, every row with a sentence ≤12 words that names the state. Optional second sentence ≤24 words that explains. No third sentence in a card body without a structural reason.

| Bad | Good |
|---|---|
| "The pipeline is what we are building. The milestones are the proof layers over that pipeline: what is wired, what has receipts, what is blocked, and what gets built next." | "Ten stages. Five wired. Two blocked." |
| "Lane recovery plus quick wins are now main-branch truth." | "Lanes recovered. Quick wins merged." |

### V2 — Present tense, active voice

Subject acts. Object receives. No "was the X that did Y."

| Bad | Good |
|---|---|
| "PR #16 was the PR that landed the smoke matrix expansion changes." | "PR #16 landed the smoke matrix." |
| "Stale handoffs are audited and retired from current-readiness claims." | "PR #17 retired stale handoffs." |
| "Coverage validators exist." | "Coverage validators land in #13." |

### V3 — Numerals in mono

Every numeral, percentage, ID, timestamp, ratio, and code token is set in `Geist Mono` with `tabular-nums`. This is enforced by `TY02` (typography rule from 1.0) and reinforced by V3 (voice rule): the writer must consciously place numerals where mono renders.

```html
<p>
  Stage <code>5</code> reaches <code>74%</code> evidence maturity.
  Stage <code>10</code> blocked at <code>52%</code>.
</p>
```

### V4 — No file paths in body prose (`R-VOICE-001`)

File paths belong in: code blocks, `<ToolCall>` detail rows, footnote refs, the Receipt section, or `<Citation>` chips when shipped. Never inline in body prose.

| Bad | Good |
|---|---|
| "Receipts: consent_orders/docs/receipts/2026-04-28-smoke-matrix-expansion-receipt.md and …" | "Three receipts. See the ReceiptStack below." |
| "Edit `tokens.css` at line 42 to update the accent." | "Update the accent token." (Then link to the line in a code block.) |

### V5 — Project jargon needs a one-clause unpack on first appearance

Domain-specific terms ("SPEC-O gate," "campaignName validation," "smoke matrix," "canonical handoff") get one clause of unpacking the first time they appear in a page, then can run free. The unpack is a clause, not a paragraph.

| Bad (no unpack) | Good (one-clause unpack) |
|---|---|
| "PR #12 lands the SPEC-O gate payload normalizer." | "PR #12 lands the SPEC-O gate — the payload normalizer for review evidence." |
| "Smoke matrix expanded to five fixtures." (first mention) | "The smoke matrix — fixture-level proof of pipeline coverage — expanded to five fixtures." |

### V6 — Rhythm variance (`R-VOICE-002`)

No two adjacent sections may end with the same micro-template. The 1.0 page ends every card with `Evidence: X. Next: Y.` This rule forces variation.

Permitted card-closer templates (rotate; never two adjacent the same):
- `Next: <subject-verb-object>.`
- `Blocks on <subject>.`
- `<Phase> remains <state>.`
- `Owner: <name>.`
- `Updates <event>.`
- (no closer) — let the body sentence end the card.

If a section repeats the same template as its neighbor, the Quality Evaluator flags `R-VOICE-002`.

### V7 — No status-meeting voice (`R-VOICE-003`)

Banned phrases (non-exhaustive). When detected, replace with the named substitute.

| Banned phrase | Why it fails | Replace with |
|---|---|---|
| "We are building…" | Narrates existence. | Name what is built or pending. |
| "What we are building" | Same. | A title that names the artifact. |
| "What we're working on" | Same. | A title that names the current state. |
| "Things are…" | No subject. | Name the subject. |
| "Stricter after diagnostics" (vague comparative) | Subject and dimension missing. | Name what got stricter and how. |
| "Main-branch truth" used as adjective | Jargon adjectival. | "Lands on main." |
| "Draft-PR truth" / "working-tree truth" / "still-blocked truth" | "-truth" suffix is project-internal jargon. | Name the actual state. "Draft PRs," "working-tree changes," "blocked work." |
| "The project is not green because…" | Editorial frame. | Name the gating condition: "Green requires PR #20." |
| "Now main-branch truth" | Same -truth pattern. | "Now lands on main." |
| "Where we are going" / "What we are building" as section h1 | Editorial frames that don't name the artifact. | "Five phases queued." "Ten stages, four wired." |

This list grows as the corpus surfaces new offenders. New entries logged in `TASTE_LOG.md`.

## Per-recipe microcopy templates

Each recipe in `sous-ds-v2-composition-recipes.md` declares its own microcopy template. Re-stated here for cross-reference.

### PipelineMap

- **Eyebrow:** `STAGES — N` (mono, no period)
- **Title pattern:** `<count> stages, <count> <state>.` Examples:
  - `Ten stages, four wired.`
  - `Six stages, two blocked.`
- **Body pattern:** one sentence ≤24 words naming current state and next gate.
  - `Stage 5 (Copy) is the strongest current path.`
  - `Stage 10 (Output) blocked on WARP.`
- **Per-stage label:** stage name only. ≤2 words.
- **Forbidden:** "What we are building," "PRD to verified handoff, shown end to end."

### MilestoneStrip

- **Eyebrow:** `MILESTONES — N PHASES`
- **Title pattern:** `<count> phases. <count> <state>, <count> <state>.`
  - `Five phases. Three live, two queued.`
- **Phase label:** `M1` style, mono (1.0 convention preserved).
- **Phase title:** ≤4 words, present tense.
  - `Verified handoff spine.`
  - `Fixture confidence.`
- **Phase body:** 1 sentence ≤16 words.
- **Forbidden:** "Where we are going."

### MetricWall

- **Eyebrow:** the **shared unit or axis**. Without this, `R-METRIC-001` fires.
  - Good: `EVIDENCE MATURITY — % PER STAGE`
  - Bad: `KEY METRICS`
- **Title:** optional. If present, names the implication, not the numbers.
  - `Evidence is climbing.`
  - `Coverage outpaces lead time.`
- **Stat label:** ≤3 words, mono, uppercase with letter-spacing 0.08em.
- **Stat unit:** half-size superscript, baseline-aligned.
- **Forbidden:** "Our four key metrics."

### RAGStatus

- **Eyebrow:** scope. `PROJECT RAG`, `BUILD HEALTH`, `PIPELINE`.
- **Title pattern:** `<state-word>: <verb-led clause>.`
  - Good: `Amber: diagnostics tightened the bar.`
  - Bad: `Amber, stricter after diagnostics.` (vague; no subject for "stricter")
- **Body:** one sentence ≤20 words naming why and what unblocks the next state.
  - `Bar confidence climbs to 78–80% after #16/#17 land. Green requires PR #20 (CI gate).`
- **Forbidden:** "The project is not green because too much evidence is still…"

### AgentLog

- **Eyebrow:** timestamp range, or `LIVE`.
  - `RECENT — 16:42`
  - `LIVE`
- **Section title:** present-tense if live, past-tense if done. ≤6 words.
  - `Indexing Linear tickets.` (live)
  - `Retired stale handoffs.` (done)
- **Row title:** subject-verb-object. ≤8 words.
  - `PR #17 retired stale handoffs.`
- **Row detail:** ≤24 words. Numerals in mono.

### ReceiptStack

- **Eyebrow:** provenance. `RECEIPTS — origin/main`.
- **Section title:** present-tense state of the underlying truth. ≤8 words.
  - `Six receipts. Five merged. One superseded.`
- **Body:** optional. If present, one sentence ≤16 words.
- **Row template:** `[ID] · subject-verb-object · [STATE] · timestamp`
  - `[#10] Render contract v1 lands. [MERGED] 2026-04-28`
- **Forbidden:** body prose enumeration of file paths.

## Headline construction (cross-recipe)

Headlines (h1/h2/h3) follow these rules in addition to per-recipe templates:

1. **Verb-led, present tense.** Most headlines start with the subject doing something. `Lanes recovered.` `Five phases queued.` `Indexing Linear tickets.`
2. **Period at end of declarative h1/h2.** sous-ds 1.0 already used this convention (e.g., "Do these first."). 2.0 makes it canonical.
3. **No editorial frame as h1.** "Where we are going," "What we are building," "How we got here" — these are outline labels, not headlines. Replace with the artifact: "Five phases queued," "Ten stages, four wired."
4. **Numerals as mono runs inside the headline.** When an h1 includes a number ("Ten stages, four wired."), the numeric run sets in mono per 1.0's `display`/`h1` rule (the alpha/numeric mix).

## Body construction

1. **First sentence: state.** Name the current state in ≤12 words.
2. **Second sentence (optional): cause or next.** Name what produced the current state, or what unblocks the next state.
3. **Third sentence: only with structural reason.** Three sentences in a card body needs justification — almost always means the card is doing too much, restructure into a recipe.
4. **No section-level recap.** "As you can see above…" "We've now established that…" — outline scaffolding, not body copy.

## Microcopy

| Surface | Pattern |
|---|---|
| Empty state | One sans sentence + one ghost-variant action. No illustration. (1.0 rule.) |
| Loading state | Bracketed mono `[LOADING…]` via `<InlineStatus>`. No "please wait" prose. (1.0 rule.) |
| Error state | One declarative sentence + one action. `Connection lost. Retry.` Not `Sorry, something went wrong! Please try again later.` |
| Toast confirmation | ≤6 words. `Saved.` `Settings updated.` `PR #17 merged.` |
| Button label | Verb. `Save.` `Retry.` `Show all.` Not `Click here to save.` |
| Form label | Noun. `Email.` `Token.` Not `Please enter your email.` |
| Tooltip | ≤16 words. Names what the affordance does, not what it is. |

## Banned constructions (cross-cutting)

- **"In order to"** → "to"
- **"At this time"** → "now" (or omit)
- **"In the process of"** → "is" + verb
- **"Going forward"** → omit
- **"At the end of the day"** → omit
- **"Move the needle"** → omit (named substitute: state the metric)
- **"Best-in-class"** → omit
- **"Cutting-edge"** → omit
- **"Robust" / "scalable" / "powerful"** → name the property
- **"Unlock"** as a verb for capability → name the capability

These appear nowhere in the test page (the 1.0 page failed in a different direction — engineering jargon, not marketing jargon) but are banned globally to keep the system out of generic SaaS voice.

## Voice + dials

Voice scales by the VOICE dial (Layer 6 of `sous-ds-v2.md`):

- **VOICE 1–3 (telegram):** ≤8 words per sentence. ≤2 sentences per card. Cards may be one sentence with no closer.
- **VOICE 4–7 (instrument, default):** This contract verbatim.
- **VOICE 8–10 (editorial):** ≤3 sentences per card. Rhetorical structure within a body (e.g., a contrast: "X holds. Y does not.") permitted. Voice rules V1–V7 still apply.

The case-study page should have run `VOICE=3` (telegram) and would have produced something legible.
