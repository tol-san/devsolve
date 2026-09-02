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
  /** 1-based, continues across pages (e.g. page=1, size=20 starts at 21) */
  rank: number;
  /** Researcher UUID — link to their profile */
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  country: string | null;
  /** Times this program or organization has thanked them */
  recognitions: number;
  /** Missing key = zero; key order is not meaningful */
  bySeverity: Partial<Record<Severity, number>>;
  /**
   * ISO LocalDateTime e.g. "2026-08-30T14:02:11.482"
   * Server local time is UTC+7 (no timezone suffix in raw string).
   */
  lastThankedAt: string | null;
  /** Programs where this researcher earned recognitions, sorted by name */
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

/**
 * Related recognition entry for a researcher's public profile recognitions list.
 * GET /api/v1/user-profiles/{userId}/recognitions?page=0&size=10&sort=awardedAt,desc
 */
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
  /** Associated program details */
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
