import { baseApi } from "./baseApi";
import type {
  DisclosureStatus,
  HacktivityActivity,
  HacktivityApiEntry,
  HacktivityApiPage,
  HacktivityFeed,
  HacktivityQueryParams,
  HacktivityStats,
  Researcher,
  Reward,
  Severity,
} from "@/lib/types/hacktivity/types";
import { SEVERITIES } from "@/lib/types/hacktivity/types";

import {
  DEFAULT_HACKTIVITY_PAGE_SIZE,
  toFeed,
} from "@/lib/hacktivity/transform";

export * from "@/lib/types/hacktivity/types";

export const HACKTIVITY_PAGE_SIZE = DEFAULT_HACKTIVITY_PAGE_SIZE;

function queryStringOf(params: HacktivityQueryParams): string {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  for (const severity of params.severity ?? []) search.append("severity", severity);
  for (const event of params.eventType ?? []) search.append("eventType", event);
  if (params.programId) search.set("programId", params.programId);
  if (params.organizationId) search.set("organizationId", params.organizationId);
  search.set("page", String(Math.max(0, params.page ?? 0)));
  search.set("size", String(params.size ?? HACKTIVITY_PAGE_SIZE));
  if (params.sort) search.set("sort", params.sort);

  return search.toString();
}

export const hacktivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHacktivityFeed: builder.query<HacktivityFeed, HacktivityQueryParams | void>({
      query: (params) => `/hacktivity?${queryStringOf(params ?? {})}`,
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),

    getHacktivityStats: builder.query<HacktivityStats, void>({
      query: () => "/hacktivity/stats",
      providesTags: ["Post"],
    }),

    getUserHacktivity: builder.query<
      HacktivityFeed,
      { userId: string } & HacktivityQueryParams
    >({
      query: ({ userId, ...params }) =>
        `/user-profiles/${userId}/hacktivity?${queryStringOf(params)}`,
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),
  }),
});

export const {
  useGetHacktivityFeedQuery,
  useGetHacktivityStatsQuery,
  useGetUserHacktivityQuery,
} = hacktivityApi;
