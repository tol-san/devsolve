export type Severity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ProgramSummary {
  id: string;
  name: string;
  handle: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLogoUrl?: string | null;
}

export interface ThanksEntry {
  rank: number;
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  country: string | null;
  recognitions: number;
  bySeverity: Partial<Record<Severity, number>>;
  lastThankedAt: string | null;
  programs?: ProgramSummary[] | null;
}

export interface PageThanksResponse {
  content: ThanksEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ThanksQueryParams {
  page?: number;
  size?: number;
}

export interface UserRecognitionItem {
  id: string;
  userId: string;
  programId: string;
  programName?: string | null;
  reportId: string;
  title: string;
  description?: string | null;
  awardedBy: string;
  awardedAt: string;
  severity?: Severity | null;
  createdAt?: string;
  updatedAt?: string;
  program?: ProgramSummary | null;
}

export interface PageUserRecognitionsResponse {
  content: UserRecognitionItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserRecognitionsQueryParams {
  userId: string;
  page?: number;
  size?: number;
  sort?: string;
}
