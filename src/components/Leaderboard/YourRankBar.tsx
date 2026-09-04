"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Crosshair } from "lucide-react";
import {
  LeaderboardEntry,
  LeaderboardPeriod,
  RANKED_COUNT_LABEL,
} from "@/lib/types/leaderboard/types";
import ResearcherAvatar from "./ResearcherAvatar";
import RankMovement from "./RankMovement";
import { PERIOD_LABEL_SHORT, formatNumber, profileHref } from "./leaderboard-ui";

type Props = {
  entry: LeaderboardEntry | null;
  totalRanked: number;
  topPercent: number | null;
  period: LeaderboardPeriod;
  onJumpToMe?: () => void;
};

export default function YourRankBar({
  entry,
  totalRanked,
  topPercent,
  period,
  onJumpToMe,
}: Props) {
  if (!entry) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
      aria-label="Your position on the leaderboard"
      className="sticky bottom-4 z-30"
    >
      <div className="flex flex-col gap-3 sm:gap-4 rounded-2xl bg-slate-900/95 dark:bg-card/95 backdrop-blur-md p-3.5 sm:p-4 md:px-5 text-white dark:text-foreground shadow-2xl border border-slate-800/80 dark:border-border/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <ResearcherAvatar
            username={entry.username}
            displayName={entry.displayName}
            avatarUrl={entry.avatarUrl}
            initials={entry.avatarInitials}
            size={40}
            className="ring-2 ring-white/20 dark:ring-foreground/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 text-base sm:text-lg font-bold tracking-tight">
              You&apos;re #{formatNumber(entry.rank)}
              <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-muted-foreground">
                of {formatNumber(totalRanked)} · {PERIOD_LABEL_SHORT[period].toLowerCase()}
              </span>
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-300 dark:text-muted-foreground">
              <span className="font-semibold text-white dark:text-foreground">
                {formatNumber(entry.reputation)} pts
              </span>
              {entry.validReports != null && (
                <>
                  <span className="hidden sm:inline text-slate-500 dark:text-muted-foreground/60">·</span>
                  <span>{formatNumber(entry.validReports)} valid</span>
                </>
              )}
              <span className="hidden sm:inline text-slate-500 dark:text-muted-foreground/60">·</span>
              <span>{formatNumber(entry.criticalReports)} critical</span>
              <span className="hidden sm:inline text-slate-500 dark:text-muted-foreground/60">·</span>
              <span>
                {formatNumber(entry.recognitionCount)}{" "}
                {entry.recognitionCount === 1
                  ? RANKED_COUNT_LABEL[period].singular
                  : RANKED_COUNT_LABEL[period].plural}
              </span>
              {topPercent != null && (
                <span className="rounded-md bg-white/10 dark:bg-muted px-1.5 py-0.5 text-xs font-semibold text-white dark:text-foreground">
                  Top {topPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t border-slate-800/80 dark:border-border/80 sm:border-t-0 justify-end sm:justify-start">
          <RankMovement
            rank={entry.rank}
            previousRank={entry.previousRank}
            tone="dark"
            className="rounded-lg bg-white/10 dark:bg-muted px-2.5 py-1"
          />

          {onJumpToMe && (
            <button
              type="button"
              onClick={onJumpToMe}
              className="inline-flex h-9 sm:h-10 flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-white/10 dark:bg-muted px-3 text-xs sm:text-sm font-semibold text-white dark:text-foreground transition-colors hover:bg-white/20 dark:hover:bg-muted/80 cursor-pointer"
            >
              <Crosshair className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              My row
            </button>
          )}

          <Link
            href={profileHref(entry.username)}
            className="inline-flex h-9 sm:h-10 flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
          >
            My profile
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
