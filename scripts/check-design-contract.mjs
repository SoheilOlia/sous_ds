#!/usr/bin/env node
/**
 * Repo-owned DESIGN.md contract smoke check.
 *
 * The upstream @google/design.md CLI is still alpha and can fail for reasons
 * unrelated to this package's source truth. This script validates the contract
 * shape SOUS-DS relies on: frontmatter exists, core token groups exist,
 * component references resolve, and the human-readable sections remain present.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const file = join(ROOT, "DESIGN.md");
const source = readFileSync(file, "utf8");
const errors = [];

if (!source.startsWith("---\n")) {
  errors.push("DESIGN.md must start with YAML frontmatter");
}

const end = source.indexOf("\n---\n", 4);
if (end === -1) {
  errors.push("DESIGN.md must close YAML frontmatter with ---");
}

const frontmatter = end === -1 ? "" : source.slice(4, end);
const body = end === -1 ? source : source.slice(end + 5);

function cleanKey(raw) {
  return raw.trim().replace(/^['\"]|['\"]$/g, "");
}

function parseFrontmatterPaths(text) {
  const paths = new Set();
  const stack = [];

  for (const rawLine of text.split("\n")) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const match = rawLine.match(/^(\s*)([^:#][^:]*):/);
    if (!match) continue;

    const indent = match[1].length;
    const key = cleanKey(match[2]);
    if (!key) continue;

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const path = [...stack.map((entry) => entry.key), key].join(".");
    paths.add(path);
    stack.push({ indent, key });
  }

  return paths;
}

const paths = parseFrontmatterPaths(frontmatter);

const requiredRootPaths = [
  "version",
  "name",
  "description",
  "colors",
  "typography",
  "rounded",
  "spacing",
  "components"
];

for (const path of requiredRootPaths) {
  if (!paths.has(path)) {
    errors.push(`Missing frontmatter key: ${path}`);
  }
}

const requiredTokens = [
  "colors.bg",
  "colors.surface",
  "colors.surface-raised",
  "colors.line",
  "colors.line-strong",
  "colors.text-primary",
  "colors.text-secondary",
  "colors.text-muted",
  "colors.accent-live",
  "colors.accent-success",
  "typography.display",
  "typography.h1",
  "typography.h2",
  "typography.h3",
  "typography.body",
  "typography.label",
  "rounded.sm",
  "rounded.md",
  "rounded.pill",
  "spacing.0",
  "spacing.11",
  "components.button-primary",
  "components.card",
  "components.pill-filled"
];

for (const path of requiredTokens) {
  if (!paths.has(path)) {
    errors.push(`Missing required design token path: ${path}`);
  }
}

const references = new Set([...frontmatter.matchAll(/\{([a-zA-Z0-9_.-]+)\}/g)].map((match) => match[1]));
for (const reference of references) {
  if (!paths.has(reference)) {
    errors.push(`Broken token reference: {${reference}}`);
  }
}

const requiredSections = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Components",
  "Do's and Don'ts",
  "Agent prompt guide",
  "System metadata"
];

for (const section of requiredSections) {
  const pattern = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  if (!pattern.test(body)) {
    errors.push(`Missing markdown section: ## ${section}`);
  }
}

if (!/accent-success/.test(body) || !/accent-live/.test(body)) {
  errors.push("DESIGN.md body must document both semantic accents");
}

if (!/npx @google\/design\.md lint DESIGN\.md/.test(body)) {
  errors.push("DESIGN.md system metadata must keep the Google lint command visible");
}

if (errors.length > 0) {
  console.error("DESIGN.md contract check failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`DESIGN.md contract: OK (${paths.size} frontmatter paths, ${references.size} references)`);
