import { proxyApi } from "./proxyApi";
import type {
  ReportDraftResponse,
  SaveReportDraftValues,
} from "@/lib/validations/report-draft";

interface DraftPage {
  content?: ReportDraftResponse[];
  totalElements?: number;
}

/**
 * Server-side report drafts.
 *
 * A draft outlives the tab, the browser and the device, which is what a local
 * copy could never do — a researcher who writes half a report on a laptop
 * finds it on their desktop.
 *
 * The write endpoints deliberately do **not** invalidate the list. Autosave
 * fires every few seconds while someone types, and a tag invalidation would
 * refetch the list on each one, which in turn re-renders the form that is
 * being typed into. The id is held by the caller instead, and the list is
 * only refreshed where it is actually read.
 */
export const reportDraftsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Drafts for one program — how the form finds work to resume. */
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
      providesTags: ["ReportDraft"],
    }),

    /** First save: the draft does not exist yet. */
    createReportDraft: builder.mutation<
      ReportDraftResponse,
      { programId: string; body: SaveReportDraftValues }
    >({
      query: ({ programId, body }) => ({
        url: `/programs/${programId}/report-drafts`,
        method: "POST",
        body,
      }),
    }),

    /** Every save after the first. */
    updateReportDraft: builder.mutation<
      ReportDraftResponse,
      { id: string; body: SaveReportDraftValues }
    >({
      query: ({ id, body }) => ({
        url: `/report-drafts/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteReportDraft: builder.mutation<void, string>({
      query: (id) => ({ url: `/report-drafts/${id}`, method: "DELETE" }),
      invalidatesTags: ["ReportDraft"],
    }),

    /** Promote the stored draft into a real report. */
    submitReportDraft: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/report-drafts/${id}/submit`, method: "POST" }),
      invalidatesTags: ["ReportDraft", "Report"],
    }),
  }),
});

export const {
  useGetReportDraftsQuery,
  useGetReportDraftQuery,
  useCreateReportDraftMutation,
  useUpdateReportDraftMutation,
  useDeleteReportDraftMutation,
  useSubmitReportDraftMutation,
} = reportDraftsApi;
