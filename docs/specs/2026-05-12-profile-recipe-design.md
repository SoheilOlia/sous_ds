---
name: Profile recipe — R-FAMILY-001 design pass
status: design (variant pick pending)
date: 2026-05-12
protocol: R-FAMILY-001
parent: docs/specs/sous-ds-v2-composition-recipes.md
target_version: v0.12.0
---

# Profile recipe — design doc

The user prompt *"Create a card that shows me: designer name, avatar, slack handle, what they are working on, AI confidence score"* failed schema validation in v0.11.0 because the planner had no recipe to map "person card" onto. R-COMPOSE-006 refuses matching/relevancy chrome on roster surfaces; R-METRIC-002 forbids per-person counts in comparative shape. Neither *proposes* what to use for "show me one person."

This doc runs the R-FAMILY-001 protocol on a proposed seventh composition recipe: **Profile**.

---

## Step 1 — Survey (the recipes family)

Six existing recipes, all page-section-level:

| Recipe | Intent | Primary primitive |
|---|---|---|
| PipelineMap | multi-stage process with order + state | `<DotTimeline>` horizontal |
| AgentLog | live agent/tool activity stream | `<ToolCall>` stack + `<PulseTrail>` head |
| ReceiptStack | completed events, machine-attested | `<ToolCall tone="done">` rows |
| MetricWall | 2–4 numbers sharing a unit/axis | `<MetricStat>` row |
| RAGStatus | single state-word callout | mono state word + `<LiveDot>` or `<SegmentedBar>` |
| MilestoneStrip | time-tagged phases with progress | `<DotTimeline>` + per-phase `<SegmentedBar>` |

**What every recipe shares (the family motif):**
- Wraps content in a `<Card>` (1px border, no shadow, radius-md, surface)
- Eyebrow in mono uppercase tracked text, muted
- Section title in h3 mono, present-tense, verb-led
- One primary primitive that carries the data shape
- All accent rides sanctioned carriers (no raw accent CSS)
- Compose from existing primitives — no recipe introduces a new component

**Adjacent person-shaped primitives currently in the system:** none. There is no `<Avatar>`, no `<Profile>`, no `@handle` convention, no identity component. Profile introduces the first identity primitive.

---

## Step 2 — Motif in one sentence

> A composition recipe is a named, page-section-level archetype that takes a content intent + dial inputs, wraps a `<Card>`, declares its primary primitive, and emits eyebrow + title + body composed from sanctioned components — one recipe per intent, with the body shape that best matches the data the user has.

**Profile inherits this motif.** It is a card-wrapped page section whose intent is "show one person, who they are, what they are shipping." Its primary primitive is an **identity head row** (new) followed by an **artifact body** (existing — ReceiptStack-style).

---

## Step 3 — Vocabulary (explicit)

| Dimension | Decision |
|---|---|
| **Primitive shape** | `<Card>` wrapper (same as every existing recipe) + new identity-head row + existing receipt/agent-row stack |
| **Identity head** | Monogram circle (1px-bordered, mono initial in `text-primary`) + name (mono or display, depending on density) + role + handle in mono `[@name]` |
| **State coloring** | Identity is **neutral only** (text-primary/secondary/muted). Confidence rides existing carriers: `<SegmentedBar>` at full → `accent-success`; `<LiveDot>` if AI is currently inferring → `accent-live`. No raw accent CSS. |
| **Motion cadence** | Reuses `ds-gen-section-enter` (scale 0.97 → 1, opacity 0 → 1, `var(--ds-dur-standard)`, staggered). Avatar does not have its own entry animation. |
| **Axis / label language** | Eyebrow = role + scope (`"DESIGNER — TRUST"`). Section title = name (`"Soheil Olia."`) verb-led when used as identity context. `@handle` in mono `[@soheil]` brackets. |
| **Typography** | Name: h3 mono (28px) by default; display (Cash Sans 64px) when DENSITY ≤ 4. Handle: mono label (11px, tracked 0.08em). Body: Geist sans, 15px, capped at measure. |
| **Avatar** | Monogram in 1px-bordered circle. Sizes snap to existing tokens — 32px (default), 40px (DENSITY=5), 48px (DENSITY≤4). No raster avatars in v1; the optional `imageUrl` field is deferred to a follow-up so we can ship without image-handling. |
| **Refusals carried** | R-COMPOSE-006 (no matching/relevancy rails); R-METRIC-002 (no per-person counts unless self-evidently descriptive — confidence is the one permitted scalar); R-COMPOSE-005 (no policing chrome — no [BEHIND] or [AT RISK] badges on a Profile). |

---

## Step 4 — Three variants (same primitive, different body shape)

All three share the identity-head structure above. They differ in **what goes in the body**.

### Variant A — Identity head + ReceiptStack body *(recommended)*

```
┌────────────────────────────────────────────────────────────────┐
│ DESIGNER — TRUST                                               │
│                                                                │
│  ●─.   Soheil Olia.                              [@soheil]    │
│ │ S │  Working on cdwm and trust review                        │
│  '─'                                                           │
│                                                                │
│ RECENT                                                         │
│ ─────────────────────────────────────────────────────────────  │
│ R-001  Trust review dashboard variant A.    [SHIPPED] 05-11    │
│ R-002  Compiler spine for cdwm-validators.  [SHIPPED] 05-10    │
│ R-003  Reflective-surface refusal spec.     [MERGED]  05-11    │
│ R-004  Nexus-session taste capture.         [DRAFT]   05-12    │
└────────────────────────────────────────────────────────────────┘
```

- **Body:** ReceiptStack of 3–6 artifacts the person has shipped (R-METRIC-002 compliant — shows what was made, not how much)
- **Optional confidence:** single `<MetricStat>` in `Card.meta` slot ("AI confidence 87%") — counts as a one-stat callout, exempt from R-METRIC-001
- **Density:** 6, RHYTHM 2 (single-archetype — dial declaration required per v0.11.0)
- **What this is good for:** the user's literal request, mapped cleanly to existing primitives
- **What it can't do:** show real-time activity (use Variant B for that)

### Variant B — Identity head + "Working on" + recent shipped *(split body)*

```
┌────────────────────────────────────────────────────────────────┐
│ DESIGNER — TRUST                                               │
│                                                                │
│  ●─.   Soheil Olia.                              [@soheil]    │
│ │ S │                                                          │
│  '─'                                                           │
│                                                                │
│ WORKING ON  ── LIVE                                            │
│ ─────────────────────────────────────────────────────────────  │
│ ●  cdwm trust-review variant A         01:23  [LIVE]           │
│                                                                │
│ RECENT                                                         │
│ ─────────────────────────────────────────────────────────────  │
│ R-001  Compiler spine for validators.       [SHIPPED] 05-10    │
│ R-002  Reflective-surface refusal spec.     [MERGED]  05-11    │
│ R-003  Nexus-session taste capture.         [DRAFT]   05-12    │
└────────────────────────────────────────────────────────────────┘
```

- **Body:** two subsections — `WORKING ON` (AgentLog-style with `<PulseTrail>` head, 1–2 active items) + `RECENT` (ReceiptStack, 3 items)
- **Closer to a live agent-style profile**; useful for "show me what they're doing right now"
- **Density:** 7, RHYTHM 4 (two distinct shapes inside — borderline R-COMPOSE-004 but exempt as one recipe with two body subsections)
- **What this is good for:** team-of-teams overviews where the live-now feel matters
- **Cost:** slightly more complex; two body slots; the planner has to know when to emit each

### Variant C — Identity-only callout *(thinnest)*

```
┌────────────────────────────────────────────────────────────────┐
│ DESIGNER — TRUST                                               │
│                                                                │
│  ●──────.   Soheil Olia.                                       │
│ │   S    │  Working on cdwm and trust review.                  │
│  '──────'                                                      │
│                                                                │
│ [@soheil]   AI confidence ▓▓▓▓▓▓▓▓▓░ 87%                      │
└────────────────────────────────────────────────────────────────┘
```

- **Body:** one-sentence "working on" + handle + single confidence metric
- **No artifact list.** Closest to the literal user prompt
- **Density:** 3, RHYTHM 2
- **What this is good for:** identity callout inside a larger composition (e.g., header of a knowledge-layer page)
- **What it can't do:** answer "what have they shipped" — you'd compose it with a separate ReceiptStack section, defeating the point of one Profile recipe

---

## Step 5 — Mock against canonical *(deferred to after pick)*

Once you pick the variant, I render it next to a canonical existing recipe (likely ReceiptStack since they share the row-stack pattern) at actual pixels via the browse skill, and we glance-test whether it reads as sibling or visitor.

---

## Recommendation: **Variant A**

Reasoning, ranked:

1. **Most aligned with R-METRIC-002.** Shows what was *made* (the receipt rows), with an optional single confidence metric — the one count the refusal explicitly permits.
2. **Most aligned with R-COMPOSE-006.** No matching/relevancy rail; the artifact list is the surface area.
3. **Uses existing primitives only.** No new components required — just a new renderer function in `GenerativeRenderer.tsx`, a new schema entry, a new section in the planner-taste corpus, and a monogram-circle CSS pattern (which is small enough to live inside the renderer's CSS, not a new component).
4. **Smallest recipe surface to ship.** Variant B's split-body is a real escalation of recipe complexity (two subsections inside one recipe is a precedent we'd have to live with). Variant C is so thin it's barely distinguishable from a vanilla Card and doesn't answer the "what have they shipped" question.
5. **Variant B grows out of A naturally.** Adding `isLive` and a `working_on` array later is additive; we'd ship A in v0.12.0 and consider B in v0.13.0 if real demand surfaces.
6. **Variant C is captured as a degenerate case of A.** Empty artifact list + present confidence + small density renders close to C visually. We don't need a separate recipe for it.

---

## If you pick A — implementation plan (v0.12.0)

| File | Action |
|---|---|
| `docs/specs/generative-ui-schema.json` | New `ProfileSection` shape — `recipe: "Profile"`, `eyebrow`, `name` (required), `role` (optional), `handle` (optional, regex enforces `[@\w]` shape), `body` (optional 120-char description), `artifacts` (optional ReceiptItem[] 0–6), `confidence` (optional `{ label, value 0–100 }`) |
| `components/generative-ui-types.ts` | Add `ProfileSection` to the union |
| `components/GenerativeRenderer.tsx` | Add `renderProfile()` function; route `recipe: "Profile"` to it; new identity-head subcomponent (monogram + name + handle + body) |
| `components/GenerativeRenderer.css` | New `.ds-gen-profile-*` classes — monogram circle (32/40/48 sizes, snapped to tokens), head layout, separator rule between head and ReceiptStack body. All values via `var(--ds-*)`. No accent painted directly. |
| `examples/generative-ui-fixtures.json` | Add a 5th fixture — `profile-soheil` (or similar) so the chip-load works without a live API call |
| `docs/specs/sous-ds-v2-composition-recipes.md` | New "7. Profile" section with intent, primary primitive, supporting components, layout, microcopy template, density quotas, failure-mode-replaced, forbidden substitutes |
| `docs/specs/planner-taste.md` | New section "Profile recipe" explaining when the planner should pick Profile vs. AgentLog vs. ReceiptStack |
| `docs/specs/generative-ui-planner.md` | Add Profile to the six-recipes table; add Profile to the component vocabulary table (Step 7 of R-FAMILY-001 from v0.11.0) |
| `SKILL.md` | Add Profile to the recipe table in the Composition recipes section; add Profile row to the intent→component decision tree |
| `TASTE_LOG.md` | ENTRY 012 — "Profile recipe added (R-FAMILY-001 pass)" with the design doc cross-reference and the `### Planner update` subsection |
| `CHANGELOG.md` | v0.12.0 entry |
| `package.json` | bump 0.11.0 → 0.12.0 |

After implementation:
- Lint, tsc, schema validate, dev-server boot, browse smoke test
- Verify the user's original prompt now succeeds: *"Create a card that shows me: designer name, avatar, slack handle, what they are working on, AI confidence score"*
- Commit + push

---

## Open questions for you

1. **Variant pick:** A (recommended), B, or C — or a hybrid I missed?
2. **Avatar format in v1:** monogram-only (the doc's assumption), or also accept an `imageUrl` field that renders an `<img>` inside the circle? (Monogram-only is cleanest; image support adds a real surface — async load, alt text, fallback.)
3. **Confidence positioning:** single `<MetricStat>` in `Card.meta` (right side of head, compact) vs. separate strip below the head (more visible). Lean: `Card.meta` for v1, escalate if it reads cramped.
4. **`@handle` semantics:** is it always Slack? Or do we parameterize it (e.g., `{ kind: "slack" | "github" | "email", value: "soheil" }`)? Lean: just a string for v1; kind is overkill until a second source surfaces.
