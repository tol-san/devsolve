import { proxyApi } from "./proxyApi";
import type {
  AnalyticsQueryParams,
  OrganizationAnalyticsResponse,
} from "@/lib/types/analytics/types";

export * from "@/lib/types/analytics/types";

export const analyticsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationAnalytics: builder.query<
      OrganizationAnalyticsResponse,
      AnalyticsQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.timeRange) {
          queryParams.set("timeRange", params.timeRange);
        }
        if (params?.programId) {
          queryParams.set("programId", params.programId);
        }
        if (params?.organizationId) {
          queryParams.set("organizationId", params.organizationId);
        }

        const queryString = queryParams.toString();
        return queryString
          ? `/organizations/me/analytics?${queryString}`
          : "/organizations/me/analytics";
      },
      providesTags: ["OrganizationAnalytics"],
    }),

    getOrganizationAnalyticsById: builder.query<
      OrganizationAnalyticsResponse,
      { organizationId: string } & AnalyticsQueryParams
    >({
      query: ({ organizationId, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.timeRange) {
          queryParams.set("timeRange", params.timeRange);
        }
        if (params.programId) {
          queryParams.set("programId", params.programId);
        }

        const queryString = queryParams.toString();
        return queryString
          ? `/organizations/${encodeURIComponent(organizationId)}/analytics?${queryString}`
          : `/organizations/${encodeURIComponent(organizationId)}/analytics`;
      },
      providesTags: ["OrganizationAnalytics"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrganizationAnalyticsQuery,
  useGetOrganizationAnalyticsByIdQuery,
} = analyticsApi;
