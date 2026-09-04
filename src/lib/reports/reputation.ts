
import { toApiSeverity } from "@/lib/reports/severity";

const POINTS_BY_SEVERITY = {
  NONE: 0,
  LOW: 5,
  MEDIUM: 15,
  HIGH: 40,
  CRITICAL: 100,
} as const;

export type ReputationSeverity = keyof typeof POINTS_BY_SEVERITY;

export function pointsFor(severity: string | null | undefined): number | null {
  const normalized = toApiSeverity(severity);

  return normalized ? POINTS_BY_SEVERITY[normalized] : null;
}

export function hasReputationAward(report: {
  reputationPoints?: number | null;
  reputationAwardedAt?: string | null;
}): boolean {
  return Boolean(report.reputationAwardedAt) && report.reputationPoints != null;
}

export function reputationLabel(points: number): string {
  return points === 0
    ? "No reputation (informational)"
    : `+${points.toLocaleString()} reputation`;
}
