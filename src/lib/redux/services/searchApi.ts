import { baseApi } from "./baseApi";
import {
  MAX_QUERY_LENGTH,
  type SearchParams,
  type SearchResponse,
  type SearchType,
} from "@/lib/types/search/types";

export * from "@/lib/types/search/types";

/**
 * Only what the endpoint accepts, and only when it is meaningful.
 *
 * `page` is dropped without a `type` because the grouped mode ignores it, and
 * a blank `q` is sent as a blank rather than omitted — that is how the index
 * is browsed rather than searched, and the two read identically upstream.
 *
 * The query is cut to the API's limit instead of being sent long and refused:
 * a 400 on the 201st character would surface as a broken search box while
 * someone is mid-sentence.
 */
function searchQueryString({ q, type, page, size }: SearchParams): string {
  const params = new URLSearchParams();

  params.set("q", (q ?? "").slice(0, MAX_QUERY_LENGTH));
  if (type) params.set("type", type);
  if (type && typeof page === "number" && page > 0) {
    params.set("page", String(page));
  }
  if (typeof size === "number") params.set("size", String(size));

  return params.toString();
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * One search, in whichever mode the arguments describe.
     *
     * Passing a `type` switches the API from grouped to paged; the response
     * shape is the same either way, so a single endpoint serves the dropdown
     * and the results page and they share a cache entry when the arguments
     * match.
     *
     * Deliberately untagged. Nothing in this app invalidates the index —
     * indexing is a background job that polls every 30 seconds, so a result
     * can be up to ~45s behind a write and no amount of cache invalidation
     * here would change that.
     */
    search: builder.query<SearchResponse, SearchParams>({
      query: (params) => `/search?${searchQueryString(params)}`,
      /* Keyed on the arguments that reach the API, so `{q: "a"}` and
         `{q: "a", page: 0}` do not occupy two entries for one request. */
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${searchQueryString(queryArgs)})`,
      keepUnusedDataFor: 60,
    }),

    /** The `type` values the API accepts, for checking our mirrored list. */
    searchTypes: builder.query<SearchType[], void>({
      query: () => "/search/types",
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useSearchQuery, useSearchTypesQuery } = searchApi;
