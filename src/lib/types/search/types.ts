
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
  slug: string;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  imageUrl: string | null;
  document: Record<string, unknown>;
}

export interface SearchGroup {
  type: SearchType;
  hits: SearchHit[];
  totalHits: number;
}

export interface SearchResponse {
  query: string;
  groups: SearchGroup[];
  page: number | null;
  size: number;
  totalHits: number;
  totalPages: number | null;
}

export interface SearchParams {
  q?: string;
  type?: SearchType;
  page?: number;
  size?: number;
}

export const DROPDOWN_SIZE = 5;

export const RESULTS_PAGE_SIZE = 20;

export const MAX_QUERY_LENGTH = 200;
