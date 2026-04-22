#!/usr/bin/env node
/**
 * soheil-ds · Quality Evaluator · lint.mjs
 *
 * Scans CSS, TSX, JSX, and HTML files for violations of the rules defined
 * in quality-evaluator.md. Emits structured findings as JSON.
 *
 * Usage:
 *   node scripts/lint.mjs components/
 *   node scripts/lint.mjs components/ preview.html
 *   node scripts/lint.mjs --format text components/
 *
 * Exit codes:
 *   0 — no errors (warnings allowed)
 *   1 — one or more errors
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------

const FORBIDDEN_FONTS = [
  "Inter", "Roboto", "Helvetica", "Arial",
  "Open Sans", "Lato", "Poppins", "Nunito", "Space Grotesk",
];

const SPACING_SCALE = [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const SCANNABLE = [".css", ".scss", ".tsx", ".jsx", ".ts", ".js", ".html"];

// Files that legitimately contain hex / forbidden strings
// (the token source itself, the evaluator spec, docs)
const SKIP_FILES = new Set([
  "tokens.css",
  "design-tokens.json",
  "quality-evaluator.md",
  "DESIGN.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "AGENTS.md",
  "README.md",
  "TASTE_LOG.md",
  "ANIMATION_RULES.md",
  "SKILL.md",
  "lint.mjs",
]);

// ---------------------------------------------------------------
// Rules. Each returns an array of findings.
// ---------------------------------------------------------------

function ruleTY01_forbiddenFonts(src, file) {
  const findings = [];
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only flag when used as the *primary* face in a font-family declaration,
    // which we approximate as the first face listed.
    const m = line.match(/font-family\s*:\s*["']?([^"',;]+)/i);
    if (!m) continue;
    const first = m[1].trim();
    for (const fb of FORBIDDEN_FONTS) {
      if (first.toLowerCase() === fb.toLowerCase()) {
        findings.push({
          rule: "TY01",
          severity: "error",
          path: `${file}:${i + 1}`,
          message: `'${fb}' is forbidden as the primary face. Use var(--ds-font-sans) or var(--ds-font-mono).`,
          suggestion: `font-family: var(--ds-font-sans);`,
        });
      }
    }
  }
  return findings;
}

function ruleMO01_transitionAll(src, file) {
  const findings = [];
  // Only match within CSS property context. Skip instances inside <code>,
  // <pre>, markdown backticks, or HTML text nodes where the rule is being
  // documented rather than used.
  const rx = /(?:^|[;{])\s*transition\s*:\s*all\b/gm;
  let m;
  while ((m = rx.exec(src)) !== null) {
    // Skip if inside a <code> or <pre> block (rough check)
    const window = src.slice(Math.max(0, m.index - 200), m.index);
    if (/<code[^>]*>[^<]*$/i.test(window) || /<pre[^>]*>[\s\S]*$/i.test(window)) continue;
    findings.push({
      rule: "MO01",
      severity: "error",
      path: `${file}:${lineAt(src, m.index)}`,
      message: "'transition: all' is forbidden. Enumerate properties explicitly.",
      suggestion: "e.g. transition: opacity 140ms var(--ds-ease-out), transform 100ms ease;",
    });
  }
  return findings;
}

function ruleMO02_transitionColor(src, file) {
  const findings = [];
  // Flag 'transition: color ...' (on its own line or first property) and
  // 'transition-property: color'.
  const rx1 = /transition\s*:\s*color\b/gi;
  const rx2 = /transition-property\s*:\s*[^;]*\bcolor\b/gi;
  const rx3 = /transition\s*:\s*[^;]*\bcolor\b\s+\d/gi;
  for (const rx of [rx1, rx2, rx3]) {
    let m;
    while ((m = rx.exec(src)) !== null) {
      findings.push({
        rule: "MO02",
        severity: "error",
        path: `${file}:${lineAt(src, m.index)}`,
        message: "Transition on 'color' is forbidden. Use opacity or background-color.",
        suggestion: "Replace with: transition: opacity var(--ds-dur-micro) var(--ds-ease-out);",
      });
    }
  }
  return findings;
}

function ruleMO03_scaleZero(src, file) {
  const findings = [];
  // scale(0), scale(0.0), scale(0,0)
  const rx = /scale\(\s*0(?:\.0+)?\s*(?:,\s*0(?:\.0+)?\s*)?\)/g;
  let m;
  while ((m = rx.exec(src)) !== null) {
    // Skip if this is documentation: inside <code>, inside an HTML text node
    // that contains rule descriptions, or inside a comment.
    const windowBefore = src.slice(Math.max(0, m.index - 160), m.index);
    const lineStart = src.lastIndexOf("\n", m.index) + 1;
    const line = src.slice(lineStart, src.indexOf("\n", m.index));
    if (/<code[^>]*>[^<]*$/i.test(windowBefore)) continue;
    if (/^\s*(\/\*|\/\/|\*|<!--)/.test(line)) continue;
    // Skip if this is inside a list item describing the rule (heuristic: line contains "never" or "from")
    if (/<li>.*\bnever\b/i.test(line)) continue;

    findings.push({
      rule: "MO03",
      severity: "error",
      path: `${file}:${lineAt(src, m.index)}`,
      message: "scale(0) is forbidden as an animation start value. Use scale(0.95) minimum.",
      suggestion: "Replace with scale(0.95). Even a deflated balloon has shape.",
    });
  }
  return findings;
}

function ruleMO04_durationTooLong(src, file) {
  const findings = [];
  // Any duration >= 301ms in a transition or animation shorthand.
  // Matches '350ms' or '0.5s' etc.
  const rx = /(\d+(?:\.\d+)?)(ms|s)\b/g;
  let m;
  while ((m = rx.exec(src)) !== null) {
    const n = parseFloat(m[1]);
    const unit = m[2];
    const ms = unit === "s" ? n * 1000 : n;
    if (ms > 300) {
      // Only flag if in a transition/animation context (not animation-delay).
      const snippet = src.slice(Math.max(0, m.index - 120), m.index);
      if (!/transition|animation/i.test(snippet)) continue;
      // Skip animation-delay: those are stagger values, not durations.
      if (/animation-delay\s*:\s*$/i.test(snippet)) continue;
      if (/animation-delay\s*:\s*\d*[^;]*$/i.test(snippet) &&
          !/animation-delay[^;]*;[\s\S]*animation\s*:/i.test(snippet)) continue;
      // Spinners are allowed to be longer (they're continuous motion)
      if (/infinite/.test(src.slice(m.index, m.index + 180))) continue;

      findings.push({
        rule: "MO04",
        severity: "error",
        path: `${file}:${lineAt(src, m.index)}`,
        message: `Duration ${m[0]} (${ms}ms) exceeds the 300ms ceiling.`,
        suggestion: "Use var(--ds-dur-deliberate) (280ms) or shorter.",
      });
    }
  }
  return findings;
}

function ruleEL02_slopShadow(src, file) {
  const findings = [];
  // box-shadow with blur >= 25px.
  // Matches 'box-shadow: 0 25px 50px ...' or any blur component >= 25px.
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/box-shadow\s*:/i.test(line)) continue;
    // Extract the value after 'box-shadow:'
    const m = line.match(/box-shadow\s*:\s*([^;]+)/i);
    if (!m) continue;
    const value = m[1];
    // Split into shadow layers on commas
    const layers = value.split(",");
    for (const layer of layers) {
      // Layer is like "0 25px 50px rgba(...)" — the third number is blur
      const nums = [...layer.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((x) =>
        parseFloat(x[1])
      );
      // nums[0] = offsetX, nums[1] = offsetY, nums[2] = blur, nums[3] = spread
      if (nums.length >= 3 && nums[2] >= 25) {
        findings.push({
          rule: "EL02",
          severity: "error",
          path: `${file}:${i + 1}`,
          message: `box-shadow blur ${nums[2]}px is the AI-slop shadow. Blur >= 25px is forbidden.`,
          suggestion: "Cards use 1px border (var(--ds-line)). Use var(--ds-elev-1) or --ds-elev-2 for genuinely floating surfaces.",
        });
      }
    }
  }
  return findings;
}

function ruleLY01_offGridSpacing(src, file) {
  // This rule is noisy by default. Only runs on files inside components/
  // where every value should be a token.
  if (!/components[\\/]/.test(file)) return [];
  const findings = [];
  // Find padding, margin, gap with px values
  // Scope to spacing properties only. Width/height legitimately carry
  // component sizes (6px dots, 40px buttons, 360px toasts) and produce
  // noise that obscures real violations.
  const rx = /(?:padding|margin|gap)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = rx.exec(src)) !== null) {
    const value = m[1];
    const pxs = [...value.matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) =>
      parseFloat(x[1])
    );
    for (const n of pxs) {
      if (!SPACING_SCALE.includes(n) && n !== 1) {
        // 1px = hairline border — allowed
        findings.push({
          rule: "LY01",
          severity: "warning",
          path: `${file}:${lineAt(src, m.index)}`,
          message: `Value ${n}px is not on the 8pt scale.`,
          suggestion: `Snap to one of: ${SPACING_SCALE.join(", ")}.`,
        });
        break; // one warning per declaration is enough
      }
    }
  }
  return findings;
}

function ruleCL01_hardcodedHex(src, file) {
  // Only applies to component files. Tokens.css is allowed to hold raw hex.
  if (!/components[\\/]/.test(file)) return [];
  const findings = [];
  const rx = /#[0-9a-fA-F]{3,8}\b/g;
  let m;
  while ((m = rx.exec(src)) !== null) {
    // Allow hex inside comments
    const lineStart = src.lastIndexOf("\n", m.index) + 1;
    const line = src.slice(lineStart, src.indexOf("\n", m.index));
    if (/^\s*(\/\*|\/\/|\*)/.test(line)) continue;
    findings.push({
      rule: "CL01",
      severity: "error",
      path: `${file}:${lineAt(src, m.index)}`,
      message: `Hardcoded hex color ${m[0]}. Components must use var(--ds-*).`,
      suggestion: "Move the value to tokens.css and reference it via a CSS custom property.",
    });
  }
  return findings;
}

const RULES = [
  ruleTY01_forbiddenFonts,
  ruleMO01_transitionAll,
  ruleMO02_transitionColor,
  ruleMO03_scaleZero,
  ruleMO04_durationTooLong,
  ruleEL02_slopShadow,
  ruleLY01_offGridSpacing,
  ruleCL01_hardcodedHex,
];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function lineAt(src, idx) {
  return src.slice(0, idx).split("\n").length;
}

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
      // examples/ demonstrates slop on purpose. Scanning it is nonsensical.
      if (ent.name === "examples") continue;
      await walk(full, out);
    } else if (
      SCANNABLE.includes(path.extname(ent.name)) &&
      !SKIP_FILES.has(ent.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

async function collectFiles(targets) {
  const files = [];
  for (const t of targets) {
    const stat = await fs.stat(t);
    if (stat.isDirectory()) {
      await walk(t, files);
    } else {
      files.push(t);
    }
  }
  return files;
}

// ---------------------------------------------------------------
// Main
// ---------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  let format = "json";
  const targets = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--format") {
      format = argv[++i];
    } else {
      targets.push(argv[i]);
    }
  }
  if (targets.length === 0) targets.push(".");

  const files = await collectFiles(targets);
  const findings = [];

  for (const file of files) {
    const src = await fs.readFile(file, "utf8");
    for (const rule of RULES) {
      findings.push(...rule(src, file));
    }
  }

  const summary = {
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warning").length,
    info: findings.filter((f) => f.severity === "info").length,
  };
  const verdict =
    summary.errors > 0 ? "fail" : summary.warnings > 3 ? "warn" : "pass";

  const report = { findings, summary, verdict, filesScanned: files.length };

  if (format === "text") {
    printText(report);
  } else {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  }

  process.exit(summary.errors > 0 ? 1 : 0);
}

function printText(r) {
  const { findings, summary, verdict, filesScanned } = r;
  if (findings.length === 0) {
    console.log(`\x1b[32m✓\x1b[0m soheil-ds lint · ${filesScanned} files · ${verdict}`);
    return;
  }
  for (const f of findings) {
    const color =
      f.severity === "error" ? "\x1b[31m"
      : f.severity === "warning" ? "\x1b[33m"
      : "\x1b[36m";
    console.log(
      `${color}${f.severity.toUpperCase()}\x1b[0m ${f.rule}  ${f.path}`
    );
    console.log(`  ${f.message}`);
    if (f.suggestion) console.log(`  → ${f.suggestion}`);
    console.log();
  }
  console.log(
    `${filesScanned} files · ${summary.errors} errors · ${summary.warnings} warnings · verdict: ${verdict}`
  );
}

main().catch((err) => {
  console.error("Lint failed:", err);
  process.exit(2);
});
