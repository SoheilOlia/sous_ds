#!/usr/bin/env node
/**
 * Tests for bin/init.mjs — managed-block insert/update logic.
 *
 * The CLI's actual file IO is exercised manually (run init in a
 * scratch dir and inspect output). What's worth testing in isolation
 * is the pure transform: given existing file contents and a managed
 * body, produce the right next contents. That's where the
 * "don't clobber user content" safety property lives.
 *
 * Uses node's built-in test runner so there's no devDep cost.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyManagedBlock, planLine, buildTargets, buildGlobalTargets } from "./init.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRYPOINT = resolve(__dirname, "sous-ds.mjs");

const BEGIN = "<!-- BEGIN sous-ds managed — do not edit; re-run `npx sous-ds init` to update. -->";
const END   = "<!-- END sous-ds managed -->";

test("applyManagedBlock: empty file → just the block + newline", () => {
  const out = applyManagedBlock("", "hello");
  assert.equal(out, `${BEGIN}\nhello\n${END}\n`);
});

test("applyManagedBlock: null file → just the block + newline", () => {
  const out = applyManagedBlock(null, "hello");
  assert.equal(out, `${BEGIN}\nhello\n${END}\n`);
});

test("applyManagedBlock: file without markers → block appended, user content preserved", () => {
  const existing = "# My project\n\nSome rules I wrote.\n";
  const out = applyManagedBlock(existing, "managed body");
  assert.ok(out.startsWith("# My project"));
  assert.ok(out.includes("Some rules I wrote."));
  assert.ok(out.includes(BEGIN));
  assert.ok(out.includes("managed body"));
  assert.ok(out.includes(END));
  // User content must come BEFORE the managed block, not after.
  assert.ok(out.indexOf("Some rules I wrote.") < out.indexOf(BEGIN));
});

test("applyManagedBlock: file with existing managed block → block replaced, surrounding content untouched", () => {
  const existing = `# My project\n\nIntro paragraph.\n\n${BEGIN}\nold body\n${END}\n\n## My other section\n\nMy own rules.\n`;
  const out = applyManagedBlock(existing, "new body");

  // New body present, old gone.
  assert.ok(out.includes("new body"));
  assert.ok(!out.includes("old body"));

  // User's intro and other section preserved.
  assert.ok(out.includes("Intro paragraph."));
  assert.ok(out.includes("My other section"));
  assert.ok(out.includes("My own rules."));

  // Order preserved: intro → managed block → other section.
  assert.ok(out.indexOf("Intro paragraph.") < out.indexOf(BEGIN));
  assert.ok(out.indexOf(END) < out.indexOf("My other section"));
});

test("applyManagedBlock: idempotent — running twice produces the same output as once", () => {
  const initial = "# My project\n";
  const once = applyManagedBlock(initial, "managed body");
  const twice = applyManagedBlock(once, "managed body");
  assert.equal(twice, once);
});

test("applyManagedBlock: changed body updates in place without duplicating block", () => {
  const initial = "# My project\n";
  const once = applyManagedBlock(initial, "v1");
  const twice = applyManagedBlock(once, "v2");
  // Only one BEGIN marker — no duplication.
  const beginCount = (twice.match(new RegExp(BEGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  assert.equal(beginCount, 1);
  assert.ok(twice.includes("v2"));
  assert.ok(!twice.includes("v1"));
});

test("applyManagedBlock: file ending without newline still gets a separator", () => {
  const existing = "no trailing newline";
  const out = applyManagedBlock(existing, "body");
  assert.ok(out.startsWith("no trailing newline\n\n"));
});

test("applyManagedBlock: trims trailing whitespace from block body", () => {
  const out = applyManagedBlock("", "body   \n\n   ");
  // Body should be normalized — no trailing newlines inside the block,
  // exactly one newline between block body and END marker.
  assert.equal(out, `${BEGIN}\nbody\n${END}\n`);
});

test("planLine: known actions render with consistent column width", () => {
  assert.equal(planLine("create", "AGENTS.md"), "  + create  AGENTS.md");
  assert.equal(planLine("update", "CLAUDE.md"), "  ~ update  CLAUDE.md");
  assert.equal(planLine("skip",   ".cursor/rules/sous-ds.mdc"), "  - skip    .cursor/rules/sous-ds.mdc");
});

test("buildTargets: returns the four expected paths in order", () => {
  // Use a fake package root — only the SKILL.md path matters here, and
  // we call the body fn lazily, so we can assert paths without IO.
  const targets = buildTargets("/tmp/sous-ds-fake");
  const paths = targets.map((t) => t.path);
  assert.deepEqual(paths, [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/rules/sous-ds.mdc",
    ".claude/skills/sous-ds/SKILL.md",
  ]);

  // First two are managed-block, last two are owned-file.
  assert.equal(targets[0].mode, "managed-block");
  assert.equal(targets[1].mode, "managed-block");
  assert.equal(targets[2].mode, "owned-file");
  assert.equal(targets[3].mode, "owned-file");
});

test("buildGlobalTargets: returns global skill and command paths", () => {
  const targets = buildGlobalTargets("/tmp/sous-ds-fake");
  const paths = targets.map((t) => t.path);
  assert.deepEqual(paths, [
    ".agents/skills/sous-ds/SKILL.md",
    ".codex/skills/sous-ds/SKILL.md",
    ".claude/skills/sous-ds/SKILL.md",
    ".config/goose/skills/sous-ds/SKILL.md",
    "repos/agents/skills/sous-ds/SKILL.md",
    ".cursor/commands/sous-ds.md",
    ".claude/commands/sous-ds.md",
  ]);
  assert.ok(targets.every((t) => t.mode === "owned-file"));
  assert.match(targets[0].body, /Learn from this project/);
});

// ─── Subprocess + symlink regression tests ────────────────────────────
//
// The bug fixed in v0.6.1 was: bin/init.mjs's `isDirect` check
// (`import.meta.url === file://${process.argv[1]}`) silently failed when
// invoked through a bin symlink — npm/npx ALWAYS invoke via symlink, so
// the CLI silently no-op'd in production while passing every unit test
// because tests import directly. These tests spawn the real entrypoint
// through a real symlink so the same failure mode can never recur
// silently again.

function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "sous-ds-cli-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("CLI: direct invocation prints the plan and exits 0", () => {
  withTmpDir((cwd) => {
    const result = spawnSync(process.execPath, [ENTRYPOINT, "--dry-run"], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `stdout=${result.stdout}\nstderr=${result.stderr}`);
    assert.match(result.stdout, /sous-ds@.* init/);
    assert.match(result.stdout, /AGENTS\.md/);
    assert.match(result.stdout, /CLAUDE\.md/);
    assert.match(result.stdout, /\.cursor\/rules\/sous-ds\.mdc/);
    assert.match(result.stdout, /\.claude\/skills\/sous-ds\/SKILL\.md/);
    assert.match(result.stdout, /Plan only\. Re-run without --dry-run to apply\./);
  });
});

test("CLI: invocation through a symlink (the bin pattern) still works", () => {
  // Reproduces exactly how npm/npx invoke the bin: via a symlink in
  // node_modules/.bin/ that points at the real entrypoint. Pre-v0.6.1
  // this path silently no-op'd because of the isDirect check.
  withTmpDir((cwd) => {
    const link = join(cwd, "fake-bin");
    symlinkSync(ENTRYPOINT, link);
    const result = spawnSync(process.execPath, [link, "--dry-run"], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `stdout=${result.stdout}\nstderr=${result.stderr}`);
    assert.match(result.stdout, /sous-ds@.* init/);
    assert.match(result.stdout, /\+ create  AGENTS\.md/);
    // No writes in --dry-run, even via symlink.
    assert.equal(existsSync(join(cwd, "AGENTS.md")), false);
  });
});

test("CLI: --version prints just the version and exits 0", () => {
  const result = spawnSync(process.execPath, [ENTRYPOINT, "--version"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  // Should be the package's own version, e.g. "0.6.1\n".
  const pkg = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8"));
  assert.equal(result.stdout.trim(), pkg.version);
});

test("CLI: -V short flag also prints the version", () => {
  const result = spawnSync(process.execPath, [ENTRYPOINT, "-V"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^\d+\.\d+\.\d+/);
});

test("CLI: --help prints usage and exits 0", () => {
  const result = spawnSync(process.execPath, [ENTRYPOINT, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npx sous-ds/);
  assert.match(result.stdout, /--dry-run/);
  assert.match(result.stdout, /--force/);
  assert.match(result.stdout, /--version/);
});

test("CLI: real run writes the four files in an empty cwd", () => {
  withTmpDir((cwd) => {
    const result = spawnSync(process.execPath, [ENTRYPOINT], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, `stderr=${result.stderr}`);
    assert.match(result.stdout, /Wrote 4 files/);
    assert.equal(existsSync(join(cwd, "AGENTS.md")), true);
    assert.equal(existsSync(join(cwd, "CLAUDE.md")), true);
    assert.equal(existsSync(join(cwd, ".cursor/rules/sous-ds.mdc")), true);
    assert.equal(existsSync(join(cwd, ".claude/skills/sous-ds/SKILL.md")), true);
  });
});

test("CLI: install-global writes global skill and command shims under SOUS_DS_HOME", () => {
  withTmpDir((cwd) => {
    const result = spawnSync(process.execPath, [ENTRYPOINT, "install-global"], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, SOUS_DS_HOME: cwd },
    });
    assert.equal(result.status, 0, `stderr=${result.stderr}`);
    assert.match(result.stdout, /install-global/);
    assert.equal(existsSync(join(cwd, ".agents/skills/sous-ds/SKILL.md")), true);
    assert.equal(existsSync(join(cwd, ".codex/skills/sous-ds/SKILL.md")), true);
    assert.equal(existsSync(join(cwd, ".claude/skills/sous-ds/SKILL.md")), true);
    assert.equal(existsSync(join(cwd, ".config/goose/skills/sous-ds/SKILL.md")), true);
    assert.equal(existsSync(join(cwd, "repos/agents/skills/sous-ds/SKILL.md")), true);
    assert.equal(existsSync(join(cwd, ".cursor/commands/sous-ds.md")), true);
    assert.equal(existsSync(join(cwd, ".claude/commands/sous-ds.md")), true);
  });
});

test("CLI: re-running is idempotent (skip x4 on second run)", () => {
  withTmpDir((cwd) => {
    spawnSync(process.execPath, [ENTRYPOINT], { cwd, encoding: "utf8" });
    const second = spawnSync(process.execPath, [ENTRYPOINT], { cwd, encoding: "utf8" });
    assert.equal(second.status, 0);
    assert.match(second.stdout, /Wrote 0 files, skipped 4/);
  });
});

test("CLI: existing AGENTS.md gets a managed block appended without clobbering user content", () => {
  withTmpDir((cwd) => {
    const userContent = "# My project\n\nMy own AGENTS.md rules.\n";
    writeFileSync(join(cwd, "AGENTS.md"), userContent);
    const result = spawnSync(process.execPath, [ENTRYPOINT], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0);
    const after = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    assert.ok(after.startsWith("# My project"), "user content preserved at top");
    assert.ok(after.includes("My own AGENTS.md rules."), "user content body preserved");
    assert.ok(after.includes("BEGIN sous-ds managed"), "managed block inserted");
    assert.ok(after.includes("END sous-ds managed"), "managed block closed");
  });
});
