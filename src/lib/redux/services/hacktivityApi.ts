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

/** The upstream caps a page at 100 and defaults to 10. */
export const HACKTIVITY_PAGE_SIZE = DEFAULT_HACKTIVITY_PAGE_SIZE;

/** Repeatable keys are appended, which is how the upstream reads them. */
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
    /**
     * The public stream. Every filter is a server parameter — the page used to
     * narrow the loaded page in the browser, which quietly meant searching
     * only what was already on screen.
     */
    getHacktivityFeed: builder.query<HacktivityFeed, HacktivityQueryParams | void>({
      query: (params) => `/hacktivity?${queryStringOf(params ?? {})}`,
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),

    /** Platform-wide totals for the badges above the feed. */
    getHacktivityStats: builder.query<HacktivityStats, void>({
      query: () => "/hacktivity/stats",
      providesTags: ["Post"],
    }),

    /**
     * One researcher's activity, for the Hacktivity tab on a profile.
     *
     * Keyed on the profile's UUID, which is the only thing the endpoint
     * accepts. This used to be assembled from `/reports/mine` — the signed-in
     * user's own reports, which take no user parameter — so it could only ever
     * describe the viewer, and opening someone else's profile showed an empty
     * tab. It also saw nothing but resolved reports: recognitions, bounties
     * and disclosures are activity too, and they arrive here.
     */
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
