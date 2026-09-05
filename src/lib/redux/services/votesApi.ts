import { baseApi } from "./baseApi";
import type { VoteTargetType } from "@/lib/validations/engagement";
import { crossPatchShowcaseVote } from "./showcaseCacheSync";

export interface VoteSummary {
  type: VoteTargetType;
  targetId: string;
  score: number;
  upvotes: number;
  downvotes: number;
  currentUserVote: number | null;
}

interface VoteTarget {
  type: VoteTargetType;
  targetId: string;
}

const tagFor = (type: VoteTargetType, targetId: string) =>
  ({ type: "Vote" as const, id: `${type}-${targetId}` });

export const votesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVoteSummary: builder.query<VoteSummary, VoteTarget>({
      query: ({ type, targetId }) => `/votes/${type}/${targetId}/summary`,
      providesTags: (_result, _error, { type, targetId }) => [
        tagFor(type, targetId),
      ],
    }),

    setVote: builder.mutation<unknown, VoteTarget & { value: 1 | -1 }>({
      query: ({ type, targetId, value }) => ({
        url: `/votes/${type}/${targetId}`,
        method: "PUT",
        body: { value },
      }),
      async onQueryStarted(
        { type, targetId, value },
        { dispatch, getState, queryFulfilled },
      ) {
        const showcasePatch =
          type === "SHOWCASE"
            ? crossPatchShowcaseVote(dispatch, getState, targetId, {
                type: "SET",
                value,
              })
            : null;

        const patch = dispatch(
          votesApi.util.updateQueryData(
            "getVoteSummary",
            { type, targetId },
            (draft) => {
              const previousVote = draft.currentUserVote ?? 0;
              if (previousVote === value) return;

              draft.score += value - previousVote;

              if (previousVote === 1) {
                draft.upvotes = Math.max(0, draft.upvotes - 1);
              } else if (previousVote === -1) {
                draft.downvotes = Math.max(0, draft.downvotes - 1);
              }

              if (value === 1) {
                draft.upvotes += 1;
              } else {
                draft.downvotes += 1;
              }

              draft.currentUserVote = value;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
          showcasePatch?.undo();
        }
      },
      invalidatesTags: (_result, _error, { type, targetId }) => [
        tagFor(type, targetId),
      ],
    }),

    removeVote: builder.mutation<void, VoteTarget>({
      query: ({ type, targetId }) => ({
        url: `/votes/${type}/${targetId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ type, targetId }, { dispatch, getState, queryFulfilled }) {
        const showcasePatch =
          type === "SHOWCASE"
            ? crossPatchShowcaseVote(dispatch, getState, targetId, {
                type: "REMOVE",
              })
            : null;

        const patch = dispatch(
          votesApi.util.updateQueryData(
            "getVoteSummary",
            { type, targetId },
            (draft) => {
              const previousVote = draft.currentUserVote ?? 0;
              if (previousVote === 0) return;

              draft.score -= previousVote;

              if (previousVote === 1) {
                draft.upvotes = Math.max(0, draft.upvotes - 1);
              } else if (previousVote === -1) {
                draft.downvotes = Math.max(0, draft.downvotes - 1);
              }

              draft.currentUserVote = null;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
          showcasePatch?.undo();
        }
      },
      invalidatesTags: (_result, _error, { type, targetId }) => [
        tagFor(type, targetId),
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetVoteSummaryQuery,
  useSetVoteMutation,
  useRemoveVoteMutation,
} = votesApi;
