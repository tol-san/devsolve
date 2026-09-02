/**
 * The public disclosure stream — `GET /api/v1/hacktivity`.
 *
 * Two shapes live here: what the API sends, and what a card reads. The second
 * exists because a card has to answer questions the payload only implies —
 * whether a title may be printed, whether a reward is money or points, whether
 * a noun is safe to link — and deciding that once, here, keeps it out of the
 * markup.
 */

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"] as const;
export type Severity = (typeof SEVERITIES)[number];

/**
 * All four event types now emitted by the backend:
 * - `RECOGNITION_AWARDED`: Researcher recognised by organization
 * - `BOUNTY_AWARDED`: Cash bounty awarded to researcher
 * - `REPORT_RESOLVED`: Organization resolved a vulnerability report
 * - `REPORT_DISCLOSED`: Researcher disclosed a vulnerability finding
 */
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

/** `createdAt` and `severity` are the only sortable fields; anything else 400s. */
export const SORTS = [
  "createdAt,DESC",
  "createdAt,ASC",
  "severity,DESC",
  "severity,ASC",
] as const;
export type Sort = (typeof SORTS)[number];

// ─── What the API sends ───────────────────────────────────────────────────────

export interface HacktivityApiEntry {
  id: string;
  eventType?: string;
  createdAt?: string;
  user?: {
    id?: string;
    /** URL-safe handle, and what `/profile/{username}` resolves. */
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
    /** Null while a severity dispute is open. */
    severity?: Severity | null;
    disclosureStatus?: DisclosureStatus | null;
    /** Null while unclassified. */
    weakness?: { cweId?: string; name?: string } | null;
  } | null;
  /** Nullable: null on REPORT_RESOLVED and REPORT_DISCLOSED rows */
  recognition?: { id?: string; title?: string; description?: string } | null;
  /** Null when the report was never paid. */
  reward?: {
    amount?: number | null;
    currency?: string | null;
    points?: number | null;
  } | null;
}

/** `PageHacktivityResponse`, trimmed to what the feed reads. */
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

// ─── What a card reads ────────────────────────────────────────────────────────

/**
 * Money and points are separate outcomes, not one number with a zero in it: a
 * points-only award is a real result and printing it as `$0` would read as a
 * refusal to pay.
 */
export type Reward =
  | { kind: "cash"; amount: number; currency: string; points: number | null }
  | { kind: "points"; points: number }
  | { kind: "none" };

export interface Researcher {
  /** Absent only if the upstream sends a row with no user. */
  username?: string;
  name: string;
  avatarUrl?: string;
  reputation?: number;
}

export interface HacktivityActivity {
  id: string;
  eventType?: EventType | string;
  /** ISO-8601, UTC. Formatted at render, where the locale is known. */
  createdAt?: string;
  researcher: Researcher;
  /** The program the work was done against; the card links it when it can. */
  program?: { id?: string; name: string; handle?: string };
  organization?: { id?: string; name: string; slug?: string; logoUrl?: string };
  severity: Severity | null;
  weakness?: { cweId?: string; name?: string };
  /**
   * Only set on a disclosed report. A row is on the feed because it was
   * recognised or paid, which is not the same as its report being public, so
   * an undisclosed title is null.
   */
  title?: string | null;
  disclosureStatus: DisclosureStatus;
  isDisclosed: boolean;
  /** The report behind the row, present whether or not it may be named. */
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
  /** Across the whole stream, not the page that came back. */
  total: number;
  page: number;
  totalPages: number;
  size: number;
}

/** Every parameter is optional; the endpoint defaults to newest first. */
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
