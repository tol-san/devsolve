"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Bookmark,
  CheckCircle2,
  CircleDot,
  Eye,
  MessageSquare,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const isShowcase = post.category === "Showcase";
  const answerNoun = t(
    isShowcase ? "community.card.comments" : "community.card.answers",
  );
  const tags = isShowcase && post.techStack ? post.techStack : post.tags;
  const titleId = `discussion-title-${post.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.06 }}
      whileHover={{ y: -2 }}
    >
      <Card
        role="article"
        aria-labelledby={titleId}
        className="group relative gap-0 overflow-hidden rounded-2xl bg-card py-0 shadow-xs ring-1 ring-foreground/5 transition-shadow duration-200 hover:shadow-sm hover:ring-foreground/10 focus-within:ring-2 focus-within:ring-primary/40"
      >
        <Link
          href={lp(
            isShowcase ? `/showcases/${post.id}` : `/community/${post.id}`,
          )}
          className="absolute inset-0 rounded-2xl outline-none"
        >
          <span className="sr-only">
            {t("community.card.open")}: {post.title}
          </span>
        </Link>

        <CardHeader className="pointer-events-none relative px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <Badge variant="ghost" className="rounded-lg text-sm">
              {t(isShowcase ? "community.card.showcase" : "community.card.problem")}
            </Badge>
            <Badge variant="secondary" className="rounded-lg text-sm">
              {post.topic}
            </Badge>
            {post.status && (
              <Badge
                variant={post.status === "Solved" ? "default" : "secondary"}
                className="rounded-lg text-sm"
              >
                {post.status === "Solved" ? (
                  <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
                ) : (
                  <CircleDot data-icon="inline-start" aria-hidden="true" />
                )}
                {t(
                  post.status === "Solved"
                    ? "community.card.statusSolved"
                    : "community.card.statusOpen",
                )}
              </Badge>
            )}

            {myAnswer && myAnswer.review === "REJECTED" && (
              <Link
                href={MY_COMMUNITY_HREF}
                className={cn(
                  "pointer-events-auto relative z-10 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold transition-colors",
                  "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
                )}
              >
                <XCircle aria-hidden="true" className="size-3.5" />
                {t("community.card.answerRejected")}
              </Link>
            )}
          </div>

          <CardTitle className="min-w-0">
            <h3
              id={titleId}
              className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl break-words [word-break:break-word] min-w-0"
            >
              {post.title}
            </h3>
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 text-base leading-relaxed text-foreground/80 break-words [word-break:break-word]">
            {post.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pointer-events-none relative flex flex-col gap-4 px-5 py-4 sm:px-6">
          {isShowcase && post.thumbnailUrl && (
            <div className="relative w-full max-h-[360px] overflow-hidden rounded-xl bg-slate-950/80 dark:bg-neutral-950/90 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center">
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                aria-hidden="true"
                sizes="100px"
                quality={30}
                className="object-cover blur-2xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
              />
              <div className="relative z-10 w-full h-[220px] sm:h-[280px] flex items-center justify-center">
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

          <div className="flex flex-wrap gap-2" aria-label={t("community.card.tags")}>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="tag"
                className="rounded-lg font-mono text-sm font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pointer-events-none relative flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
          <div className="flex min-w-0 items-center gap-2">
            <CardAuthorAvatar author={post.author} />
            <div className="flex min-w-0 items-baseline gap-1.5 text-sm overflow-hidden">
              <span className="truncate font-semibold text-foreground">
                {post.author.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {relativeTime(post.sortTimestamp)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span
                className="flex items-center gap-1"
                aria-label={`${post.answersCount} ${answerNoun}`}
              >
                <MessageSquare aria-hidden="true" className="size-3.5 shrink-0" />
                <span>{post.answersCount}</span>
                <span className="hidden min-[1400px]:inline">{answerNoun}</span>
              </span>
              <span
                className="flex items-center gap-1"
                aria-label={`${post.viewsCount.toLocaleString()} ${t("community.card.views")}`}
              >
                <Eye aria-hidden="true" className="size-3.5 shrink-0" />
                <span>{post.viewsCount.toLocaleString()}</span>
                <span className="hidden min-[1400px]:inline">
                  {t("community.card.views")}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
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
                  "pointer-events-auto rounded-xl",
                  localBookmarked && "text-primary",
                )}
              >
                <Bookmark
                  aria-hidden="true"
                  className={cn(localBookmarked && "fill-current")}
                />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
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
    <Avatar size="sm">
      <AvatarImage
        src={avatarUrl}
        alt={`${name} — ${t("community.card.avatarOf")}`}
      />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
