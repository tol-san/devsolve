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
  avatarLetter: string;
  type: "Bounty" | "Response";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "TRIAGING" | "RESOLVED" | "ACCEPTED" | "SUBMITTED" | "REJECTED";
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
  retestHistory: RetestItem[];
}

export interface SubmitReportPayload {
  /** Catalogue id for `category`. Both are absent on an unclassified report. */
  weaknessId?: string;
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
