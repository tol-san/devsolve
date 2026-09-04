import { proxyApi } from "./proxyApi";
import type {
  PageSolutionDraftResponse,
  SolutionDraftResponse,
  SaveSolutionDraftValues,
} from "@/lib/validations/solution-draft";
import type { SolutionResponse } from "./solutionsApi";

export const solutionDraftsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getSolutionDrafts: builder.query<
      SolutionDraftResponse[],
      { problemId?: string; page?: number; size?: number } | void
    >({
      query: (args) => {
        const params = new URLSearchParams({
          page: String(args?.page ?? 0),
          size: String(args?.size ?? 20),
          sort: "updatedAt,DESC",
        });
        if (args?.problemId) params.set("problemId", args.problemId);
        return `/solution-drafts?${params.toString()}`;
      },
      transformResponse: (
        response: PageSolutionDraftResponse | SolutionDraftResponse[],
      ) => (Array.isArray(response) ? response : (response.content ?? [])),
      providesTags: ["SolutionDraft"],
    }),

    getSolutionDraft: builder.query<SolutionDraftResponse, string>({
      query: (id) => `/solution-drafts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "SolutionDraft", id }],
    }),

    createSolutionDraft: builder.mutation<
      SolutionDraftResponse,
      { problemId: string; body: SaveSolutionDraftValues }
    >({
      query: ({ problemId, body }) => ({
        url: `/problems/${problemId}/solution-drafts`,
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    updateSolutionDraft: builder.mutation<
      SolutionDraftResponse,
      { id: string; body: SaveSolutionDraftValues }
    >({
      query: ({ id, body }) => ({
        url: `/solution-drafts/${id}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    deleteSolutionDraft: builder.mutation<void, string>({
      query: (id) => ({ url: `/solution-drafts/${id}`, method: "DELETE" }),
      invalidatesTags: ["SolutionDraft"],
    }),

    submitSolutionDraft: builder.mutation<SolutionResponse, string>({
      query: (id) => ({ url: `/solution-drafts/${id}/submit`, method: "POST" }),
      invalidatesTags: ["SolutionDraft"],
    }),
  }),
});

async function cacheWhatWasStored(
  dispatch: (action: unknown) => unknown,
  queryFulfilled: PromiseLike<{ data: SolutionDraftResponse }>,
) {
  try {
    const { data: saved } = await queryFulfilled;
    if (saved?.id) {
      dispatch(
        solutionDraftsApi.util.upsertQueryData("getSolutionDraft", saved.id, saved),
      );
    }
  } catch {
    /* Reported through the mutation itself. */
  }
}

export const {
  useGetSolutionDraftsQuery,
  useGetSolutionDraftQuery,
  useCreateSolutionDraftMutation,
  useUpdateSolutionDraftMutation,
  useDeleteSolutionDraftMutation,
  useSubmitSolutionDraftMutation,
} = solutionDraftsApi;
