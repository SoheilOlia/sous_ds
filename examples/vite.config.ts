import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite config for the sous-ds generative-UI playground.
 *
 * The dev server mounts a /api/plan middleware that proxies planner
 * requests to api.anthropic.com using a SERVER-SIDE Anthropic API key.
 * The browser never sees the key. This closes the CORS-blocked path for
 * org-issued keys and removes the dangerouslyAllowBrowser pattern.
 *
 * Key precedence:
 *   ANTHROPIC_API_KEY        → preferred (new)
 *   VITE_ANTHROPIC_API_KEY   → legacy fallback (still works)
 *
 * Model precedence is the same.
 *
 * Run from repo root: bun run dev
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || "";
  const model = env.ANTHROPIC_MODEL || env.VITE_ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const plannerProxy = {
    name: "sous-ds-planner-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/plan", async (req, res) => {
        /* Health check — lets the client surface a config hint without
           making a real planner call. */
        if (req.method === "GET") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ keyConfigured: !!apiKey, model }));
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed; POST only" }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error:
                "ANTHROPIC_API_KEY not set. Add it to examples/.env.local (no VITE_ prefix) and restart bun run dev.",
            }),
          );
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const body = Buffer.concat(chunks).toString("utf8");

        try {
          const upstream = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body,
          });
          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader(
            "Content-Type",
            upstream.headers.get("content-type") ?? "application/json",
          );
          res.end(text);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Upstream fetch failed",
              detail: err instanceof Error ? err.message : String(err),
            }),
          );
        }
      });
    },
  };

  return {
    root: __dirname,
    plugins: [react(), plannerProxy],
    define: {
      /* Expose only the model name to the client — never the key. */
      "import.meta.env.PLANNER_MODEL": JSON.stringify(model),
    },
    resolve: {
      alias: {
        "sous-ds/components": path.resolve(__dirname, "../components"),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
