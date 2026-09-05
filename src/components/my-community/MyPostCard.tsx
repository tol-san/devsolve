"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Bookmark,
  Eye,
  FilePen,
  Flame,
  ImageOff,
  LoaderCircle,
  MessageSquare,
  Pencil,
  SendHorizontal,
  SquareArrowOutUpRight,
  Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  useDeleteProblemMutation,
  useSubmitProblemMutation,
} from "@/lib/redux/services/problemsApi";
import { useDeleteSolutionMutation } from "@/lib/redux/services/solutionsApi";
import { useDeleteShowcaseMutation } from "@/lib/redux/services/showcasesApi";
import { useDeleteShowcaseDraftMutation } from "@/lib/redux/services/showcaseDraftsApi";
import { useDeleteSolutionDraftMutation } from "@/lib/redux/services/solutionDraftsApi";
import type { MyPost } from "@/lib/redux/services/myCommunityApi";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<MyPost["kind"], string> = {
  Problem: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
  Solution: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  Showcase: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
};

const STATE_STYLES: Record<MyPost["state"]["tone"], string> = {
  live: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  blocked:
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  draft:
    "bg-muted text-muted-foreground border border-border",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DELETE_COPY: Record<MyPost["kind"], string> = {
  Problem:
    "Answers already posted under it go with it, and anyone holding a link will find nothing there.",
  Solution:
    "The problem stays; only your answer to it is withdrawn. If it was the accepted one, that problem goes back to unsolved.",
  Showcase:
    "This one is not reversible — the showcase and its build steps are destroyed.",
};

export function MyPostCard({ post }: { post: MyPost }) {
  const [confirming, setConfirming] = useState(false);

  const [deleteProblem, { isLoading: deletingProblem }] =
    useDeleteProblemMutation();
  const [deleteSolution, { isLoading: deletingSolution }] =
    useDeleteSolutionMutation();
  const [deleteShowcase, { isLoading: deletingShowcase }] =
    useDeleteShowcaseMutation();
  const [deleteShowcaseDraft, { isLoading: deletingShowcaseDraft }] =
    useDeleteShowcaseDraftMutation();
  const [deleteSolutionDraft, { isLoading: deletingSolutionDraft }] =
    useDeleteSolutionDraftMutation();

  const [submitProblem, { isLoading: submitting }] = useSubmitProblemMutation();

  const deleting =
    deletingProblem ||
    deletingSolution ||
    deletingShowcase ||
    deletingShowcaseDraft ||
    deletingSolutionDraft;

  const onSubmitForReview = async () => {
    try {
      await submitProblem(post.id).unwrap();
      toast.success("Sent for review.", {
        description: "A moderator will look at it before it goes live.",
      });
    } catch (caught) {
      toast.error(
        messageOf(caught, "This problem could not be sent for review."),
      );
    }
  };

  const onDelete = async () => {
    try {
      if (post.isDraft) {
        if (post.kind === "Showcase") {
          await deleteShowcaseDraft(post.id).unwrap();
        } else if (post.kind === "Solution") {
          await deleteSolutionDraft(post.id).unwrap();
        } else {
          await deleteProblem(post.id).unwrap();
        }
      } else {
        if (post.kind === "Problem") {
          await deleteProblem(post.id).unwrap();
        } else if (post.kind === "Solution") {
          await deleteSolution({ id: post.id, problemId: post.problemId }).unwrap();
        } else {
          await deleteShowcase(post.id).unwrap();
        }
      }

      toast.success(`${post.kind} deleted.`, { description: post.title });
      setConfirming(false);
    } catch (caught) {
      toast.error(messageOf(caught, `The ${post.kind.toLowerCase()} could not be deleted.`));
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 shadow-xs transition-all sm:flex-row sm:p-5 text-card-foreground hover:ring-blue-500/30"
    >
      {post.kind === "Showcase" && (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:w-40 dark:border-slate-700 dark:bg-slate-800">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              quality={90}
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-slate-400">
              <ImageOff aria-hidden="true" className="size-5" />
            </span>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-lg px-2.5 py-0.5 text-xs font-semibold",
              KIND_STYLES[post.kind],
            )}
          >
            {post.kind}
          </span>
          <span
            className={cn(
              "rounded-lg px-2.5 py-0.5 text-xs font-semibold",
              STATE_STYLES[post.state.tone],
            )}
          >
            {post.state.label}
          </span>
          {post.hasPendingEdit && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <FilePen className="size-3" aria-hidden="true" />
              Edit awaiting review
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {post.excerpt}
          </p>
        </div>

        {post.note && (
          <p className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-relaxed text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{post.note}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            {post.kind === "Showcase" && (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-semibold tabular-nums",
                    (post.votes ?? 0) > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : (post.votes ?? 0) < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <Flame className="size-3.5 text-amber-500" aria-hidden="true" />
                  <span>{(post.votes ?? 0) > 0 ? `+${post.votes}` : (post.votes ?? 0)}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Bookmark className="size-3.5" aria-hidden="true" />
                  <span>{post.bookmarks ?? 0}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  <span>{post.comments ?? 0}</span>
                </span>
                <span>·</span>
              </>
            )}
            {post.views !== undefined && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" aria-hidden="true" />
                  {post.views.toLocaleString()}
                </span>
                <span>·</span>
              </>
            )}
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {post.href && (
              <Link
                href={post.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-xl",
                )}
              >
                <SquareArrowOutUpRight
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                View
              </Link>
            )}

            {post.editHref ? (
              <Link
                href={post.editHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-xl",
                )}
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                Edit
              </Link>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                title="This answer is not attached to a problem, so it has no edit page"
                className="rounded-xl"
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                Edit
              </Button>
            )}

            {post.canSubmit && (
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                onClick={() => void onSubmitForReview()}
                className="cursor-pointer rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {submitting ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <SendHorizontal data-icon="inline-start" aria-hidden="true" />
                )}
                Submit for review
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${post.title}`}
              className="cursor-pointer rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              {deleting ? (
                <LoaderCircle
                  data-icon="inline-start"
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Trash2 data-icon="inline-start" aria-hidden="true" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={confirming}
        onOpenChange={(open) => !open && !deleting && setConfirming(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{post.title}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_COPY[post.kind]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void onDelete();
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.article>
  );
}

function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
