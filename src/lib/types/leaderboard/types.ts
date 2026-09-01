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

/** How reputation points are earned. Surfaced in the UI so the ranking is
 *  legible, and deliberately payout-independent. */
export const REPUTATION_POINTS = {
  critical: 45,
  high: 20,
  medium: 8,
  low: 3,
  recognition: 25,
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
