import { baseApi } from "./baseApi";
import type {
  ShowcaseReviewStatus,
  showcaseCreateSchema,
  showcaseStepCreateSchema,
  showcaseStepUpdateSchema,
  showcaseUpdateSchema,
} from "@/lib/validations/showcase";
import type * as z from "zod";

/* ── Request / response shapes, mirroring the backend schemas ──────────── */

/** Spring's `Page<T>`, trimmed to the fields the UI reads. */
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

/* The request bodies are the proxy schemas' own output, so a field added to a
   schema cannot drift from the type callers pass. */

/** `CreateShowCasesRequest`. Only `title` and `overview` are required. */
export type CreateShowcaseRequest = z.output<typeof showcaseCreateSchema>;

/** `UpdateShowCasesRequest` — every field optional. */
export type UpdateShowcaseRequest = z.output<typeof showcaseUpdateSchema>;

/** `CreateShowcaseStepRequest`. `stepNumber` is 1-based and set by position. */
export type CreateShowcaseStepRequest = z.output<
  typeof showcaseStepCreateSchema
>;

/** `UpdateShowcaseStepRequest` — every field optional. */
export type UpdateShowcaseStepRequest = z.output<
  typeof showcaseStepUpdateSchema
>;

/** `ShowcaseStepResponse`. */
export interface ShowcaseStepResponse {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  imageUrl?: string;
  diagramUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** `ShowcaseTagResponse`. */
export interface ShowcaseTagResponse {
  id?: string;
  name?: string;
  slug?: string;
}

export interface ShowcaseAuthorResponse {
  id?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string;
  reputation?: number;
}

/** `ShowCasesResponse`. */
export interface ShowcaseResponse {
  id: string;
  authorId?: string;
  authorName?: string;
  author?: ShowcaseAuthorResponse;
  categoryId?: string;
  categoryName?: string;
  title: string;
  overview: string;
  coverImageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  reviewStatus: ShowcaseReviewStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: ShowcaseTagResponse[];
  steps?: ShowcaseStepResponse[];
}

/**
 * `ShowCasesSummaryResponse` — the list row. Carries no steps, and adds the
 * two fields only an author sees: whether an edit is queued for review, and
 * why the last submission was turned down.
 */
export interface ShowcaseSummaryResponse
  extends Omit<ShowcaseResponse, "steps"> {
  hasUnpublishedRevision?: boolean;
  rejectionReason?: string;
}

/**
 * `ShowcaseReviewDetailResponse` — a submission as the reviewer (and the
 * author, via `/revision`) sees it. `submissionType` separates a first publish
 * from an edit to something already approved.
 */
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

/** `ShowcaseViewCountResponse`. */
export interface ShowcaseViewCountResponse {
  showcaseId: string;
  viewCount: number;
}

/** `GET /showcases` query parameters. */
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

/** Drops undefined entries so RTK Query's cache keys stay stable. */
function params(source: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== "") out[key] = String(value);
  }
  return out;
}

/** One `file` part, the shape all four image routes take. */
function filePart(file: File): FormData {
  const body = new FormData();
  body.append("file", file);
  // No explicit Content-Type: the browser has to set the multipart boundary
  // itself, and naming the header here would strip it.
  return body;
}

const LIST = "LIST";

export const showcasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Reading ──────────────────────────────────────────────────────── */

    /** GET /api/v1/showcases — the public index. */
    getShowcases: builder.query<
      Page<ShowcaseResponse>,
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

    /** GET /api/v1/showcases/{id} — one showcase with its build guide. */
    getShowcaseById: builder.query<ShowcaseResponse, string>({
      query: (id) => `/showcases/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Showcase", id }],
    }),

    /** GET /api/v1/showcases/mine — the caller's own, review status included. */
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

    /** GET /api/v1/user-profiles/{userId}/showcases — a public portfolio. */
    getUserShowcases: builder.query<
      Page<ShowcaseSummaryResponse>,
      { userId: string } & PageParams
    >({
      query: ({ userId, ...rest }) => ({
        url: `/user-profiles/${userId}/showcases`,
        params: params(rest),
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Showcase", id: `USER-${userId}` },
      ],
    }),

    /** GET /api/v1/showcases/{id}/revision — the author's pending edit. */
    getMyShowcaseRevision: builder.query<ShowcaseReviewDetailResponse, string>({
      query: (id) => `/showcases/${id}/revision`,
      providesTags: (_result, _error, id) => [{ type: "ShowcaseRevision", id }],
    }),

    /* ── Writing ──────────────────────────────────────────────────────── */

    /** POST /api/v1/showcases — creates the showcase shell, without steps. */
    createShowcase: builder.mutation<ShowcaseResponse, CreateShowcaseRequest>({
      query: (body) => ({ url: "/showcases", method: "POST", body }),
      invalidatesTags: [
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    /**
     * PATCH /api/v1/showcases/{id}. On an approved showcase the upstream files
     * this as a revision awaiting review rather than changing what is live, so
     * the pending-revision cache is invalidated alongside the showcase.
     */
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
      ],
    }),

    /** DELETE /api/v1/showcases/{id} — unrecoverable. */
    deleteShowcase: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    /** PATCH /api/v1/showcases/{id}/soft-delete — reversible via `restore`. */
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

    /** PATCH /api/v1/showcases/{id}/restore. */
    restoreShowcase: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}/restore`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Showcase", id },
        { type: "Showcase", id: LIST },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    /** DELETE /api/v1/showcases/{id}/revision — withdraws a pending edit. */
    cancelShowcaseRevision: builder.mutation<void, string>({
      query: (id) => ({ url: `/showcases/${id}/revision`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ShowcaseRevision", id },
        { type: "Showcase", id },
        { type: "Showcase", id: "MINE" },
      ],
    }),

    /**
     * POST /api/v1/showcases/{id}/views. Deliberately invalidates nothing: a
     * view count that refetched the page it was recorded from would loop.
     */
    incrementShowcaseViews: builder.mutation<ShowcaseViewCountResponse, string>(
      {
        query: (id) => ({ url: `/showcases/${id}/views`, method: "POST" }),
      },
    ),

    /* ── Cover image ──────────────────────────────────────────────────── */

    /**
     * PUT /api/v1/showcases/{id}/cover-image. Scoped to an existing showcase,
     * so the create form uploads straight after the showcase is created.
     */
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

    /** DELETE /api/v1/showcases/{id}/cover-image. */
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

    /* ── Build steps ──────────────────────────────────────────────────── */

    /** GET /api/v1/showcase-steps/{showcaseId} — the guide, in order. */
    getShowcaseSteps: builder.query<ShowcaseStepResponse[], string>({
      query: (showcaseId) => `/showcase-steps/${showcaseId}`,
      providesTags: (_result, _error, showcaseId) => [
        { type: "ShowcaseStep", id: showcaseId },
      ],
    }),

    /** GET /api/v1/showcase-steps/{showcaseId}/{stepId}. */
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

    /**
     * POST /api/v1/showcase-steps/{showcaseId} — one call per step. The API
     * takes no bulk variant, so the form posts these in order after the
     * showcase itself exists.
     */
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

    /** PATCH /api/v1/showcase-steps/{showcaseId}/{stepId}. */
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

    /** DELETE /api/v1/showcase-steps/{showcaseId}/{stepId}. */
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

    /* ── Step images ──────────────────────────────────────────────────── */

    /** PUT /api/v1/showcase-steps/{showcaseId}/{stepId}/image. */
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

    /** DELETE /api/v1/showcase-steps/{showcaseId}/{stepId}/image. */
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

    /** PUT /api/v1/showcase-steps/{showcaseId}/{stepId}/diagram. */
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

    /** DELETE /api/v1/showcase-steps/{showcaseId}/{stepId}/diagram. */
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
