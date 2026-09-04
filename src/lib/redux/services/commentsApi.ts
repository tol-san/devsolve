import { baseApi } from "./baseApi";
import type { Page } from "./showcasesApi";
import type {
  CommentableType,
  CommentSort,
} from "@/lib/validations/engagement";
import {
  buildCreateCommentBody,
  type CreateCommentInput,
} from "@/lib/comments/payload";

export interface CommentResponse {
  id: string;
  commentableType: CommentableType;
  commentableId: string;
  parentCommentId?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  internal?: boolean;
  replyCount?: number;
  voteScore?: number;
  upvoteCount?: number;
  downvoteCount?: number;
  myVote?: number;
  edited?: boolean;
  editedAt?: string;
  removed?: boolean;
  removalReason?: "AUTHOR" | "MODERATOR";
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentThreadResponse {
  comment: CommentResponse;
  replies: CommentResponse[];
  replyCount: number;
  hasMoreReplies: boolean;
}

interface CommentTarget {
  commentableType: CommentableType;
  commentableId: string;
}

interface CommentThreadParams extends CommentTarget {
  sort?: CommentSort;
  replyLimit?: number;
  pageNumber?: number;
  pageSize?: number;
}

interface CommentListParams extends CommentTarget {
  parentCommentId?: string;
  sort?: CommentSort;
  pageNumber?: number;
  pageSize?: number;
}

export type { CreateCommentBody } from "@/lib/comments/payload";

export type CreateCommentRequest = CreateCommentInput;

function params(source: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== "") out[key] = String(value);
  }
  return out;
}

const tagFor = (type: CommentableType, id: string) =>
  ({ type: "Comment" as const, id: `${type}-${id}` });

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommentById: builder.query<CommentResponse, string>({
      query: (id) => `/comments/${id}`,
      providesTags: (result) =>
        result
          ? [tagFor(result.commentableType, result.commentableId)]
          : [],
    }),

    getCommentThread: builder.query<
      Page<CommentThreadResponse>,
      CommentThreadParams
    >({
      query: (args) => ({ url: "/comments/thread", params: params(args) }),
      providesTags: (_result, _error, { commentableType, commentableId }) => [
        tagFor(commentableType, commentableId),
      ],
    }),

    getComments: builder.query<Page<CommentResponse>, CommentListParams>({
      query: (args) => ({ url: "/comments", params: params(args) }),
      providesTags: (_result, _error, { commentableType, commentableId }) => [
        tagFor(commentableType, commentableId),
      ],
    }),

    createComment: builder.mutation<CommentResponse, CreateCommentRequest>({
      query: (input) => ({
        url: "/comments",
        method: "POST",
        body: buildCreateCommentBody(input),
      }),
      invalidatesTags: (_result, _error, { commentableType, commentableId }) => [
        tagFor(commentableType, commentableId),
      ],
    }),

    updateComment: builder.mutation<
      CommentResponse,
      CommentTarget & { id: string; content: string }
    >({
      query: ({ id, content }) => ({
        url: `/comments/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { commentableType, commentableId }) => [
        tagFor(commentableType, commentableId),
      ],
    }),

    deleteComment: builder.mutation<void, CommentTarget & { id: string }>({
      query: ({ id }) => ({ url: `/comments/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { commentableType, commentableId }) => [
        tagFor(commentableType, commentableId),
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCommentByIdQuery,
  useLazyGetCommentByIdQuery,
  useGetCommentThreadQuery,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
