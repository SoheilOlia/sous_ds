/*
 * sous-ds · init (library)
 *
 * Pure library. Tests import from here. The CLI entrypoint lives at
 * bin/sous-ds.mjs and just calls main() — that keeps detection
 * logic (which is fragile across Node versions and bin symlinks)
 * out of this file entirely.
 *
 * Run via `npx sous-ds init` after `npm install sous-ds` to wire the
 * design contract into every AI coding assistant configured for this
 * project. Drops a small bootstrap file in each agent's expected
 * location, telling the agent to read the full contract from
 * node_modules/sous-ds/.
 *
 * Files written (idempotent — safe to re-run):
 *   AGENTS.md                          → root, managed block.
 *                                        Covers Codex CLI + the
 *                                        emerging agents.md spec
 *                                        (Goose ≥ 1.x reads this too).
 *   CLAUDE.md                          → root, managed block.
 *                                        Claude Code's preferred entry.
 *   .cursor/rules/sous-ds.mdc          → Cursor rule, owned by us.
 *   .claude/skills/sous-ds/SKILL.md    → Claude Code per-project skill.
 *
 * Existing files: only the section between
 *   <!-- BEGIN sous-ds managed --> ... <!-- END sous-ds managed -->
 * is touched. User content above/below the markers is preserved.
 *
 * Files we OWN (no markers, full overwrite on re-run):
 *   .cursor/rules/sous-ds.mdc
 *   .claude/skills/sous-ds/SKILL.md
 *
 * Usage:
 *   npx sous-ds init                  Apply the bootstrap
 *   npx sous-ds init --dry-run        Print the plan, write nothing
 *   npx sous-ds init --force          Overwrite owned files
 *   npx sous-ds --version             Print package version
 *   npx sous-ds --help                Print usage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ─── Constants ────────────────────────────────────────────────────────

const BEGIN = "<!-- BEGIN sous-ds managed — do not edit; re-run `npx sous-ds init` to update. -->";
const END   = "<!-- END sous-ds managed -->";

const __dirname = dirname(fileURLToPath(import.meta.url));
// node_modules/sous-ds/bin/init.mjs → node_modules/sous-ds/
const PKG_ROOT = resolve(__dirname, "..");

// ─── Pure helpers (testable, no fs) ───────────────────────────────────

/**
 * Return new file contents with the sous-ds managed block inserted or
 * replaced. If the existing file has no markers, the block is appended
 * (preceded by a blank line if the file is non-empty). Idempotent.
 */
export function applyManagedBlock(existing, blockBody) {
  const block = `${BEGIN}\n${blockBody.trim()}\n${END}`;
  if (existing == null || existing === "") return block + "\n";

  const beginIdx = existing.indexOf(BEGIN);
  const endIdx   = existing.indexOf(END);

  if (beginIdx >= 0 && endIdx > beginIdx) {
    // Replace existing managed block in place.
    return (
      existing.slice(0, beginIdx) +
      block +
      existing.slice(endIdx + END.length)
    );
  }

  // No markers — append, separated by a blank line.
  const sep = existing.endsWith("\n") ? "\n" : "\n\n";
  return existing + sep + block + "\n";
}

/**
 * Pretty-print a write plan line. Used in dry-run output.
 */
export function planLine(action, path) {
  const tag = {
    create: "+ create",
    update: "~ update",
    skip:   "- skip  ",
  }[action] ?? "? " + action;
  return `  ${tag}  ${path}`;
}

// ─── File templates ───────────────────────────────────────────────────

const ROOT_BLOCK_BODY = `## sous-ds — design system contract

This project uses [\`sous-ds\`](https://www.npmjs.com/package/sous-ds), a
dark-first, data-dense, restraint-led design system. **Before generating
or editing any UI in this project, read the full contract:**

- \`node_modules/sous-ds/SKILL.md\` — agent entrypoint
- \`node_modules/sous-ds/DESIGN.md\` — canonical design spec
- \`node_modules/sous-ds/AGENTS.md\` — code-generation rules
- \`node_modules/sous-ds/ANIMATION_RULES.md\` — motion contract
- \`node_modules/sous-ds/refusals.json\` — machine-readable refusal corpus

Then follow these non-negotiables:

- **Tokens only.** Every color, size, radius, duration, easing comes
  from \`var(--ds-*)\`. Never hardcode.
- **Motion ≤ 300ms.** Default easing \`var(--ds-ease-out)\`. Never
  \`transition: all\`. Entries start at \`scale(0.95)\` minimum.
- **1px borders, no shadow.** Cards use \`var(--ds-line)\`. Shadow is
  reserved for floating menus (\`--ds-elev-1\`) and modals
  (\`--ds-elev-2\`). Blur ≥ 25px is forbidden.
- **Typography.** \`Cash Sans\` display + \`Geist\` body + \`Geist Mono\`
  for all data, labels, timestamps, code. Always
  \`font-variant-numeric: tabular-nums\` on numerals.
- **Two semantic accents only.** \`--ds-accent-live\` (red, attention),
  \`--ds-accent-success\` (green, completion). Never on CTAs, never
  decorative.
- **Components.** Prefer existing \`sous-ds\` components over
  hand-rolling. Surface: \`<Button>\`, \`<Card>\`, \`<Pill>\`, \`<LiveDot>\`,
  \`<LiveBlock>\`, \`<InlineStatus>\`, \`<MetricStat>\`, \`<ToolCall>\`,
  \`<DottedChart>\`, \`<DotTimeline>\`, \`<PulseTrail>\`, \`<SegmentedBar>\`,
  \`<SegmentedControl>\`, \`<TetrisLoader>\`, \`<BoxLoader>\`,
  \`<DotLoader>\`, \`<BlockLoader>\`, \`<ThinkingCube>\`, \`<Toast>\`. Plus
  the \`motion\` primitive (\`tween\`, \`typewriter\`, \`rotateLabels\`,
  \`stagger\`, \`easings\`).
- **Refuse silently slop.** Gradients on buttons. Glass morphism.
  Inter or system-ui as the primary face. Shadow blur ≥ 25px.
  \`transition: all\`. Scale-from-zero entries. Accent-colored CTAs.

Verify before considering UI work done:
\`\`\`bash
npx sous-lint   # runs the implementation linter on this project
\`\`\``;

const CURSOR_RULE_BODY = `---
description: sous-ds design system contract
globs: ["**/*.{ts,tsx,js,jsx,css,html}"]
alwaysApply: true
---

# sous-ds design system

This project uses \`sous-ds\` (https://www.npmjs.com/package/sous-ds).
Before generating or editing UI, read the full contract:

- \`node_modules/sous-ds/SKILL.md\`
- \`node_modules/sous-ds/DESIGN.md\`
- \`node_modules/sous-ds/AGENTS.md\`
- \`node_modules/sous-ds/ANIMATION_RULES.md\`
- \`node_modules/sous-ds/refusals.json\`

## Non-negotiables

- **Tokens only.** Every value via \`var(--ds-*)\`. No hardcoded colors,
  sizes, radii, durations, or easings.
- **Motion ≤ 300ms.** Default easing \`var(--ds-ease-out)\`. Never
  \`transition: all\`. Entries from \`scale(0.95)\` minimum.
- **1px borders, no shadow** on cards. Shadow only for floating
  surfaces (menus, toasts, modals). Blur ≥ 25px is forbidden.
- **Typography.** Cash Sans display, Geist body, Geist Mono for all
  data/labels/code. \`tabular-nums\` always on numerals.
- **Two accents only.** \`--ds-accent-live\` for attention,
  \`--ds-accent-success\` for completion. Never on CTAs, never
  decorative.
- **Prefer existing components** from \`sous-ds\` over hand-rolling.

## Refuse

- Gradients on buttons / cards / backgrounds
- Glass morphism / heavy blur
- Inter, Roboto, system-ui as the primary face
- \`transition: all\`
- Scale-from-zero entries
- Accent-colored CTAs

## Imports

\`\`\`tsx
import "sous-ds/styles.css";   // once at app root
import { Button, Card, LiveDot } from "sous-ds";
\`\`\`

For Tailwind users: \`presets: [require("sous-ds/tailwind")]\`.
`;

/**
 * Build the targets list. Each target describes a file we may write,
 * which mode we use (managed-block append vs full overwrite), and the
 * body. Pure data — no fs.
 */
export function buildTargets(packageRoot) {
  return [
    {
      label: "AGENTS.md",
      path: "AGENTS.md",
      mode: "managed-block",
      body: ROOT_BLOCK_BODY,
    },
    {
      label: "CLAUDE.md",
      path: "CLAUDE.md",
      mode: "managed-block",
      body: ROOT_BLOCK_BODY,
    },
    {
      label: "Cursor rule",
      path: ".cursor/rules/sous-ds.mdc",
      mode: "owned-file",
      body: CURSOR_RULE_BODY,
    },
    {
      label: "Claude Code skill",
      path: ".claude/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      // Copy the package's SKILL.md verbatim — it's the canonical
      // agent entrypoint and Claude Code reads SKILL.md at this path.
      body: () => readFileSync(join(packageRoot, "SKILL.md"), "utf8"),
    },
  ];
}

// ─── IO + driver ──────────────────────────────────────────────────────

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function fileExists(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}

function readIfExists(p) {
  return fileExists(p) ? readFileSync(p, "utf8") : null;
}

/**
 * Decide what to do with a single target. Returns { action, next }.
 * action ∈ "create" | "update" | "skip". next is the file contents to
 * write (or null when skipping).
 */
function planTarget(target, cwd, opts) {
  const fullPath = join(cwd, target.path);
  const existing = readIfExists(fullPath);
  const body = typeof target.body === "function" ? target.body() : target.body;

  if (target.mode === "managed-block") {
    const next = applyManagedBlock(existing, body);
    if (next === existing) return { action: "skip", next: null };
    return { action: existing == null ? "create" : "update", next };
  }

  if (target.mode === "owned-file") {
    const desired = body.endsWith("\n") ? body : body + "\n";
    if (existing === desired) return { action: "skip", next: null };
    if (existing != null && !opts.force) {
      // We own this path but it exists with different content. Refuse to
      // clobber unless --force. (We hand-pick paths we know are ours,
      // but defense in depth.)
      return { action: "skip", next: null, reason: "exists; use --force to overwrite" };
    }
    return { action: existing == null ? "create" : "update", next: desired };
  }

  throw new Error(`unknown mode: ${target.mode}`);
}

/**
 * Read the package version from node_modules/sous-ds/package.json
 * (or whatever PKG_ROOT resolves to). Returns "unknown" on failure
 * so a missing/malformed package.json never crashes the CLI.
 */
function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

const HELP = `Usage: npx sous-ds [command] [options]

Wires the sous-ds design contract into every AI coding assistant
configured for this project (Cursor, Claude Code, Codex, Goose, and
any agent that reads AGENTS.md).

Commands:
  init             Apply the bootstrap (default; runs when no command given)

Options:
  -n, --dry-run    Print the plan; write nothing
  -f, --force      Overwrite owned files even if they exist
  -V, --version    Print sous-ds version
  -h, --help       Show this help

Idempotent: safe to re-run after upgrading sous-ds. Existing
AGENTS.md / CLAUDE.md content above and below the managed-block
markers is preserved.`;

/**
 * Run the init bootstrap. Exits the process on terminal errors
 * (sanity-check failure, write errors). Returns 0 on success.
 *
 * Exported so the CLI entrypoint (bin/sous-ds.mjs) and tests can
 * both invoke it directly without re-implementing arg parsing.
 */
export function main(argv = []) {
  const opts = {
    dryRun: argv.includes("--dry-run") || argv.includes("-n"),
    force: argv.includes("--force") || argv.includes("-f"),
    help: argv.includes("--help") || argv.includes("-h"),
    version: argv.includes("--version") || argv.includes("-V"),
  };

  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  if (opts.version) {
    console.log(readPackageVersion());
    return 0;
  }

  // Sanity check that PKG_ROOT looks like the installed sous-ds package.
  // Without SKILL.md, the .claude/skills/ target can't be populated and
  // the bootstrap content references files that won't exist — fail loud.
  if (!fileExists(join(PKG_ROOT, "SKILL.md"))) {
    console.error(`sous-ds: cannot find SKILL.md in ${PKG_ROOT}.`);
    console.error("This usually means the package is not installed correctly.");
    console.error("Try: rm -rf node_modules package-lock.json && npm install sous-ds");
    return 1;
  }

  const cwd = process.cwd();
  const version = readPackageVersion();
  const targets = buildTargets(PKG_ROOT);
  const plans = targets.map((t) => ({ target: t, ...planTarget(t, cwd, opts) }));

  console.log(`sous-ds@${version} init · ${cwd}`);
  console.log("");
  let wrote = 0;
  let skipped = 0;
  for (const p of plans) {
    if (p.action === "skip") {
      const note = p.reason ? ` (${p.reason})` : "";
      console.log(planLine("skip", p.target.path) + note);
      skipped++;
      continue;
    }
    console.log(planLine(p.action, p.target.path));
    if (!opts.dryRun) {
      const fullPath = join(cwd, p.target.path);
      ensureDir(fullPath);
      writeFileSync(fullPath, p.next);
      wrote++;
    }
  }

  console.log("");
  if (opts.dryRun) {
    console.log(`Plan only. Re-run without --dry-run to apply.`);
  } else {
    console.log(`Wrote ${wrote} file${wrote === 1 ? "" : "s"}, skipped ${skipped}.`);
    console.log(`Verify with: npx sous-lint`);
  }
  return 0;
}
