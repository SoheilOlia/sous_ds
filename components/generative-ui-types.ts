/**
 * sous-ds generative-UI types
 *
 * Hand-typed mirror of docs/specs/generative-ui-schema.json (v1).
 * Keep in sync when the schema changes. Runtime validation lives in the
 * playground via ajv; this module gives TS callers static guarantees.
 */

export type RecipeName =
  | "MetricWall"
  | "RAGStatus"
  | "PipelineMap"
  | "MilestoneStrip"
  | "AgentLog"
  | "ReceiptStack"
  | "Profile";

export type StageState = "done" | "live" | "queued";

export interface Dials {
  density: number; // 1..10
  rhythm: number;  // 1..10
  voice: number;   // 1..10
}

export const DEFAULT_DIALS: Dials = { density: 6, rhythm: 6, voice: 4 };

export interface MetricItem {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
}

export interface MetricWallSection {
  recipe: "MetricWall";
  eyebrow: string;
  title?: string;
  metrics: MetricItem[];
}

export interface RAGStatusSection {
  recipe: "RAGStatus";
  eyebrow: string;
  title?: string;
  status: "RED" | "AMBER" | "GREEN";
  body: string;
}

export interface PipelineStage {
  label: string;
  state: StageState;
}

export interface PipelineMapSection {
  recipe: "PipelineMap";
  eyebrow: string;
  title: string;
  stages: PipelineStage[];
}

export interface MilestonePhase {
  label: string;
  title?: string;
  date?: string;
  progress: number;
  state: StageState;
}

export interface MilestoneStripSection {
  recipe: "MilestoneStrip";
  eyebrow: string;
  title: string;
  phases: MilestonePhase[];
}

export interface AgentLogItem {
  tool: string;
  label: string;
  duration?: string;
  status: StageState;
}

export interface AgentLogSection {
  recipe: "AgentLog";
  eyebrow: string;
  title: string;
  isLive?: boolean;
  items: AgentLogItem[];
}

export interface ReceiptItem {
  id: string;
  label: string;
  state: string;
  timestamp?: string;
}

export interface ReceiptStackSection {
  recipe: "ReceiptStack";
  eyebrow: string;
  title: string;
  body?: string;
  items: ReceiptItem[];
}

export interface ProfileConfidence {
  label: string;
  value: number; // 0..100
}

export interface ProfileSection {
  recipe: "Profile";
  eyebrow: string;
  name: string;
  handle?: string;
  body?: string;
  artifacts?: ReceiptItem[];
  confidence?: ProfileConfidence;
}

export type Section =
  | MetricWallSection
  | RAGStatusSection
  | PipelineMapSection
  | MilestoneStripSection
  | AgentLogSection
  | ReceiptStackSection
  | ProfileSection;

export interface CompositionJSON {
  pageTitle: string;
  dials?: Partial<Dials>;
  sections: Section[];
  _reasoning?: string;
}
