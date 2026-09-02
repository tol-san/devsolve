/**
 * The Meilisearch-backed search API.
 *
 * One response shape serves two modes, and the difference is which fields are
 * null rather than which shape comes back:
 *
 * - **Grouped** (no `type`) — a short list per index, for a search-as-you-type
 *   dropdown. `page` and `totalPages` are null, and **an index that matched
 *   nothing is left out of `groups` entirely** — so the sections present are
 *   the sections with hits, never a fixed five.
 * - **Paged** (with a `type`) — one group, possibly with `hits: []`, and
 *   `page`/`totalPages` describing it.
 */

export const SEARCH_TYPES = [
  "programs",
  "showcases",
  "problems",
  "organizations",
  "users",
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export function isSearchType(value: unknown): value is SearchType {
  return (
    typeof value === "string" && SEARCH_TYPES.includes(value as SearchType)
  );
}

export interface SearchHit {
  type: SearchType;
  id: string;
  /**
   * What our own URLs are built from. For `showcases` and `problems` this is
   * the id — they have no name of their own — and for the rest it is a real
   * handle. See `hrefForHit`, which is the only place that mapping lives.
   */
  slug: string;
  /** Plain text. */
  title: string;
  /** Plain text, and frequently null. */
  subtitle: string | null;
  /**
   * The matching stretch of body text, ~40 words, with each matched word
   * wrapped in `<mark>`. **The only field carrying markup**, and null wherever
   * the indexed body is empty — most organizations and users.
   */
  snippet: string | null;
  imageUrl: string | null;
  /** The whole indexed document. Fields vary by type; see the per-type reads. */
  document: Record<string, unknown>;
}

export interface SearchGroup {
  type: SearchType;
  hits: SearchHit[];
  /**
   * What this index holds for the query in total — *not* `hits.length`. This
   * is the number behind "see all 43".
   */
  totalHits: number;
}

export interface SearchResponse {
  query: string;
  groups: SearchGroup[];
  /** Zero-based. Null in grouped mode. */
  page: number | null;
  size: number;
  /** Summed across every group. */
  totalHits: number;
  /** Null in grouped mode. */
  totalPages: number | null;
}

/** Everything the endpoint accepts. There is no filtering or sorting. */
export interface SearchParams {
  /** Max 200 characters. Blank matches everything, which is how you browse. */
  q?: string;
  /** Omit for grouped mode. */
  type?: SearchType;
  /** Zero-based, and only meaningful alongside a `type`. */
  page?: number;
  /** Grouped: default 5, max 20. Typed: default 20, max 100. Over is a 400. */
  size?: number;
}

/** What the dropdown asks for per index. The grouped maximum is 20. */
export const DROPDOWN_SIZE = 5;

/** What the results page asks for. The typed maximum is 100. */
export const RESULTS_PAGE_SIZE = 20;

/** The API refuses anything longer with a 400. */
export const MAX_QUERY_LENGTH = 200;
