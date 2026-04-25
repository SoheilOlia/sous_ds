import { defineConfig } from "tsup";

/**
 * Build the library for consumption as an installed npm package.
 *
 * Output shape:
 *   dist/index.{js,cjs,d.ts}          — barrel exports (components + motion)
 *   dist/components/*.{js,cjs,d.ts}   — per-component chunks (tree-shakeable)
 *   dist/motion.{js,cjs,d.ts}         — motion primitive subpath
 *
 * CSS handling:
 *   - Component source files use `import "./X.css"` as a side-effect import
 *     for dev-time style loading (Vite/Next/webpack pick these up natively).
 *   - In the built output those imports are stripped via `external` because
 *     consumers load CSS once at the app root via `import "sous-ds/styles.css"`
 *     (produced by scripts/build-styles.mjs post-build).
 *   - This keeps JS bundle size honest and avoids runtime CSS injection.
 *
 * React is marked external — it's a peer dependency.
 */
export default defineConfig({
  entry: [
    "index.ts",
    "components/index.ts",
    "components/motion.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  target: "es2020",
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom"],
  // Strip CSS side-effect imports from output — consumers load
  // `sous-ds/styles.css` once at the app root instead.
  loader: { ".css": "empty" },
  outDir: "dist",
});
