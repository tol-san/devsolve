"use client";

import { motion } from "motion/react";
import { Award, CheckCircle2, DollarSign, FileText, Sparkles } from "lucide-react";
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
  const cards = [
    {
      label: "Reputation",
      value: stats.reputation.toLocaleString(),
      subtext: "Platform points",
      icon: Sparkles,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderGlow: "hover:border-blue-500/30",
    },
    ...(stats.globalRank !== undefined
      ? [
          {
            label: "Global Rank",
            value: `#${stats.globalRank}`,
            subtext: "Leaderboard position",
            icon: Award,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-500/10",
            borderGlow: "hover:border-amber-500/30",
          },
        ]
      : []),
    {
      label: "Reports Submitted",
      value: stats.reportsSubmitted.toLocaleString(),
      subtext: "Total disclosures",
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderGlow: "hover:border-indigo-500/30",
    },
    {
      label: "Accepted Rate",
      value: `${stats.acceptedRate}%`,
      subtext: `${stats.accepted} accepted findings`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderGlow: "hover:border-emerald-500/30",
    },
    {
      label: "Total Earned",
      value: formatBountyAmount(stats.totalEarned, stats.bountyCurrency),
      subtext:
        stats.rewardedReports !== undefined
          ? `${stats.rewardedReports} rewarded ${stats.rewardedReports === 1 ? "report" : "reports"}`
          : "Bounty rewards",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderGlow: "hover:border-emerald-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ y: -3 }}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 ${card.borderGlow}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${card.bgColor} ${card.color} transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className="size-4" />
              </div>
            </div>

            <div className="mt-3">
              <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
