import { baseApi } from "../baseApi";
import type {
  Page,
  ShowcaseReviewDetailResponse,
} from "../showcasesApi";
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

export interface ShowcaseReviewQueueItem {
  showcaseId: string;
  revisionId?: string;
  submissionType: "INITIAL" | "REVISION";
  authorId: string;
  authorName: string;
  categoryId?: string;
  categoryName?: string;
  title: string;
  overview: string;
  coverImageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  reviewStatus: ShowcaseReviewStatus;
  tags?: { id?: string; name: string; slug?: string }[];
  submittedAt: string;
}

export interface ShowcaseReviewHistoryEntry {
  id: string;
  showcaseId: string;
  revisionId?: string;
  submissionType: "INITIAL" | "REVISION";
  categoryId?: string;
  title: string;
  overview: string;
  coverImageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  reviewStatus: ShowcaseReviewStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface ShowcaseReviewDecision {
  reviewStatus: ShowcaseReviewStatus;
  rejectionReason?: string;
}

export interface ReviewQueueParams {
  reviewStatus?: ShowcaseReviewStatus;
  pageNumber?: number;
  pageSize?: number;
}

function params(source: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== "") out[key] = String(value);
  }
  return out;
}

const QUEUE = "QUEUE";

export const showcaseReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowcaseReviewQueue: builder.query<
      Page<ShowcaseReviewQueueItem>,
      ReviewQueueParams | void
    >({
      query: (args) => ({
        url: "/admin/showcases",
        params: params(args ?? {}),
      }),
      providesTags: [{ type: "ShowcaseReview", id: QUEUE }],
    }),

    getShowcaseReviewDetail: builder.query<ShowcaseReviewDetailResponse, string>(
      {
        query: (id) => `/admin/showcases/${id}`,
        providesTags: (_result, _error, id) => [
          { type: "ShowcaseReview", id },
        ],
      },
    ),

    getShowcaseReviewHistory: builder.query<
      Page<ShowcaseReviewHistoryEntry>,
      { id: string; pageNumber?: number; pageSize?: number }
    >({
      query: ({ id, ...rest }) => ({
        url: `/admin/showcases/${id}/review-history`,
        params: params(rest),
      }),
      providesTags: (_result, _error, { id }) => [
        { type: "ShowcaseReview", id: `HISTORY-${id}` },
      ],
    }),

    updateShowcaseReviewStatus: builder.mutation<
      ShowcaseReviewDetailResponse,
      { id: string; body: ShowcaseReviewDecision }
    >({
      query: ({ id, body }) => ({
        url: `/admin/showcases/${id}/review-status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ShowcaseReview", id },
        { type: "ShowcaseReview", id: QUEUE },
        { type: "ShowcaseReview", id: `HISTORY-${id}` },
        { type: "Showcase", id },
        { type: "Showcase", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetShowcaseReviewQueueQuery,
  useGetShowcaseReviewDetailQuery,
  useGetShowcaseReviewHistoryQuery,
  useUpdateShowcaseReviewStatusMutation,
} = showcaseReviewApi;
