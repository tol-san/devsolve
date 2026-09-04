/**
 * A report's timeline — an append-only record of what happened to it.
 *
 * This is what both sides argue from when a severity is disputed, so it is
 * read as evidence rather than as decoration: nothing is dropped, nothing is
 * invented, and an entry whose type this build does not recognise is still
 * shown rather than filtered away.
 */

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

/**
 * A known activity type — but the field is typed as a plain string too,
 * because the backend will add more and an unrecognised one must render as a
 * generic entry rather than crash or vanish.
 */
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
  /**
   * Who acted, or **null when the platform did** — which is a fact, not a
   * missing value. Today only `RETEST_EXPIRED` arrives this way. It renders as
   * the system, never as an unknown user.
   */
  actor: ReportActivityActor | null;
  /**
   * Both null on entries that did not move the report — a reward, a disclosure
   * change. Whether to draw a transition is decided from these two being
   * present, never from `activityType`, so a type added later still renders
   * correctly without this code knowing about it.
   */
  fromState: ReportActivityState | null;
  toState: ReportActivityState | null;
  /** Null when no severity was settled by this entry. */
  severity: ReportActivitySeverity | null;
  /**
   * Written by the platform, never typed by a person, so it is plain text.
   * It is not a substitute for the discussion — people's own words live on
   * the report's comments.
   */
  detail: string | null;
  /** ISO LocalDateTime, no zone. */
  createdAt: string;
}
