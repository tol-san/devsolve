"use client";

import React, { useState } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Eye,
  Flag,
  MessageSquare,
  Rss,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import { cn } from "@/lib/utils";

interface ShowcaseActionBarProps {
  showcase: ShowcaseResponse;
  isSignedIn: boolean;
  onRequireAuth: () => void;
  onVote: (direction: "UP" | "DOWN") => void;
  onToggleBookmark: () => void;
  onToggleFollowShowcase: () => void;
  onOpenReport?: () => void;
}

export function ShowcaseActionBar({
  showcase,
  isSignedIn,
  onRequireAuth,
  onVote,
  onToggleBookmark,
  onToggleFollowShowcase,
  onOpenReport,
}: ShowcaseActionBarProps) {
  const [copied, setCopied] = useState(false);

  const engagement = showcase.engagement ?? {
    voteScore: 0,
    upvoteCount: 0,
    downvoteCount: 0,
    bookmarkCount: 0,
    followerCount: 0,
  };

  const viewer = showcase.viewer ?? {
    vote: null,
    bookmarked: false,
    following: false,
    followingAuthor: false,
    owner: false,
    canEdit: false,
    canDelete: false,
    editUnderReview: false,
  };

  const isUpvoted = viewer.vote === "UP";
  const isDownvoted = viewer.vote === "DOWN";
  const isBookmarked = viewer.bookmarked;
  const isFollowing = viewer.following;

  const handleVoteClick = (direction: "UP" | "DOWN") => {
    if (!isSignedIn) {
      onRequireAuth();
      return;
    }
    onVote(direction);
  };

  const handleBookmarkClick = () => {
    if (!isSignedIn) {
      onRequireAuth();
      return;
    }
    onToggleBookmark();
  };

  const handleFollowClick = () => {
    if (!isSignedIn) {
      onRequireAuth();
      return;
    }
    onToggleFollowShowcase();
  };

  const handleShareClick = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById("comments-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-18 sm:top-20 z-20 w-full rounded-2xl border border-border/80 bg-card/90 p-2 sm:p-2.5 shadow-md backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Voting Pill + Bookmark + Follow */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Vote Control Pill */}
          <div className="inline-flex items-center rounded-xl border border-border/80 bg-background/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleVoteClick("UP")}
              aria-label="Upvote showcase"
              aria-pressed={isUpvoted}
              className={cn(
                "flex size-8 sm:size-9 items-center justify-center rounded-lg transition-all active:scale-95 cursor-pointer",
                isUpvoted
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <ChevronUp className="size-5 stroke-[2.5]" />
            </button>

            <span
              className={cn(
                "min-w-8 text-center text-xs sm:text-sm font-bold tabular-nums px-1",
                isUpvoted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isDownvoted
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground",
              )}
            >
              {engagement.voteScore}
            </span>

            <button
              type="button"
              onClick={() => handleVoteClick("DOWN")}
              aria-label="Downvote showcase"
              aria-pressed={isDownvoted}
              className={cn(
                "flex size-8 sm:size-9 items-center justify-center rounded-lg transition-all active:scale-95 cursor-pointer",
                isDownvoted
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <ChevronDown className="size-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark showcase"}
            aria-pressed={isBookmarked}
            className={cn(
              "inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border px-3 text-xs sm:text-sm font-semibold transition-all active:scale-98 cursor-pointer shadow-2xs",
              isBookmarked
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Bookmark
              className={cn("size-4", isBookmarked && "fill-current")}
            />
            <span className="tabular-nums">{engagement.bookmarkCount}</span>
            <span className="hidden md:inline">
              {isBookmarked ? "Saved" : "Save"}
            </span>
          </button>

          {/* Follow Showcase Button */}
          <button
            type="button"
            onClick={handleFollowClick}
            aria-label={isFollowing ? "Unfollow showcase" : "Follow showcase"}
            aria-pressed={isFollowing}
            className={cn(
              "inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border px-3 text-xs sm:text-sm font-semibold transition-all active:scale-98 cursor-pointer shadow-2xs",
              isFollowing
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Rss className="size-4" />
            <span className="tabular-nums">{engagement.followerCount}</span>
            <span className="hidden md:inline">
              {isFollowing ? "Following" : "Follow"}
            </span>
          </button>
        </div>

        {/* Right Side: Comments + Views + Share + Report */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Comments count anchor */}
          <button
            type="button"
            onClick={scrollToComments}
            aria-label="Scroll to comments"
            className="inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <MessageSquare className="size-4" />
            <span className="tabular-nums">{showcase.commentCount ?? 0}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          {/* Views count pill (passive) */}
          <div
            title={`${showcase.viewCount} views`}
            className="inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 text-xs sm:text-sm font-semibold text-muted-foreground shadow-2xs select-none"
          >
            <Eye className="size-4 text-muted-foreground/70" />
            <span className="tabular-nums">{showcase.viewCount}</span>
            <span className="hidden xl:inline">views</span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            aria-label="Share showcase"
            className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Copy link"
          >
            <Share2 className="size-4" />
          </button>

          {/* Report Button */}
          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              aria-label="Report showcase"
              className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-rose-500 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Report content"
            >
              <Flag className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
