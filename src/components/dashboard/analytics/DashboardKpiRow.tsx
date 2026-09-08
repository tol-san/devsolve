"use client";

import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiSummary } from "@/lib/types/analytics/types";

interface DashboardKpiRowProps {
  kpi: KpiSummary;
}

function formatBountyAmount(amount: number): string {
  const hasCents = amount % 1 !== 0;
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })}`;
}

export function DashboardKpiRow({ kpi }: DashboardKpiRowProps) {
  const cards = [
    {
      title: "Total Reports",
      value: kpi.totalReports.value.toLocaleString(),
      subtext: "All vulnerability submissions",
      icon: FileText,
    },
    {
      title: "Accepted Reports",
      value: kpi.acceptedReports.value.toLocaleString(),
      subtext: `${kpi.acceptedReports.acceptanceRate.toFixed(1)}% acceptance rate`,
      icon: CheckCircle2,
    },
    {
      title: "Rejected Reports",
      value: kpi.rejectedReports.value.toLocaleString(),
      subtext: `${kpi.rejectedReports.rejectionRate.toFixed(1)}% rejection rate`,
      icon: XCircle,
    },
    {
      title: "Bounties Paid",
      value: formatBountyAmount(kpi.totalBountiesPaid.amount),
      subtext: `${kpi.reputationPointsAwarded.toLocaleString()} rep points awarded`,
      icon: DollarSign,
    },
    {
      title: "Active Researchers",
      value: kpi.activeResearchers.value.toLocaleString(),
      subtext: "Contributing researchers",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isFifthOnTwoCol = idx === 4;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 select-none flex flex-col justify-between gap-3 min-w-0",
              isFifthOnTwoCol && "sm:col-span-2 md:col-span-1",
            )}
          >
            {/* Ambient radial color glow in corner combining primary blue + emerald accent */}
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10 flex items-start justify-between gap-2">
              <span
                className="text-xs sm:text-sm font-semibold text-foreground/80 leading-snug line-clamp-2 min-w-0 group-hover:text-foreground transition-colors"
                title={card.title}
              >
                {card.title}
              </span>
              <div
                className="size-9 rounded-xl flex items-center justify-center border border-primary/20 bg-primary/10 text-primary shadow-2xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <Icon className="size-4.5" />
              </div>
            </div>

            <div className="relative z-10 space-y-2 mt-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans leading-none text-foreground tabular-nums truncate transition-colors group-hover:text-primary">
                {card.value}
              </div>
              <div className="pt-2 border-t border-border/50">
                <span
                  className="text-xs text-muted-foreground truncate block min-w-0"
                  title={card.subtext}
                >
                  {card.subtext}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
