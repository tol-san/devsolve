/**
 * The public disclosure stream — `GET /api/v1/hacktivity`.
 *
 * A row carries ids, names, a report severity and a timestamp: no bounty
 * amount and no reputation, so everything the feed shows is derived from
 * those fields alone.
 */

/** One row as the API returns it. Every nested object may be absent. */
export interface HacktivityApiEntry {
  id: string;
  user?: { id?: string; username?: string; avatarUrl?: string } | null;
  organization?: { id?: string; name?: string } | null;
  report?: { id?: string; title?: string; severity?: string } | null;
  recognition?: { id?: string; title?: string; description?: string } | null;
  program?: { id?: string; name?: string } | null;
  createdAt?: string;
}

/** `PageHacktivityResponse`, trimmed to the fields the feed reads. */
export interface HacktivityApiPage {
  content?: HacktivityApiEntry[];
  totalElements?: number;
  totalPages?: number;
  /** Zero-based index of the page that came back. */
  number?: number;
}

/** What the entry records: a disclosed finding, or a recognition awarded. */
export type HacktivityLabel = "DISCLOSURE" | "RECOGNITION";

export type HacktivitySeverity =
  | "Critical"
  | "High"
  | "Medium"
  | "Low"
  | "None";

/** One row, normalised for the cards. */
export interface HacktivityActivity {
  id: string;
  userId?: string;
  handle: string;
  avatarUrl?: string;
  label: HacktivityLabel;
  /** Reads into `program`: "disclosed a Critical severity finding in …". */
  action: string;
  /** The report headline, when the caller is allowed to see one. */
  title?: string;
  program: string;
  organization?: string;
  severity: HacktivitySeverity | null;
  /** Only set when it says something the title does not repeat. */
  recognition?: string;
  timeAgo: string;
  /** ISO timestamp, kept for sorting. */
  createdAt?: string;
}

export interface HacktivityStat {
  label: string;
  value: string;
}

export interface HacktivityFeedResponse {
  stats: HacktivityStat[];
  activities: HacktivityActivity[];
  /** Across the whole stream, not just the page that came back. */
  total: number;
  page: number;
  totalPages: number;
}

export interface HacktivityQueryParams {
  page?: number;
  size?: number;
}
