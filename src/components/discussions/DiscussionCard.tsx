"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Bookmark,
  CheckCircle2,
  Eye,
  MessageSquare,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteControl } from "@/components/ui/vote-control";
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
}) => {
  const t = useT();
  const lp = useLocalePath();
  const relativeTime = useRelativeTime();
  const bookmarkableType =
    post.category === "Showcase" ? "SHOWCASE" : "PROBLEM";

  const { data: voteSummary } = useGetVoteSummaryQuery({
    type: bookmarkableType,
    targetId: post.id,
  });
  const [setVote, { isLoading: isSettingVote }] = useSetVoteMutation();
  const [removeVote, { isLoading: isRemovingVote }] = useRemoveVoteMutation();
  const { data: bookmarkStatus } = useGetBookmarkStatusQuery({
    type: bookmarkableType,
    targetId: post.id,
  });
  const [addBookmark, { isLoading: isAddingBookmark }] =
    useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemovingBookmark }] =
    useRemoveBookmarkMutation();
  const isVoting = isSettingVote || isRemovingVote;
  const isBookmarking = isAddingBookmark || isRemovingBookmark;

  const currentUserVote = voteSummary
    ? (voteSummary.currentUserVote ?? 0)
    : (post.isUpvoted ? 1 : 0);
  const upvoteCount = voteSummary?.upvotes;
  const downvoteCount = voteSummary?.downvotes;
  const voteScore = voteSummary?.score ?? post.votes ?? 0;
  const localBookmarked = bookmarkStatus ?? post.isBookmarked ?? false;

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
      await removeVote({
        type: bookmarkableType,
        targetId: post.id,
      }).unwrap();
      return;
    }

    await setVote({
      type: bookmarkableType,
      targetId: post.id,
      value,
    }).unwrap();
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

    const result = localBookmarked
      ? await removeBookmark({ type: bookmarkableType, targetId: post.id })
      : await addBookmark({ type: bookmarkableType, targetId: post.id });

    if ("error" in result) return;
  };

  const router = useRouter();
  const isShowcase = post.category === "Showcase";
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
    if (target.closest("button, a, input, [role='button']")) {
      return;
    }
    router.push(targetHref);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(index * 0.04, 0.25) }}
      role="article"
      aria-labelledby={titleId}
      onClick={handleCardClick}
      className="group relative border-b border-border/70 py-4 sm:py-5 px-2 sm:px-3.5 transition-colors hover:bg-muted/30 cursor-pointer"
    >
      <Link
        href={targetHref}
        className="absolute inset-0 z-0 outline-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="relative pointer-events-none flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4.5">
        {/* Left Column: Author Avatar */}
        <div className="shrink-0 pt-0.5 pointer-events-auto">
          <div className="relative">
            <CardAuthorAvatar author={post.author} />
            {post.status === "Solved" ? (
              <span
                title="Solved"
                className="absolute -bottom-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs"
              >
                <CheckCircle2 className="size-3" />
              </span>
            ) : post.author.reputation && post.author.reputation > 500 ? (
              <span
                title="Top Contributor"
                className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs"
              >
                ★
              </span>
            ) : null}
          </div>
        </div>

        {/* Center Column: Title, Topic Pill, Description, Media, Tags */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Header row with Topic Badge & relative time */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: topicColor }}
                aria-hidden="true"
              />
              <span>{topicLabel}</span>
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {relativeTime(post.sortTimestamp)}
            </span>
          </div>

          {/* Rejection / Status notice if relevant */}
          {myAnswer && myAnswer.review === "REJECTED" && (
            <div className="mb-1 pointer-events-auto relative z-10">
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
            className="text-base sm:text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary break-words [word-break:break-word] min-w-0"
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
            <p className="line-clamp-2 text-sm sm:text-base leading-relaxed text-foreground/80 break-words [word-break:break-word]">
              {post.description}
            </p>
          )}

          {/* Showcase Media Preview */}
          {isShowcase && post.thumbnailUrl && (
            <div className="relative w-full max-h-[300px] overflow-hidden rounded-xl bg-slate-950/80 dark:bg-neutral-950/90 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center my-3">
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                aria-hidden="true"
                sizes="100px"
                quality={30}
                className="object-cover blur-2xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
              />
              <div className="relative z-10 w-full h-[200px] sm:h-[240px] flex items-center justify-center">
                <Image
                  src={post.thumbnailUrl}
                  alt={`${post.title} ${t("community.card.preview")}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={90}
                  className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5 pt-1"
              aria-label={t("community.card.tags")}
            >
              {tags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag}
                  variant="tag"
                  className="rounded-md font-mono text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Participant Avatars, Comments Count & Actions */}
        <div className="flex shrink-0 sm:flex-col sm:items-end justify-between items-center gap-3 pt-3 sm:pt-1 border-t border-border/40 sm:border-0">
          {/* Participant Avatars Stack */}
          <ParticipantAvatarStack
            author={post.author}
            answersCount={post.answersCount}
          />

          {/* Comments Counter */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground">
            <MessageSquare aria-hidden="true" className="size-4 text-muted-foreground/80 shrink-0" />
            <span>
              {post.answersCount} {answerNoun}
            </span>
          </div>

          {/* Actions: Votes & Bookmark */}
          <div className="flex items-center gap-1.5 relative z-10 pt-1">
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
                "pointer-events-auto rounded-xl cursor-pointer",
                localBookmarked && "text-primary",
              )}
            >
              <Bookmark
                aria-hidden="true"
                className={cn("size-4", localBookmarked && "fill-current")}
              />
            </Button>
          </div>
        </div>
      </div>
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
    <Avatar className="size-11 sm:size-12 rounded-full border-2 border-background shadow-xs ring-1 ring-border/80">
      <AvatarImage
        src={avatarUrl}
        alt={`${name} — ${t("community.card.avatarOf")}`}
      />
      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
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

  // Render a clean participant stack
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
