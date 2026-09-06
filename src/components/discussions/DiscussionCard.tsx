"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FilePen,
  Flame,
  MessageSquare,
  Pencil,
  Trash2,
  XCircle,
  ZoomIn,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { VoteControl } from "@/components/ui/vote-control";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
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
  useAddBookmarkMutation,
  useGetBookmarkStatusQuery,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";
import {
  useGetVoteSummaryQuery,
  useRemoveVoteMutation,
  useSetVoteMutation,
} from "@/lib/redux/services/votesApi";
import { useGetPublicProfileQuery } from "@/lib/redux/services/solutionsApi";
import { useDeleteShowcaseMutation } from "@/lib/redux/services/showcasesApi";
import type { DiscussionPost } from "@/lib/types/dicussion/types";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { useRelativeTime } from "@/lib/i18n/relative-time";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  MY_COMMUNITY_HREF,
  type MySolutionStatus,
} from "@/hooks/useMySolutionStatus";
import { getTopicColor } from "./topic-colors";
import { cn } from "@/lib/utils";

interface DiscussionCardProps {
  post: DiscussionPost;
  index?: number;
  myAnswer?: MySolutionStatus;
  variant?: "feed" | "card";
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  post,
  index = 0,
  myAnswer,
  variant = "feed",
  className,
}) => {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const t = useT();
  const lp = useLocalePath();
  const relativeTime = useRelativeTime();
  const router = useRouter();

  const isShowcase = post.category === "Showcase";
  const bookmarkableType = isShowcase ? "SHOWCASE" : "PROBLEM";

  const { data: voteSummary } = useGetVoteSummaryQuery(
    {
      type: bookmarkableType,
      targetId: post.id,
    },
    {
      skip: isShowcase && post.engagement !== undefined && post.viewer !== undefined,
    },
  );
  const [setVote, { isLoading: isSettingVote }] = useSetVoteMutation();
  const [removeVote, { isLoading: isRemovingVote }] = useRemoveVoteMutation();
  const { data: bookmarkStatus } = useGetBookmarkStatusQuery(
    {
      type: bookmarkableType,
      targetId: post.id,
    },
    {
      skip: isShowcase && post.viewer !== undefined,
    },
  );
  const [addBookmark, { isLoading: isAddingBookmark }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemovingBookmark }] = useRemoveBookmarkMutation();
  const [deleteShowcase, { isLoading: isDeletingShowcase }] = useDeleteShowcaseMutation();

  const isVoting = isSettingVote || isRemovingVote;
  const isBookmarking = isAddingBookmark || isRemovingBookmark;

  const currentUserVote =
    isShowcase && post.viewer
      ? (post.viewer.vote === "UP" ? 1 : post.viewer.vote === "DOWN" ? -1 : 0)
      : (voteSummary ? (voteSummary.currentUserVote ?? 0) : (post.isUpvoted ? 1 : 0));

  const upvoteCount =
    isShowcase && post.engagement
      ? post.engagement.upvoteCount
      : voteSummary?.upvotes;

  const downvoteCount =
    isShowcase && post.engagement
      ? post.engagement.downvoteCount
      : voteSummary?.downvotes;

  const voteScore =
    isShowcase && post.engagement
      ? post.engagement.voteScore
      : (voteSummary?.score ?? post.votes ?? 0);

  const bookmarkCount =
    isShowcase && post.engagement
      ? post.engagement.bookmarkCount
      : 0;

  const localBookmarked =
    isShowcase && post.viewer
      ? Boolean(post.viewer.bookmarked)
      : (bookmarkStatus ?? post.isBookmarked ?? false);

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const handleVote = async (value: 1 | -1) => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/community",
      );
      return;
    }
    if (isVoting) return;

    if (currentUserVote === value) {
      try {
        await removeVote({
          type: bookmarkableType,
          targetId: post.id,
        }).unwrap();
      } catch {
        toast.error("Failed to remove vote.");
      }
      return;
    }

    try {
      await setVote({
        type: bookmarkableType,
        targetId: post.id,
        value,
      }).unwrap();
    } catch {
      toast.error("Failed to record your vote.");
    }
  };

  const handleBookmark = async () => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/community",
      );
      return;
    }
    if (isBookmarking) return;

    try {
      if (localBookmarked) {
        await removeBookmark({ type: bookmarkableType, targetId: post.id }).unwrap();
        toast.success("Bookmark removed.");
      } else {
        await addBookmark({ type: bookmarkableType, targetId: post.id }).unwrap();
        toast.success("Saved to bookmarks.");
      }
    } catch {
      toast.error("Failed to update bookmark.");
    }
  };

  const handleDeleteShowcase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteShowcase(post.id).unwrap();
      toast.success("Showcase deleted.");
      setIsConfirmingDelete(false);
    } catch {
      toast.error("Failed to delete showcase.");
    }
  };

  const targetHref = lp(
    isShowcase ? `/showcases/${post.id}` : `/community/${post.id}`,
  );
  const answerNoun = t(
    isShowcase ? "community.card.comments" : "community.card.answers",
  );
  const tags = isShowcase && post.techStack ? post.techStack : post.tags;
  const titleId = `discussion-title-${post.id}`;
  const topicColor = getTopicColor(post.topic || post.category);
  const topicLabel = post.topic || (isShowcase ? "Showcase" : "Problems");

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button'], [role='dialog']")) {
      return;
    }
    router.push(targetHref);
  };

  const { data: authorProfile } = useGetPublicProfileQuery(post.author.id ?? "", {
    skip: Boolean(post.author.name && post.author.avatarUrl) || !post.author.id,
  });
  const authorName =
    post.author.name ||
    authorProfile?.fullName ||
    "Community Member";
  const authorProfileHref = post.author.id
    ? lp(`/profile/${post.author.id}`)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(index * 0.04, 0.25) }}
      role="article"
      aria-labelledby={titleId}
      onClick={handleCardClick}
      className={cn(
        variant === "card"
          ? "group relative flex flex-col justify-between rounded-2xl bg-card text-card-foreground p-5 sm:p-6 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-2xs hover:shadow-md hover:ring-foreground/15 transition-all duration-200 cursor-pointer h-full border-0"
          : "group relative border-b border-border/60 last:border-b-0 p-4 sm:p-6 transition-colors hover:bg-muted/30 cursor-pointer",
        className,
      )}
    >
      <Link
        href={targetHref}
        className="absolute inset-0 z-0 outline-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className={cn("relative pointer-events-none flex flex-col gap-3 sm:gap-3.5", variant === "card" && "h-full justify-between")}>
        {/* Top Header: Author info, Topic & Badges on left; Owner affordances & Bookmark on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pointer-events-auto">
            <div className="relative shrink-0">
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary block"
                >
                  <CardAuthorAvatar author={post.author} />
                </Link>
              ) : (
                <CardAuthorAvatar author={post.author} />
              )}
              {post.status === "Solved" ? (
                <span
                  title="Solved"
                  className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs"
                >
                  <CheckCircle2 className="size-2.5" />
                </span>
              ) : post.author.reputation && post.author.reputation > 500 ? (
                <span
                  title="Top Contributor"
                  className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-xs"
                >
                  ★
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 text-xs sm:text-sm">
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-[200px]"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                  {authorName}
                </span>
              )}
              <span className="text-muted-foreground/60 text-xs">·</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <span
                  className="size-1.5 sm:size-2 rounded-full shrink-0"
                  style={{ backgroundColor: topicColor }}
                  aria-hidden="true"
                />
                <span>{topicLabel}</span>
              </span>
              <span className="text-muted-foreground/60 text-xs">·</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {relativeTime(post.sortTimestamp)}
              </span>

              {/* Showcase Owner Badge: "Yours" */}
              {isShowcase && post.viewer?.owner && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Yours
                </span>
              )}

              {/* Showcase Pending Edit Badge */}
              {isShowcase && post.hasUnpublishedRevision && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <FilePen className="size-3" aria-hidden="true" />
                  <span>Edit awaiting review</span>
                </span>
              )}
            </div>
          </div>

          {/* Top Right: Solved Badge, Edit/Delete affordances & Bookmark button */}
          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
            {post.status === "Solved" && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                <span>Solved</span>
              </span>
            )}

            {/* Owner affordances: Edit button */}
            {isShowcase && post.viewer?.canEdit && (
              <Link
                href={lp(`/dashboard/showcases/${post.id}/edit`)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 px-2 sm:px-2.5 rounded-xl text-xs font-semibold gap-1 hover:bg-muted text-foreground cursor-pointer shadow-2xs border-border/80",
                )}
                title="Edit showcase"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            )}

            {/* Owner affordances: Delete button */}
            {isShowcase && post.viewer?.canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(true);
                }}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                title="Delete showcase"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            )}

            {/* Bookmark button */}
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={handleBookmark}
              disabled={isBookmarking}
              aria-pressed={localBookmarked}
              aria-label={t(
                localBookmarked
                  ? "community.card.removeBookmark"
                  : "community.card.bookmark",
              )}
              className={cn(
                "rounded-xl cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                localBookmarked && "text-primary hover:text-primary",
              )}
            >
              <Bookmark
                aria-hidden="true"
                className={cn("size-4", localBookmarked && "fill-current")}
              />
            </Button>
          </div>
        </div>

        {/* Rejection / Status notice if relevant */}
        {myAnswer && myAnswer.review === "REJECTED" && (
          <div className="pointer-events-auto relative z-10">
            <Link
              href={MY_COMMUNITY_HREF}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
                "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
              )}
            >
              <XCircle aria-hidden="true" className="size-3.5" />
              {t("community.card.answerRejected")}
            </Link>
          </div>
        )}

        {/* Title */}
        <h3
          id={titleId}
          className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary break-words [word-break:break-word] leading-snug"
        >
          <Link
            href={targetHref}
            className="pointer-events-auto hover:text-primary transition-colors focus:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        {/* Description */}
        {post.description && (
          <p className="line-clamp-2 sm:line-clamp-3 text-sm sm:text-base leading-relaxed text-muted-foreground break-words [word-break:break-word]">
            {post.description}
          </p>
        )}

        {/* Showcase Media Preview - Shows full uncropped photo with click to preview */}
        {isShowcase && post.thumbnailUrl && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Preview full showcase image"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPreviewImage({
                src: post.thumbnailUrl!,
                alt: post.title,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                setPreviewImage({
                  src: post.thumbnailUrl!,
                  alt: post.title,
                });
              }
            }}
            className="relative pointer-events-auto w-full aspect-[16/10] sm:aspect-[16/9] max-h-[440px] min-h-[200px] overflow-hidden rounded-xl border border-border/80 bg-blue-950/20 dark:bg-blue-950/40 my-2 group/media flex items-center justify-center cursor-zoom-in transition-all hover:border-primary/50 shadow-2xs"
          >
            {/* Ambient blurred backdrop so any aspect ratio fills seamlessly */}
            <Image
              src={post.thumbnailUrl}
              alt=""
              fill
              aria-hidden="true"
              sizes="100px"
              quality={20}
              className="object-cover blur-2xl opacity-40 dark:opacity-30 scale-110 pointer-events-none select-none"
            />

            {/* Soft blue ambient glow overlay */}
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/15 mix-blend-overlay pointer-events-none" />

            {/* Full uncropped photo */}
            <Image
              src={post.thumbnailUrl}
              alt={`${post.title} ${t("community.card.preview")}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 850px"
              quality={95}
              className="object-contain p-1.5 sm:p-2.5 transition-transform duration-300 group-hover/media:scale-[1.015]"
            />

            {/* Click to preview floating badge */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 pointer-events-none z-10">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/90 text-[11px] font-semibold text-foreground shadow-xs border border-border/80 backdrop-blur-xs group-hover/media:bg-primary group-hover/media:text-primary-foreground group-hover/media:border-primary transition-all">
                <ZoomIn className="size-3.5" />
                <span>Preview</span>
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 pt-0.5"
            aria-label={t("community.card.tags")}
          >
            {tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="tag"
                className="rounded-md font-mono text-xs font-medium bg-muted/50 hover:bg-muted text-muted-foreground border-border/70 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 5 && (
              <span className="text-xs text-muted-foreground font-mono self-center px-1">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className={cn("flex items-center justify-between gap-3 pt-2.5 sm:pt-3 border-t border-border/40 text-muted-foreground", variant === "card" && "mt-auto")}>
          {isShowcase ? (
            /* Showcase Card Footer: Vote buttons + score · bookmarks · comments · views */
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap pointer-events-auto">
              {/* Compact Card-level Vote Action (Up/Down) */}
              <div className="inline-flex items-center rounded-xl border border-border/70 bg-card p-0.5 shadow-2xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(1)}
                  disabled={isVoting}
                  aria-pressed={currentUserVote === 1}
                  aria-label="Upvote showcase"
                  className={cn(
                    "size-7.5 rounded-lg transition-colors cursor-pointer",
                    currentUserVote === 1
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <div className="h-4 w-px bg-border/60 mx-0.5" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(-1)}
                  disabled={isVoting}
                  aria-pressed={currentUserVote === -1}
                  aria-label="Downvote showcase"
                  className={cn(
                    "size-7.5 rounded-lg transition-colors cursor-pointer",
                    currentUserVote === -1
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>

              {/* Stats row: score (engagement.voteScore) · bookmarks · comments · views */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs text-muted-foreground">
                {/* Score with its own Flame icon, negative scores not clamped to 0 */}
                <span
                  title="Vote Score"
                  className={cn(
                    "inline-flex items-center gap-1 font-bold tabular-nums",
                    voteScore > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : voteScore < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-foreground",
                  )}
                >
                  <Flame className="size-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                  <span>{voteScore > 0 ? `+${voteScore}` : voteScore} score</span>
                </span>

                <span className="text-muted-foreground/60">·</span>

                {/* Bookmarks */}
                <span className="inline-flex items-center gap-1 font-medium">
                  <Bookmark className="size-3.5 text-muted-foreground/80 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">
                    {bookmarkCount} {bookmarkCount === 1 ? "bookmark" : "bookmarks"}
                  </span>
                </span>

                <span className="text-muted-foreground/60">·</span>

                {/* Comments */}
                <Link
                  href={targetHref}
                  className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors"
                >
                  <MessageSquare className="size-3.5 text-muted-foreground/80 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">
                    {post.answersCount} {post.answersCount === 1 ? "comment" : "comments"}
                  </span>
                </Link>

                {/* Views */}
                {post.viewsCount !== undefined && (
                  <>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Eye className="size-3.5 text-muted-foreground/80 shrink-0" aria-hidden="true" />
                      <span className="tabular-nums">{post.viewsCount.toLocaleString()} views</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Problem Card Footer */
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <VoteControl
                voteCount={voteScore}
                upvotes={upvoteCount}
                downvotes={downvoteCount}
                currentVote={currentUserVote}
                onVote={handleVote}
                isLoading={isVoting}
                upvoteLabel={t("community.card.upvote")}
                downvoteLabel={t("community.card.downvote")}
                className="pointer-events-auto"
              />

              <Link
                href={targetHref}
                className="pointer-events-auto inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-2xs active:scale-98"
              >
                <MessageSquare
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground/80 shrink-0"
                />
                <span>
                  {post.answersCount} {answerNoun}
                </span>
              </Link>

              {post.viewsCount !== undefined && post.viewsCount > 0 && (
                <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1.5">
                  <Eye className="size-3.5 text-muted-foreground/70" />
                  <span>{post.viewsCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Participant Avatars Stack */}
          <div className="pointer-events-auto">
            <ParticipantAvatarStack
              author={post.author}
              answersCount={post.answersCount}
            />
          </div>
        </div>
      </div>

      {/* Full Photo Lightbox Preview */}
      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt}
        title={previewImage?.alt}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete showcase?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The showcase and its build steps will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingShowcase}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShowcase}
              disabled={isDeletingShowcase}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeletingShowcase ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.article>
  );
};

function CardAuthorAvatar({
  author,
}: {
  author: DiscussionPost["author"];
}) {
  const t = useT();
  const { data: profile } = useGetPublicProfileQuery(author.id ?? "", {
    skip: Boolean(author.avatarUrl) || !author.id,
  });

  const avatarUrl = author.avatarUrl || profile?.avatarUrl;
  const name = author.name || profile?.fullName || "Community Member";

  return (
    <Avatar className="size-9 sm:size-10 rounded-full border-2 border-background shadow-xs ring-1 ring-border/80">
      <AvatarImage
        src={avatarUrl}
        alt={`${name} — ${t("community.card.avatarOf")}`}
      />
      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function ParticipantAvatarStack({
  author,
  answersCount,
}: {
  author: DiscussionPost["author"];
  answersCount: number;
}) {
  if (answersCount <= 0) return null;

  const initialsList = [
    getInitials(author.name || "User"),
    "JD",
    "AK",
  ].slice(0, Math.min(3, answersCount + 1));

  return (
    <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
      {initialsList.map((initials, i) => (
        <span
          key={i}
          className="inline-flex size-6 sm:size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground shadow-2xs"
        >
          {initials}
        </span>
      ))}
      {answersCount > 3 && (
        <span className="inline-flex size-6 sm:size-7 items-center justify-center rounded-full border-2 border-card bg-muted/80 text-[10px] font-semibold text-muted-foreground">
          +{answersCount - 2}
        </span>
      )}
    </div>
  );
}
