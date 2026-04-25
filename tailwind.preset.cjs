/**
 * sous-ds · Tailwind preset
 *
 * Usage in a consumer's tailwind.config.{js,cjs,ts}:
 *
 *   const sousPreset = require("sous-ds/tailwind");
 *   module.exports = {
 *     presets: [sousPreset],
 *     content: ["./src/**\/*.{ts,tsx,js,jsx,html}"],
 *   };
 *
 * And once at the app root:
 *   import "sous-ds/tokens.css";   // or "sous-ds/styles.css" for the full bundle
 *
 * Every Tailwind utility added by this preset resolves to a `var(--ds-*)`
 * at runtime — so overriding a token in CSS (e.g. swapping dark → light)
 * propagates through every Tailwind utility automatically. The preset
 * never embeds the token's literal value; the CSS variable is the source
 * of truth.
 *
 * Token namespace: every key is prefixed `ds-` to avoid colliding with
 * Tailwind defaults or another design system's extensions. So
 * `bg-ds-surface`, `text-ds-primary`, `gap-ds-5`, `rounded-ds-md`, etc.
 *
 * This preset adds no plugins, no dark: variant switching, no opacity
 * wrapping — it's a pure token bridge. Consumers add whatever plugin
 * stack their app needs.
 */

/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        "ds-bg":             "var(--ds-bg)",
        "ds-surface":        "var(--ds-surface)",
        "ds-surface-raised": "var(--ds-surface-raised)",
        "ds-line":           "var(--ds-line)",
        "ds-line-strong":    "var(--ds-line-strong)",
        "ds-text-primary":   "var(--ds-text-primary)",
        "ds-text-secondary": "var(--ds-text-secondary)",
        "ds-text-muted":     "var(--ds-text-muted)",
        "ds-text-on-primary":"var(--ds-text-on-primary)",
        "ds-text-on-accent": "var(--ds-text-on-accent)",
        "ds-text-on-success":"var(--ds-text-on-success)",
        "ds-accent-live":    "var(--ds-accent-live)",
        "ds-accent-success": "var(--ds-accent-success)",
      },
      fontFamily: {
        "ds-display": "var(--ds-font-display)",
        "ds-sans":    "var(--ds-font-sans)",
        "ds-mono":    "var(--ds-font-mono)",
      },
      fontSize: {
        "ds-display":  ["var(--ds-type-display-size)",  { lineHeight: "var(--ds-type-display-lh)",  letterSpacing: "var(--ds-type-display-track)" }],
        "ds-h1":       ["var(--ds-type-h1-size)",       { lineHeight: "var(--ds-type-h1-lh)",       letterSpacing: "var(--ds-type-h1-track)" }],
        "ds-h2":       ["var(--ds-type-h2-size)",       { lineHeight: "var(--ds-type-h2-lh)",       letterSpacing: "var(--ds-type-h2-track)" }],
        "ds-h3":       ["var(--ds-type-h3-size)",       { lineHeight: "var(--ds-type-h3-lh)",       letterSpacing: "var(--ds-type-h3-track)" }],
        "ds-body-lg":  ["var(--ds-type-body-lg-size)",  { lineHeight: "var(--ds-type-body-lg-lh)" }],
        "ds-body":     ["var(--ds-type-body-size)",     { lineHeight: "var(--ds-type-body-lh)" }],
        "ds-body-sm":  ["var(--ds-type-body-sm-size)",  { lineHeight: "var(--ds-type-body-sm-lh)" }],
        "ds-label":    ["var(--ds-type-label-size)",    { lineHeight: "var(--ds-type-label-lh)",    letterSpacing: "var(--ds-type-label-track)" }],
        "ds-mono-xl":  ["var(--ds-type-mono-xl-size)",  { lineHeight: "var(--ds-type-mono-xl-lh)" }],
        "ds-mono":     ["var(--ds-type-mono-size)",     { lineHeight: "var(--ds-type-mono-lh)" }],
      },
      maxWidth: {
        "ds-measure": "var(--ds-measure)",
      },
      spacing: {
        "ds-0":  "var(--ds-space-0)",
        "ds-1":  "var(--ds-space-1)",
        "ds-2":  "var(--ds-space-2)",
        "ds-3":  "var(--ds-space-3)",
        "ds-4":  "var(--ds-space-4)",
        "ds-5":  "var(--ds-space-5)",
        "ds-6":  "var(--ds-space-6)",
        "ds-7":  "var(--ds-space-7)",
        "ds-8":  "var(--ds-space-8)",
        "ds-9":  "var(--ds-space-9)",
        "ds-10": "var(--ds-space-10)",
        "ds-11": "var(--ds-space-11)",
      },
      borderRadius: {
        "ds-none": "var(--ds-radius-none)",
        "ds-xs":   "var(--ds-radius-xs)",
        "ds-sm":   "var(--ds-radius-sm)",
        "ds-md":   "var(--ds-radius-md)",
        "ds-lg":   "var(--ds-radius-lg)",
        "ds-pill": "var(--ds-radius-pill)",
      },
      boxShadow: {
        "ds-0": "var(--ds-elev-0)",
        "ds-1": "var(--ds-elev-1)",
        "ds-2": "var(--ds-elev-2)",
      },
      transitionDuration: {
        "ds-instant":    "var(--ds-dur-instant)",
        "ds-press":      "var(--ds-dur-press)",
        "ds-micro":      "var(--ds-dur-micro)",
        "ds-standard":   "var(--ds-dur-standard)",
        "ds-deliberate": "var(--ds-dur-deliberate)",
        "ds-exit":       "var(--ds-dur-exit-standard)",
      },
      transitionTimingFunction: {
        "ds-out":    "var(--ds-ease-out)",
        "ds-in-out": "var(--ds-ease-in-out)",
        "ds-in":     "var(--ds-ease-in)",
      },
      screens: {
        "ds-sm": "640px",
        "ds-md": "768px",
        "ds-lg": "1024px",
        "ds-xl": "1280px",
      },
    },
  },
};
