export type ReportType = "Bounty" | "Response";
export type ReportStatus = "Open" | "Closed";
export type ReportSeverity = "Critical" | "High" | "Medium" | "Low";
export type ReportWorkflowState = "PENDING" | "UNDER_REVIEW" | "RETESTING" | "APPROVED" | "CLOSED";

export type ManagedReport = {
  id: string | number;
  reportId?: string;
  programId?: string;
  organizationId?: string;
  title: string;
  programLogo?: string;
  author: string;
  authorEmail: string;
  authorInitials: string;
  authorId?: string;
  type: ReportType;
  status: ReportStatus;
  severity: ReportSeverity;
  queueState?: ReportWorkflowState;
  submittedAt: string;
  submittedAtIso?: string;
  summary: string;
  assets: string[];
};

export type ReportManagementDetail = {
  id: string | number;
  reportId: string;
  programId?: string;
  organizationId?: string;
  title: string;
  programLogo?: string;
  submitter: string;
  submitterInitials: string;
  submitterEmail?: string;
  submitterId?: string;
  submitterAvatarUrl?: string;
  type: ReportType;
  status: ReportStatus;
  isReviewed?: boolean;
  rawStatus?:
    | "SUBMITTED"
    | "TRIAGING"
    | "NEEDS_MORE_INFO"
    | "VALID_CONFIRMED"
    | "RETESTING"
    | "RESOLVED"
    | "REJECTED"
    | string;
  retestHistory?: import("@/lib/redux/services/reportsApi").RetestSummary[];
  severity: ReportSeverity;
  cvssScore: string;
  submittedDate: string;
  bountyRange: string;
  summary: string;
  assets: string[];
  affectedUrl: string;
  httpMethod: string;
  parameter: string;
  environment: string;
  environmentNote: string;
  vulnerabilityType: string;
  cweIdentifier: string;
  vectorString: string;
  assessmentSummary: string;
  reproductionSteps: string[];
  impact: string;
  rootCause: string;
  remediation: string;
  analystTip: string;
  proofRequestLanguage: string;
  proofRequest: string;
  expectedResult: string;
  actualResult: string;
  attachments: Array<{
    name: string;
    kind: "image" | "file";
    url?: string;
    size?: string;
    content?: string;
  }>;
  externalDocumentation: string;
  internalAssetLink: string;
  relatedReport: string;
};

export type MetricCard = {
  title: string;
  value: number;
};
