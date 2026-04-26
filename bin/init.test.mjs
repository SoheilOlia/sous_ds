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
import { applyManagedBlock, planLine, buildTargets } from "./init.mjs";

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
