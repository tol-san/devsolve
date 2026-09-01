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

/** `GET /organizations/me/programs/handle-available` */
export type ProgramHandleAvailability = {
  /** The normalized form that will be stored — show this back to the author. */
  handle: string;
  available: boolean;
  /** The rule that failed, or null when the handle is free. */
  reason?: string | null;
};

export const programsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /programs?page=0&size=20&search=...
    getPrograms: builder.query<
      PaginatedResponse<Program>,
      GetProgramsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        // Convert 1-indexed UI page to 0-indexed Spring Boot page
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

    /** Exact country values present in published programs. The program API
     * matches countries exactly, so these values are safer than guessing
     * whether an organization stored an ISO code or a full country name. */
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

    // GET /organizations/me/programs (COMPANY role)
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

    // GET /organizations/me/programs/{id} (COMPANY role)
    getMyCompanyProgramById: builder.query<ProgramDetail, string>({
      query: (id) => `organizations/me/programs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Program", id }],
    }),

    // GET /programs/{id}
    getProgramById: builder.query<ProgramDetail, string>({
      query: (id) => `programs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Program", id }],
    }),

    createProgram: builder.mutation<
      Program,
      CreateProgramRequest & { state?: string; submit?: boolean }
    >({
      query: ({ submit, ...body }) => ({
        /* One transaction: the program is created and enters review together,
           so a failure leaves nothing behind rather than an orphan draft the
           author was told had been submitted. */
        url: submit
          ? "/organizations/me/programs?submit=true"
          : "/organizations/me/programs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Program"],
    }),

    /**
     * Whether a handle can still be taken.
     *
     * Checks every program — draft, private, soft-deleted — through the same
     * repository the write uses, so it cannot disagree with the save.
     * `GET /programs/handle/{handle}` is not a substitute: it resolves
     * published programs only, so a draft holding the handle reads as free.
     *
     * Malformed handles answer here too, with the broken rule as `reason`, so
     * one debounced call covers both format and uniqueness.
     */
    getProgramHandleAvailability: builder.query<
      ProgramHandleAvailability,
      { handle: string; programId?: string }
    >({
      query: ({ handle, programId }) => {
        const params = new URLSearchParams({ handle });
        /* Editing an existing program: its own handle must not read as taken. */
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

    // PATCH /programs/{id} (update state: DRAFT -> ACTIVE)
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

    // PATCH /programs/{id}/submit (company sends a draft for admin review)
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

    // PATCH /programs/{id}/publish (publish / set to ACTIVE)
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

    // PATCH /programs/{id}/close (close program)
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

    // PATCH /programs/{id}/pause (pause program)
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

    // PATCH /programs/{id}/resume (resume paused program back to ACTIVE)
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

    // PATCH /programs/{id} (update visibility: PUBLIC, PRIVATE, INVITE_ONLY)
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

    // GET /programs/{id}/updates (public changelog/updates)
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

