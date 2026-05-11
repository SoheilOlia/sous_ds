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

## Server-side proxy for the Anthropic API

The playground uses `dangerouslyAllowBrowser: true` and reads
`VITE_ANTHROPIC_API_KEY` straight from `import.meta.env`. That's fine on
`localhost` for an individual dogfooding the demo. It is not fine for any
deployed surface — including an internal Vercel preview, a Blockcell share
link, or a teammate's machine.

**Before the playground becomes a shared URL** (deployed anywhere with
network egress beyond the user who launched it), the Anthropic call must
move behind a server. Smallest viable shape:

- A single edge function (Vercel/Cloudflare Worker/Next.js API route) that
  reads `ANTHROPIC_API_KEY` from a server-side secret and forwards the
  `messages.create` payload upstream.
- Playground swaps the SDK call for a `fetch("/api/plan", { method: "POST",
  body: JSON.stringify({ system, messages, model }) })`.
- The browser bundle no longer references the SDK or the key.

The header comment in `examples/generative-ui-playground.tsx` already says
"do not deploy this as-is" — but a comment isn't infrastructure. Track this
as a real gating gap before any shared URL.

## `<Citation>` integration in body strings

`<Citation>` exists as an inline source chip but the renderer does not yet
parse body strings for citation markers. Body strings are rendered as plain
text.

**Workaround in v0.10.0:** out of scope. Body strings stay plain. R-VOICE-001
(no file paths in prose) is enforced via the schema's `Body` pattern.

**If we graduate it:** add a `citations: [{ id, source, preview }]` field to
each section and a `{{id}}` interpolation convention in body strings. The
renderer would split the body on markers and emit `<Citation>` for each.
