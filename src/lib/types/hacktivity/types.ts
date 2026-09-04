
export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EVENT_TYPES = [
  "RECOGNITION_AWARDED",
  "BOUNTY_AWARDED",
  "REPORT_RESOLVED",
  "REPORT_DISCLOSED",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type DisclosureStatus =
  | "NOT_DISCLOSED"
  | "PENDING_DISCLOSURE"
  | "DISCLOSED";

export const SORTS = [
  "createdAt,DESC",
  "createdAt,ASC",
  "severity,DESC",
  "severity,ASC",
] as const;
export type Sort = (typeof SORTS)[number];

export interface HacktivityApiEntry {
  id: string;
  eventType?: string;
  createdAt?: string;
  user?: {
    id?: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string | null;
    reputation?: number | null;
  } | null;
  organization?: {
    id?: string;
    name?: string;
    slug?: string;
    logoUrl?: string | null;
  } | null;
  program?: { id?: string; name?: string; handle?: string } | null;
  report?: {
    id?: string;
    title?: string | null;
    severity?: Severity | null;
    disclosureStatus?: DisclosureStatus | null;
    weakness?: { cweId?: string; name?: string } | null;
  } | null;
  recognition?: { id?: string; title?: string; description?: string } | null;
  reward?: {
    amount?: number | null;
    currency?: string | null;
    points?: number | null;
  } | null;
}

export interface HacktivityApiPage {
  content?: HacktivityApiEntry[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export interface HacktivityStats {
  disclosures: number;
  researchers: number;
  programsActive: number;
  totalPaid: number;
  currency: string;
}

export type Reward =
  | { kind: "cash"; amount: number; currency: string; points: number | null }
  | { kind: "points"; points: number }
  | { kind: "none" };

export interface Researcher {
  username?: string;
  name: string;
  avatarUrl?: string;
  reputation?: number;
}

export interface HacktivityActivity {
  id: string;
  eventType?: EventType | string;
  createdAt?: string;
  researcher: Researcher;
  program?: { id?: string; name: string; handle?: string };
  organization?: { id?: string; name: string; slug?: string; logoUrl?: string };
  severity: Severity | null;
  weakness?: { cweId?: string; name?: string };
  title?: string | null;
  disclosureStatus: DisclosureStatus;
  isDisclosed: boolean;
  reportId?: string;
  recognition?: {
    id?: string;
    title?: string;
    description?: string;
  } | null;
  reward: Reward;
}

export interface HacktivityFeed {
  activities: HacktivityActivity[];
  total: number;
  page: number;
  totalPages: number;
  size: number;
}

export interface HacktivityQueryParams {
  q?: string;
  severity?: Severity[];
  eventType?: EventType[];
  programId?: string;
  organizationId?: string;
  page?: number;
  size?: number;
  sort?: Sort;
}
