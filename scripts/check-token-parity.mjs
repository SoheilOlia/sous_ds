#!/usr/bin/env node
/**
 * Verify that the runtime CSS custom properties in tokens.css are backed by
 * design-tokens.json source values.
 *
 * The DTCG source has descriptive paths like color.bg.default. Runtime CSS uses
 * stable aliases like --ds-bg and --ds-text-primary. This check validates that
 * contract instead of requiring one CSS variable per DTCG path.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const tokens = JSON.parse(readFileSync(join(ROOT, "design-tokens.json"), "utf8"));
const css = readFileSync(join(ROOT, "tokens.css"), "utf8");

const declarations = new Map();
for (const match of css.matchAll(/(--ds-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  if (!declarations.has(match[1])) {
    declarations.set(match[1], match[2].trim());
  }
}

const errors = [];

function readToken(path) {
  let node = tokens;
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && "$value" in node) {
      node = node.$value;
    }
    node = node?.[part];
  }
  if (node && typeof node === "object" && "$value" in node) {
    return node.$value;
  }
  if (node === undefined) {
    throw new Error(`Unknown token path: ${path}`);
  }
  return node;
}

function referenceToCssVar(value) {
  if (typeof value !== "string") return String(value);
  const match = value.match(/^\{([^}]+)\}$/);
  if (!match) return value;
  return `var(--ds-${match[1].replace(/\./g, "-")})`;
}

function normalize(value) {
  return referenceToCssVar(value)
    .replace(/\/\*.*?\*\//g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function expectVar(name) {
  if (!declarations.has(name)) {
    errors.push(`${name} is missing from tokens.css`);
  }
}

function expectToken(path, name) {
  expectVar(name);
  if (!declarations.has(name)) return;

  const tokenValue = readToken(path);
  const cssValue = declarations.get(name);
  if (normalize(tokenValue) !== normalize(cssValue)) {
    errors.push(`${name} does not match ${path}: expected ${referenceToCssVar(tokenValue)}, got ${cssValue}`);
  }
}

const backedRuntimeTokens = [
  ["color.bg.default", "--ds-bg"],
  ["color.surface.default", "--ds-surface"],
  ["color.surface.raised", "--ds-surface-raised"],
  ["color.line.default", "--ds-line"],
  ["color.line.strong", "--ds-line-strong"],
  ["color.text.primary", "--ds-text-primary"],
  ["color.text.secondary", "--ds-text-secondary"],
  ["color.text.muted", "--ds-text-muted"],
  ["color.text.on-primary", "--ds-text-on-primary"],
  ["color.text.on-accent", "--ds-text-on-accent"],
  ["color.text.on-success", "--ds-text-on-success"],
  ["color.accent.live", "--ds-accent-live"],
  ["color.accent.success", "--ds-accent-success"],
  ["type.family.display", "--ds-font-display"],
  ["type.family.sans", "--ds-font-sans"],
  ["type.family.mono", "--ds-font-mono"],
  ["type.measure.default", "--ds-measure"],
  ["type.scale.display.size", "--ds-type-display-size"],
  ["type.scale.display.lineHeight", "--ds-type-display-lh"],
  ["type.scale.display.weight", "--ds-type-display-weight"],
  ["type.scale.display.tracking", "--ds-type-display-track"],
  ["type.scale.h1.size", "--ds-type-h1-size"],
  ["type.scale.h1.lineHeight", "--ds-type-h1-lh"],
  ["type.scale.h1.weight", "--ds-type-h1-weight"],
  ["type.scale.h1.tracking", "--ds-type-h1-track"],
  ["type.scale.h2.size", "--ds-type-h2-size"],
  ["type.scale.h2.lineHeight", "--ds-type-h2-lh"],
  ["type.scale.h2.weight", "--ds-type-h2-weight"],
  ["type.scale.h2.tracking", "--ds-type-h2-track"],
  ["type.scale.h3.size", "--ds-type-h3-size"],
  ["type.scale.h3.lineHeight", "--ds-type-h3-lh"],
  ["type.scale.h3.weight", "--ds-type-h3-weight"],
  ["type.scale.h3.tracking", "--ds-type-h3-track"],
  ["type.scale.body-lg.size", "--ds-type-body-lg-size"],
  ["type.scale.body-lg.lineHeight", "--ds-type-body-lg-lh"],
  ["type.scale.body.size", "--ds-type-body-size"],
  ["type.scale.body.lineHeight", "--ds-type-body-lh"],
  ["type.scale.body-sm.size", "--ds-type-body-sm-size"],
  ["type.scale.body-sm.lineHeight", "--ds-type-body-sm-lh"],
  ["type.scale.label.size", "--ds-type-label-size"],
  ["type.scale.label.lineHeight", "--ds-type-label-lh"],
  ["type.scale.label.tracking", "--ds-type-label-track"],
  ["type.scale.mono-xl.size", "--ds-type-mono-xl-size"],
  ["type.scale.mono-xl.lineHeight", "--ds-type-mono-xl-lh"],
  ["type.scale.mono.size", "--ds-type-mono-size"],
  ["type.scale.mono.lineHeight", "--ds-type-mono-lh"],
  ["space.0", "--ds-space-0"],
  ["space.1", "--ds-space-1"],
  ["space.2", "--ds-space-2"],
  ["space.3", "--ds-space-3"],
  ["space.4", "--ds-space-4"],
  ["space.5", "--ds-space-5"],
  ["space.6", "--ds-space-6"],
  ["space.7", "--ds-space-7"],
  ["space.8", "--ds-space-8"],
  ["space.9", "--ds-space-9"],
  ["space.10", "--ds-space-10"],
  ["space.11", "--ds-space-11"],
  ["space.tight", "--ds-space-tight"],
  ["space.group", "--ds-space-group"],
  ["space.section", "--ds-space-section"],
  ["space.context", "--ds-space-context"],
  ["size.control-sm", "--ds-size-control-sm"],
  ["size.control-md", "--ds-size-control-md"],
  ["size.interactive-min", "--ds-size-interactive-min"],
  ["size.dot", "--ds-size-dot"],
  ["size.icon-sm", "--ds-size-icon-sm"],
  ["size.toast-min-width", "--ds-size-toast-min-width"],
  ["radius.none", "--ds-radius-none"],
  ["radius.xs", "--ds-radius-xs"],
  ["radius.sm", "--ds-radius-sm"],
  ["radius.md", "--ds-radius-md"],
  ["radius.lg", "--ds-radius-lg"],
  ["radius.pill", "--ds-radius-pill"],
  ["elevation.0", "--ds-elev-0"],
  ["elevation.1", "--ds-elev-1"],
  ["elevation.2", "--ds-elev-2"],
  ["motion.duration.instant", "--ds-dur-instant"],
  ["motion.duration.press", "--ds-dur-press"],
  ["motion.duration.micro", "--ds-dur-micro"],
  ["motion.duration.standard", "--ds-dur-standard"],
  ["motion.duration.deliberate", "--ds-dur-deliberate"],
  ["motion.duration.exit-standard", "--ds-dur-exit-standard"],
  ["motion.duration.spinner", "--ds-dur-spinner"],
  ["motion.duration.live-pulse", "--ds-dur-live-pulse"],
  ["motion.duration.stagger-column", "--ds-dur-stagger-column"],
  ["motion.duration.stagger-item", "--ds-dur-stagger-item"],
  ["motion.easing.out", "--ds-ease-out"],
  ["motion.easing.in-out", "--ds-ease-in-out"],
  ["motion.easing.in", "--ds-ease-in"]
];

for (const [path, name] of backedRuntimeTokens) {
  expectToken(path, name);
}

const explicitAliases = new Map([
  ["--ds-type-display-family", "var(--ds-font-display)"],
  ["--ds-type-h1-family", "var(--ds-font-display)"],
  ["--ds-type-h2-family", "var(--ds-font-mono)"],
  ["--ds-type-h3-family", "var(--ds-font-mono)"]
]);

for (const [name, expected] of explicitAliases) {
  expectVar(name);
  if (declarations.has(name) && normalize(declarations.get(name)) !== normalize(expected)) {
    errors.push(`${name} expected ${expected}, got ${declarations.get(name)}`);
  }
}

const versionMatch = css.match(/Generated from design-tokens\.json v([^\s]+)/);
if (versionMatch && versionMatch[1] !== tokens.$version) {
  errors.push(`tokens.css header version ${versionMatch[1]} does not match design-tokens.json ${tokens.$version}`);
}

if (errors.length > 0) {
  console.error("Token parity failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`Token parity: OK (${backedRuntimeTokens.length + explicitAliases.size} runtime exports, ${declarations.size} CSS declarations)`);
