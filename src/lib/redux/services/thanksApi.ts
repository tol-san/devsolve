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
