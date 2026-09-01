"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetTopResearchersQuery,
  type RankingPeriod,
} from "@/lib/redux/services/leaderboardApi";
import { cn } from "@/lib/utils";
import { formatCount } from "./presentation";

/**
 * The head of the ranking, for one window.
 *
 * On a windowed period the API measures reputation, recognitions and criticals
 * over that window and returns the lifetime totals as null. Those lines are
 * dropped rather than printed as zero — a researcher with no reports this week
 * has not filed zero reports.
 */

/** Labels stay short: four tabs share 320px of sidebar. */
const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "DAY", label: "Today" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
  { value: "ALL_TIME", label: "All" },
];

const EMPTY_COPY: Record<RankingPeriod, string> = {
  DAY: "No ranked activity today yet.",
  WEEK: "No ranked activity this week yet.",
  MONTH: "No ranked activity this month yet.",
  ALL_TIME: "No researchers are ranked yet.",
};

/** Gold, silver, bronze — the rest keep the neutral chip. */
const RANK_TONE = [
  "bg-amber-400 text-amber-950",
  "bg-foreground/20 text-foreground",
  "bg-orange-300 text-orange-950",
];

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
      className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10"
    >
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Trophy aria-hidden className="size-[18px] text-amber-500" />
        <h2 id="top-researchers" className="text-base font-bold text-foreground">
          Top researchers
        </h2>
      </div>

      <div
        role="group"
        aria-label="Ranking period"
        className="mt-3 flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1"
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
                "flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {isLoading ? (
          [0, 1, 2].map((index) => (
            <div
              key={index}
              aria-hidden
              className="h-[52px] animate-pulse rounded-xl bg-muted/60"
            />
          ))
        ) : isError ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            The ranking is unavailable right now.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
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
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                    RANK_TONE[researcher.rank - 1] ??
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {researcher.rank}
                </span>

                <Avatar size="sm" className="shrink-0">
                  <AvatarImage src={researcher.avatarUrl} alt="" />
                  <AvatarFallback>{initialsOf(researcher.name)}</AvatarFallback>
                </Avatar>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {researcher.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {researcher.username ? `@${researcher.username}` : null}
                    {researcher.criticalReports > 0
                      ? `${researcher.username ? " · " : ""}${formatCount(
                          researcher.criticalReports,
                        )} critical`
                      : null}
                    {/* Lifetime-only figures are absent on a window, not zero. */}
                    {!isWindowed && researcher.validReports !== null
                      ? ` · ${formatCount(researcher.validReports)} valid`
                      : null}
                  </span>
                </span>

                <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCount(researcher.reputation)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    rep
                  </span>
                </span>
              </>
            );

            const className =
              "flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

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
