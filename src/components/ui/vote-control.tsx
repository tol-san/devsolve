"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoteValue = 1 | -1;

interface VoteControlProps {
  voteCount: number;
  currentVote?: number | null;
  onVote: (value: VoteValue) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  upvoteLabel?: string;
  downvoteLabel?: string;
  orientation?: "horizontal" | "vertical";
}

export function VoteControl({
  voteCount,
  currentVote = 0,
  onVote,
  isLoading = false,
  className,
  upvoteLabel = "Upvote",
  downvoteLabel = "Downvote",
  orientation = "vertical",
}: VoteControlProps) {
  const isUpvoted = currentVote === 1;
  const isDownvoted = currentVote === -1;

  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-xl border border-border/80 bg-card p-0.5 shadow-2xs",
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void onVote(1)}
          disabled={isLoading}
          aria-pressed={isUpvoted}
          aria-label={
            isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
          }
          className={cn(
            "size-7.5 rounded-lg transition-colors cursor-pointer",
            isUpvoted
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ChevronUp className="size-4" />
        </Button>

        <span
          className={cn(
            "min-w-7 px-1.5 text-center text-sm font-bold tabular-nums",
            isUpvoted && "text-emerald-600 dark:text-emerald-400",
            isDownvoted && "text-rose-600 dark:text-rose-400",
            !isUpvoted && !isDownvoted && "text-foreground"
          )}
        >
          {voteCount}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void onVote(-1)}
          disabled={isLoading}
          aria-pressed={isDownvoted}
          aria-label={
            isDownvoted ? `Remove ${downvoteLabel.toLowerCase()}` : downvoteLabel
          }
          className={cn(
            "size-7.5 rounded-lg transition-colors cursor-pointer",
            isDownvoted
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card p-1 shadow-2xs",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void onVote(1)}
        disabled={isLoading}
        aria-pressed={isUpvoted}
        aria-label={
          isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
        }
        className={cn(
          "size-8 rounded-lg transition-colors cursor-pointer",
          isUpvoted
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <ChevronUp className="size-4.5" />
      </Button>

      <span
        className={cn(
          "flex min-w-8 items-center justify-center py-0.5 text-sm font-bold tabular-nums",
          isUpvoted && "text-emerald-600 dark:text-emerald-400",
          isDownvoted && "text-rose-600 dark:text-rose-400",
          !isUpvoted && !isDownvoted && "text-foreground"
        )}
      >
        {voteCount}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void onVote(-1)}
        disabled={isLoading}
        aria-pressed={isDownvoted}
        aria-label={
          isDownvoted ? `Remove ${downvoteLabel.toLowerCase()}` : downvoteLabel
        }
        className={cn(
          "size-8 rounded-lg transition-colors cursor-pointer",
          isDownvoted
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <ChevronDown className="size-4.5" />
      </Button>
    </div>
  );
}
