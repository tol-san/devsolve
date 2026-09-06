"use client";

import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TopResearcher } from "@/lib/types/analytics/types";

interface DashboardResearcherLeaderboardProps {
  researchers: TopResearcher[];
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold";
  }
  if (rank === 2) {
    return "bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30 font-bold";
  }
  if (rank === 3) {
    return "bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30 font-bold";
  }
  return "bg-muted text-muted-foreground border-border font-medium";
}

export function DashboardResearcherLeaderboard({
  researchers,
}: DashboardResearcherLeaderboardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs space-y-5">
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="size-5 text-primary shrink-0" />
            <span>Top Security Researchers</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Key contributors ranked by valid vulnerabilities and impact
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border shrink-0 whitespace-nowrap">
          {researchers.length} hackers
        </span>
      </div>

      {researchers.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No researcher contributions recorded for this window.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
          {researchers.map((researcher) => {
            const initials = researcher.displayName
              ? researcher.displayName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : researcher.username.slice(0, 2).toUpperCase();

            return (
              <div
                key={researcher.userId}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-muted/20 p-4 hover:bg-muted/40 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-10 rounded-xl border border-border">
                      {researcher.avatarUrl && (
                        <AvatarImage
                          src={researcher.avatarUrl}
                          alt={researcher.displayName}
                        />
                      )}
                      <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <Link
                        href={`/profile/${researcher.username}`}
                        className="truncate text-sm font-bold text-foreground hover:underline block"
                      >
                        {researcher.displayName}
                      </Link>
                      <span className="text-xs text-muted-foreground block truncate">
                        @{researcher.username}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-lg border text-xs tabular-nums shrink-0 ${getRankBadge(
                      researcher.rank,
                    )}`}
                  >
                    #{researcher.rank}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3.5 mt-3.5 border-t border-border/60 text-center">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">
                      Valid
                    </span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {researcher.validReports}
                      {researcher.criticalReports > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 text-xs ml-1 font-semibold">
                          ({researcher.criticalReports}c)
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">
                      Bounties
                    </span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      ${researcher.totalBountiesEarned.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">
                      Reputation
                    </span>
                    <span className="text-sm font-bold text-primary tabular-nums">
                      +{researcher.reputationEarned}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
