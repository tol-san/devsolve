import { proxyApi } from "../proxyApi";
import {
  Program,
  PaginatedResponse,
  GetProgramsParams,
  ProgramDetail,
  CreateProgramRequest,
  UpdateProgramRequest,
} from "@/lib/types/programs/types";
import { PageProgramManagementSummaryResponseDto } from "@/lib/types/admin/programAdminTypes";

export * from "@/lib/types/programs/types";

export type ProgramHandleAvailability = {
  handle: string;
  available: boolean;
  reason?: string | null;
};

export const programsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query<
      PaginatedResponse<Program>,
      GetProgramsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.page !== undefined) {
          queryParams.append("page", (params.page - 1).toString());
        }
        if (params?.size) {
          queryParams.append("size", params.size.toString());
        }
        for (const [key, value] of Object.entries(params ?? {})) {
          if (key === "page" || key === "size") continue;
          if (value !== undefined && value !== "") {
            queryParams.append(key, String(value));
          }
        }

        const queryString = queryParams.toString();
        return queryString ? `programs?${queryString}` : "programs";
      },
      providesTags: ["Program"],
    }),

    getProgramCountryValues: builder.query<string[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const firstResult = await fetchWithBQ("programs?page=0&size=100");
        if (firstResult.error) return { error: firstResult.error };

        const firstPage = firstResult.data as PaginatedResponse<Program>;
        const remainingPages = Array.from(
          { length: Math.max(0, firstPage.totalPages - 1) },
          (_, index) => index + 1,
        );
        const remainingResults = await Promise.all(
          remainingPages.map((page) =>
            fetchWithBQ(`programs?page=${page}&size=100`),
          ),
        );
        const failedPage = remainingResults.find((result) => result.error);
        if (failedPage?.error) return { error: failedPage.error };

        const programs = [
          ...firstPage.content,
          ...remainingResults.flatMap(
            (result) =>
              (result.data as PaginatedResponse<Program>).content,
          ),
        ];
        const values = Array.from(
          new Set(
            programs
              .map((program) => program.organization?.country?.trim())
              .filter((country): country is string => Boolean(country)),
          ),
        ).sort((a, b) => a.localeCompare(b));

        return { data: values };
      },
      providesTags: [{ type: "Program", id: "COUNTRIES" }],
    }),

    getMyCompanyPrograms: builder.query<
      PageProgramManagementSummaryResponseDto,
      {
        page?: number;
        size?: number;
        sort?: string;
        submissionState?: string;
        state?: string;
        search?: string;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.size) {
          queryParams.append("size", params.size.toString());
        }
        if (params?.sort) {
          queryParams.append("sort", params.sort);
        }
        if (params?.submissionState) {
          queryParams.append("submissionState", params.submissionState);
        }
        if (params?.state) {
          queryParams.append("state", params.state);
        }
        if (params?.search && params.search.trim()) {
          queryParams.append("search", params.search.trim());
        }

        const queryString = queryParams.toString();
        return queryString
          ? `organizations/me/programs?${queryString}`
          : "organizations/me/programs";
      },
      providesTags: ["Program"],
    }),

    getMyCompanyProgramById: builder.query<ProgramDetail, string>({
      query: (id) => `organizations/me/programs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Program", id }],
    }),

    getProgramById: builder.query<ProgramDetail, string>({
      query: (id) => `programs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Program", id }],
    }),

    createProgram: builder.mutation<
      Program,
      CreateProgramRequest & { state?: string; submit?: boolean }
    >({
      query: ({ submit, ...body }) => ({
        url: submit
          ? "/organizations/me/programs?submit=true"
          : "/organizations/me/programs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Program"],
    }),

    getProgramHandleAvailability: builder.query<
      ProgramHandleAvailability,
      { handle: string; programId?: string }
    >({
      query: ({ handle, programId }) => {
        const params = new URLSearchParams({ handle });
        if (programId) params.set("programId", programId);

        return `/organizations/me/programs/handle-available?${params.toString()}`;
      },
    }),

    updateProgram: builder.mutation<
      Program,
      { id: string; body: UpdateProgramRequest }
    >({
      query: ({ id, body }) => ({
        url: `/programs/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    deleteProgram: builder.mutation<void, string>({
      query: (id) => ({
        url: `/programs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    updateProgramState: builder.mutation<
      Program,
      { id: string; state: "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT" }
    >({
      query: ({ id, state }) => ({
        url: `/programs/${id}`,
        method: "PATCH",
        body: { state },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    submitProgram: builder.mutation<Program, string>({
      query: (id) => ({
        url: `/programs/${id}/submit`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    publishProgram: builder.mutation<Program, string>({
      query: (id) => ({
        url: `/programs/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    closeProgram: builder.mutation<Program, string>({
      query: (id) => ({
        url: `/programs/${id}/close`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    pauseProgram: builder.mutation<Program, string>({
      query: (id) => ({
        url: `/programs/${id}/pause`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    resumeProgram: builder.mutation<Program, string>({
      query: (id) => ({
        url: `/programs/${id}/resume`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    updateProgramVisibility: builder.mutation<
      Program,
      { id: string; visibility: "PUBLIC" | "PRIVATE" | "INVITE_ONLY" }
    >({
      query: ({ id, visibility }) => ({
        url: `/programs/${id}`,
        method: "PATCH",
        body: { visibility },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Program",
        { type: "Program", id },
      ],
    }),

    getProgramUpdates: builder.query<
      any,
      { id: string; page?: number; size?: number; sort?: string }
    >({
      query: ({ id, page = 0, size = 10, sort }) => ({
        url: `/programs/${id}/updates`,
        params: { page, size, ...(sort ? { sort } : {}) },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "Program", id }],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetProgramsQuery,
  useGetProgramCountryValuesQuery,
  useGetMyCompanyProgramsQuery,
  useGetMyCompanyProgramByIdQuery,
  useGetProgramByIdQuery,
  useGetProgramUpdatesQuery,
  useCreateProgramMutation,
  useGetProgramHandleAvailabilityQuery,
  useLazyGetProgramHandleAvailabilityQuery,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useUpdateProgramStateMutation,
  useSubmitProgramMutation,
  usePublishProgramMutation,
  useCloseProgramMutation,
  usePauseProgramMutation,
  useResumeProgramMutation,
  useUpdateProgramVisibilityMutation,
} = programsApi;

