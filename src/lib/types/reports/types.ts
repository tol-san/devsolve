export interface DisputeDetail {
  id?: string;
  status:
    | "AWAITING_REPORTER"
    | "OPEN"
    | "UNDER_REVIEW"
    | "RESOLVED"
    | "DISMISSED";
  reason?: string;
  resolvedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  resolutionNotes?: string | null;
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
  programId?: string;
  organizationId?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationSlug?: string;
  organizationWebsiteUrl?: string;
  avatarLetter: string;
  type: "Bounty" | "Response";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;
  reportedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  triageSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  agreedSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE" | null;
  settledSeverity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;
  hasSeverityDisagreement?: boolean;
  dispute?: DisputeDetail | null;
  weaknessObj?: WeaknessSummary | null;
  suggestedWeakness?: string | null;
  status: "TRIAGING" | "RESOLVED" | "ACCEPTED" | "SUBMITTED" | "REJECTED" | "RETESTING";
  rawStatus?: string;
  retestHistory?: RetestSummary[];
  reputationPoints?: number | null;
  reputationAwardedAt?: string | null;
  firstRespondedAt?: string | null;
  author?: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  authorReputation?: number | null;
  isDisputed?: boolean;
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
  cvssScore: string | null;
  cvssVector: string | null;
  rewardStatus: string;
  assetType: string;
  environment: string | null;
  policyUrl: string;
  description: string;
  impact: string;
  reproduceSteps: string[];
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
  reporterAvatarUrl?: string | null;
  reporterReputation?: number | null;
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
  rewards: { amount: number; note?: string; awardedAt?: string }[];
  programOffersBounties: boolean | null;
}

export interface SubmitReportPayload {
  weaknessId?: string | null;
  suggestedWeakness?: string | null;
  weaknessMode?: "catalog" | "unsure" | "custom";
  programId: string;
  programName: string;
  assetId?: string;
  targetAsset: string;
  environment?: string;
  discoveredAt?: string;
  category?: string;
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
