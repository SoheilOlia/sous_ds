# ROOM_BRIEF

## Problem
AI coding agents default to generic "marketing brochure" UI. `sous-ds` is the contract that constrains them toward a dark-first, data-dense, restraint-led house style: monospace for data, 1px borders over shadows, two semantic accents, motion under 300ms, WCAG AA on every pair. The contract lives in six files (DESIGN.md, AGENTS.md, ANIMATION_RULES.md, TASTE_LOG.md, quality-evaluator.md, design-tokens.json) plus `tokens.css` and reference `components/`.

## Current Focus
v0.5.0 is the first installable release — ESM/CJS/types + Tailwind preset, published via the new tag-push → npm/GitHub Release workflow. Recent beats: Block-family loader rename (Live/SquareLoader → Block), `<LiveCube>` as the dimensional sibling of `<LiveDot>`, §11 loader alignment + typewriter caption polish. Next beat is whatever the 36 pending working-tree changes land as.

## Bigger Program
`sous-ds` is the design source-of-truth for downstream consumers that install it via npm and inherit its tokens, preset, and components. New UI in this repo must read as a sibling to what already ships — match the section-head pattern, DottedChart density, and still-frame motion legibility — so that consuming apps stay coherent as the system grows.
