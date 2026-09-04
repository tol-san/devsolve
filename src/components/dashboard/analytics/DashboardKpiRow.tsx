"use client";

import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  KpiSummary,
  TrendDirection,
} from "@/lib/types/analytics/types";

interface DashboardKpiRowProps {
  kpi: KpiSummary;
}

function TrendBadge({
  trend,
  changePercentage,
  invertGood = false,
}: {
  trend: TrendDirection;
  changePercentage: number | null;
  invertGood?: boolean; 
}) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const isPositive = invertGood ? isDown : isUp;
  const isNegative = invertGood ? isUp : isDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        !isPositive && !isNegative && "bg-muted text-muted-foreground",
      )}
    >
      {isUp ? (
        <TrendingUp className="size-3 stroke-[2.5]" />
      ) : isDown ? (
        <TrendingDown className="size-3 stroke-[2.5]" />
      ) : (
        <Minus className="size-3 stroke-[2.5]" />
      )}
      <span>
        {changePercentage !== null
          ? `${changePercentage > 0 ? "+" : ""}${changePercentage.toFixed(1)}%`
          : "—"}
      </span>
    </span>
  );
}

export function DashboardKpiRow({ kpi }: DashboardKpiRowProps) {
  const cards = [
    {
      title: "Total Reports",
      value: kpi.totalReports.value.toLocaleString(),
      subtext: "All vulnerability submissions",
      trend: kpi.totalReports.trend,
      changePercentage: kpi.totalReports.changePercentage,
      icon: FileText,
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Accepted Reports",
      value: kpi.acceptedReports.value.toLocaleString(),
      subtext: `${kpi.acceptedReports.acceptanceRate.toFixed(1)}% acceptance rate`,
      trend: kpi.acceptedReports.trend,
      changePercentage: kpi.acceptedReports.changePercentage,
      icon: CheckCircle2,
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Rejected Reports",
      value: kpi.rejectedReports.value.toLocaleString(),
      subtext: `${kpi.rejectedReports.rejectionRate.toFixed(1)}% rejection rate`,
      trend: kpi.rejectedReports.trend,
      changePercentage: kpi.rejectedReports.changePercentage,
      invertGood: true,
      icon: XCircle,
      iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Bounties Paid",
      value: `$${kpi.totalBountiesPaid.amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${kpi.reputationPointsAwarded.toLocaleString()} rep points awarded`,
      trend: kpi.totalBountiesPaid.trend,
      changePercentage: kpi.totalBountiesPaid.changePercentage,
      icon: DollarSign,
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Active Researchers",
      value: kpi.activeResearchers.value.toLocaleString(),
      subtext: "Contributing researchers",
      trend: kpi.activeResearchers.trend,
      changePercentage: kpi.activeResearchers.changePercentage,
      icon: Users,
      iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 pb-2">
              <span className="text-sm font-semibold text-muted-foreground truncate">
                {card.title}
              </span>
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0",
                  card.iconColor,
                )}
              >
                <Icon className="size-5" />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
                {card.value}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  {card.subtext}
                </span>
                <TrendBadge
                  trend={card.trend}
                  changePercentage={card.changePercentage}
                  invertGood={card.invertGood}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
