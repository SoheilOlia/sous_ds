#!/usr/bin/env node
/**
 * build-styles.mjs
 *
 * Concatenates tokens.css + every components/*.css into dist/styles.css
 * (the full bundle consumers load once at the app root), and copies
 * tokens.css to dist/tokens.css for consumers who only want the token
 * layer and will author their own component styles.
 *
 * Order matters:
 *   1. tokens.css (defines all --ds-* custom properties; must come first)
 *   2. components in alphabetical order (deterministic output)
 *
 * No postcss, no autoprefixer, no minifier — the source CSS is already
 * authored against `--ds-*` tokens with no vendor prefixes, and the
 * bundle is small enough that minification is cosmetic. Consumers who
 * want minification run it themselves.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });

const tokens = readFileSync(join(root, "tokens.css"), "utf8");

const componentDir = join(root, "components");
const componentCss = readdirSync(componentDir)
  .filter((f) => f.endsWith(".css"))
  .sort()
  .map((f) => {
    const body = readFileSync(join(componentDir, f), "utf8");
    return `/* ---- ${f} ${"-".repeat(60 - f.length)} */\n${body}`;
  })
  .join("\n");

const bundle = [
  "/*!",
  " * sous-ds · bundled stylesheet",
  " * tokens.css + every component CSS, concatenated in deterministic order.",
  " * Consumers: `import \"sous-ds/styles.css\";` once at the app root.",
  " */",
  "",
  tokens,
  "",
  componentCss,
  "",
].join("\n");

writeFileSync(join(dist, "styles.css"), bundle);
writeFileSync(join(dist, "tokens.css"), tokens);

const bytes = Buffer.byteLength(bundle, "utf8");
const files = readdirSync(componentDir).filter((f) => f.endsWith(".css")).length;
console.log(
  `build-styles: dist/styles.css (${files + 1} inputs, ${bytes.toLocaleString()} bytes)`,
);
console.log(`build-styles: dist/tokens.css (${tokens.length.toLocaleString()} bytes)`);
