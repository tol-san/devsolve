import type { CommentableType } from "@/lib/validations/engagement";

export interface CreateCommentBody {
  commentableType: CommentableType;
  commentableId: string;
  content: string;
  parentCommentId: string | null;
  internal: boolean;
  mentionedUserIds: string[];
}

export interface CreateCommentInput {
  commentableType: CommentableType;
  commentableId: string;
  content: string;
  parentCommentId?: string | null;
  internal?: boolean;
  mentionedUserIds?: string[];
}

export function buildCreateCommentBody(
  input: CreateCommentInput,
): CreateCommentBody {
  return {
    commentableType: input.commentableType,
    commentableId: input.commentableId,
    content: input.content,
    parentCommentId: input.parentCommentId ?? null,
    internal: input.internal ?? false,
    mentionedUserIds: input.mentionedUserIds ?? [],
  };
}
