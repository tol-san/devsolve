"use client";

import { motion } from "motion/react";
import {
  Award,
  CheckCircle2,
  DollarSign,
  FileText,
  LucideIcon,
  Sparkles,
} from "lucide-react";
import { ProfileStats } from "@/lib/types/profile/types";

interface StatsCardsProps {
  stats: ProfileStats;
}

function formatBountyAmount(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toLocaleString()}`;
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const tiles: Array<{
    label: string;
    value: string;
    subtext: string;
    icon: LucideIcon;
    accent: string;
    tint: string;
  }> = [
    {
      label: "Reports submitted",
      value: stats.reportsSubmitted.toLocaleString(),
      subtext: "Total disclosures",
      icon: FileText,
      accent: "text-indigo-600 dark:text-indigo-400",
      tint: "bg-indigo-500/10",
    },
    {
      label: "Accepted rate",
      value: `${stats.acceptedRate}%`,
      subtext: `${stats.accepted.toLocaleString()} accepted ${
        stats.accepted === 1 ? "finding" : "findings"
      }`,
      icon: CheckCircle2,
      accent: "text-emerald-600 dark:text-emerald-400",
      tint: "bg-emerald-500/10",
    },
    {
      label: "Total earned",
      value: formatBountyAmount(stats.totalEarned, stats.bountyCurrency),
      subtext:
        stats.rewardedReports !== undefined
          ? `${stats.rewardedReports} rewarded ${
              stats.rewardedReports === 1 ? "report" : "reports"
            }`
          : "Bounty rewards",
      icon: DollarSign,
      accent: "text-emerald-600 dark:text-emerald-400",
      tint: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      {/* Reputation is the headline number, so it gets the wide slot. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs transition-colors hover:border-primary/30 sm:col-span-2 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/8 blur-2xl"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reputation
            </p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums text-primary sm:text-5xl">
              {stats.reputation.toLocaleString()}
            </p>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground">
              Platform points earned from valid work
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
            <Sparkles className="size-5" />
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
          {stats.globalRank !== undefined ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Award className="size-3.5" />
                Rank #{stats.globalRank.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                on the global leaderboard
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                <Award className="size-3.5" />
                Unranked
              </span>
              <span className="text-xs text-muted-foreground">
                a valid report earns a leaderboard place
              </span>
            </>
          )}
        </div>
      </motion.div>

      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: (index + 1) * 0.05 }}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs transition-colors hover:border-primary/30 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tile.label}
              </span>
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${tile.tint} ${tile.accent}`}
              >
                <Icon className="size-4" />
              </div>
            </div>

            <div className="mt-4">
              <p
                className={`text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl ${tile.accent}`}
              >
                {tile.value}
              </p>
              <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                {tile.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
