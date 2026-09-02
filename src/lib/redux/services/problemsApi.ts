import { baseApi } from "./baseApi";
import type { Page } from "./showcasesApi";
import type {
  CreateProblemRequest,
  ProblemSeverity,
  ProblemStatus,
  ProblemType,
  ProblemUpdateRequest,
  SdlcPhase,
} from "@/lib/validations/problem";

export type { ProblemSeverity, ProblemStatus, ProblemType };

/** Query parameters `findPublished` accepts. */
export interface ProblemFeedParams {
  categoryId?: string;
  sdlcPhase?: SdlcPhase;
  tag?: string;
  technology?: string;
  q?: string;
  status?: ProblemStatus;
  unansweredOnly?: boolean;
  /** Zero-based, matching Spring's own paging on this controller. */
  page?: number;
  size?: number;
  /** Named listing order from the public OpenAPI contract. */
  sort?: "NEWEST" | "OLDEST" | "TOP" | "TRENDING" | "MOST_VIEWED" | "TITLE";
}

/**
 * Mirrors `AuthorSummary`, with one caveat the schema does not capture: the
 * name arrives as `fullName` from `/problems` and as `displayName` from
 * `/problems/{id}/solutions`. Both are declared, and `authorNameOf` is what
 * reads them — never either field directly.
 */
export interface AuthorSummary {
  id?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string;
  /** Absent on the author embedded in a solution. */
  reputation?: number;
}

export interface CategorySummary {
  id?: string;
  name?: string;
  slug?: string;
  scope?: "PROBLEM" | "SHOWCASE";
}

export interface TechnologySummary {
  id?: string;
  name?: string;
  version?: string;
}

export interface TagSummary {
  id?: string;
  name?: string;
  slug?: string;
}

export interface AttachmentSummary {
  id?: string;
  /** The upstream field. `fileName` was the old, wrong name for it. */
  originalFileName?: string;
  downloadUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  createdAt?: string;
}

/** `EnvironmentSummary` — where the problem was seen, as opposed to what it uses. */
export interface EnvironmentSummary {
  technology?: string;
  version?: string;
}

/** Mirrors the backend `ProblemResponse` returned after submission. */
export interface ProblemResponse {
  id?: string;
  author?: AuthorSummary;
  category?: CategorySummary;
  title?: string;
  description?: string;
  problemType?: ProblemType;
  sdlcPhase?: SdlcPhase;
  severity?: ProblemSeverity;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string[];
  environment?: EnvironmentSummary[];
  attemptsTried?: string;
  errorMessage?: string;
  repositoryUrl?: string;
  status?: ProblemStatus;
  viewCount?: number;
  technologies?: TechnologySummary[];
  tags?: TagSummary[];
  attachments?: AttachmentSummary[];
  contentWarnings?: string[];
  /* Counts and viewer state the detail response carries, so a page that has
     the problem does not have to fetch them a second time. */
  solutionCount?: number;
  commentCount?: number;
  voteScore?: number;
  bookmarkCount?: number;
  /** Plural: a problem may accept more than one answer. */
  acceptedSolutionIds?: string[];
  isBookmarkedByViewer?: boolean;
  viewerVote?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canAcceptSolution?: boolean;
  publishedAt?: string;
  deletedAt?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /api/problems -> POST /api/v1/problems. */
    createProblem: builder.mutation<ProblemResponse, CreateProblemRequest>({
      query: (body) => ({ url: "/problems", method: "POST", body }),
      invalidatesTags: [{ type: "Discussion", id: "LIST" }],
    }),

    /** Creates an editable draft so files can be scanned before moderation. */
    createProblemDraft: builder.mutation<ProblemResponse, CreateProblemRequest>({
      query: (body) => ({ url: "/problems/drafts", method: "POST", body }),
      invalidatesTags: [{ type: "Problem", id: "MINE" }],
    }),

    uploadProblemAttachment: builder.mutation<
      ProblemResponse,
      { problemId: string; file: File }
    >({
      query: ({ problemId, file }) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: `/problems/${problemId}/attachments`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Problem", id: "MINE" },
      ],
    }),

    /**
     * Removing one stored file from a problem.
     *
     * Takes effect at once rather than on save: there is no draft of an
     * attachment list to reconcile, so the editor must say so before asking.
     * The refreshed problem is re-read through the invalidated tag, which is
     * what drops the row from the editor's list.
     */
    deleteProblemAttachment: builder.mutation<
      void,
      { problemId: string; attachmentId: string }
    >({
      query: ({ problemId, attachmentId }) => ({
        url: `/problems/${problemId}/attachments/${attachmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Problem", id: "MINE" },
      ],
    }),

    /** GET /api/problems/{id} -> GET /api/v1/problems/{id}. */
    getProblemById: builder.query<ProblemResponse, string>({
      query: (id) => `/problems/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Problem", id }],
    }),

    /**
     * POST /api/problems/{id}/views -> POST /api/v1/problems/{id}/views.
     * The upstream response is 204, so the authoritative updated count is
     * obtained by refreshing the cached detail and list queries afterward.
     */
    incrementProblemViews: builder.mutation<void, string>({
      query: (id) => ({ url: `/problems/${id}/views`, method: "POST" }),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              { type: "Problem", id },
              { type: "Problem", id: "LIST" },
              { type: "Discussion", id },
            ],
    }),

    /**
     * PATCH /api/problems/{id} — the author revising their own problem.
     *
     * `version` becomes the `If-Match` header, quoted the way the upstream
     * ETag is (`ETag: "3"` for `version: 3`). Saving over someone else's
     * newer version is refused with a 412 rather than silently winning.
     */
    updateProblem: builder.mutation<
      ProblemResponse,
      { id: string; version: number; body: ProblemUpdateRequest }
    >({
      query: ({ id, version, body }) => ({
        url: `/problems/${id}`,
        method: "PATCH",
        headers: { "If-Match": `"${version}"` },
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),

    /**
     * POST /api/problems/{id}/submit — the author sending a draft to review.
     *
     * The step between `DRAFT` and `PENDING_APPROVAL`. A draft nobody submits
     * is visible only to its author, so this is what turns one into a post.
     */
    submitProblem: builder.mutation<ProblemResponse, string>({
      query: (id) => ({ url: `/problems/${id}/submit`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),

    /**
     * DELETE /api/problems/{id} — the author withdrawing their own problem.
     * A soft delete upstream, so the record survives but stops being served.
     */
    deleteProblem: builder.mutation<void, string>({
      query: (id) => ({ url: `/problems/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),

    /**
     * PUT /api/problems/{problemId}/accepted-solutions — the asker marking an
     * answer as one that worked. Only the problem's author may do it, and the
     * backend is what enforces that.
     *
     * Plural, and additive: accepting a second answer does not replace the
     * first, so a problem solved two ways can say so.
     */
    setAcceptedSolution: builder.mutation<
      ProblemResponse,
      { problemId: string; solutionId: string }
    >({
      query: ({ problemId, solutionId }) => ({
        url: `/problems/${problemId}/accepted-solutions`,
        method: "PUT",
        body: { solutionId },
      }),
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Solution", id: problemId },
      ],
    }),

    /**
     * DELETE /api/problems/{problemId}/accepted-solutions/{solutionId} —
     * un-accepting one answer. The id is in the path because several may be
     * accepted at once, so which one is being withdrawn has to be named.
     */
    removeAcceptedSolution: builder.mutation<
      ProblemResponse,
      { problemId: string; solutionId: string }
    >({
      query: ({ problemId, solutionId }) => ({
        url: `/problems/${problemId}/accepted-solutions/${solutionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Solution", id: problemId },
      ],
    }),

    /** GET /api/problems -> the published feed. Approved problems only. */
    getProblems: builder.query<Page<ProblemResponse>, ProblemFeedParams | void>({
      query: (args) => {
        // Undefined entries are dropped so RTK Query's cache keys stay stable.
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(args ?? {})) {
          if (value !== undefined && value !== "") params[key] = String(value);
        }
        return { url: "/problems", params };
      },
      providesTags: [{ type: "Problem", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateProblemMutation,
  useCreateProblemDraftMutation,
  useUploadProblemAttachmentMutation,
  useDeleteProblemAttachmentMutation,
  useUpdateProblemMutation,
  useSubmitProblemMutation,
  useGetProblemByIdQuery,
  useIncrementProblemViewsMutation,
  useGetProblemsQuery,
  useDeleteProblemMutation,
  useSetAcceptedSolutionMutation,
  useRemoveAcceptedSolutionMutation,
} = problemsApi;
