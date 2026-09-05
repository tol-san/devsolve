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

export interface ProblemFeedParams {
  categoryId?: string;
  sdlcPhase?: SdlcPhase;
  tag?: string;
  technology?: string;
  q?: string;
  status?: ProblemStatus;
  unansweredOnly?: boolean;
  page?: number;
  size?: number;
  sort?: "NEWEST" | "OLDEST" | "TOP" | "TRENDING" | "MOST_VIEWED" | "TITLE";
}

export interface AuthorSummary {
  id?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string;
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
  originalFileName?: string;
  downloadUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  createdAt?: string;
}

export interface EnvironmentSummary {
  technology?: string;
  version?: string;
}

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
  solutionCount?: number;
  commentCount?: number;
  voteScore?: number;
  bookmarkCount?: number;
  acceptedSolutionIds?: string[];
  isBookmarkedByViewer?: boolean;
  viewerVote?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canAcceptSolution?: boolean;
  publishedAt?: string;
  deletedAt?: string;
  version?: number;
  etag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RelatedProblem {
  id: string;
  title: string;
  status: "PUBLISHED" | "RESOLVED" | "CLOSED";
  solved: boolean;
  solutionCount: number;
  viewCount: number;
}

export interface DuplicateCheckRequest {
  title: string;
  description?: string;
  errorMessage?: string;
  excludeId?: string;
}

export interface DuplicateSuggestion {
  id: string;
  title: string;
  excerpt: string | null;
  status: "PUBLISHED" | "RESOLVED" | "CLOSED";
  solved: boolean;
  solutionCount: number;
  acceptedSolutionCount: number;
  viewCount: number;
  verdict: "DUPLICATE" | "NEAR_DUPLICATE" | "RELATED" | null;
  confidence: number | null;
  reason: string | null;
}

export interface DuplicateCheckResponse {
  aiReviewed: boolean;
  suggestions: DuplicateSuggestion[];
}

function extractEtagVersion(response: ProblemResponse, meta: any): ProblemResponse {
  const etag = meta?.response?.headers?.get?.("etag");
  let version = response.version;
  if (etag) {
    const unquoted = etag.replace(/^W\//, "").replace(/^"|"$/g, "").trim();
    const num = parseInt(unquoted, 10);
    if (!isNaN(num)) {
      version = num;
    }
  }
  return {
    ...response,
    version,
    etag: etag ?? (version != null ? `"${version}"` : undefined),
  };
}

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProblem: builder.mutation<ProblemResponse, CreateProblemRequest>({
      query: (body) => ({ url: "/problems", method: "POST", body }),
      transformResponse: extractEtagVersion,
      invalidatesTags: [{ type: "Discussion", id: "LIST" }],
    }),

    createProblemDraft: builder.mutation<ProblemResponse, CreateProblemRequest>({
      query: (body) => ({ url: "/problems/drafts", method: "POST", body }),
      transformResponse: extractEtagVersion,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: saved } = await queryFulfilled;
          if (saved?.id) {
            dispatch(
              problemsApi.util.upsertQueryData("getProblemById", saved.id, saved),
            );
          }
        } catch {}
      },
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
      transformResponse: extractEtagVersion,
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Problem", id: "MINE" },
      ],
    }),

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

    getProblemById: builder.query<ProblemResponse, string>({
      query: (id) => `/problems/${id}`,
      transformResponse: extractEtagVersion,
      providesTags: (_result, _error, id) => [{ type: "Problem", id }],
    }),

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

    updateProblem: builder.mutation<
      ProblemResponse,
      { id: string; version: number; body: ProblemUpdateRequest }
    >({
      query: ({ id, version, body }) => ({
        url: `/problems/${id}`,
        method: "PATCH",
        headers: {
          "If-Match": `"${version}"`,
          "X-If-Match": `"${version}"`,
        },
        body,
      }),
      transformResponse: extractEtagVersion,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
        { type: "AutoReview", id: `PROBLEM_${id}` },
        { type: "AutoReview" },
      ],
    }),

    updateProblemDraft: builder.mutation<
      ProblemResponse,
      { id: string; version: number; body: ProblemUpdateRequest }
    >({
      query: ({ id, version, body }) => ({
        url: `/problems/${id}`,
        method: "PATCH",
        headers: {
          "If-Match": `"${version}"`,
          "X-If-Match": `"${version}"`,
        },
        body,
      }),
      transformResponse: extractEtagVersion,
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: saved } = await queryFulfilled;
          if (saved?.id) {
            dispatch(
              problemsApi.util.upsertQueryData("getProblemById", id, saved),
            );
          }
        } catch {}
      },
    }),

    submitProblem: builder.mutation<ProblemResponse, string>({
      query: (id) => ({ url: `/problems/${id}/submit`, method: "POST" }),
      transformResponse: extractEtagVersion,
      invalidatesTags: (_result, _error, id) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),

    deleteProblem: builder.mutation<void, string>({
      query: (id) => ({ url: `/problems/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Problem", id },
        { type: "Problem", id: "LIST" },
        { type: "Problem", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),

    setAcceptedSolution: builder.mutation<
      ProblemResponse,
      { problemId: string; solutionId: string }
    >({
      query: ({ problemId, solutionId }) => ({
        url: `/problems/${problemId}/accepted-solutions`,
        method: "PUT",
        body: { solutionId },
      }),
      transformResponse: extractEtagVersion,
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Solution", id: problemId },
      ],
    }),

    removeAcceptedSolution: builder.mutation<
      ProblemResponse,
      { problemId: string; solutionId: string }
    >({
      query: ({ problemId, solutionId }) => ({
        url: `/problems/${problemId}/accepted-solutions/${solutionId}`,
        method: "DELETE",
      }),
      transformResponse: extractEtagVersion,
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Problem", id: problemId },
        { type: "Solution", id: problemId },
      ],
    }),

    getProblems: builder.query<Page<ProblemResponse>, ProblemFeedParams | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(args ?? {})) {
          if (value !== undefined && value !== "") params[key] = String(value);
        }
        return { url: "/problems", params };
      },
      providesTags: [{ type: "Problem", id: "LIST" }],
    }),

    getRelatedProblems: builder.query<
      RelatedProblem[],
      { q: string; excludeId?: string; limit?: number }
    >({
      query: ({ q, excludeId, limit = 5 }) => {
        const params: Record<string, string> = { q };
        if (excludeId) params.excludeId = excludeId;
        if (limit) params.limit = String(limit);
        return { url: "/problems/related", params };
      },
    }),

    checkDuplicateProblems: builder.mutation<
      DuplicateCheckResponse,
      DuplicateCheckRequest
    >({
      query: (body) => ({
        url: "/problems/duplicate-check",
        method: "POST",
        body,
      }),
    }),

    getMyProblems: builder.query<
      { content?: ProblemResponse[]; totalElements?: number },
      { page?: number; size?: number } | void
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set("page", String(params.page));
        if (params?.size !== undefined) search.set("size", String(params.size));
        const qs = search.toString();
        return `/problems/mine${qs ? `?${qs}` : ""}`;
      },
      providesTags: [{ type: "Problem", id: "MINE" }],
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
  useUpdateProblemDraftMutation,
  useSubmitProblemMutation,
  useGetProblemByIdQuery,
  useLazyGetProblemByIdQuery,
  useIncrementProblemViewsMutation,
  useGetProblemsQuery,
  useDeleteProblemMutation,
  useSetAcceptedSolutionMutation,
  useRemoveAcceptedSolutionMutation,
  useGetRelatedProblemsQuery,
  useLazyGetRelatedProblemsQuery,
  useCheckDuplicateProblemsMutation,
  useGetMyProblemsQuery,
  useLazyGetMyProblemsQuery,
} = problemsApi;

