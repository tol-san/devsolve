/**
 * What resolving a report pays the researcher.
 *
 * Reputation is the platform's half of accepting a finding: awarded
 * automatically when a report reaches `RESOLVED`, priced from its severity,
 * and not something the organization sets. The bounty is the other half —
 * money, decided by the organization, recorded separately in `rewards[]`.
 * The two are never added together.
 *
 * **This table is for showing someone what a resolution will cost before they
 * confirm it — never for displaying what a report already earned.** Points are
 * awarded once and kept: a severity corrected afterwards does not change what
 * was paid, and a failed retest that reopens and re-resolves a report does not
 * pay twice. So an awarded figure is always read from `reputationPoints` on
 * the report itself, which is the only place that records what actually
 * happened. Recomputing it from severity would quietly disagree with the
 * backend on exactly the reports where the difference matters.
 */

import { toApiSeverity } from "@/lib/reports/severity";

/** `ReputationPolicy.pointsFor` upstream, mirrored for the confirm step. */
const POINTS_BY_SEVERITY = {
  NONE: 0,
  LOW: 5,
  MEDIUM: 15,
  HIGH: 40,
  CRITICAL: 100,
} as const;

export type ReputationSeverity = keyof typeof POINTS_BY_SEVERITY;

/**
 * What a resolution at this severity will award, or null when the severity is
 * not one the policy prices — in which case the screen says nothing rather
 * than promising a number the backend never agreed to.
 */
export function pointsFor(severity: string | null | undefined): number | null {
  /* Shares the triage calls' conversion, so what a screen quotes and what the
     request sends can never disagree about what "Info" means. */
  const normalized = toApiSeverity(severity);

  return normalized ? POINTS_BY_SEVERITY[normalized] : null;
}

/**
 * Whether a report has been paid its reputation.
 *
 * `reputationAwardedAt` is the signal, not the points: `0` is a real award on
 * a `NONE`-severity finding — credited, worth nothing — and reads very
 * differently from a report that has not been resolved, or one resolved
 * before the platform started paying reputation at all. Those were not
 * backfilled, so a missing value means "unknown", never "zero".
 */
export function hasReputationAward(report: {
  reputationPoints?: number | null;
  reputationAwardedAt?: string | null;
}): boolean {
  return Boolean(report.reputationAwardedAt) && report.reputationPoints != null;
}

/** `+40 reputation`, or the informational case, which scores nothing. */
export function reputationLabel(points: number): string {
  return points === 0
    ? "No reputation (informational)"
    : `+${points.toLocaleString()} reputation`;
}
