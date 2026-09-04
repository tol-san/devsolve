export type TimeRangeOption = "30d" | "90d" | "6m" | "1y" | "all";

export type TrendDirection = "up" | "down" | "flat";

export interface KpiMetric {
  value: number;
  changePercentage: number | null;
  trend: TrendDirection;
}

export interface AcceptedReportsMetric extends KpiMetric {
  acceptanceRate: number;
}

export interface RejectedReportsMetric extends KpiMetric {
  rejectionRate: number;
}

export interface BountiesPaidMetric {
  amount: number;
  currency: string;
  changePercentage: number | null;
  trend: TrendDirection;
}

export interface SlaMetrics {
  meanTimeToTriageHours: number;
  meanTimeToResolveDays: number;
  slaCompliancePercentage: number;
  triageTargetHours: number;
}

export interface KpiSummary {
  totalReports: KpiMetric;
  acceptedReports: AcceptedReportsMetric;
  rejectedReports: RejectedReportsMetric;
  totalBountiesPaid: BountiesPaidMetric;
  reputationPointsAwarded: number;
  activeResearchers: KpiMetric;
  slaMetrics: SlaMetrics;
}

export interface SubmissionTrendPoint {
  period: string;
  label: string;
  submitted: number;
  accepted: number;
  resolved: number;
  rejected: number;
  bountyPaid: number;
}

export interface SeverityBandMetric {
  count: number;
  percentage: number;
  avgBounty: number;
}

export interface SeverityDistribution {
  critical: SeverityBandMetric;
  high: SeverityBandMetric;
  medium: SeverityBandMetric;
  low: SeverityBandMetric;
  none: SeverityBandMetric;
}

export interface TopVulnerabilityCategory {
  cweId: string;
  name: string;
  count: number;
  percentage: number;
  criticalCount: number;
}

export type TargetedAssetType =
  | "URL"
  | "WILDCARD"
  | "IP_RANGE"
  | "MOBILE_APP"
  | "API"
  | "SOURCE_CODE"
  | "HARDWARE"
  | "OTHER";

export interface TopTargetedAsset {
  assetTarget: string;
  assetType: TargetedAssetType;
  totalReports: number;
  criticalCount: number;
  highCount: number;
  totalBounty: number;
}

export interface TopResearcher {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  rank: number;
  validReports: number;
  criticalReports: number;
  totalBountiesEarned: number;
  reputationEarned: number;
}

export interface OrganizationAnalyticsResponse {
  organizationId: string;
  organizationName: string;
  timeRange: TimeRangeOption;
  filterProgramId: string | null;
  generatedAt: string;
  kpiSummary: KpiSummary;
  submissionTrend: SubmissionTrendPoint[];
  severityDistribution: SeverityDistribution;
  topVulnerabilityCategories: TopVulnerabilityCategory[];
  topTargetedAssets: TopTargetedAsset[];
  topResearchers: TopResearcher[];
}

export interface AnalyticsQueryParams {
  timeRange?: TimeRangeOption;
  programId?: string;
  organizationId?: string;
}

export const TARGETED_ASSET_TYPE_LABELS: Record<TargetedAssetType, string> = {
  URL: "Web URL",
  WILDCARD: "Wildcard Domain",
  IP_RANGE: "IP Range",
  MOBILE_APP: "Mobile App",
  API: "API Endpoint",
  SOURCE_CODE: "Source Code",
  HARDWARE: "Hardware",
  OTHER: "Other",
};

export const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeOption; label: string }> = [
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last 1 Year" },
  { value: "all", label: "All Time" },
];
