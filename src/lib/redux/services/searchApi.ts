import { baseApi } from "./baseApi";
import {
  MAX_QUERY_LENGTH,
  type SearchParams,
  type SearchResponse,
  type SearchType,
} from "@/lib/types/search/types";

export * from "@/lib/types/search/types";

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
    search: builder.query<SearchResponse, SearchParams>({
      query: (params) => `/search?${searchQueryString(params)}`,
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${searchQueryString(queryArgs)})`,
      keepUnusedDataFor: 60,
    }),

    searchTypes: builder.query<SearchType[], void>({
      query: () => "/search/types",
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useSearchQuery, useSearchTypesQuery } = searchApi;
