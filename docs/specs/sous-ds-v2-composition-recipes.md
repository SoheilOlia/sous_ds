---
name: sous-ds 2.0 composition recipes
status: draft
date: 2026-05-01
parent: sous-ds-v2.md
---

# Composition Recipes — sous-ds 2.0

A **recipe** is a named, opinionated archetype for one section of one page. Each recipe declares: intent, primary primitive, supporting components, layout, microcopy template, density quotas, and the failure mode it replaces.

Recipes are the unit of consistency that 1.0 lacked. Without recipes, every section converged on `eyebrow + h1 + body + grid-of-cards`.

## How recipes work

- A page draws ≥3 distinct recipes from this catalogue (or registered project-local recipes), unless `RHYTHM ≤ 3`.
- A recipe is invoked by intent, not by component. Claude's job is to read the user's content shape and pick the recipe whose **intent** matches.
- A recipe owns its microcopy template (Layer 5). Voice rules apply per-recipe.
- A recipe declares its forbidden substitutes — patterns that must not be used to express the same intent.
- Adding a new recipe follows `R-FAMILY-001` (survey, name motif, propose same-motif variants, mock against canonical, update labels).

## The catalogue (initial six)

### 1. PipelineMap

> **Intent:** Show a multi-stage process with order, per-stage state, and forward flow.

**Primary primitive:** `<DotTimeline>` rendered horizontally, one column per stage.
**Supporting:** `<DottedChart>` per stage (evidence density), `<InlineStatus>` for current stage, `<Pill>` for milestone label.
**Layout:** Full-width strip at the top of the section. Stage labels below. No card chrome around the strip itself — the strip is the structure.
**Microcopy:**
- Eyebrow: `STAGES — N` (mono, no period)
- Title: verb-led, ≤7 words, present tense. Good: `Ten stages, four wired.`
- Body: one sentence ≤24 words naming current state and next gate. No "we are building."
**Density quotas:** ≤1 per page. ≤8 stages per strip without scroll. ≤3 supporting `<Pill>` instances on the strip itself.
**Failure modes replaced:** Card grid of pipeline stages. Numbered list. Table with PR-merged pills.
**Forbidden substitutes:** A `<Card>` per stage, side by side. A markdown table with stage rows. A `<SegmentedBar>` per stage stacked vertically (that's MilestoneStrip, different recipe).

```jsx
<section data-recipe="PipelineMap">
  <header>
    <span className="ds-eyebrow">STAGES — 10</span>
    <h2>Ten stages, four wired.</h2>
    <p>Stage 5 (Copy) is the strongest current path. Stage 10 (Output) blocked on WARP.</p>
  </header>
  <DotTimeline
    columns={stages}
    rules={{ priority: ["live", "done", "queued"] }}
  />
  <DottedChart data={evidencePerStage} accent="success" />
</section>
```

### 2. AgentLog

> **Intent:** A scrolling stream of agent or tool activity, latest at top, with status and duration per row, and a "live now" head.

> **Row differentiation rule (v0.11.0):** AgentLog rows differentiate event kinds (demo / decision / status / code / file) **through the bracketed mono `[KIND]` label** inside the row, never through per-row background hue or per-kind text color. The natural first move is to tint rows by kind — that violates `R-SEMANTIC-001` and `R-COLOR-002`. Every row shares the same `surface-raised + 1px border` treatment; kind lives in the label.

> **Forbidden:** `--demo: <warm>; --decision: <green>; --status: <gray>` row tinting. This was tried (variant C, 2026-05-11) and removed. Bracketed label only.

**Primary primitive:** `<ToolCall>` stack (one row per event) with the head row carrying `<PulseTrail>` for "live now" feel.
**Supporting:** `<InlineStatus>` for state, `<LiveDot>` only on the head row, `<Pill>` for the tool/source name.
**Layout:** Single-column stack. Width ≤ 720px even on wide screens — agent activity reads as a transcript, not a dashboard.
**Microcopy:**
- Eyebrow: timestamp range or `LIVE` (mono)
- Title: ≤6 words, present tense if live, past tense if done. Good: `Indexing Linear tickets`. `Retired stale handoffs.`
- Row title: subject-verb-object. ≤8 words. Good: `PR #17 retired stale handoffs.`
- Row detail: ≤24 words. May contain numerals; numerals in mono.
**Density quotas:** Show ≤8 rows by default; older rows fold under a `<Button variant="ghost">show all</Button>`. No more than 1 `<PulseTrail>` per page.
**Failure modes replaced:** Markdown table with PR-merged pills. Bullet list. Card grid of recent activity.
**Forbidden substitutes:** A `<Card>` per event. A timeline component (that's MilestoneStrip — different intent: completed phases vs. live activity).

```jsx
<section data-recipe="AgentLog">
  <header>
    <span className="ds-eyebrow">RECENT — 16:42</span>
    <h2>Indexing Linear tickets.</h2>
  </header>
  <ToolCall tone="live" head>
    <PulseTrail length={6} />
    <ToolCall.Title>fetch_tickets — Linear</ToolCall.Title>
    <ToolCall.Detail>54 of 188 indexed.</ToolCall.Detail>
  </ToolCall>
  <ToolCall tone="done">PR #17 retired stale handoffs.</ToolCall>
  <ToolCall tone="done">PR #16 expanded smoke matrix to 5 fixtures.</ToolCall>
  …
</section>
```

### 3. ReceiptStack

> **Intent:** A list of completed events that should read as machine-attested truth, not as a story.

**Primary primitive:** `<ToolCall tone="done">` rows with mono `[ID]` prefix and bracketed timestamp suffix.
**Supporting:** `<InlineStatus>` for terminal state words (`[MERGED]`, `[CLOSED]`, `[SUPERSEDED]`).
**Layout:** Single-column stack. Width unconstrained (this is data). Mono dominates; sans only for the optional one-sentence preamble.
**Microcopy:**
- Eyebrow: provenance. `RECEIPTS — origin/main`
- Title: present-tense state of the underlying truth. ≤8 words. `Six receipts. Five merged. One superseded.` Numerals in mono.
- Body (optional): one sentence ≤16 words. Often omitted — the rows speak.
- Row template: `[ID] · subject-verb-object · [STATE] · timestamp`
**Density quotas:** No upper bound. ReceiptStack is the one recipe where density is the point.
**Failure modes replaced:** File paths in body prose. Markdown table with status pills. "Receipts: …, …, and …" sentence.
**Forbidden substitutes:** A `<Card>` with bullet list. Body-prose enumeration.

```jsx
<section data-recipe="ReceiptStack">
  <header>
    <span className="ds-eyebrow">RECEIPTS — origin/main</span>
    <h2>Six receipts. Five merged. One superseded.</h2>
  </header>
  <ToolCall tone="done">
    <code>[#10]</code> Render contract v1 lands. <InlineStatus>[MERGED]</InlineStatus> <time>2026-04-28</time>
  </ToolCall>
  <ToolCall tone="done">
    <code>[#12]</code> SPEC-O gate payload normalizer lands. <InlineStatus>[MERGED]</InlineStatus> <time>2026-04-28</time>
  </ToolCall>
  …
</section>
```

### 4. MetricWall

> **Intent:** A page-anchoring set of 2–4 numbers that share a unit or axis.

**Primary primitive:** `<MetricStat>` row capped at 4 instances.
**Supporting (optional):** one `<DottedChart>` strip below the row showing the underlying time series.
**Layout:** Horizontal row at the top of a page or section. Each stat takes equal width. The supporting `<DottedChart>` (if present) spans the full row width below.
**Microcopy:**
- Eyebrow: the **shared unit or axis**. Without this eyebrow, the recipe is a `R-METRIC-001` violation. Good: `EVIDENCE MATURITY — % PER STAGE`. Bad: `KEY METRICS`.
- Title: optional. If present, ≤7 words, names the implication of the numbers, not the numbers themselves. Good: `Evidence is climbing.` Bad: `Our four key metrics.`
- Stat label: ≤3 words, mono. Stat unit: in `<sup>` at half size, baseline-aligned.
**Density quotas:** ≤4 stats. ≤1 MetricWall per page. ≤1 supporting chart.
**Failure modes replaced:** 4-up grid of mismatched-unit stats (10 stages, M2, 5 fixtures, 2 blockers — these don't belong together).
**Forbidden substitutes:** A grid of `<Card>` containing one stat each. A pie chart. A `<MetricStat>` with units that don't compose in the eyebrow's axis.

```jsx
<section data-recipe="MetricWall">
  <header>
    <span className="ds-eyebrow">EVIDENCE MATURITY — % PER STAGE</span>
  </header>
  <div className="ds-stat-row">
    <MetricStat label="Verified" value={68} unit="%" />
    <MetricStat label="Codegen" value={52} unit="%" />
    <MetricStat label="Render" value={48} unit="%" />
    <MetricStat label="Output" value={52} unit="%" />
  </div>
  <DottedChart data={maturityHistory} />
</section>
```

### 5. RAGStatus

> **Intent:** A single-word system-state callout (RED / AMBER / GREEN / BLUE) with one explanatory sentence.

**Primary primitive:** `<LiveBlock>` carrying the state word + `<Pill>` for the colored marker.
**Supporting:** ≤2 `<MetricStat>` callouts inline (e.g., bar confidence %, evidence maturity range).
**Layout:** Compact horizontal row. State word at display size in mono, single sentence to its right at body-lg.
**Microcopy:**
- Eyebrow: scope. `PROJECT RAG`. `BUILD HEALTH`.
- Title: state word + colon + verb-led clause. Good: `Amber: diagnostics tightened the bar.` Bad: `Amber, stricter after diagnostics.` (vague comparative; missing subject for "stricter")
- Body: one sentence ≤20 words naming why and what unblocks green. No "the project is not green because…" phrasing — just name the gating condition.
**Density quotas:** 1 per page. ≤2 supporting `<MetricStat>`.
**Failure modes replaced:** A `<Card>` with a colored dot, an h1, and a paragraph of "the compiler spine and validation gates are real on this branch…"
**Forbidden substitutes:** A modal or banner. A status pill alone (too quiet for a system-state callout).

```jsx
<section data-recipe="RAGStatus">
  <header>
    <span className="ds-eyebrow">PROJECT RAG</span>
    <div className="ds-rag-row">
      <LiveBlock state="amber">AMBER</LiveBlock>
      <h2>Amber: diagnostics tightened the bar.</h2>
    </div>
    <p>Bar confidence climbs to 78–80% after #16/#17 land. Green requires PR #20 (CI gate).</p>
  </header>
  <div className="ds-stat-row">
    <MetricStat label="Bar confidence" value="78–80" unit="%" />
    <MetricStat label="Evidence maturity" value="69–71" unit="%" />
  </div>
</section>
```

### 6. MilestoneStrip

> **Intent:** A horizontal time-tagged set of phases with done/active/queued state per phase. Distinct from PipelineMap — phases are bigger units (M1, M2…), not pipeline stages.

**Primary primitive:** `<DotTimeline>` with phase labels above + `<SegmentedBar>` per phase below for sub-progress.
**Supporting:** `<Pill>` for ticket/blocker IDs (≤3 per phase). `<InlineStatus>` for blocker callouts.
**Layout:** Horizontal strip. Each phase gets equal width. Above each phase: label + state. Below each phase: SegmentedBar showing sub-tasks done/total.
**Microcopy:**
- Eyebrow: `MILESTONES — N PHASES`
- Title: present-tense, names the trajectory. Good: `Five phases. Three live, two queued.`
- Phase label: `M1` style, mono. Phase title: ≤4 words. Phase body: 1 sentence ≤16 words.
**Density quotas:** ≤6 phases (more = scroll or split into two strips). ≤3 `<Pill>` per phase.
**Failure modes replaced:** 5-up grid of milestone cards each with DONE/NEXT/TICKETS/RECEIPTS sub-sections (the original failure).
**Forbidden substitutes:** Vertical list of cards. Gantt chart (a different recipe entirely; not in 2.0 catalogue).

```jsx
<section data-recipe="MilestoneStrip">
  <header>
    <span className="ds-eyebrow">MILESTONES — 5 PHASES</span>
    <h2>Five phases. Three live, two queued.</h2>
  </header>
  <div className="ds-phase-strip">
    {phases.map(phase => (
      <article data-phase={phase.id}>
        <header>
          <code>{phase.id}</code>
          <h3>{phase.title}</h3>
        </header>
        <SegmentedBar value={phase.done} total={phase.total} />
        <p>{phase.summary}</p>
        <div className="ds-phase-pills">
          {phase.tickets.slice(0, 3).map(t => <Pill key={t}>{t}</Pill>)}
        </div>
      </article>
    ))}
  </div>
</section>
```

## Recipe registration

Project-local recipes live in `docs/specs/recipes/<name>.md` and follow the same schema as the catalogue above:

```yaml
---
name: <RecipeName>
intent: <one sentence>
primary: <primitive>
supporting: [<list>]
layout: <one sentence>
microcopy:
  eyebrow: <template>
  title: <template>
  body: <template>
quotas:
  primary_per_page: <int>
  pills_per_card: <int>
failure_modes_replaced:
  - <description>
forbidden_substitutes:
  - <description>
---
```

The 2.0 SKILL.md teaches Claude to discover registered recipes alongside the catalogue.

## Recipe-pair anti-patterns

Some recipe pairs are forbidden in the same page:

- **PipelineMap + MilestoneStrip on the same page** — they overlap conceptually (process phases). Pick one. If both are needed, split into two pages or two distinct sections explicitly framed (`This is the pipeline. The milestones below are the proof phases.`)
- **MetricWall × 2** — only one MetricWall per page. A second is pillar-anchored data redundancy.
- **AgentLog + ReceiptStack of the same source** — they're the live and historical views of the same stream. Pick one or distinguish explicitly with `LIVE` vs `RECEIPTS` eyebrows.

## Forbidden non-recipe sections

Sections that are not anchored to a recipe in this catalogue (or a registered project-local recipe) require justification in the page draft. The default falls back to the safe `eyebrow + h1 + body + card-grid` — which is exactly the failure mode 2.0 exists to prevent.

When in doubt, use **MetricWall + RAGStatus + AgentLog** as the three-recipe minimum. They cover most AI-product status surfaces.

## Single-archetype surfaces (v0.11.0)

Some surfaces are *legitimately* one recipe repeated: a resume index, a glossary, a directory of teams, a list of receipts. R-COMPOSE-002 forbids same-recipe ≥3 and R-COMPOSE-004 requires ≥3 distinct recipes — but those rules are scoped to `RHYTHM ≥ 4`. A single-archetype page is valid when `RHYTHM ≤ 3` **and the dial is declared inline** in the renderer:

```jsx
// Dials: DENSITY=4, RHYTHM=2 (single-archetype directory layout —
// exempt from R-COMPOSE-002/004 per the dial contract)
```

The declaration is the honesty contract. Reviewers check for it before citing R-COMPOSE-002. A renderer that repeats one recipe with no dial declaration is wrong; a renderer that declares `RHYTHM=2` and repeats one recipe is correct.
