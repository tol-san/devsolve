import { baseApi } from "./baseApi";
import type {
  PageThanksResponse,
  PageUserRecognitionsResponse,
  ThanksQueryParams,
  UserRecognitionsQueryParams,
} from "@/lib/types/thanks/types";

export * from "@/lib/types/thanks/types";

export const thanksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Public Hall of Thanks board for a specific program.
     * GET /api/v1/programs/{programId}/thanks?page=0&size=20
     */
    getProgramThanks: builder.query<
      PageThanksResponse,
      { programId: string } & ThanksQueryParams
    >({
      query: ({ programId, page = 0, size = 20 }) =>
        `/programs/${encodeURIComponent(programId)}/thanks?page=${Math.max(0, page)}&size=${Math.max(1, Math.min(100, size))}`,
      providesTags: (_result, _error, { programId }) => [
        { type: "Program", id: `${programId}-thanks` },
      ],
    }),

    /**
     * Public Hall of Thanks board for an organization (all its programs combined).
     * GET /api/v1/organizations/{organizationId}/thanks?page=0&size=20
     */
    getOrganizationThanks: builder.query<
      PageThanksResponse,
      { organizationId: string } & ThanksQueryParams
    >({
      query: ({ organizationId, page = 0, size = 20 }) =>
        `/organizations/${encodeURIComponent(organizationId)}/thanks?page=${Math.max(0, page)}&size=${Math.max(1, Math.min(100, size))}`,
      providesTags: (_result, _error, { organizationId }) => [
        { type: "Organization", id: `${organizationId}-thanks` },
      ],
    }),

    /**
     * Public recognitions awarded to a researcher on their profile.
     * GET /api/v1/user-profiles/{userId}/recognitions?page=0&size=10&sort=awardedAt,desc
     */
    getUserRecognitions: builder.query<
      PageUserRecognitionsResponse,
      UserRecognitionsQueryParams
    >({
      query: ({ userId, page = 0, size = 10, sort = "awardedAt,desc" }) => {
        const params = new URLSearchParams();
        params.set("page", String(Math.max(0, page)));
        params.set("size", String(Math.max(1, Math.min(100, size))));
        if (sort) params.set("sort", sort);
        return `/user-profiles/${encodeURIComponent(userId)}/recognitions?${params.toString()}`;
      },
      providesTags: (_result, _error, { userId }) => [
        { type: "Profile", id: `${userId}-recognitions` },
        { type: "Profile" },
      ],
    }),
  }),
});

export const {
  useGetProgramThanksQuery,
  useGetOrganizationThanksQuery,
  useGetUserRecognitionsQuery,
} = thanksApi;
