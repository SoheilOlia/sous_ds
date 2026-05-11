import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite config for the sous-ds generative-UI playground.
 *
 * Run from the repo root:
 *   bun run dev      (uses examples/vite.config.ts via the package.json script)
 *
 * The playground imports directly from ../components/, so HMR follows source
 * changes without rebuilding the npm package.
 */
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      // Convenience alias so the playground reads close to a real consumer.
      "sous-ds/components": path.resolve(__dirname, "../components"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
