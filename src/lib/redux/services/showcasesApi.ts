import { baseApi } from "./baseApi";
import type {
  ShowcaseReviewStatus,
  showcaseCreateSchema,
  showcaseStepCreateSchema,
  showcaseStepUpdateSchema,
  showcaseUpdateSchema,
} from "@/lib/validations/showcase";
import type * as z from "zod";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type CreateShowcaseRequest = z.output<typeof showcaseCreateSchema>;

export type UpdateShowcaseRequest = z.output<typeof showcaseUpdateSchema>;

export type CreateShowcaseStepRequest = z.output<
  typeof showcaseStepCreateSchema
>;

export type UpdateShowcaseStepRequest = z.output<
  typeof showcaseStepUpdateSchema
>;

export interface ShowcaseStepResponse {
  id: string;
  stepNumber: number;
  title: string;
  description?: string | null;
  codeSnippet?: string | null;
  imageUrl?: string | null;
  diagramUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowcaseTagResponse {
  id?: string;
  name?: string;
  slug?: string;
}

export interface ShowcaseAuthorResponse {
  id?: string;
  username?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string | null;
  biography?: string | null;
  reputation?: number;
  publishedShowcaseCount?: number;
  followerCount?: number;
  followedByViewer?: boolean;
}

export interface ShowcaseEngagement {
  voteScore: number;
  upvoteCount: number;
  downvoteCount: number;
  bookmarkCount: number;
  followerCount: number;
}

export interface ShowcaseViewer {
  vote: "UP" | "DOWN" | null;
  bookmarked: boolean;
  following: boolean;
  followingAuthor: boolean;
  owner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  editUnderReview: boolean;
}

export interface ShowcaseRelatedItem {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  authorName?: string | null;
  categoryName?: string | null;
  viewCount: number;
}

export interface ShowcaseResponse {
  id: string;
  authorId?: string;
  authorName?: string;
  author?: ShowcaseAuthorResponse | null;
  categoryId?: string | null;
  categoryName?: string | null;
  title: string;
  overview: string;
  coverImageUrl?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  videoUrl?: string | null;
  reviewStatus: ShowcaseReviewStatus;
  viewCount: number;
  commentCount?: number;
  engagement?: ShowcaseEngagement;
  viewer?: ShowcaseViewer;
  tags?: ShowcaseTagResponse[];
  steps?: ShowcaseStepResponse[];
  related?: ShowcaseRelatedItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseSummaryResponse
  extends Omit<ShowcaseResponse, "steps"> {
  hasUnpublishedRevision?: boolean;
  rejectionReason?: string;
}

export interface ShowcaseReviewDetailResponse {
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
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
  steps?: ShowcaseStepResponse[];
}

export interface ShowcaseViewCountResponse {
  showcaseId: string;
  viewCount: number;
}

export interface ShowcaseListParams {
  query?: string;
  categoryId?: string;
  tag?: string;
  sort?: "NEWEST" | "OLDEST" | "TOP" | "TRENDING" | "MOST_VIEWED" | "TITLE";
  pageNumber?: number;
  pageSize?: number;
}

export interface PageParams {
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

function filePart(file: File): FormData {
  const body = new FormData();
  body.append("file", file);
  return body;
}

const LIST = "LIST";

export const showcasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getShowcases: builder.query<
      Page<ShowcaseSummaryResponse>,
      ShowcaseListParams | void
    >({
      query: (args) => ({ url: "/showcases", params: params(args ?? {}) }),
      providesTags: (result) => [
        { type: "Showcase", id: LIST },
        ...(result?.content ?? []).map(({ id }) => ({
          type: "Showcase" as const,
          id,
        })),
      ],
    }),

    getShowcaseById: builder.query<ShowcaseResponse, string>({
      query: (id) => `/showcases/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Showcase", id }],
    }),

    getMyShowcases: builder.query<
      Page<ShowcaseSummaryResponse>,
      PageParams | void
    >({
      query: (args) => ({
        url: "/showcases/mine",
        params: params(args ?? {}),
      }),
      providesTags: [{ type: "Showcase", id: "MINE" }],
    }),

    getUserShowcases: builder.query<
      Page<ShowcaseSummaryResponse>,
      { userId: string } & PageParams
    >({
      query: ({ userId, ...rest }) => ({
        url: `/showcases/users/${userId}`,
        params: params(rest),
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Showcase", id: `USER-${userId}` },
      ],
    }),

    getMyShowcaseRevision: builder.query<ShowcaseReviewDetailResponse, string>({
      query: (id) => `/showcases/${id}/revision`,
      providesTags: (_result, _error, id) => [{ type: "ShowcaseRevision", id }],
    }),

    createShowcase: builder.mutation<ShowcaseResponse, CreateShowcaseRequest>({
      query: (body) => ({ url: "/showcases", method: "POST", body }),
      invalidatesTags: [
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    updateShowcase: builder.mutation<
      ShowcaseResponse,
      { id: string; body: UpdateShowcaseRequest }
    >({
      query: ({ id, body }) => ({
        url: `/showcases/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
        { type: "ShowcaseRevision", id },
        { type: "AutoReview", id: `SHOWCASE_${id}` },
        { type: "AutoReview" },
      ],
    }),

    deleteShowcase: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    softDeleteShowcase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/showcases/${id}/soft-delete`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    restoreShowcase: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}/restore`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    cancelShowcaseRevision: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}/revision`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ShowcaseRevision", id },
        { type: "Showcase", id },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    incrementShowcaseViews: builder.mutation<ShowcaseViewCountResponse, string>(
      {
        query: (id) => ({ url: `/showcases/${id}/views`, method: "POST" }),
      },
    ),

    uploadShowcaseCover: builder.mutation<
      ShowcaseResponse,
      { id: string; file: File }
    >({
      query: ({ id, file }) => ({
        url: `/showcases/${id}/cover-image`,
        method: "PUT",
        body: filePart(file),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    removeShowcaseCover: builder.mutation<ShowcaseResponse, string>({
      query: (id) => ({
        url: `/showcases/${id}/cover-image`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    getShowcaseSteps: builder.query<ShowcaseStepResponse[], string>({
      query: (showcaseId) => `/showcase-steps/${showcaseId}`,
      providesTags: (_result, _error, showcaseId) => [
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),

    getShowcaseStep: builder.query<
      ShowcaseStepResponse,
      { showcaseId: string; stepId: string }
    >({
      query: ({ showcaseId, stepId }) =>
        `/showcase-steps/${showcaseId}/${stepId}`,
      providesTags: (_result, _error, { stepId }) => [
        { type: "ShowcaseStep", id: stepId },
      ],
    }),

    createShowcaseStep: builder.mutation<
      ShowcaseStepResponse,
      { showcaseId: string; body: CreateShowcaseStepRequest }
    >({
      query: ({ showcaseId, body }) => ({
        url: `/showcase-steps/${showcaseId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { showcaseId }) => [
        { type: "ShowcaseStep", id: showcaseId },
        { type: "Showcase", id: showcaseId },
      ],
    }),

    updateShowcaseStep: builder.mutation<
      ShowcaseStepResponse,
      {
        showcaseId: string;
        stepId: string;
        body: UpdateShowcaseStepRequest;
      }
    >({
      query: ({ showcaseId, stepId, body }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
        { type: "Showcase", id: showcaseId },
      ],
    }),

    deleteShowcaseStep: builder.mutation<
      void,
      { showcaseId: string; stepId: string }
    >({
      query: ({ showcaseId, stepId }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
        { type: "Showcase", id: showcaseId },
      ],
    }),

    uploadShowcaseStepImage: builder.mutation<
      ShowcaseStepResponse,
      { showcaseId: string; stepId: string; file: File }
    >({
      query: ({ showcaseId, stepId, file }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}/image`,
        method: "PUT",
        body: filePart(file),
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),

    removeShowcaseStepImage: builder.mutation<
      ShowcaseStepResponse,
      { showcaseId: string; stepId: string }
    >({
      query: ({ showcaseId, stepId }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}/image`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),

    uploadShowcaseStepDiagram: builder.mutation<
      ShowcaseStepResponse,
      { showcaseId: string; stepId: string; file: File }
    >({
      query: ({ showcaseId, stepId, file }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}/diagram`,
        method: "PUT",
        body: filePart(file),
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),

    removeShowcaseStepDiagram: builder.mutation<
      ShowcaseStepResponse,
      { showcaseId: string; stepId: string }
    >({
      query: ({ showcaseId, stepId }) => ({
        url: `/showcase-steps/${showcaseId}/${stepId}/diagram`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { showcaseId, stepId }) => [
        { type: "ShowcaseStep", id: stepId },
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetShowcasesQuery,
  useGetShowcaseByIdQuery,
  useGetMyShowcasesQuery,
  useGetUserShowcasesQuery,
  useGetMyShowcaseRevisionQuery,
  useCreateShowcaseMutation,
  useUpdateShowcaseMutation,
  useDeleteShowcaseMutation,
  useSoftDeleteShowcaseMutation,
  useRestoreShowcaseMutation,
  useCancelShowcaseRevisionMutation,
  useIncrementShowcaseViewsMutation,
  useUploadShowcaseCoverMutation,
  useRemoveShowcaseCoverMutation,
  useGetShowcaseStepsQuery,
  useGetShowcaseStepQuery,
  useCreateShowcaseStepMutation,
  useUpdateShowcaseStepMutation,
  useDeleteShowcaseStepMutation,
  useUploadShowcaseStepImageMutation,
  useRemoveShowcaseStepImageMutation,
  useUploadShowcaseStepDiagramMutation,
  useRemoveShowcaseStepDiagramMutation,
} = showcasesApi;
