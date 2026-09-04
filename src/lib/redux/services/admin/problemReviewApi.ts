import { baseApi } from "../baseApi";
import type { ProblemResponse } from "../problemsApi";
import type { Page } from "../showcasesApi";
import type {
  ProblemModerationRequest,
  ProblemStatus,
} from "@/lib/validations/problem";

export interface ProblemReviewQueueParams {
  status?: ProblemStatus;
  page?: number;
  size?: number;
  sort?: string;
}

function params(source: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== "") out[key] = String(value);
  }
  return out;
}

const QUEUE = "QUEUE";

export const problemReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProblemReviewQueue: builder.query<
      Page<ProblemResponse>,
      ProblemReviewQueueParams | void
    >({
      query: (args) => ({
        url: "/admin/problems",
        params: params(args ?? {}),
      }),
      providesTags: [{ type: "ProblemReview", id: QUEUE }],
    }),

    updateProblemModeration: builder.mutation<
      ProblemResponse,
      { id: string; body: ProblemModerationRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/problems/${id}/moderation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProblemReview", id },
        { type: "ProblemReview", id: QUEUE },
        { type: "Problem", id },
        { type: "Discussion", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProblemReviewQueueQuery,
  useUpdateProblemModerationMutation,
} = problemReviewApi;
