"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetTopResearchersQuery,
  type RankingPeriod,
} from "@/lib/redux/services/leaderboardApi";
import { cn } from "@/lib/utils";
import { formatCount } from "./presentation";

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "DAY", label: "Today" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
  { value: "ALL_TIME", label: "All time" },
];

const EMPTY_COPY: Record<RankingPeriod, string> = {
  DAY: "No ranked activity today yet.",
  WEEK: "No ranked activity this week yet.",
  MONTH: "No ranked activity this month yet.",
  ALL_TIME: "No researchers are ranked yet.",
};

const RANK_TONE: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 font-black shadow-xs ring-1 ring-amber-400/50",
  2: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-bold dark:from-slate-600 dark:to-slate-700 dark:text-slate-100",
  3: "bg-gradient-to-br from-amber-600/60 to-amber-700/80 text-white font-bold dark:text-amber-100",
};

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DS"
  );
}

export function TopResearchers() {
  const [period, setPeriod] = useState<RankingPeriod>("WEEK");
  const { data, isLoading, isError } = useGetTopResearchersQuery({
    period,
    size: 5,
  });

  const isWindowed = period !== "ALL_TIME";

  return (
    <section
      aria-labelledby="top-researchers"
      className="overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy aria-hidden className="size-4" />
          </div>
          <h2
            id="top-researchers"
            className="text-base font-bold text-foreground"
          >
            Top researchers
          </h2>
        </div>

        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div
        role="group"
        aria-label="Ranking period"
        className="mt-3.5 flex gap-1 rounded-xl bg-muted/60 p-1"
      >
        {PERIODS.map((option) => {
          const isActive = option.value === period;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              aria-label={option.value === "ALL_TIME" ? "All time" : undefined}
              onClick={() => setPeriod(option.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-lg py-1 text-xs font-semibold transition-all duration-150 select-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 space-y-2">
        {isLoading ? (
          [0, 1, 2, 3].map((index) => (
            <div
              key={index}
              aria-hidden
              className="h-[54px] animate-pulse rounded-xl border border-border/40 bg-muted/40"
            />
          ))
        ) : isError ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            The ranking is unavailable right now.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {EMPTY_COPY[period]}
          </p>
        ) : (
          data.map((researcher) => {
            const href = researcher.username
              ? `/profile/${encodeURIComponent(researcher.username)}`
              : undefined;

            const row = (
              <>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                    RANK_TONE[researcher.rank] ??
                      "bg-muted text-muted-foreground font-semibold border border-border/60",
                  )}
                >
                  {researcher.rank}
                </span>

                <Avatar className="size-8 shrink-0 ring-1 ring-border/80">
                  <AvatarImage src={researcher.avatarUrl} alt="" />
                  <AvatarFallback className="bg-muted text-[11px] font-bold text-foreground">
                    {initialsOf(researcher.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs sm:text-sm font-bold text-foreground">
                    {researcher.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {researcher.username ? `@${researcher.username}` : null}
                    {researcher.criticalReports > 0
                      ? `${researcher.username ? " · " : ""}${formatCount(
                          researcher.criticalReports,
                        )} critical`
                      : null}
                    {!isWindowed && researcher.validReports !== null
                      ? ` · ${formatCount(researcher.validReports)} valid`
                      : null}
                  </span>
                </div>

                <div className="flex shrink-0 items-baseline gap-0.5 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCount(researcher.reputation)}
                  <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                    pts
                  </span>
                </div>
              </>
            );

            const className =
              "flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/40 p-2.5 transition-all duration-150 hover:border-border/80 hover:bg-muted/70 hover:shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

            return href ? (
              <Link key={researcher.id} href={href} className={className}>
                {row}
              </Link>
            ) : (
              <div key={researcher.id} className={className}>
                {row}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

