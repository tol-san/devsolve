"use client";

import React from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThanksRankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
}

export function ThanksRankBadge({ rank, size = "md" }: ThanksRankBadgeProps) {
  if (rank === 1) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl font-black shadow-xs shrink-0 transition-transform",
          "border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
          size === "lg" ? "h-11 px-3.5 text-base" : size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm"
        )}
        title="Rank #1"
      >
        <Crown className={cn(size === "lg" ? "size-5" : size === "sm" ? "size-3.5" : "size-4", "text-amber-500 fill-amber-500/30")} />
        <span className="font-mono">#1</span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl font-black shadow-xs shrink-0 transition-transform",
          "border border-slate-400/30 bg-gradient-to-br from-slate-400/15 via-slate-300/10 to-slate-400/5 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400/20",
          size === "lg" ? "h-11 px-3.5 text-base" : size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm"
        )}
        title="Rank #2"
      >
        <Medal className={cn(size === "lg" ? "size-5" : size === "sm" ? "size-3.5" : "size-4", "text-slate-400 fill-slate-400/30")} />
        <span className="font-mono">#2</span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl font-black shadow-xs shrink-0 transition-transform",
          "border border-amber-700/30 bg-gradient-to-br from-amber-700/15 via-orange-600/10 to-amber-700/5 text-amber-800 dark:text-amber-500 ring-1 ring-amber-700/20",
          size === "lg" ? "h-11 px-3.5 text-base" : size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm"
        )}
        title="Rank #3"
      >
        <Trophy className={cn(size === "lg" ? "size-5" : size === "sm" ? "size-3.5" : "size-4", "text-amber-700 dark:text-amber-500 fill-amber-700/20")} />
        <span className="font-mono">#3</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-bold font-mono text-muted-foreground bg-muted/60 border border-border shrink-0",
        size === "lg" ? "h-11 min-w-11 px-3 text-sm" : size === "sm" ? "h-7 min-w-7 px-2 text-xs" : "h-9 min-w-9 px-2.5 text-xs"
      )}
      title={`Rank #${rank}`}
    >
      #{rank}
    </div>
  );
}
