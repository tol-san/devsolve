"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Flag,
  MessageSquare,
  Rss,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
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
  className?: string;
}

export function ShowcaseActionBar({
  showcase,
  isSignedIn,
  onRequireAuth,
  onVote,
  onToggleBookmark,
  onToggleFollowShowcase,
  onOpenReport,
  className,
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
    <div className={cn("w-full flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5", className)}>
      {/* Left Cluster: Voting Pill + Bookmark + Follow */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Modern Tactile Vote Control Pill */}
        <div className="inline-flex items-center rounded-xl sm:rounded-2xl border border-border/80 bg-background/90 p-0.5 sm:p-1 shadow-2xs">
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="button"
            onClick={() => handleVoteClick("UP")}
            aria-label="Upvote showcase"
            aria-pressed={isUpvoted}
            className={cn(
              "flex size-7.5 sm:size-8.5 items-center justify-center rounded-lg sm:rounded-xl transition-colors cursor-pointer",
              isUpvoted
                ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ChevronUp className="size-4.5 stroke-[2.5]" />
          </motion.button>

          <span
            className={cn(
              "min-w-7 sm:min-w-8 text-center text-xs sm:text-sm font-extrabold tabular-nums px-1",
              isUpvoted
                ? "text-emerald-600 dark:text-emerald-400"
                : isDownvoted
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground",
            )}
          >
            {engagement.voteScore}
          </span>

          <motion.button
            whileTap={{ scale: 0.88 }}
            type="button"
            onClick={() => handleVoteClick("DOWN")}
            aria-label="Downvote showcase"
            aria-pressed={isDownvoted}
            className={cn(
              "flex size-7.5 sm:size-8.5 items-center justify-center rounded-lg sm:rounded-xl transition-colors cursor-pointer",
              isDownvoted
                ? "bg-rose-500 text-white shadow-xs shadow-rose-500/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ChevronDown className="size-4.5 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleBookmarkClick}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark showcase"}
          aria-pressed={isBookmarked}
          className={cn(
            "inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs",
            isBookmarked
              ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-amber-500/10"
              : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-amber-500/30",
          )}
        >
          <Bookmark
            className={cn("size-3.5 sm:size-4 transition-transform", isBookmarked && "fill-current scale-110")}
          />
          <span className="tabular-nums font-bold">{engagement.bookmarkCount}</span>
          <span className="hidden sm:inline">
            {isBookmarked ? "Saved" : "Save"}
          </span>
        </motion.button>

        {/* Follow Showcase Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleFollowClick}
          aria-label={isFollowing ? "Unfollow showcase" : "Follow showcase"}
          aria-pressed={isFollowing}
          className={cn(
            "inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs",
            isFollowing
              ? "border-primary/40 bg-primary/15 text-primary shadow-primary/10"
              : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30",
          )}
        >
          <span className="relative flex size-3.5 sm:size-4 items-center justify-center">
            <Rss className="size-3.5 sm:size-4" />
            {isFollowing && (
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </span>
          <span className="tabular-nums font-bold">{engagement.followerCount}</span>
          <span className="hidden md:inline">
            {isFollowing ? "Following" : "Follow"}
          </span>
        </motion.button>
      </div>

      {/* Subtle Divider (Desktop) */}
      <div className="h-5 w-px bg-border/80 shrink-0 hidden sm:block" />

      {/* Right Cluster: Comments + Views + Share + Report */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Comments Count Anchor */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={scrollToComments}
          aria-label="Scroll to comments"
          className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
        >
          <MessageSquare className="size-3.5 sm:size-4" />
          <span className="tabular-nums font-bold text-foreground">{showcase.commentCount ?? 0}</span>
          <span className="hidden sm:inline">Comments</span>
        </motion.button>

        {/* Views Count Pill (Passive) */}
        <div
          title={`${showcase.viewCount} views`}
          className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold text-muted-foreground shadow-2xs select-none"
        >
          <Eye className="size-3.5 sm:size-4 text-muted-foreground/70" />
          <span className="tabular-nums font-bold">{showcase.viewCount}</span>
          <span className="hidden lg:inline">views</span>
        </div>

        {/* Share Button with Animated Feedback */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleShareClick}
          aria-label="Share showcase"
          className={cn(
            "flex size-8 sm:size-9 items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs",
            copied
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          title="Copy link"
        >
          {copied ? (
            <Check className="size-3.5 sm:size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Share2 className="size-3.5 sm:size-4" />
          )}
        </motion.button>

        {/* Report Button */}
        {onOpenReport && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onOpenReport}
            aria-label="Report showcase"
            className="flex size-8 sm:size-9 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer shadow-2xs"
            title="Report content"
          >
            <Flag className="size-3.5 sm:size-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
