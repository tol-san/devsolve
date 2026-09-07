"use client";

import React from "react";
import { motion } from "motion/react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import { ShieldAlert, FileCheck, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportConfirmationStatCardsProps {
  reports: ReportConfirmationItem[];
}

export function ReportConfirmationStatCards({ reports }: ReportConfirmationStatCardsProps) {
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const criticalCount = reports.filter(
    (r) => r.severity === "Critical" && r.status === "PENDING",
  ).length;
  const confirmedCount = reports.filter((r) => r.status === "CONFIRMED").length;
  const rejectedCount = reports.filter((r) => r.status === "REJECTED").length;

  const stats = [
    {
      label: "Pending Triage",
      value: pendingCount,
      subtext: "Awaiting security audit",
      icon: Clock,
      glow: "from-amber-500/15 via-primary/5 to-transparent",
      badge: "Action Required",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    },
    {
      label: "Critical Queue",
      value: criticalCount,
      subtext: "High-urgency vulnerabilities",
      icon: ShieldAlert,
      glow: "from-rose-500/15 via-primary/5 to-transparent",
      badge: criticalCount > 0 ? "Urgent" : "Clear",
      badgeClass: criticalCount > 0
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
        : "bg-muted text-muted-foreground border-border/60",
    },
    {
      label: "Confirmed & Forwarded",
      value: confirmedCount,
      subtext: "Approved to program owners",
      icon: FileCheck,
      glow: "from-emerald-500/15 via-primary/5 to-transparent",
      badge: "Verified",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    },
    {
      label: "Rejected / Out of Scope",
      value: rejectedCount,
      subtext: "Dismissed submissions",
      icon: XCircle,
      glow: "from-primary/15 via-primary/5 to-transparent",
      badge: "Archived",
      badgeClass: "bg-muted text-muted-foreground border-border/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 flex flex-col justify-between gap-3 min-w-0 select-none"
          >
            {/* Ambient radial corner glow */}
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-gradient-to-br opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-100",
                item.glow,
              )}
            />

            <div className="relative z-10 flex items-start justify-between gap-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground/80 leading-snug group-hover:text-foreground transition-colors">
                {item.label}
              </span>
              <div className="size-9 sm:size-10 rounded-xl flex items-center justify-center border border-primary/20 bg-primary/10 text-primary shadow-2xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <Icon className="size-4.5 sm:size-5" />
              </div>
            </div>

            <div className="relative z-10 space-y-2 mt-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans leading-none text-foreground tabular-nums truncate transition-colors group-hover:text-primary">
                {item.value}
              </div>
              <div className="flex items-center justify-between gap-1.5 min-w-0 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground truncate" title={item.subtext}>
                  {item.subtext}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs shrink-0",
                    item.badgeClass,
                  )}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
