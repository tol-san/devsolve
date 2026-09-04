
export const REPORT_ACTIVITY_TYPES = [
  "SUBMITTED",
  "STATE_CHANGED",
  "SEVERITY_CHANGED",
  "REWARD_GRANTED",
  "RETEST_REQUESTED",
  "RETEST_SUBMITTED",
  "RETEST_EXPIRED",
  "DISCLOSURE_CHANGED",
] as const;

export type KnownReportActivityType = (typeof REPORT_ACTIVITY_TYPES)[number];
export type ReportActivityType = KnownReportActivityType | (string & {});

export type ReportActivityState =
  | "NEW"
  | "TRIAGING"
  | "NEEDS_MORE_INFO"
  | "VALID_CONFIRMED"
  | "RETESTING"
  | "RESOLVED"
  | "REJECTED"
  | "DUPLICATE";

export type ReportActivitySeverity =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface ReportActivityActor {
  id: string;
  name: string;
}

export interface ReportActivity {
  id: string;
  activityType: ReportActivityType;
  actor: ReportActivityActor | null;
  fromState: ReportActivityState | null;
  toState: ReportActivityState | null;
  severity: ReportActivitySeverity | null;
  detail: string | null;
  createdAt: string;
}
