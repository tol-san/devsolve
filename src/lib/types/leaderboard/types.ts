
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
  rank: number;
  previousRank: number | null;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitials: string;
  country: string | null;
  reputation: number;
  totalReports: number | null;
  validReports: number | null;
  criticalReports: number;
  recognitionCount: number;
  severity: SeverityBreakdown;
  topSeverity: SeverityLabel;
  isCurrentUser?: boolean;
}

export type LeaderboardHighlightKind =
  | "reports"
  | "valid"
  | "critical"
  | "recognition"
  | "climb";

export interface LeaderboardHighlight {
  kind: LeaderboardHighlightKind;
  label: string;
  value: number;
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

export const RANKED_COUNT_LABEL: Record<
  LeaderboardPeriod,
  { column: string; singular: string; plural: string }
> = {
  all: { column: "Recognitions", singular: "recognition", plural: "recognitions" },
  month: { column: "Findings", singular: "finding", plural: "findings" },
  week: { column: "Findings", singular: "finding", plural: "findings" },
};
