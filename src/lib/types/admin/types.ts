export interface AdminStatMetric {
  id: string;
  title: string;
  value: string | number;
  subtext: string;
  trend?: "up" | "down" | "neutral";
  changeText?: string;
  type: "organizations" | "programs" | "total_reports" | "users" | "community_posts" | "disputes";
}

export interface AdminActionQueueItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  status: "urgent" | "pending" | "normal";
  linkHref: string;
  type: "verification" | "report_confirmation" | "moderation" | "user_review";
}

export interface PlatformActivityPoint {
  month: string;
  reports: number;
  communityPosts: number;
  disputes: number;
}

export interface ReportStatusBreakdown {
  confirmed: number;
  pending: number;
  rejected: number;
  inReview: number;
  total: number;
}

// ─── Real API: GET /api/v1/admin/organizations/pending ────────────────────────

export type PendingOrgIndustry =
  | "TECHNOLOGY"
  | "FINANCE"
  | "HEALTHCARE"
  | "EDUCATION"
  | "RETAIL"
  | "MANUFACTURING"
  | "MEDIA"
  | "GOVERNMENT"
  | "NONPROFIT"
  | string;

export type OrganizationReviewStatus = "PENDING" | "ACTIVE" | "REJECTED";
export type OrganizationVerificationFilter =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface OrganizationReviewSummaryItem {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  industry: PendingOrgIndustry;
  companySize?: string;
  country?: string;
  status: OrganizationReviewStatus;
  ownerId: string;
  ownerFullName?: string;
  ownerEmail?: string;
  submissionVersion: number;
  createdAt: string;
}

export type PendingOrganizationItem = OrganizationReviewSummaryItem & {
  status: "PENDING";
};

export interface PageableSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  sort: PageableSort;
  unpaged: boolean;
}

export interface PaginatedResponse<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: PageableInfo;
  sort: PageableSort;
  empty: boolean;
}

export type PendingOrganizationsResponse = PaginatedResponse<PendingOrganizationItem>;
export type OrganizationsResponse = PaginatedResponse<OrganizationReviewSummaryItem>;

export interface OrganizationResponse {
  id: string;
  ownerId?: string;
  ownerFullName?: string;
  ownerEmail?: string;
  ownerJobTitle?: string;
  joiningReason?: string;
  emailVerified?: boolean;
  submissionVersion?: number;
  reviewedBy?: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  name: string;
  slug?: string;
  domain?: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  status: OrganizationReviewStatus;
  verifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationReviewHistoryItem {
  id: string;
  organizationId?: string;
  submissionVersion?: number;
  decision?: "APPROVED" | "REJECTED" | string;
  action?: string;
  reviewerId?: string;
  reviewerName?: string;
  reason?: string;
  notes?: string;
  reviewedAt?: string;
  createdAt?: string;
}

// ──────────────────────────────────────────────────────────────────────────────

export interface CompanyVerificationItem {
  id: string;
  orgCode?: string;
  companyName: string;
  email: string;
  domain: string;
  taxId?: string;
  businessType: string;
  registrationDate: string;
  submittedAt?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentsCount?: number;
  notes?: string;
  contactName?: string;
  jobTitle?: string;
  phone?: string;
  website?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  joiningReason?: string;
  emailVerified?: boolean;
  submissionVersion?: number;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  verifiedAt?: string | null;
  logoUrl?: string;
  riskIndicators?: {
    domainMatchesEmail: boolean;
    noFailedDocs: boolean;
    descriptionProvided: boolean;
  };
}

export interface ReportConfirmationItem {
  id: string;
  reportCode?: string;
  title: string;
  researcherName: string;
  companyName: string;
  programName?: string;
  avatarColor?: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "ESCALATED";
  submittedAt: string;
  acceptedAt?: string;
  rewardEstimate: string;
  rewardAmount?: string;
  category: string;
  cwe?: string;
  cvssScore?: string;
  cvssVector?: string;
  targetAsset?: string;
  description?: string;
  impact?: string;
  reproduceSteps?: string[];
  pocPayload?: string;
  attachments?: { name: string; size?: string; type?: string; previewUrl?: string }[];
  hackerClaimedSeverity?: {
    tier: "Critical" | "High" | "Medium" | "Low";
    cvss: string;
    typicalReward: string;
  };
  companyConfirmedSeverity?: {
    tier: "Critical" | "High" | "Medium" | "Low";
    cvss: string;
    typicalReward: string;
  };
  severitiesAgree?: boolean;
  companyReasoning?: string;
  discussionThread?: {
    id: string;
    author: string;
    role: "HACKER" | "COMPANY" | "ADMIN";
    avatar?: string;
    text: string;
    timestamp: string;
  }[];
  fairnessSignals?: {
    companyDowngradeRate: string;
    companyDowngradeText: string;
    researcherAcceptanceRate: string;
    researcherReputationText: string;
  };
  triageNotes?: string;
  auditLog?: {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface AdminUserSummaryItem {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  country?: string;
  status: "ACTIVE" | "SUSPENDED" | "REMOVED" | string;
  reputation?: number;
  totalReports?: number;
  validReports?: number;
  criticalReports?: number;
  recognitionCount?: number;
  lastLoginAt?: string;
  createdAt: string;
  roles?: string[];
  role?: string;
  realm_access?: {
    roles?: string[];
  };
  realmAccess?: {
    roles?: string[];
  };
}

export type PageAdminUserSummaryResponse = PaginatedResponse<AdminUserSummaryItem>;

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "COMPANY" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "REMOVED";
  joinedDate: string;
  reportsSubmitted?: number;
  validReports?: number;
  criticalReports?: number;
  reputation?: number;
  country?: string;
  programsManaged?: number;
  avatarUrl?: string;
}

export interface ModerationItem {
  id: string;
  contentType: "DISCUSSION" | "SHOWCASE" | "COMMENT" | "PROFILE";
  title: string;
  authorName: string;
  reason: "Spam" | "Harassment" | "Inappropriate Content" | "Policy Violation";
  reportedAt: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  details: string;
}

export interface ContentReportItem {
  id: string;
  type: "SOLUTION" | "PROBLEM" | "COMMENT" | "SHOWCASE" | "PROGRAM";
  title: string;
  timestamp: string;
  reportCount: number;
  reason: "Spam" | "Harmful" | "Offensive" | "Off-topic";
  author: string;
  authorId?: string;
  pastViolationsCount?: number;
  status: "PENDING" | "DISMISSED" | "WARNED" | "REMOVED";
  snippet?: string;
  authorAvatar?: string;
  contentUrl?: string;
}

export interface ReportReasonsBreakdownData {
  spam: number;
  harmful: number;
  offensive: number;
  offTopic: number;
  total: number;
}

export interface AdminActivityFeedItem {
  id: string;
  title: string;
  actor: string;
  timestamp: string;
  type: "verification" | "bounty" | "user_action" | "system";
  badgeText: string;
}

export interface AdminDashboardOverviewResponse {
  stats: AdminStatMetric[];
  activityChart: PlatformActivityPoint[];
  reportStatusBreakdown: ReportStatusBreakdown;
  actionQueue: {
    totalCount: number;
    items: AdminActionQueueItem[];
  };
  recentActivity: AdminActivityFeedItem[];
}

export interface AdminOverviewResponse {
  generatedAt?: string;
  users: {
    total: number;
    active: number;
    suspended: number;
    removed: number;
  };
  organizations: {
    total: number;
    active: number;
    pendingReview: number;
    rejected: number;
  };
  programs: {
    total: number;
    draft: number;
    active: number;
    paused: number;
    closed: number;
    pendingReview: number;
  };
  reports: {
    total: number;
    open: number;
    newReports: number;
    triaging: number;
    needsMoreInfo: number;
    validConfirmed: number;
    resolved: number;
    rejected: number;
    duplicate: number;
  };
  moderation: {
    totalPending: number;
    organizations: number;
    programs: number;
    problems: number;
    showcases: number;
    solutions: number;
    contentFlags: number;
  };
}

// ─── Real API: Moderation Actions & Admin Users ─────────────────────────────

export type ModerationActionTargetType =
  | "PROGRAM"
  | "PROBLEM"
  | "SOLUTION"
  | "COMMENT"
  | "USER"
  | "REPORT"
  | "SHOWCASE";

export type ModerationActionType = "WARN" | "SUSPEND" | "REMOVE" | "BAN" | "REINSTATE";

export interface CreateModerationActionRequest {
  targetType?: ModerationActionTargetType;
  targetId?: string;
  action: ModerationActionType;
  reason: string;
  expiresAt?: string;
}

export interface ModerationActionResponse {
  id: string;
  adminId: string;
  adminName: string;
  targetType: ModerationActionTargetType;
  targetId: string;
  action: ModerationActionType;
  reason: string;
  expiresAt?: string | null;
  createdAt: string;
}

export type PageModerationActionResponse = PaginatedResponse<ModerationActionResponse>;

export interface GetModerationHistoryParams {
  targetType?: ModerationActionTargetType;
  targetId?: string;
  action?: ModerationActionType;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetAdminUsersParams {
  query?: string;
  status?: "ACTIVE" | "SUSPENDED" | "REMOVED" | string;
  pageNumber?: number;
  pageSize?: number;
}
export * from "./programAdminTypes";
export * from "./problemAdminTypes";
export * from "./solutionAdminTypes";
