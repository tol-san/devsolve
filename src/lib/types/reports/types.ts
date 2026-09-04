/**
 * A disagreement about a report's severity.
 *
 * The reporter is asked first now. A triage severity that differs from what
 * was reported opens the dispute as `AWAITING_REPORTER`; accepting settles it
 * at the triage rating, refusing escalates it to an administrator, and silence
 * settles it the same way accepting would after the deadline.
 *
 * While one is unanswered the report's `severity` is null and the report is
 * blocked — it cannot be resolved, rewarded or retested.
 */
export interface DisputeDetail {
  id?: string;
  /**
   * `AWAITING_REPORTER` is the reporter's step and the only one either party
   * can act on. `OPEN`/`UNDER_REVIEW` mean an administrator is deciding, and
   * `RESOLVED`/`DISMISSED` mean it is settled.
   */
  status:
    | "AWAITING_REPORTER"
    | "OPEN"
    | "UNDER_REVIEW"
    | "RESOLVED"
    | "DISMISSED";
  /** The reporter's case for refusing. Written by them, not the platform. */
  reason?: string;
  resolvedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  /** How it was settled, including the case where the deadline passed. */
  resolutionNotes?: string | null;
  /**
   * The deadline to answer. Present only while `AWAITING_REPORTER` — null in
   * every other status, where no deadline should be rendered at all.
   */
  respondBy?: string | null;
  createdAt?: string;
  resolvedAt?: string;
}

export interface WeaknessSummary {
  id?: string;
  cweId?: string;
  name?: string;
}

export interface ReportItem {
  id: string;
  reportId: string;
  title: string;
  program: string;
  /** The program filed against, and the company behind it.
 
      Carried so a report can be grouped by who received it — the display name
      alone cannot do that, since two companies may run programs by the same
      name. Both are absent on a record that never came from the API, and
      `organizationId` also when the program itself could not be read. */
  programId?: string;
  organizationId?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationSlug?: string;
  organizationWebsiteUrl?: string;
  avatarLetter: string;
  type: "Bounty" | "Response";
  /** The settled severity: `severity ?? triageSeverity ?? reportedSeverity`. */
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  /** What the reporter claimed. Always set on report. */
  reportedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  /** What the organization assessed. Null until triaged. */
  triageSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  /** The agreed severity. Null while the two disagree, and null on untriaged reports. */
  agreedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  /** Settled severity shorthand. */
  settledSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  /** True when severity is null and triageSeverity is set (disagreement surfaced). */
  hasSeverityDisagreement?: boolean;
  /** When non-null, severity is contested under dispute. */
  dispute?: DisputeDetail | null;
  /** Catalogue weakness or null. */
  weaknessObj?: WeaknessSummary | null;
  /** Custom reporter-suggested weakness or null. */
  suggestedWeakness?: string | null;
  status: "TRIAGING" | "RESOLVED" | "ACCEPTED" | "SUBMITTED" | "REJECTED" | "RETESTING";
  rawStatus?: string;
  retestHistory?: RetestSummary[];
  /**
   * Reputation the platform awarded for this finding, priced from its
   * severity when the report was resolved.
   *
   * Null until resolution, and null on reports resolved before reputation
   * became automatic — render nothing for those rather than a zero. `0` is a
   * real award on a NONE-severity finding and means "credited, scores
   * nothing". Awarded once: never recompute it from `severity`.
   */
  reputationPoints?: number | null;
  reputationAwardedAt?: string | null;
  /**
   * The first time anyone but the reporter acted on this report, stamped once
   * and never moved. Null means nobody has responded *or* that the report
   * predates the field — the two cannot be told apart here, so no copy built
   * on it may accuse a program of ignoring a report.
   */
  firstRespondedAt?: string | null;
  bountyOrRep: string;
  isBountyHighlight?: boolean;
  isBountyDim?: boolean;
  lastActivityDate: string;
  lastActivityBadge: string;
  submittedAt?: string;
}

export interface ReportsFilterParams {
  search?: string;
  status?: string;
  severity?: string;
  program?: string;
  programId?: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  isAdmin?: boolean;
  timestamp: string;
  text: string;
}

export interface ActivityUpdate {
  id: string;
  actor: string;
  actionText: string;
  statusBadge?: string;
  timestamp: string;
}

export interface RetestItem {
  id: string;
  reportIdTitle: string;
  securityCategory: string;
  version: string;
  status: "PASSED" | "FAILED";
  requestDate: string;
  bountyBonus?: string;
}

export type { RetestSummary } from "@/lib/redux/services/reportsApi";
import type { RetestSummary } from "@/lib/redux/services/reportsApi";

export interface ReportDetail extends ReportItem {
  submittedAgo: string;
  claimedSeverity: string;
  confirmedSeverity: string;
  /** As the reporter scored it, or `null` when they gave no score. */
  cvssScore: string | null;
  cvssVector: string | null;
  rewardStatus: string;
  assetType: string;
  /** Display label for the environment, or `null` when unreported. */
  environment: string | null;
  policyUrl: string;
  description: string;
  impact: string;
  reproduceSteps: string[];
  /** The remaining `ReportResponse` fields, each absent rather than invented. */
  proofOfConcept: string | null;
  remediation: string | null;
  targetEndpoint: string | null;
  discoveredAt: string | null;
  referenceLinks: string[];
  weakness: string | null;
  weaknessObj?: WeaknessSummary | null;
  suggestedWeakness?: string | null;
  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterUsername?: string;
  attachments: {
    id?: string;
    name: string;
    size?: string;
    type: string;
    url?: string;
  }[];
  comments: CommentItem[];
  updates: ActivityUpdate[];
  retestHistory?: RetestSummary[];
  /**
   * The bounties the organization paid, as recorded. Separate from
   * `reputationPoints`, which the platform pays: the two are different
   * currencies from different payers and are never summed.
   */
  rewards: { amount: number; note?: string; awardedAt?: string }[];
  /**
   * Whether the program offers money at all. Null when the program could not
   * be read — the screen then shows reputation alone rather than an empty
   * money slot it cannot justify.
   */
  programOffersBounties: boolean | null;
}

export interface SubmitReportPayload {
  /** Catalogue id for `category`. Both are absent on an unclassified report. */
  weaknessId?: string | null;
  /** Reporter suggested weakness name (exclusive with weaknessId). */
  suggestedWeakness?: string | null;
  weaknessMode?: "catalog" | "unsure" | "custom";
  programId: string;
  programName: string;
  assetId?: string;
  targetAsset: string;
  /** One of `CreateReportRequest.environment`'s values, not a display label. */
  environment?: string;
  /** `YYYY-MM-DD` from the form; sent as an ISO instant. */
  discoveredAt?: string;
  /** Absent when the reporter answered "I'm not sure". */
  category?: string;
  /* What the reporter claims. `reportedSeverity` upstream has no NONE, so
     there is no tier below LOW to send. */
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cweIdentifier?: string;
  cvssScore?: string;
  cvssVector?: string;
  title: string;
  summaryPoC: string;
  reproduceStepsList?: string[];
  impact?: string;
  remediation?: string;
  pocPayload?: string;
  expectedResult?: string;
  actualResult?: string;
  attachments?: { name: string; size: string; type: string }[];
  externalLinks?: string[];
  agreeTerms?: boolean;
}

export interface SubmitReportResponse {
  success: boolean;
  reportId: string;
  id: string;
  message: string;
  status: "TRIAGING";
  createdAt: string;
}
