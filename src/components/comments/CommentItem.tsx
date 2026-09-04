"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ChevronDown,
  CornerDownRight,
  Flag,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CommentResponse } from "@/lib/redux/services/commentsApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { CommentComposer } from "./CommentComposer";
import { ReportCommentDialog } from "./ReportCommentDialog";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function timeAgo(value?: string): string {
  if (!value) return "";
  const date = new Date(/[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function CommentItem({
  comment,
  isReply,
  replyingTo,
  isSignedIn,
  onReply,
  onEdit,
  onDelete,
  isBusy,
  children,
}: {
  comment: CommentResponse;
  isReply?: boolean;
  replyingTo?: string;
  isSignedIn?: boolean;
  onReply?: (content: string) => Promise<void>;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  isBusy?: boolean;
  children?: React.ReactNode;
}) {
  const [mode, setMode] = useState<"idle" | "replying" | "editing">("idle");
  const [draft, setDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [pending, setPending] = useState(false);

  const { handleLogin } = useKeycloakLogin();
  const lp = useLocalePath();

  const profileHref = comment.authorId
    ? lp(`/profile/${comment.authorId}`)
    : null;
  const viewProfileLabel = `View ${comment.authorName || "this member"}'s profile`;

  const avatar = comment.authorAvatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={comment.authorAvatarUrl}
      alt=""
      className={cn(
        "shrink-0 rounded-full bg-muted object-cover",
        isReply ? "size-7" : "size-9",
      )}
    />
  ) : (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-bold text-blue-700 dark:text-blue-300",
        isReply ? "size-7 text-xs" : "size-9 text-sm",
      )}
    >
      {initialsOf(comment.authorName || "?")}
    </span>
  );

  const startEditing = () => {
    setDraft(comment.content);
    setMode("editing");
  };

  const startReplying = () => {
    if (!isSignedIn) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/",
      );
      return;
    }
    setDraft("");
    setMode("replying");
  };

  const isOwn = comment.canEdit || comment.canDelete;
  const canReport = isSignedIn === true && !isOwn;
  const hasActions = Boolean(comment.canEdit || comment.canDelete || canReport);

  const submit = async () => {
    const content = draft.trim();
    if (!content) return;

    setPending(true);
    try {
      if (mode === "editing") await onEdit(content);
      else if (mode === "replying" && onReply) await onReply(content);
      setMode("idle");
      setDraft("");
    } finally {
      setPending(false);
    }
  };

  if (comment.removed) {
    return (
      <div
        id={`comment-${comment.id}`}
        className={cn("flex scroll-mt-24 gap-3", isReply && "pl-3")}
      >
        <span className="mt-1 size-8 shrink-0 rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm italic text-muted-foreground">
            {comment.removalReason === "MODERATOR"
              ? "This comment was removed by a moderator."
              : "This comment was deleted by its author."}
          </p>
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={`comment-${comment.id}`}
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex scroll-mt-24 gap-3 rounded-2xl target:bg-primary/5 target:ring-2 target:ring-primary/30"
    >
      {profileHref ? (
        <Link
          href={profileHref}
          aria-label={viewProfileLabel}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        <div className="group/comment rounded-2xl bg-muted/50 px-4 py-3">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="text-sm font-bold text-foreground transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                >
                  {comment.authorName || "Unknown"}
                </Link>
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {comment.authorName || "Unknown"}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {timeAgo(comment.createdAt)}
              </span>
              {comment.edited && (
                <span
                  className="text-sm text-muted-foreground"
                  title={
                    comment.editedAt
                      ? `Edited ${timeAgo(comment.editedAt)}`
                      : undefined
                  }
                >
                  · edited
                </span>
              )}
              {comment.internal && (
                <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Internal
                </span>
              )}
            </div>

            {hasActions && mode !== "editing" && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Actions for ${comment.authorName || "this comment"}'s comment`}
                  disabled={isBusy}
                  className="-mr-1 -mt-0.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 data-[popup-open]:bg-foreground/10 data-[popup-open]:text-foreground"
                >
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <MoreVertical className="size-4" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {comment.canEdit && (
                    <DropdownMenuItem
                      onClick={startEditing}
                      className="cursor-pointer"
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {comment.canDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmingDelete(true)}
                      className="cursor-pointer"
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {canReport && (
                    <DropdownMenuItem
                      onClick={() => setReporting(true)}
                      className="cursor-pointer"
                    >
                      <Flag />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {replyingTo && (
            <p className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
              <CornerDownRight aria-hidden="true" className="size-3.5" />
              Replying to{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                @{replyingTo}
              </span>
            </p>
          )}

          {mode === "editing" ? (
            <div className="pt-1">
              <CommentComposer
                value={draft}
                onChange={setDraft}
                onSubmit={submit}
                onCancel={() => setMode("idle")}
                isSubmitting={pending}
                submitLabel="Save"
                placeholder="Edit your comment…"
                autoFocus
                compact
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap wrap-break-word text-base leading-relaxed text-foreground">
              {comment.content}
            </p>
          )}
        </div>

        {onReply && mode === "idle" && (
          <button
            type="button"
            onClick={startReplying}
            className="mt-1 ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            <CornerDownRight className="size-3.5" />
            Reply
          </button>
        )}

        {mode === "replying" && (
          <div className="mt-2">
            <CommentComposer
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              onCancel={() => setMode("idle")}
              isSubmitting={pending}
              submitLabel="Reply"
              placeholder={`Reply to ${comment.authorName || "this comment"}…`}
              autoFocus
              compact
            />
          </div>
        )}

        {children}
      </div>

      <ReportCommentDialog
        commentId={comment.id}
        authorName={comment.authorName}
        open={reporting}
        onOpenChange={setReporting}
      />

      <AlertDialog
        open={confirmingDelete}
        onOpenChange={(open) => !open && setConfirmingDelete(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              {comment.replyCount
                ? "Replies to it stay in the thread, but what you wrote is removed."
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                setConfirmingDelete(false);
                void onDelete();
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export function ShowMoreReplies({
  remaining,
  isLoading,
  onClick,
}: {
  remaining: number;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-blue-600 transition-colors hover:underline disabled:opacity-60 dark:text-blue-400"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
      ) : (
        <ChevronDown className="size-4" />
      )}
      {remaining === 1 ? "Show 1 more reply" : `Show ${remaining} more replies`}
    </button>
  );
}
