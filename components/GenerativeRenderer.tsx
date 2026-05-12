/*
 * GenerativeRenderer · sous-ds
 *
 * Deterministic React component that turns a CompositionJSON (planner
 * output) into a live sous-ds page. No LLM at render time — a typed
 * switch over the six v2 composition recipes. All visual primitives are
 * existing sous-ds components; accents only ride sanctioned carriers
 * (LiveDot, PulseTrail, Pill[live], InlineStatus[live], SegmentedBar[success]).
 *
 * See docs/specs/generative-ui-schema.json for the wire contract.
 * See docs/specs/generative-ui-planner.md for the system prompt that
 * produces conforming JSON.
 */

import * as React from "react";
import "./GenerativeRenderer.css";

import { Card } from "./Card";
import { Pill } from "./Pill";
import { LiveDot } from "./LiveDot";
import { PulseTrail } from "./PulseTrail";
import { InlineStatus } from "./InlineStatus";
import { MetricStat } from "./MetricStat";
import { ToolCall } from "./ToolCall";
import { SegmentedBar } from "./SegmentedBar";

import type {
  CompositionJSON,
  Section,
  MetricWallSection,
  RAGStatusSection,
  PipelineMapSection,
  MilestoneStripSection,
  AgentLogSection,
  ReceiptStackSection,
  ProfileSection,
  Dials,
  StageState,
} from "./generative-ui-types";
import { DEFAULT_DIALS } from "./generative-ui-types";

export interface GenerativeRendererProps {
  composition: CompositionJSON;
  onSectionClick?: (sectionIndex: number) => void;
}

/* --------------------------------------------------------------------- */
/* Dial → CSS custom-property mapping                                    */
/* --------------------------------------------------------------------- */

/**
 * Density and rhythm map to padding / gap tokens snapped to the 8pt scale.
 * A lookup keeps every value on-grid (LY01 lint compliance) instead of
 * interpolating continuously off-grid.
 */
const DENSITY_TO_PADDING: Record<number, string> = {
  1: "var(--ds-space-9)", 2: "var(--ds-space-9)", 3: "var(--ds-space-8)",
  4: "var(--ds-space-7)", 5: "var(--ds-space-7)", 6: "var(--ds-space-6)",
  7: "var(--ds-space-6)", 8: "var(--ds-space-5)", 9: "var(--ds-space-4)",
  10: "var(--ds-space-4)",
};

const RHYTHM_TO_SECTION_GAP: Record<number, string> = {
  1: "var(--ds-space-9)", 2: "var(--ds-space-9)", 3: "var(--ds-space-8)",
  4: "var(--ds-space-8)", 5: "var(--ds-space-7)", 6: "var(--ds-space-7)",
  7: "var(--ds-space-6)", 8: "var(--ds-space-6)", 9: "var(--ds-space-5)",
  10: "var(--ds-space-5)",
};

function dialsStyle(dials: Dials): React.CSSProperties {
  return {
    "--ds-gen-card-pad": DENSITY_TO_PADDING[dials.density] ?? "var(--ds-space-6)",
    "--ds-gen-section-gap": RHYTHM_TO_SECTION_GAP[dials.rhythm] ?? "var(--ds-space-7)",
  } as React.CSSProperties;
}

/* --------------------------------------------------------------------- */
/* Stable per-section keys: re-animate only when content changes         */
/* --------------------------------------------------------------------- */

function hashSection(section: Section): string {
  return JSON.stringify(section);
}

/* --------------------------------------------------------------------- */
/* Renderer                                                              */
/* --------------------------------------------------------------------- */

export function GenerativeRenderer({
  composition,
  onSectionClick,
}: GenerativeRendererProps) {
  const dials: Dials = {
    ...DEFAULT_DIALS,
    ...(composition.dials ?? {}),
  };

  return (
    <div className="ds-gen-root" style={dialsStyle(dials)}>
      <h1 className="ds-gen-page-title">{composition.pageTitle}</h1>

      <div className="ds-gen-sections">
        {composition.sections.map((section, index) => {
          const key = hashSection(section);
          const sectionStyle = {
            "--ds-gen-section-index": index,
          } as React.CSSProperties;

          return (
            <section
              key={key}
              className="ds-gen-section"
              data-recipe={section.recipe}
              style={sectionStyle}
              onClick={onSectionClick ? () => onSectionClick(index) : undefined}
            >
              {renderSection(section)}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function renderSection(section: Section): React.ReactNode {
  switch (section.recipe) {
    case "MetricWall":     return renderMetricWall(section);
    case "RAGStatus":      return renderRAGStatus(section);
    case "PipelineMap":    return renderPipelineMap(section);
    case "MilestoneStrip": return renderMilestoneStrip(section);
    case "AgentLog":       return renderAgentLog(section);
    case "ReceiptStack":   return renderReceiptStack(section);
    case "Profile":        return renderProfile(section);
    default:               return renderUnknown(section);
  }
}

/* Two-letter initial (mono) extracted from "First Last" / "First" / "@handle". */
function monogramFromName(name: string): string {
  const parts = name.trim().replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeHandle(handle: string | undefined): string | null {
  if (!handle) return null;
  const trimmed = handle.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

/* --------------------------------------------------------------------- */
/* Recipe renderers                                                      */
/* --------------------------------------------------------------------- */

function renderMetricWall(section: MetricWallSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      <div className="ds-gen-metric-row">
        {section.metrics.slice(0, 4).map((metric, i) => {
          const numericValue = parseFloat(metric.value);
          const isNumeric = !Number.isNaN(numericValue);

          if (isNumeric) {
            return (
              <MetricStat
                key={i}
                label={metric.label}
                value={numericValue}
                prefix=""
                suffix={metric.unit}
                delta={metric.delta}
                animated={false}
              />
            );
          }

          /* Non-numeric value (e.g. "78–80"). Render the raw string
             mono-aligned so range and unit notation stay legible. */
          return (
            <div key={i} className="ds-gen-metric-string">
              <span className="ds-gen-metric-string__label">{metric.label}</span>
              <span className="ds-gen-metric-string__value">
                {metric.value}
                {metric.unit && (
                  <span className="ds-gen-metric-string__unit">{metric.unit}</span>
                )}
              </span>
              {metric.delta && (
                <span className="ds-gen-metric-string__delta">{metric.delta}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function renderRAGStatus(section: RAGStatusSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      <div className="ds-gen-rag-row">
        <div className="ds-gen-rag-word">
          {section.status === "RED" && (
            <LiveDot announce="Red status" className="ds-gen-rag-dot" />
          )}
          <span className="ds-gen-rag-text" data-status={section.status}>
            {section.status}
          </span>
        </div>
        <p className="ds-gen-rag-body">{section.body}</p>
      </div>
      {section.status === "GREEN" && (
        <div className="ds-gen-rag-success">
          <SegmentedBar
            value={1}
            total={1}
            completeTone="success"
            animated={false}
            aria-label="Status green"
          />
        </div>
      )}
    </Card>
  );
}

function renderPipelineMap(section: PipelineMapSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      <div className="ds-gen-stage-row" role="list">
        {section.stages.map((stage, i) => (
          <div
            key={`${i}-${stage.label}`}
            className="ds-gen-stage"
            data-state={stage.state}
            role="listitem"
          >
            <div className="ds-gen-stage__dot-slot">
              {renderStageDot(stage.state)}
            </div>
            <span className="ds-gen-stage__label">{stage.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function renderStageDot(state: StageState): React.ReactNode {
  if (state === "live") {
    return <LiveDot announce="Active stage" />;
  }
  if (state === "done") {
    return <span className="ds-gen-stage__neutral-dot" aria-label="Done" />;
  }
  return <span className="ds-gen-stage__queued-dot" aria-label="Queued" />;
}

function renderMilestoneStrip(section: MilestoneStripSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      <ul className="ds-gen-phase-list">
        {section.phases.map((phase, i) => {
          const segmentTotal = 10;
          const segmentValue = Math.max(
            0,
            Math.min(segmentTotal, Math.round((phase.progress / 100) * segmentTotal)),
          );
          const isComplete = phase.state === "done" && segmentValue === segmentTotal;
          return (
            <li
              key={`${phase.label}-${i}`}
              className="ds-gen-phase"
              data-state={phase.state}
            >
              <div className="ds-gen-phase__head">
                <code className="ds-gen-phase__code">{phase.label}</code>
                {phase.title && (
                  <span className="ds-gen-phase__title">{phase.title}</span>
                )}
                {phase.date && (
                  <time className="ds-gen-phase__date">{phase.date}</time>
                )}
              </div>
              <SegmentedBar
                value={segmentValue}
                total={segmentTotal}
                completeTone={isComplete ? "success" : "default"}
                animated={false}
                aria-label={`${phase.label} progress`}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function renderAgentLog(section: AgentLogSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      {section.isLive && (
        <div className="ds-gen-agent-head">
          {/* Empty events — the head loop carries the "live now" signal.
              Avoids Date.now() in render so re-renders stay deterministic
              and React's key-based DOM preservation is byte-stable. */}
          <PulseTrail
            events={[]}
            trailLength={0}
            loopDuration={4000}
            label="Agent activity"
            showAxis={false}
          />
        </div>
      )}
      <div className="ds-gen-agent-stack">
        {section.items.map((item, i) => (
          <ToolCall
            key={`${item.tool}-${i}`}
            name={item.tool}
            detail={item.label}
            duration={item.duration}
            status={item.status.toUpperCase()}
            statusTone={item.status === "live" ? "live" : "default"}
          />
        ))}
      </div>
    </Card>
  );
}

function renderReceiptStack(section: ReceiptStackSection): React.ReactNode {
  return (
    <Card label={section.eyebrow} title={section.title}>
      {section.body && <p className="ds-gen-receipt-body">{section.body}</p>}
      <ul className="ds-gen-receipt-list">
        {section.items.map((item) => (
          <li key={item.id} className="ds-gen-receipt-row">
            <code className="ds-gen-receipt-id">{item.id}</code>
            <span className="ds-gen-receipt-label">{item.label}</span>
            <InlineStatus tone="default">{item.state}</InlineStatus>
            {item.timestamp && (
              <time className="ds-gen-receipt-time">{item.timestamp}</time>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function renderProfile(section: ProfileSection): React.ReactNode {
  const monogram = monogramFromName(section.name);
  const handle = normalizeHandle(section.handle);
  const confidenceMeta = section.confidence
    ? `${section.confidence.label} ${section.confidence.value}%`
    : undefined;
  const artifacts = section.artifacts ?? [];

  return (
    <Card label={section.eyebrow} meta={confidenceMeta}>
      <div className="ds-gen-profile-head">
        <span className="ds-gen-profile-monogram" aria-hidden="true">
          {monogram}
        </span>
        <div className="ds-gen-profile-identity">
          <h2 className="ds-gen-profile-name">{section.name}</h2>
          {section.body && (
            <p className="ds-gen-profile-body">{section.body}</p>
          )}
        </div>
        {handle && (
          <code className="ds-gen-profile-handle">[{handle}]</code>
        )}
      </div>
      {artifacts.length > 0 && (
        <div className="ds-gen-profile-artifacts">
          <div className="ds-gen-profile-artifacts-head">RECENT</div>
          <ul className="ds-gen-receipt-list">
            {artifacts.map((item) => (
              <li key={item.id} className="ds-gen-receipt-row">
                <code className="ds-gen-receipt-id">{item.id}</code>
                <span className="ds-gen-receipt-label">{item.label}</span>
                <InlineStatus tone="default">{item.state}</InlineStatus>
                {item.timestamp && (
                  <time className="ds-gen-receipt-time">{item.timestamp}</time>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function renderUnknown(section: Section): React.ReactNode {
  return (
    <Card label="UNKNOWN RECIPE">
      <InlineStatus tone="live">
        {`UNKNOWN RECIPE: ${(section as { recipe: string }).recipe}`}
      </InlineStatus>
    </Card>
  );
}
