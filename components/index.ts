/**
 * sous-ds component suite · v0.4.0
 *
 * Every component is a reference implementation of the rules in DESIGN.md.
 * Components should prefer tokens and documented system values over ad hoc
 * literals so agents can learn the right defaults from the source.
 *
 * Usage:
 *   import {
 *     Button, Card, Pill, LiveDot, InlineStatus, MetricStat, ToolCall,
 *     ToastProvider, useToast, DottedChart, DotTimeline, PulseTrail,
 *     tween, typewriter, rotateLabels, stagger, easings, prefersReducedMotion,
 *   } from "sous-ds";
 *
 *   // Tree-shakeable motion subpath:
 *   import { tween } from "sous-ds/motion";
 */

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Pill } from "./Pill";
export type { PillProps } from "./Pill";

export { LiveDot } from "./LiveDot";
export type { LiveDotProps } from "./LiveDot";

export { LiveBlock } from "./LiveBlock";
export type { LiveBlockProps } from "./LiveBlock";

export { ToastProvider, useToast } from "./Toast";

export { DottedChart } from "./DottedChart";
export type { DottedChartProps, DottedChartDatum } from "./DottedChart";

export { DotTimeline } from "./DotTimeline";
export type { DotTimelineProps, Bucket, BucketState, TimelineEvent } from "./DotTimeline";

export { PulseTrail } from "./PulseTrail";
export type { PulseTrailProps, TrailEvent, TrailEventState } from "./PulseTrail";

export { SegmentedBar } from "./SegmentedBar";
export type { SegmentedBarProps } from "./SegmentedBar";

export { SegmentedControl } from "./SegmentedControl";
export type { SegmentedControlOption, SegmentedControlProps } from "./SegmentedControl";

export { InlineStatus } from "./InlineStatus";
export type { InlineStatusProps } from "./InlineStatus";

export { MetricStat } from "./MetricStat";
export type { MetricStatProps } from "./MetricStat";

export { ToolCall } from "./ToolCall";
export type { ToolCallProps } from "./ToolCall";

export { AgentStream } from "./AgentStream";
export type { AgentStreamProps } from "./AgentStream";

export { Citation } from "./Citation";
export type { CitationProps } from "./Citation";

export { TetrisLoader } from "./TetrisLoader";
export type {
  TetrisLoaderProps,
  TetrisLoaderSize,
  TetrisLoaderSpeed,
} from "./TetrisLoader";

export { BoxLoader } from "./BoxLoader";
export type { BoxLoaderProps } from "./BoxLoader";

export { DotLoader } from "./DotLoader";
export type { DotLoaderProps } from "./DotLoader";

export { ThinkingCube } from "./ThinkingCube";
export type { ThinkingCubeProps } from "./ThinkingCube";

export { BlockLoader } from "./BlockLoader";
export type { BlockLoaderProps } from "./BlockLoader";

export { GenerativeRenderer } from "./GenerativeRenderer";
export type { GenerativeRendererProps } from "./GenerativeRenderer";
export { DEFAULT_DIALS } from "./generative-ui-types";
export type {
  CompositionJSON,
  Section,
  MetricWallSection,
  RAGStatusSection,
  PipelineMapSection,
  MilestoneStripSection,
  AgentLogSection,
  ReceiptStackSection,
  Dials,
  StageState,
  RecipeName,
} from "./generative-ui-types";

// Motion primitive — zero-dep animation vocabulary shared across
// components and consumers. See components/motion.ts for the rationale.
export {
  tween,
  typewriter,
  rotateLabels,
  stagger,
  easings,
  prefersReducedMotion,
} from "./motion";
export type {
  TweenOptions,
  TypewriterOptions,
  RotateLabelsOptions,
  StaggerOptions,
  EasingFn,
} from "./motion";
