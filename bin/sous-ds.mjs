#!/usr/bin/env node
/*
 * sous-ds — bin entrypoint
 *
 * Always runs main(). No "is this the entrypoint?" detection — that
 * idiom (`import.meta.url === file://${argv[1]}`) silently fails when
 * the script is invoked through a bin symlink (which is how npm/npx
 * always invokes it), because argv[1] is the symlink path and
 * import.meta.url is the resolved path. They never match → main()
 * never runs → silent no-op.
 *
 * Splitting library (init.mjs, exports only) from entrypoint (this
 * file, always runs) sidesteps the issue entirely. There's a
 * regression test in init.test.mjs that spawns this file via a real
 * symlink and asserts it produces output.
 */

import { main } from "./init.mjs";

try {
  process.exit(main(process.argv.slice(2)));
} catch (err) {
  console.error("sous-ds: unexpected error");
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}
