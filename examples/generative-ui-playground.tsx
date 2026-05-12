/*
 * sous-ds — Generative UI Playground
 *
 * A single-file React app that wires:
 *   - the planner system prompt (docs/specs/generative-ui-planner.md)
 *   - the planner-proxy middleware in vite.config.ts (server-side)
 *   - the JSON Schema validator (ajv)
 *   - the deterministic <GenerativeRenderer>
 *
 * The Anthropic key is read server-side by the Vite middleware and
 * never reaches the browser. CORS-blocked org keys work fine because
 * the request originates from the Node process, not a browser tab.
 *
 * Setup (one-time):
 *   1. cp examples/.env.local.example examples/.env.local
 *   2. Add your ANTHROPIC_API_KEY to .env.local (no VITE_ prefix)
 *   3. bun install   (or npm install)
 *
 * Run:
 *   bun run dev      (opens http://localhost:5173 automatically)
 */

import * as React from "react";
import { createRoot } from "react-dom/client";
import Ajv from "ajv";

import "../tokens.css";
import "./generative-ui-playground.css";
import { GenerativeRenderer } from "../components/GenerativeRenderer";
import { ToastProvider, useToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";
import { InlineStatus } from "../components/InlineStatus";
import { DEFAULT_DIALS } from "../components/generative-ui-types";
import type { CompositionJSON, Dials } from "../components/generative-ui-types";

import schema from "../docs/specs/generative-ui-schema.json";
import plannerMarkdown from "../docs/specs/generative-ui-planner.md?raw";
import plannerTasteMarkdown from "../docs/specs/planner-taste.md?raw";
import fixturesData from "./generative-ui-fixtures.json";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const VERSION = "v0.10.0";
const DEFAULT_MODEL = "claude-sonnet-4-6";

const QUICK_PROMPTS: string[] = [
  "Show me a trust review dashboard for a flagged account.",
  "Add a pipeline showing the 5 stages of a fraud investigation.",
  "Change the risk score card to show 3 metrics: score, days open, flag count.",
  "Make the agent log show 4 tool calls, last one still running.",
];

interface Fixture {
  id: string;
  prompt: string;
  composition: CompositionJSON;
}

const FIXTURES: Fixture[] = (fixturesData as { fixtures: Fixture[] }).fixtures;

/* Extract the actual system prompt from the planner markdown.
 * The markdown wraps the prompt in a ```text fenced block. */
function extractSystemPrompt(md: string): string {
  const match = md.match(/```text\n([\s\S]*?)\n```/);
  return match ? match[1] : md;
}

/* The planner system prompt is `generative-ui-planner.md` (role, output
 * format, recipe selection, dials, iteration) PLUS `planner-taste.md`
 * (voice, refusals, structural taste). Both are concatenated at boot
 * so the planner reads them as one continuous instruction surface.
 * See docs/specs/planner-taste.md and TASTE_LOG.md ENTRY 011. */
const SYSTEM_PROMPT =
  extractSystemPrompt(plannerMarkdown) +
  "\n\n---\n\n# Planner taste corpus\n\n" +
  plannerTasteMarkdown.replace(/^---[\s\S]*?---\n\n/, ""); // strip the YAML frontmatter

/* ------------------------------------------------------------------ */
/* Ajv validator (compiled once)                                      */
/* ------------------------------------------------------------------ */

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

function validateComposition(json: unknown): { ok: true; value: CompositionJSON } | { ok: false; errors: string } {
  const ok = validate(json);
  if (ok) return { ok: true, value: json as CompositionJSON };
  const errors = (validate.errors ?? [])
    .map((e) => `${e.instancePath || "/"} ${e.message}`)
    .join("; ");
  return { ok: false, errors };
}

/* ------------------------------------------------------------------ */
/* Planner — call /api/plan (server-side proxy)                       */
/* ------------------------------------------------------------------ */

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  error?: { type?: string; message?: string };
}

interface PlanArgs {
  userPrompt: string;
  previousUserPrompt?: string;
  previousComposition?: CompositionJSON;
}

async function planComposition({
  userPrompt,
  previousUserPrompt,
  previousComposition,
}: PlanArgs): Promise<{ raw: string; composition: CompositionJSON }> {
  const messages: AnthropicMessage[] = [];

  if (previousUserPrompt && previousComposition) {
    messages.push({ role: "user", content: previousUserPrompt });
    messages.push({ role: "assistant", content: JSON.stringify(previousComposition) });
  }
  messages.push({ role: "user", content: userPrompt });

  const model =
    (import.meta.env.PLANNER_MODEL as string | undefined) ?? DEFAULT_MODEL;

  const response = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const head = errText.slice(0, 200);
    throw new Error(`Proxy returned ${response.status}: ${head}`);
  }

  const json = (await response.json()) as AnthropicResponse;
  if (json.error) {
    throw new Error(`Anthropic error: ${json.error.type ?? "unknown"} — ${json.error.message ?? ""}`);
  }

  const text = (json.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("");

  /* Tolerate a code fence the model may slip in despite instructions. */
  const cleaned = text.trim().replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
  const parsed = JSON.parse(cleaned);
  const result = validateComposition(parsed);
  if (!result.ok) {
    throw new Error(`Planner output failed schema validation: ${result.errors}`);
  }
  return { raw: text, composition: result.value };
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

interface HistoryEntry {
  prompt: string;
  composition: CompositionJSON;
}

function App() {
  const toast = useToast();
  const [composition, setComposition] = React.useState<CompositionJSON | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [planning, setPlanning] = React.useState(false);
  const [keyStatus, setKeyStatus] = React.useState<"unknown" | "ready" | "missing">("unknown");

  /* Probe the proxy health endpoint so the sidebar can hint at config
     issues without forcing the user to click first. */
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/plan", { method: "GET" })
      .then((r) => r.json())
      .then((data: { keyConfigured?: boolean }) => {
        if (cancelled) return;
        setKeyStatus(data.keyConfigured ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setKeyStatus("missing");
      });
    return () => { cancelled = true; };
  }, []);

  const dials: Dials = {
    ...DEFAULT_DIALS,
    ...(composition?.dials ?? {}),
  };

  const submit = React.useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setPlanning(true);
      try {
        const previous = history[history.length - 1];
        const { composition: next } = await planComposition({
          userPrompt: text,
          previousUserPrompt: previous?.prompt,
          previousComposition: previous?.composition,
        });
        setComposition(next);
        setHistory((h) => [...h, { prompt: text, composition: next }]);
        setPrompt("");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[playground] plan failed", err);
        toast.show({
          tone: "live",
          title: "Planner failed",
          description: message.length > 200 ? `${message.slice(0, 197)}…` : message,
          duration: 10000,
        });
      } finally {
        setPlanning(false);
      }
    },
    [history, toast],
  );

  const loadFixture = React.useCallback(
    (fixture: Fixture) => {
      const result = validateComposition(fixture.composition);
      if (!result.ok) {
        toast.show({ tone: "live", title: "Fixture invalid", description: result.errors });
        return;
      }
      setComposition(result.value);
      setHistory([{ prompt: fixture.prompt, composition: result.value }]);
    },
    [toast],
  );

  const clearPage = React.useCallback(() => {
    setComposition(null);
    setHistory([]);
    setPrompt("");
  }, []);

  return (
    <div className="pg-shell">
      <header className="pg-topbar">
        <div className="pg-brand">
          <span className="pg-brand__name">sous-ds</span>
          <span className="pg-brand__tag">generative UI</span>
          <Pill variant="outline" tone="draft">{VERSION}</Pill>
        </div>
        <div className="pg-dials">
          <span>DENSITY <b>{dials.density}</b></span>
          <span>RHYTHM <b>{dials.rhythm}</b></span>
          <span>VOICE <b>{dials.voice}</b></span>
        </div>
      </header>

      <aside className="pg-sidebar">
        <section className="pg-side-section">
          <h2 className="pg-side-heading">PROMPT</h2>
          <textarea
            className="pg-textarea"
            value={prompt}
            placeholder="Describe the UI you want…"
            rows={6}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void submit(prompt);
              }
            }}
            disabled={planning}
          />
          <div className="pg-row">
            <Button
              variant="primary"
              onClick={() => void submit(prompt)}
              disabled={planning || !prompt.trim()}
            >
              {planning ? "Planning…" : "Plan UI"}
            </Button>
            <Button variant="ghost" onClick={clearPage} disabled={planning}>
              Clear page
            </Button>
          </div>
          {planning && (
            <InlineStatus tone="active">Planning UI…</InlineStatus>
          )}
          {keyStatus === "missing" && (
            <p className="pg-warn">
              No API key on the server. Use the fixtures below, or add{" "}
              <code>ANTHROPIC_API_KEY</code> to{" "}
              <code>examples/.env.local</code> and restart{" "}
              <code>bun run dev</code>.
            </p>
          )}
        </section>

        <section className="pg-side-section">
          <h2 className="pg-side-heading">QUICK PICKS</h2>
          <div className="pg-chips">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                className="pg-chip"
                onClick={() => setPrompt(p)}
                disabled={planning}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className="pg-side-section">
          <h2 className="pg-side-heading">FIXTURES</h2>
          <p className="pg-side-note">Pre-canned compositions. No API call.</p>
          <div className="pg-chips">
            {FIXTURES.map((f) => (
              <button
                key={f.id}
                className="pg-chip"
                onClick={() => loadFixture(f)}
                disabled={planning}
                type="button"
              >
                {f.id}
              </button>
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="pg-side-section">
            <h2 className="pg-side-heading">HISTORY — {history.length}</h2>
            <ol className="pg-history">
              {history.map((h, i) => (
                <li key={i}>
                  <span className="pg-history__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pg-history__prompt">{h.prompt}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </aside>

      <main className="pg-main">
        {composition ? (
          <GenerativeRenderer composition={composition} />
        ) : (
          <div className="pg-empty">
            <h1 className="pg-empty__title">No page yet.</h1>
            <p className="pg-empty__body">
              Describe a UI on the left, or load a fixture. The planner emits
              composition JSON; the renderer turns it into a sous-ds page.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mount                                                              */
/* ------------------------------------------------------------------ */

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root");
createRoot(rootEl).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
);
