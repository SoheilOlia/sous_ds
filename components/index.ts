/**
 * soheil-ds component suite · v0.1.0
 *
 * Every component is a reference implementation of the rules in DESIGN.md.
 * Components should prefer tokens and documented system values over ad hoc
 * literals so agents can learn the right defaults from the source.
 *
 * Usage:
 *   import { Button, Card, Pill, LiveDot, ToastProvider, useToast } from "soheil-ds";
 */

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Pill } from "./Pill";
export type { PillProps } from "./Pill";

export { LiveDot } from "./LiveDot";
export type { LiveDotProps } from "./LiveDot";

export { ToastProvider, useToast } from "./Toast";

export { DottedChart } from "./DottedChart";
export type { DottedChartProps, DottedChartDatum } from "./DottedChart";
