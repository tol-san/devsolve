import { proxyApi } from "./proxyApi";
import type {
  ReportDraftResponse,
  SaveReportDraftValues,
} from "@/lib/validations/report-draft";

interface DraftPage {
  content?: ReportDraftResponse[];
  totalElements?: number;
}

export const reportDraftsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportDrafts: builder.query<ReportDraftResponse[], { programId?: string }>({
      query: ({ programId }) => {
        const params = new URLSearchParams({
          page: "0",
          size: "20",
          sort: "updatedAt,DESC",
        });
        if (programId) params.set("programId", programId);
        return `/report-drafts?${params.toString()}`;
      },
      transformResponse: (response: DraftPage | ReportDraftResponse[]) =>
        Array.isArray(response) ? response : (response.content ?? []),
      providesTags: ["ReportDraft"],
    }),

    getReportDraft: builder.query<ReportDraftResponse, string>({
      query: (id) => `/report-drafts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ReportDraft", id }],
    }),

    createReportDraft: builder.mutation<
      ReportDraftResponse,
      { programId: string; body: SaveReportDraftValues }
    >({
      query: ({ programId, body }) => ({
        url: `/programs/${programId}/report-drafts`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    updateReportDraft: builder.mutation<
      ReportDraftResponse,
      { id: string; body: SaveReportDraftValues }
    >({
      query: ({ id, body }) => ({
        url: `/report-drafts/${id}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    deleteReportDraft: builder.mutation<void, string>({
      query: (id) => ({ url: `/report-drafts/${id}`, method: "DELETE" }),
      invalidatesTags: ["ReportDraft"],
    }),

    submitReportDraft: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/report-drafts/${id}/submit`, method: "POST" }),
      invalidatesTags: ["ReportDraft", "Report"],
    }),
  }),
});

async function cacheWhatWasStored(
  dispatch: (action: unknown) => unknown,
  queryFulfilled: PromiseLike<{ data: ReportDraftResponse }>,
) {
  try {
    const { data: saved } = await queryFulfilled;
    if (saved?.id) {
      dispatch(
        reportDraftsApi.util.upsertQueryData("getReportDraft", saved.id, saved),
      );
    }
  } catch {
    /* Reported through the mutation itself. */
  }
}

export const {
  useGetReportDraftsQuery,
  useGetReportDraftQuery,
  useCreateReportDraftMutation,
  useUpdateReportDraftMutation,
  useDeleteReportDraftMutation,
  useSubmitReportDraftMutation,
} = reportDraftsApi;
