import { baseApi } from "./baseApi";
import type { Page } from "./showcasesApi";
import type {
  ApproachType,
  CreateSolutionRequest,
  ResourceType,
  UpdateSolutionRequest,
} from "@/lib/validations/solution";
import type { AuthorSummary } from "./problemsApi";

/**
 * Answers on a problem — `GET /api/v1/problems/{problemId}/solutions`.
 *
 * The response embeds its author and carries its own vote score, so a card
 * rendering one needs no follow-up request for either.
 */

export type { ApproachType, ResourceType };

/** `VerificationStep` — one thing to run, and what it should print. */
export interface VerificationStep {
  instruction?: string;
  expectedResult?: string;
}

/** `TestedWith` — a stack the answer was actually verified against. */
export interface TestedWith {
  technology?: string;
  version?: string;
}

/** `ResourceSummary` — a link the answer leans on. */
export interface ResourceSummary {
  id?: string;
  type?: ResourceType;
  label?: string;
  url?: string;
  displayOrder?: number;
}

export interface SolutionAttachmentSummary {
  id?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  downloadUrl?: string;
  createdAt?: string;
}

/** `ModerationDetails` — where the answer stands in the review queue. */
export interface ModerationDetails {
  revisionId?: string;
  revisionNumber?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/** `SolutionResponse`. */
export interface SolutionResponse {
  id: string;
  problemId?: string;
  author?: AuthorSummary;
  summary?: string;
  bodyMarkdown?: string;
  approachType?: ApproachType;
  verificationSteps?: VerificationStep[];
  testedWith?: TestedWith[];
  tradeoffs?: string;
  resources?: ResourceSummary[];
  attachments?: SolutionAttachmentSummary[];
  isAccepted?: boolean;
  voteScore?: number;
  commentCount?: number;
  viewerVote?: string;
  /** Sent back as the `If-Match` header on an update. */
  version?: number;
  /** Set client-side when this record came from the signed-in user's list. */
  viewerOwnsSolution?: boolean;
  moderation?: ModerationDetails;
  createdAt: string;
  updatedAt?: string;
}

/** `PublicUserProfileResponse`, trimmed to what an author line needs. */
export interface PublicProfileSummary {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  biography?: string;
  reputation?: number;
}

const EDITABLE_SOLUTIONS_PAGE_SIZE = 100;

function mergeEditableSolution(
  published: SolutionResponse | undefined,
  owned: SolutionResponse,
): SolutionResponse {
  if (!published) return { ...owned, viewerOwnsSolution: true };

  return {
    ...published,
    ...owned,
    /* The author's endpoint may omit expanded relations even though its text
       and moderation fields are the pending revision we need. */
    author: owned.author ?? published.author,
    problemId: owned.problemId ?? published.problemId,
    version: owned.version ?? published.version,
    viewerOwnsSolution: true,
  };
}

export const solutionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSolutionsByProblem: builder.query<
      Page<SolutionResponse>,
      { problemId: string; pageNumber?: number; pageSize?: number }
    >({
      query: ({ problemId, pageNumber, pageSize }) => {
        const params: Record<string, string> = {};
        if (pageNumber !== undefined) params.pageNumber = String(pageNumber);
        if (pageSize !== undefined) params.pageSize = String(pageSize);
        return { url: `/problems/${problemId}/solutions`, params };
      },
      providesTags: (_result, _error, { problemId }) => [
        { type: "Solution", id: problemId },
      ],
    }),

    /**
     * GET /api/solutions/mine — the caller's own answers, review state and all.
     *
     * The public list under a problem serves approved answers only, so this is
     * the only place an author can see that the one they just posted exists and
     * is waiting. Signed-out callers get a 401, which is the answer.
     */
    getMySolutions: builder.query<
      Page<SolutionResponse>,
      { pageNumber?: number; pageSize?: number } | void
    >({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.pageNumber !== undefined)
          params.pageNumber = String(args.pageNumber);
        if (args?.pageSize !== undefined)
          params.pageSize = String(args.pageSize);
        return { url: "/solutions/mine", params };
      },
      providesTags: [{ type: "Solution", id: "MINE" }],
    }),

    /** GET /api/user-profiles/{userId} — an author's public profile. */
    getPublicProfile: builder.query<PublicProfileSummary, string>({
      query: (userId) => `/user-profiles/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Profile", id: userId },
      ],
    }),

    /**
     * GET /api/user-profiles/me — the caller's own id as the backend knows it.
     *
     * `author.id` on a problem is that same id, so this is what tells the page
     * whether the reader is looking at their own post.
     */
    getMyProfile: builder.query<PublicProfileSummary, void>({
      query: () => "/user-profiles/me",
      providesTags: [{ type: "Profile", id: "ME" }],
    }),

    /**
     * POST /api/v1/problems/{problemId}/solutions.
     *
     * Invalidates the problem's answer list so a freshly posted solution shows
     * up without a reload.
     */
    createSolution: builder.mutation<
      SolutionResponse,
      { problemId: string; body: CreateSolutionRequest }
    >({
      query: ({ problemId, body }) => ({
        url: `/problems/${problemId}/solutions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Solution", id: problemId },
        { type: "Solution", id: "MINE" },
        { type: "Problem", id: problemId },
      ],
    }),

    uploadSolutionAttachment: builder.mutation<
      SolutionResponse,
      { solutionId: string; version: number; file: File }
    >({
      query: ({ solutionId, version, file }) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: `/solutions/${solutionId}/attachments`,
          method: "POST",
          headers: { "If-Match": `"${version}"` },
          body,
        };
      },
      invalidatesTags: (_result, _error, { solutionId }) => [
        { type: "Solution", id: solutionId },
        { type: "Solution", id: "MINE" },
      ],
    }),

    /**
     * One answer in full for the edit form.
     *
     * The public detail endpoint keeps returning the last approved copy while
     * an edit is waiting for moderation. `/solutions/mine` is the author's
     * source of truth and carries that pending copy, so it wins when present.
     * The public detail remains the fallback and supplies expanded relations
     * that the author list may omit.
     */
    getSolutionById: builder.query<SolutionResponse, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        const [detailResult, firstMineResult] = await Promise.all([
          fetchWithBQ(`/solutions/${id}`),
          fetchWithBQ(
            `/solutions/mine?pageNumber=0&pageSize=${EDITABLE_SOLUTIONS_PAGE_SIZE}`,
          ),
        ]);

        const published = detailResult.error
          ? undefined
          : (detailResult.data as SolutionResponse | undefined);

        let minePage = firstMineResult.error
          ? undefined
          : (firstMineResult.data as Page<SolutionResponse> | undefined);
        let editable = minePage?.content.find(
          (solution) =>
            solution.id === id || solution.moderation?.revisionId === id,
        );

        /* Most authors fit on the first page. Continue only when necessary so
           an older answer still opens its pending revision correctly. */
        for (
          let pageNumber = 1;
          !editable && pageNumber < (minePage?.totalPages ?? 0);
          pageNumber += 1
        ) {
          const nextMineResult = await fetchWithBQ(
            `/solutions/mine?pageNumber=${pageNumber}&pageSize=${EDITABLE_SOLUTIONS_PAGE_SIZE}`,
          );
          if (nextMineResult.error) break;

          minePage = nextMineResult.data as Page<SolutionResponse> | undefined;
          editable = minePage?.content.find(
            (solution) =>
              solution.id === id || solution.moderation?.revisionId === id,
          );
        }

        if (editable) {
          return { data: mergeEditableSolution(published, editable) };
        }
        if (detailResult.error) return { error: detailResult.error };
        if (published) return { data: published };

        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "The solution response was empty.",
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Solution", id }],
    }),

    /**
     * PATCH /api/solutions/{id} — the author revising their own answer.
     *
     * `version` becomes the `If-Match` header, quoted the way the upstream
     * ETag is. Saving over a newer version is refused with a 412 rather than
     * silently winning.
     *
     * Editing sends the answer back through review upstream, so the author's
     * own list is invalidated alongside the problem's.
     */
    updateSolution: builder.mutation<
      SolutionResponse,
      {
        id: string;
        version: number;
        problemId?: string;
        body: UpdateSolutionRequest;
      }
    >({
      query: ({ id, version, body }) => ({
        url: `/solutions/${id}`,
        method: "PATCH",
        headers: { "If-Match": `"${version}"` },
        body,
      }),
      invalidatesTags: (_result, _error, { id, problemId }) => [
        { type: "Solution", id },
        { type: "Solution", id: "MINE" },
        ...(problemId
          ? [
              { type: "Solution" as const, id: problemId },
              { type: "Problem" as const, id: problemId },
            ]
          : []),
      ],
    }),

    /**
     * DELETE /api/solutions/{id} — the author withdrawing their own answer.
     *
     * The problem it answered is invalidated alongside the author's own list,
     * so the count under that problem drops without a reload. `problemId` is
     * optional because the caller does not always know it.
     */
    deleteSolution: builder.mutation<void, { id: string; problemId?: string }>({
      query: ({ id }) => ({ url: `/solutions/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { problemId }) => [
        { type: "Solution", id: "MINE" },
        ...(problemId
          ? [
              { type: "Solution" as const, id: problemId },
              { type: "Problem" as const, id: problemId },
            ]
          : []),
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSolutionsByProblemQuery,
  useGetMySolutionsQuery,
  useGetSolutionByIdQuery,
  useGetPublicProfileQuery,
  useGetMyProfileQuery,
  useCreateSolutionMutation,
  useUploadSolutionAttachmentMutation,
  useUpdateSolutionMutation,
  useDeleteSolutionMutation,
} = solutionsApi;
