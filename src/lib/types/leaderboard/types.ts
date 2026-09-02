/* ────────────────────────────────────────────────────────────────────
   Leaderboard domain types.

   Privacy contract: nothing in here may carry a company name, a report
   title, or any vulnerability detail. The leaderboard only ever exposes
   aggregate counts (3 Critical, 12 High) — never which program a finding
   belongs to, and never what the bug was.
   ──────────────────────────────────────────────────────────────────── */

/** Ranking window. `all` is cumulative; `month` / `week` are points earned
 *  inside that window and need windowed reputation on the backend. */
export type LeaderboardPeriod = "all" | "month" | "week";

export type SeverityLabel = "Critical" | "High" | "Medium" | "Low";

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface LeaderboardEntry {
  id: string;
  /** Global rank for the selected period — 1 is best. */
  rank: number;
  /** Rank in the previous comparable window, for the movement indicator. */
  previousRank: number | null;
  /** Profile slug — links to /dashboard/profile/[username]. */
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitials: string;
  countryCode: string;
  countryName: string;
  /** The sort key. Points, never payout amounts. */
  reputation: number;
  totalReports: number | null;
  validReports: number | null;
  criticalReports: number;
  /**
   * On `all`, the number of recognitions this researcher has received.
   * On a windowed board it is instead the number of findings they resolved
   * inside that window — the ones that earned the `reputation` beside it.
   * The column header changes with the period; see `RANKED_COUNT_LABEL`.
   */
  recognitionCount: number;
  severity: SeverityBreakdown;
  /** Highest severity this researcher has landed in the window. */
  topSeverity: SeverityLabel;
  isCurrentUser?: boolean;
}

export type LeaderboardHighlightKind =
  | "reports"
  | "valid"
  | "critical"
  | "recognition"
  | "climb";

/** The four "most X" cards above the table. */
export interface LeaderboardHighlight {
  kind: LeaderboardHighlightKind;
  label: string;
  value: number;
  /** Formatted suffix, e.g. "reports" / "places". */
  unit: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitials: string;
}

export interface LeaderboardCountryOption {
  code: string;
  name: string;
  count: number;
}

export interface LeaderboardStats {
  activeResearchers: number;
  validReports: number;
  programsLive: number;
}

/**
 * What each severity pays, as the platform prices it.
 *
 * Mirrors `ReputationPolicy` upstream: reputation is awarded automatically
 * when a report is resolved, so this is the whole ladder. Recognition is not
 * on it — being recognised is public credit and awards no reputation, which
 * is why the entry that used to sit here was removed rather than zeroed.
 *
 * Surfaced so the ranking is legible, and deliberately payout-independent: a
 * Critical at a startup and a Critical at a bank move the board identically.
 * For display only — what a given report actually earned is read from its own
 * `reputationPoints`, never recomputed from severity counts.
 */
export const REPUTATION_POINTS = {
  critical: 100,
  high: 40,
  medium: 15,
  low: 5,
} as const;

export const SEVERITY_ORDER: SeverityLabel[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

export const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  all: "All time",
  month: "This month",
  week: "This week",
};

/**
 * What `recognitionCount` counts, which depends on the window.
 *
 * The field name is the API's and did not change, but its meaning did: on a
 * windowed board it is the findings resolved in that window, not recognitions.
 * One static header would be wrong on two of the three periods.
 */
export const RANKED_COUNT_LABEL: Record<
  LeaderboardPeriod,
  { column: string; singular: string; plural: string }
> = {
  all: { column: "Recognitions", singular: "recognition", plural: "recognitions" },
  month: { column: "Findings", singular: "finding", plural: "findings" },
  week: { column: "Findings", singular: "finding", plural: "findings" },
};
