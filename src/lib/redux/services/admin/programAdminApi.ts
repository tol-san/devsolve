import { proxyApi } from "../proxyApi";
import {
  PageProgramManagementSummaryResponseDto,
  GetAdminProgramsParams,
  ProgramManagementSummaryItem,
  ProgramSubmissionState,
  ProgramState,
} from "@/lib/types/admin/programAdminTypes";
import type { ProgramDetail } from "@/lib/types/programs/types";

type AdminProgramDetail = ProgramDetail & {
  rejectionReason?: string | null;
};

export type {
  PageProgramManagementSummaryResponseDto,
  GetAdminProgramsParams,
  ProgramManagementSummaryItem,
  ProgramSubmissionState,
  ProgramState,
};

export const programAdminApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPrograms: builder.query<
      PageProgramManagementSummaryResponseDto,
      GetAdminProgramsParams | void
    >({
      query: (params) => {
        const { submissionState, state, search, page = 0, size = 20, sort } = params || {};
        const queryParams: Record<string, any> = { page, size };
        if (submissionState) queryParams.submissionState = submissionState;
        if (state) queryParams.state = state;
        if (search && search.trim()) queryParams.search = search.trim();
        if (sort) queryParams.sort = sort;
        return {
          url: "/admin/programs",
          params: queryParams,
        };
      },
      providesTags: ["AdminProgram"],
    }),

    getProgramDetail: builder.query<AdminProgramDetail, string>({
      query: (id) => ({
        url: `/admin/programs/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "AdminProgram", id }],
    }),

    approveProgram: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id }) => ({
        url: `/admin/programs/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProgram", id },
        "AdminProgram",
      ],
    }),

    rejectProgram: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/programs/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProgram", id },
        "AdminProgram",
      ],
    }),
  }),
});

export const {
  useGetAdminProgramsQuery,
  useGetProgramDetailQuery,
  useApproveProgramMutation,
  useRejectProgramMutation,
} = programAdminApi;
