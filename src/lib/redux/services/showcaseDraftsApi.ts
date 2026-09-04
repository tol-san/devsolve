import { proxyApi } from "./proxyApi";
import type {
  PageShowcaseDraftResponse,
  ShowcaseDraftResponse,
  SaveShowcaseDraftValues,
} from "@/lib/validations/showcase-draft";
import type { ShowcaseResponse } from "./showcasesApi";

/**
 * Server-side showcase drafts.
 *
 * Autosave writes without invalidating the list query to prevent form
 * re-renders while typing, but updates the individual draft cache via
 * `cacheWhatWasStored`.
 */
export const showcaseDraftsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowcaseDrafts: builder.query<ShowcaseDraftResponse[], { page?: number; size?: number } | void>({
      query: (args) => {
        const params = new URLSearchParams({
          page: String(args?.page ?? 0),
          size: String(args?.size ?? 20),
          sort: "updatedAt,DESC",
        });
        return `/showcase-drafts?${params.toString()}`;
      },
      transformResponse: (response: PageShowcaseDraftResponse | ShowcaseDraftResponse[]) =>
        Array.isArray(response) ? response : (response.content ?? []),
      providesTags: ["ShowcaseDraft"],
    }),

    getShowcaseDraft: builder.query<ShowcaseDraftResponse, string>({
      query: (id) => `/showcase-drafts/${id}`,
      providesTags: ["ShowcaseDraft"],
    }),

    createShowcaseDraft: builder.mutation<ShowcaseDraftResponse, SaveShowcaseDraftValues>({
      query: (body) => ({
        url: "/showcase-drafts",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    updateShowcaseDraft: builder.mutation<
      ShowcaseDraftResponse,
      { id: string; body: SaveShowcaseDraftValues }
    >({
      query: ({ id, body }) => ({
        url: `/showcase-drafts/${id}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await cacheWhatWasStored(dispatch, queryFulfilled);
      },
    }),

    deleteShowcaseDraft: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcase-drafts/${id}`, method: "DELETE" }),
      invalidatesTags: ["ShowcaseDraft"],
    }),

    submitShowcaseDraft: builder.mutation<ShowcaseResponse, string>({
      query: (id) => ({ url: `/showcase-drafts/${id}/submit`, method: "POST" }),
      invalidatesTags: ["ShowcaseDraft"],
    }),
  }),
});

async function cacheWhatWasStored(
  dispatch: (action: unknown) => unknown,
  queryFulfilled: PromiseLike<{ data: ShowcaseDraftResponse }>,
) {
  try {
    const { data: saved } = await queryFulfilled;
    if (saved?.id) {
      dispatch(
        showcaseDraftsApi.util.upsertQueryData("getShowcaseDraft", saved.id, saved),
      );
    }
  } catch {
    /* Reported through the mutation itself. */
  }
}

export const {
  useGetShowcaseDraftsQuery,
  useGetShowcaseDraftQuery,
  useCreateShowcaseDraftMutation,
  useUpdateShowcaseDraftMutation,
  useDeleteShowcaseDraftMutation,
  useSubmitShowcaseDraftMutation,
} = showcaseDraftsApi;
