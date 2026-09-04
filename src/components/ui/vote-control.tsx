"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoteValue = 1 | -1;

interface VoteControlProps {
  voteCount?: number;
  upvotes?: number;
  downvotes?: number;
  currentVote?: number | null;
  onVote: (value: VoteValue) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  upvoteLabel?: string;
  downvoteLabel?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "pill" | "button";
}

export function VoteControl({
  voteCount,
  upvotes,
  downvotes,
  currentVote = 0,
  onVote,
  isLoading = false,
  className,
  upvoteLabel = "Upvote",
  downvoteLabel = "Downvote",
  orientation,
  variant = "button",
}: VoteControlProps) {
  const isUpvoted = currentVote === 1;
  const isDownvoted = currentVote === -1;
  const hasExplicitCounts = upvotes !== undefined || downvotes !== undefined;
  const upCount = upvotes ?? (voteCount ?? 0);
  const downCount = downvotes ?? 0;
  const displayScore = voteCount ?? upCount - downCount;

  if (variant === "button" && !orientation) {
    if (hasExplicitCounts) {
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-xl border border-border/70 bg-card p-0.5 shadow-2xs",
            className,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => void onVote(1)}
            disabled={isLoading}
            aria-pressed={isUpvoted}
            aria-label={
              isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
            }
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer",
              isUpvoted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ChevronUp className="size-4" />
            <span className="tabular-nums">{upCount}</span>
          </Button>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          <Button
            type="button"
            variant="ghost"
            onClick={() => void onVote(-1)}
            disabled={isLoading}
            aria-pressed={isDownvoted}
            aria-label={
              isDownvoted
                ? `Remove ${downvoteLabel.toLowerCase()}`
                : downvoteLabel
            }
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer",
              isDownvoted
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ChevronDown className="size-4" />
            <span className="tabular-nums">{downCount}</span>
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => void onVote(1)}
        disabled={isLoading}
        aria-pressed={isUpvoted}
        aria-label={
          isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
        }
        className={cn(
          "inline-flex items-center justify-between gap-2.5 h-8.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer border select-none",
          isUpvoted
            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs dark:bg-blue-600 dark:hover:bg-blue-500 dark:border-blue-500"
            : "bg-muted/40 hover:bg-muted/80 text-foreground border-border/70 dark:bg-muted/30 dark:border-border/40 hover:border-border",
          className,
        )}
      >
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
          <ChevronUp
            className={cn(
              "size-4 transition-transform duration-200",
              isUpvoted && "scale-110 stroke-[2.5]",
            )}
          />
          <span>VOTE</span>
        </span>
        <span
          className={cn(
            "font-extrabold tabular-nums text-xs px-1.5 py-0.5 rounded-md transition-colors ml-1",
            isUpvoted
              ? "bg-white/20 text-white"
              : "bg-muted/80 text-foreground",
          )}
        >
          {displayScore}
        </span>
      </Button>
    );
  }

  if (orientation === "horizontal") {
    if (hasExplicitCounts) {
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-xl border border-border/80 bg-card p-0.5 shadow-2xs gap-0.5",
            className,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void onVote(1)}
            disabled={isLoading}
            aria-pressed={isUpvoted}
            aria-label={
              isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
            }
            className={cn(
              "h-8 px-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 font-bold text-xs tabular-nums",
              isUpvoted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ChevronUp className="size-4" />
            <span>{upCount}</span>
          </Button>

          <div className="h-4 w-px bg-border/80 mx-0.5" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void onVote(-1)}
            disabled={isLoading}
            aria-pressed={isDownvoted}
            aria-label={
              isDownvoted
                ? `Remove ${downvoteLabel.toLowerCase()}`
                : downvoteLabel
            }
            className={cn(
              "h-8 px-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 font-bold text-xs tabular-nums",
              isDownvoted
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ChevronDown className="size-4" />
            <span>{downCount}</span>
          </Button>
        </div>
      );
    }

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
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <ChevronUp className="size-4" />
        </Button>

        <span
          className={cn(
            "min-w-7 px-1.5 text-center text-sm font-bold tabular-nums",
            isUpvoted && "text-emerald-600 dark:text-emerald-400",
            isDownvoted && "text-rose-600 dark:text-rose-400",
            !isUpvoted && !isDownvoted && "text-foreground",
          )}
        >
          {displayScore}
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
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>
    );
  }

  if (hasExplicitCounts) {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card p-1 shadow-2xs gap-0.5",
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void onVote(1)}
          disabled={isLoading}
          aria-pressed={isUpvoted}
          aria-label={
            isUpvoted ? `Remove ${upvoteLabel.toLowerCase()}` : upvoteLabel
          }
          className={cn(
            "h-7 w-full px-2 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1 font-bold text-xs tabular-nums",
            isUpvoted
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <ChevronUp className="size-4" />
          <span>{upCount}</span>
        </Button>

        <div className="w-4 h-px bg-border/80 my-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void onVote(-1)}
          disabled={isLoading}
          aria-pressed={isDownvoted}
          aria-label={
            isDownvoted ? `Remove ${downvoteLabel.toLowerCase()}` : downvoteLabel
          }
          className={cn(
            "h-7 w-full px-2 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1 font-bold text-xs tabular-nums",
            isDownvoted
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <ChevronDown className="size-4" />
          <span>{downCount}</span>
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
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <ChevronUp className="size-4.5" />
      </Button>

      <span
        className={cn(
          "flex min-w-8 items-center justify-center py-0.5 text-sm font-bold tabular-nums",
          isUpvoted && "text-emerald-600 dark:text-emerald-400",
          isDownvoted && "text-rose-600 dark:text-rose-400",
          !isUpvoted && !isDownvoted && "text-foreground",
        )}
      >
        {displayScore}
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
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <ChevronDown className="size-4.5" />
      </Button>
    </div>
  );
}
