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
 *
 * They do, however, write what the server returned back into the cached copy
 * of that one draft. Not invalidating is not a licence to hold something the
 * server has since replaced: without this, saving an edit and then reopening
 * the draft served the version from before the edit, and the save looked like
 * it had been thrown away.
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
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

/**
 * Replaces the cached copy of one draft with what the server just stored.
 *
 * A patch rather than an invalidation: an invalidation would refetch on every
 * autosave and re-render the form being typed into. This costs no request and
 * leaves the cache telling the truth — what is written back is the server's
 * own answer, so a save the server altered or ignored shows as what it did,
 * not as what was sent.
 *
 * A rejected save is swallowed: the mutation already reports its own failure
 * to the caller, and there is nothing to cache. An empty 2xx is skipped for
 * the same reason — there is no draft in it to hold.
 */
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
