---
name: sous-ds reference learning protocol
status: draft
date: 2026-05-04
owner: design-system
sources:
  - https://github.com/Donsoleil/ui-ux-pro-max-skill
  - https://github.com/Donsoleil/cult-ui
---

# Reference Learning Protocol

SOUS-DS can learn from finished projects and external design-system references, but it must not absorb a foreign aesthetic wholesale. The unit of ingestion is a durable system rule: a token, component, recipe, refusal, motion rule, voice rule, installer behavior, or taste-log entry.

## Source Lessons

### ui-ux-pro-max-skill

The useful pattern is not its palette catalogue or broad style taxonomy. The useful pattern is the operational shape:

- Searchable design knowledge grouped by domain, stack, style, color, typography, chart, and UX.
- Reasoning output that includes recommendation, anti-patterns, effects, and a pre-delivery checklist.
- Platform templates that make one skill portable across Claude, Codex, Cursor, and other agents.

SOUS-DS adoption:

- Keep SOUS-DS as one restrained system, not 67 selectable styles.
- Use dials, recipes, refusals, and checklists as the controlled variation surface.
- Make global installation first-class so every agent starts from the same contract.
- When a project teaches the system something, route it to source truth instead of leaving it in chat.

### cult-ui

The useful pattern is the distribution model:

- Components are source-owned by the consuming project, not black-box package magic.
- Registry-style examples make implementation details inspectable.
- The docs explicitly separate component design from implementation packaging.

SOUS-DS adoption:

- Promote repeated local CSS into SOUS-DS components or recipes.
- Keep component source readable and copyable.
- Document composition recipes alongside components so agents know when to use each primitive.
- Treat application-specific content as non-transferable; extract only reusable structure.

## Learn From This Project

Use this protocol when a user says "Learn from this project" or asks to update SOUS-DS after a finished UI pass.

1. **Capture the source.** Record repo path, URL, branch, PR, screenshot, and exact files inspected.
2. **Classify the lesson.** One of: token, component, recipe, refusal, motion rule, voice rule, installer/tooling, taste-log entry.
3. **Check existing truth.** Search `DESIGN.md`, `SKILL.md`, `AGENTS.md`, `refusals.json`, `components/`, `docs/specs/`, and `TASTE_LOG.md` before writing.
4. **Promote only durable patterns.** Reject project copy, one-off layout values, foreign brand styling, and decorative flourishes.
5. **Update the right source.**
   - Token or semantic role: `DESIGN.md`, `design-tokens.json`, `tokens.css`
   - Component behavior: `components/`, `preview.html`, `components/index.ts`
   - Page structure: `docs/specs/*composition*`, `SKILL.md`
   - Banned pattern: `refusals.json`, `quality-evaluator.md`, `scripts/lint.mjs`
   - Taste rationale: `TASTE_LOG.md`
   - Agent distribution: `bin/init.mjs`, `install.sh`, `INSTALL.md`
6. **Verify.** Run the narrowest real tests and the broadest practical package check available.
7. **Receipt.** Record source, extraction, files changed, commands, rejected imports, and remaining risks.

## Trust Automation Milestone Map Extraction

The current milestone map polish taught SOUS-DS these candidate promotions:

- Linked pills need first-class interactive states, not app-local `a.pill` CSS.
- Citation/source links should be canonical components, not inline file paths.
- Compact metric rails are distinct from hero `MetricStat`.
- `SegmentedBar` needs a labeled wrapper for value, meter, and evidence note.
- Evidence-heavy tables need a `DataTable` recipe.
- Stage and milestone cards need a workflow recipe, not one-off card grids.

Do not copy the Trust Automation copy, PR IDs, or project-specific proof model into SOUS-DS. Promote only the component and composition gaps.
