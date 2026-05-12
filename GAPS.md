# GAPS

Aspirational APIs surfaced during the v0.10.0 generative-UI work. None block
the ship — the renderer composes around each gap. Track here so future work
can graduate the pattern under `R-FAMILY-001` instead of inventing it ad hoc.

## `<LiveBlock state>`

The v2 RAGStatus recipe example uses `<LiveBlock state="amber">AMBER</LiveBlock>`,
but `LiveBlock` has no `state` prop today — it carries `label` / `labels` for
rotating typewriter text.

**Workaround in v0.10.0:** RAGStatus renders the state word in mono-xl. RED
gets a `<LiveDot>` adornment (sanctioned `accent-live` carrier); GREEN gets a
`<SegmentedBar value={1} total={1} completeTone="success">` strip
(sanctioned `accent-success` carrier); AMBER stays neutral — there is no
AMBER accent in the system.

**If we graduate it:** decide whether `state` carries motion (LiveBlock's
chasing-blocks signature) or just a static label. Either way, follow
`R-FAMILY-001` against the LiveBlock family.

## `<ToolCall head>` and `<ToolCall tone>`

The AgentLog recipe example shows `<ToolCall tone="live" head>` (with a
`PulseTrail` slot) and `<ToolCall tone="done">`. The shipped component uses
`statusTone` for accent control and has no `head` slot.

**Workaround in v0.10.0:** AgentLog renders `<PulseTrail>` above the
`<ToolCall>` stack when `isLive=true`. Per-row accent rides on
`statusTone="live"` from the `status` field.

**If we graduate it:** `head` would be a structural slot, not a tone — keep
`statusTone` for the accent decision and surface `head` as a separate prop
that consumers compose with `<PulseTrail>`.

## Labeled stage-strip primitive

`PipelineMap` calls for a horizontal row of labeled stage dots, but
`<DotTimeline>` is a time-bucketed component (its `Bucket` shape carries
`ts` + `count` + `state`) and has no labeled-stage mode.

**Workaround in v0.10.0:** `GenerativeRenderer` composes the stage strip
inline. Dots route through sanctioned carriers — `<LiveDot>` for `live`,
neutral text-primary for `done`, line-strong hollow for `queued`. Same dot
family, different layout; no accent painted in renderer CSS.

**If we graduate it:** name the primitive (e.g. `<StageStrip>`), run
`R-FAMILY-001` against the dot family, and let `PipelineMap` use it
directly.

## Pill `success` variant

`<Pill>` has `live: boolean` (carries `accent-live`) but no `success`
variant — successful completion has no `<Pill>` carrier today.

**Workaround in v0.10.0:** RAGStatus GREEN uses `<SegmentedBar>` at full
completion instead of a green pill.

**If we graduate it:** a `success` flag on `<Pill>` would need a new sanctioned
carrier entry in `R-SEMANTIC-001` and `CL07` (`components/Pill.css` is already
in the `accent-success` allow list, so the file gate is fine — only the prop
API needs deliberation).

## Server-side proxy for the Anthropic API — **closed in v0.10.1**

Previously: the playground called the Anthropic API directly from the
browser with `dangerouslyAllowBrowser: true`. Org-issued keys (Block,
Anthropic for Work tenants, etc.) reject browser-origin requests at the
CORS layer, so the playground only worked with personal keys.

**v0.10.1 fix:** `examples/vite.config.ts` mounts a `/api/plan`
middleware that proxies planner requests to `api.anthropic.com`
server-side. The key reads from `ANTHROPIC_API_KEY` (or legacy
`VITE_ANTHROPIC_API_KEY` — both work, the former is preferred) and
never reaches the browser bundle. The `@anthropic-ai/sdk` browser
dependency was dropped; the proxy uses plain `fetch`.

A `GET /api/plan` health check returns `{ keyConfigured, model }` so
the sidebar can warn before the first request.

**Remaining work for production:** the Vite middleware is a dev-server
construct. Deploying the playground (Vercel, Blockcell, etc.) still
needs a real edge function / API route mirroring the middleware. The
client code (`fetch("/api/plan", …)`) is already deploy-ready; only
the server-side handler has to be ported.

## Roster recipe (multi-person)

The `Profile` recipe (shipped in v0.12.0) handles one person. A multi-person
roster surface — team page, directory of teams, attendee list — is the
natural companion and was implied by R-COMPOSE-006's "crew manifest" framing.

**Workaround in v0.12.0:** compose a page with multiple `Profile` sections.
Declare `dials.rhythm` ≥ 4 since a multi-Profile page is no longer
single-archetype (technically R-COMPOSE-002 fires after 3 Profiles). Up to 3
people is composable inline; beyond that we need a `Roster` recipe.

**If we graduate it:** runs R-FAMILY-001. Open questions: row shape (the
full Profile head per row, or a compact one-line variant?), sort/filter
controls (none — R-COMPOSE-005/006 stay in force), pagination strategy.

## `<Pill variant="wordmark">` for source-system provenance chiprows

Reflective surfaces (knowledge layers, weekly status, team rosters) often
need to communicate which systems back the data — Slack permalinks,
Figma URLs, GitHub PRs, Linear issues, Notion docs. v0.11.0 names the
pattern in `docs/specs/planner-taste.md` (Source-system provenance) but
the component variant is not yet built.

The intended shape: a `wordmark` variant of `<Pill>` that renders a mono
uppercase tracked wordmark inside a 1px-bordered chip. Same primitive
shape as `<Pill variant="outline">`, semantic content is the system name.

**Workaround in v0.11.0:** renderers compose the pattern inline using
existing primitives — a row of `<Pill variant="outline">` with mono
uppercase children carrying `SLACK`, `FIGMA`, `GITHUB`, `LINEAR`, `NOTION`.
Pattern documented; component variant follows.

**If we graduate it:** runs R-FAMILY-001 against the Pill family.
Vocabulary: same pill shape, same radius, same 1px dashed border, but
the `wordmark` semantic flag carries "this is a system name, not a
status" so future styling decisions stay coherent. Critically, **real
brand-color logos are forbidden** (R-COLOR-002, R-SEMANTIC-001) — only
the mono wordmark in the chip.

## `<Citation>` integration in body strings

`<Citation>` exists as an inline source chip but the renderer does not yet
parse body strings for citation markers. Body strings are rendered as plain
text.

**Workaround in v0.10.0:** out of scope. Body strings stay plain. R-VOICE-001
(no file paths in prose) is enforced via the schema's `Body` pattern.

**If we graduate it:** add a `citations: [{ id, source, preview }]` field to
each section and a `{{id}}` interpolation convention in body strings. The
renderer would split the body on markers and emit `<Citation>` for each.
