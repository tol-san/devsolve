import { baseApi } from "./baseApi";
import type { Page } from "./showcasesApi";
import type {
  ApproachType,
  CreateSolutionRequest,
  ResourceType,
  UpdateSolutionRequest,
} from "@/lib/validations/solution";
import type { AuthorSummary } from "./problemsApi";

export type { ApproachType, ResourceType };

export interface VerificationStep {
  instruction?: string;
  expectedResult?: string;
}

export interface TestedWith {
  technology?: string;
  version?: string;
}

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

export interface ModerationDetails {
  revisionId?: string;
  revisionNumber?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

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
  version?: number;
  viewerOwnsSolution?: boolean;
  moderation?: ModerationDetails;
  createdAt: string;
  updatedAt?: string;
}

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

    getPublicProfile: builder.query<PublicProfileSummary, string>({
      query: (userId) => `/user-profiles/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Profile", id: userId },
      ],
    }),

    getMyProfile: builder.query<PublicProfileSummary, void>({
      query: () => "/user-profiles/me",
      providesTags: [{ type: "Profile", id: "ME" }],
    }),

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
          headers: { "X-If-Match": `"${version}"` },
          body,
        };
      },
      invalidatesTags: (_result, _error, { solutionId }) => [
        { type: "Solution", id: solutionId },
        { type: "Solution", id: "MINE" },
      ],
    }),

    deleteSolutionAttachment: builder.mutation<
      void,
      { solutionId: string; version: number; attachmentId: string }
    >({
      query: ({ solutionId, version, attachmentId }) => ({
        url: `/solutions/${solutionId}/attachments/${attachmentId}`,
        method: "DELETE",
        headers: { "X-If-Match": `"${version}"` },
      }),
      invalidatesTags: (_result, _error, { solutionId }) => [
        { type: "Solution", id: solutionId },
        { type: "Solution", id: "MINE" },
      ],
    }),

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
        headers: { "X-If-Match": `"${version}"` },
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
  useDeleteSolutionAttachmentMutation,
  useUpdateSolutionMutation,
  useDeleteSolutionMutation,
} = solutionsApi;
