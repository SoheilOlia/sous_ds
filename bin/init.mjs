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
 *   npx sous-ds init                  Apply the project bootstrap
 *   npx sous-ds install-global        Apply the global skill bootstrap
 *   npx sous-ds init --dry-run        Print the project plan, write nothing
 *   npx sous-ds install-global -n     Print the global plan, write nothing
 *   npx sous-ds init --force          Overwrite owned project files
 *   npx sous-ds --version             Print package version
 *   npx sous-ds --help                Print usage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
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

function globalSkillBody(packageRoot) {
  return `---
name: sous-ds
description: Use when building, styling, auditing, refining, or learning from UI work with the SOUS-DS design system. Triggers on /sous-ds, /learn-from-this-project, "Learn from this project", "make this match SOUS-DS", "SOOS-DS", "SUSE", "SUSE-DS", "SUSE design system", "Sous design system", "Sous DS", "sous", "the SOUS-DS design system", "the design system" (when sous-ds is the active system), dark mode, light mode, prezzo mode, presentation mode, dark-first data-dense UI, citation chips, agent/chat interfaces, dot/dash data motif, design-system drift, or any request to update the system from a finished project.
---

# sous-ds global skill

SOUS-DS is the active design system. Use it before creating, reviewing, or changing UI.

This global skill was installed from:

\`\`\`
${packageRoot}
\`\`\`

Read, in order, when the files exist:

1. \`${packageRoot}/SKILL.md\`
2. \`${packageRoot}/DESIGN.md\`
3. \`${packageRoot}/AGENTS.md\`
4. \`${packageRoot}/ANIMATION_RULES.md\`
5. \`${packageRoot}/TASTE_LOG.md\`
6. \`${packageRoot}/refusals.json\`
7. \`${packageRoot}/components/\`
8. \`${packageRoot}/docs/specs/\`

If that package root is missing, locate the nearest installed source in this order:

1. \`node_modules/sous-ds\` in the current project
2. \`/Users/soheil/Sous_DS\`
3. \`/Users/soheil/Development/Sous_DS\`
4. \`https://github.com/SoheilOlia/sous_ds\`

## Apply SOUS-DS

- Use tokens only: \`var(--ds-*)\` for color, spacing, radius, duration, and easing.
- Use existing components before inventing local CSS.
- Use \`Geist Mono\` for data, labels, IDs, timestamps, and numerals.
- Keep motion under 300ms, enumerate transition properties, and respect reduced motion.
- Keep accent colors semantic: live/attention and success/completion only.
- Refuse gradients, glass morphism, heavy shadows, \`transition: all\`, and primary Inter/system-ui.

## Learn from this project

When the user says "Learn from this project" or asks to update SOUS-DS from a finished surface:

1. Capture the source: repo path, URL, PR, screenshot, current branch, and exact files.
2. Separate system learning from project-specific content.
3. Classify each finding as one of: token, component, composition recipe, refusal, motion rule, voice rule, installer/tooling, or taste-log entry.
4. Compare against SOUS-DS before writing. If the system already covers it, cite the existing rule instead of duplicating it.
5. Promote only durable patterns. Do not import a foreign aesthetic wholesale.
6. Update source truth first: \`DESIGN.md\`, \`SKILL.md\`, \`AGENTS.md\`, \`refusals.json\`, \`components/\`, \`docs/specs/\`, \`TASTE_LOG.md\`, or the installer.
7. Verify with the narrowest real commands available. If npm is unavailable, say that and run node-level tests that do not require npm.
8. Record a receipt: source, extracted lesson, files changed, commands run, what was rejected, and remaining risks.

## Reference lessons already ingested

- \`Donsoleil/ui-ux-pro-max-skill\`: keep design intelligence searchable and domain-aware, but avoid importing broad style taxonomies into SOUS-DS. SOUS-DS stays one system with dials, recipes, refusals, and checklists.
- \`Donsoleil/cult-ui\`: prefer copy-owned source components and registry-style recipes over black-box UI dependencies. When a pattern repeats, promote it into SOUS-DS source so agents stop patching it locally.
`;
}

const GLOBAL_COMMAND_BODY = `# sous-ds

Use the global SOUS-DS skill.

Read:

\`\`\`
~/.agents/skills/sous-ds/SKILL.md
\`\`\`

If the request says "Learn from this project", run the learning protocol from that skill and return the source-truth updates needed for SOUS-DS.
Otherwise, apply or audit the current UI against SOUS-DS.
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

export function buildGlobalTargets(packageRoot) {
  const skillBody = globalSkillBody(packageRoot);
  return [
    {
      label: "Agent skill",
      path: ".agents/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      body: skillBody,
    },
    {
      label: "Codex skill",
      path: ".codex/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      body: skillBody,
    },
    {
      label: "Claude skill",
      path: ".claude/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      body: skillBody,
    },
    {
      label: "Goose skill",
      path: ".config/goose/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      body: skillBody,
    },
    {
      label: "Nexus skill",
      // Nexus.app reads guidance via the Block agent skill registry at
      // ~/repos/agents/skills/<name>/. Drop our SKILL.md as a peer to the
      // existing nexus, linear, figma, etc. skills there.
      path: "repos/agents/skills/sous-ds/SKILL.md",
      mode: "owned-file",
      body: skillBody,
    },
    {
      label: "Cursor command",
      path: ".cursor/commands/sous-ds.md",
      mode: "owned-file",
      body: GLOBAL_COMMAND_BODY,
    },
    {
      label: "Claude command",
      path: ".claude/commands/sous-ds.md",
      mode: "owned-file",
      body: GLOBAL_COMMAND_BODY,
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
  install-global   Install/update the global sous-ds skill and slash command
                   shims for Claude, Codex, Goose, and Cursor
  global           Alias for install-global

Options:
  -n, --dry-run    Print the plan; write nothing
  -f, --force      Overwrite owned files even if they exist
  -V, --version    Print sous-ds version
  -h, --help       Show this help

Idempotent: safe to re-run after upgrading sous-ds. Existing
AGENTS.md / CLAUDE.md content above and below the managed-block
markers is preserved.`;

function targetRootForGlobalInstall() {
  return process.env.SOUS_DS_HOME || process.env.HOME || homedir();
}

function writePlans(label, root, plans, opts) {
  console.log(label);
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
      const fullPath = join(root, p.target.path);
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
}

/**
 * Run the init bootstrap. Exits the process on terminal errors
 * (sanity-check failure, write errors). Returns 0 on success.
 *
 * Exported so the CLI entrypoint (bin/sous-ds.mjs) and tests can
 * both invoke it directly without re-implementing arg parsing.
 */
export function main(argv = []) {
  const command = argv.find((arg) => !arg.startsWith("-")) || "init";
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

  if (!["init", "install-global", "global"].includes(command)) {
    console.error(`sous-ds: unknown command '${command}'.`);
    console.error("Run: npx sous-ds --help");
    return 1;
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

  const version = readPackageVersion();

  if (command === "install-global" || command === "global") {
    const root = targetRootForGlobalInstall();
    const targets = buildGlobalTargets(PKG_ROOT);
    const plans = targets.map((t) => ({ target: t, ...planTarget(t, root, opts) }));
    writePlans(`sous-ds@${version} install-global · ${root}`, root, plans, opts);
    return 0;
  }

  const cwd = process.cwd();
  const targets = buildTargets(PKG_ROOT);
  const plans = targets.map((t) => ({ target: t, ...planTarget(t, cwd, opts) }));
  writePlans(`sous-ds@${version} init · ${cwd}`, cwd, plans, opts);
  return 0;
}
