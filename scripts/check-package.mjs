#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const forbiddenPrefixes = [
  ".claude/",
  ".github/",
  "Inspiration/",
  "Sous_DS_v1.0/",
  "docs/",
  "design.yml",
];

const requiredPaths = [
  "AGENTS.md",
  "ANIMATION_RULES.md",
  "DESIGN.md",
  "INSTALL.md",
  "README.md",
  "SKILL.md",
  "TASTE_LOG.md",
  "bin/init.mjs",
  "bin/sous-ds.mjs",
  "components/index.ts",
  "design-tokens.json",
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
  "dist/components/index.js",
  "dist/components/motion.js",
  "dist/styles.css",
  "dist/tokens.css",
  "examples/slop-vs-system.html",
  "quality-evaluator.md",
  "refusals.json",
  "scripts/lint.mjs",
  "tailwind.preset.cjs",
  "tokens.css",
];

const raw = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
});

const payload = JSON.parse(raw);
const files = payload[0]?.files?.map((file) => file.path).sort() ?? [];

const forbidden = files.filter((path) =>
  forbiddenPrefixes.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  ),
);

const missing = requiredPaths.filter((path) => !files.includes(path));

if (forbidden.length || missing.length) {
  if (forbidden.length) {
    console.error("Package includes forbidden paths:");
    forbidden.forEach((path) => console.error(`  - ${path}`));
  }

  if (missing.length) {
    console.error("Package is missing required release paths:");
    missing.forEach((path) => console.error(`  - ${path}`));
  }

  process.exit(1);
}

console.log(`Package integrity: OK (${files.length} files)`);
