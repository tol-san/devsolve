import { proxyApi } from "./proxyApi";
import type {
  AutoReviewVerdict,
  AutoReviewTarget,
  AutoReviewListParams,
} from "@/lib/types/auto-reviews";

export interface AutoReviewPage {
  content: AutoReviewVerdict[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export const autoReviewsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getAutoReview: builder.query<
      AutoReviewVerdict | null,
      { target: AutoReviewTarget; contentId: string }
    >({
      queryFn: async (
        { target, contentId },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) => {
        const result = await fetchWithBQ(
          `/me/auto-reviews/${target.toUpperCase()}/${contentId}`,
        );
        if (result.error && result.error.status === 404) {
          return { data: null };
        }
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as AutoReviewVerdict };
      },
      providesTags: (_result, _error, { target, contentId }) => [
        { type: "AutoReview", id: `${target.toUpperCase()}_${contentId}` },
        { type: "AutoReview" },
      ],
    }),

    getMyAutoReviews: builder.query<
      AutoReviewPage,
      AutoReviewListParams | void
    >({
      query: (params) => {
        const { target, approved, page = 0, size = 20 } = params ?? {};
        const q = new URLSearchParams({
          page: String(Math.max(0, page)),
          size: String(Math.min(Math.max(1, size), 100)),
        });
        if (target) q.set("target", target.toUpperCase());
        if (typeof approved === "boolean") q.set("approved", String(approved));

        return `/me/auto-reviews?${q.toString()}`;
      },
      providesTags: (result) =>
        result?.content
          ? [
              ...result.content.map((item) => ({
                type: "AutoReview" as const,
                id: `${item.target}_${item.contentId}`,
              })),
              { type: "AutoReview", id: "LIST" },
            ]
          : [{ type: "AutoReview", id: "LIST" }],
    }),
  }),
});

export const { useGetAutoReviewQuery, useGetMyAutoReviewsQuery } =
  autoReviewsApi;
