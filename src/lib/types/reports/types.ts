export interface DisputeDetail {
  id?: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  reason?: string;
  resolvedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
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
  httpMethod?: string;
  vulnerableParameter?: string;
  /** One of `CreateReportRequest.environment`'s values, not a display label. */
  environment?: string;
  /** `YYYY-MM-DD` from the form; sent as an ISO instant. */
  discoveredAt?: string;
  /** Absent when the reporter answered "I'm not sure". */
  category?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
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
