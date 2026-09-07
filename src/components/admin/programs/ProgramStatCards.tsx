"use client";

import React from "react";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ProgramStatCardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const ProgramStatCards: React.FC<ProgramStatCardsProps> = ({
  total,
  pending,
  approved,
  rejected,
}) => {
  const stats = [
    {
      title: "Total Programs",
      value: total,
      subtext: `${pending} awaiting review`,
      icon: Building2,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      glow: "from-blue-500/15 via-blue-500/5 to-transparent",
      badgeClass: pending > 0
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-muted text-muted-foreground border-border",
      hoverBorder: "hover:border-blue-500/30",
    },
    {
      title: "Pending Review",
      value: pending,
      subtext: "Requires admin approval",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      glow: "from-amber-500/15 via-amber-500/5 to-transparent",
      badgeClass: pending > 0
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-muted text-muted-foreground border-border",
      hoverBorder: "hover:border-amber-500/30",
    },
    {
      title: "Approved Programs",
      value: approved,
      subtext: "Passed admin review",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      glow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/30",
    },
    {
      title: "Rejected Programs",
      value: rejected,
      subtext: "Declined by admin",
      icon: XCircle,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      glow: "from-rose-500/15 via-rose-500/5 to-transparent",
      badgeClass: rejected > 0
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        : "bg-muted text-muted-foreground border-border",
      hoverBorder: "hover:border-rose-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 hover:shadow-md",
              stat.hoverBorder,
            )}
          >
            {/* Ambient Radial Color Glow */}
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-60 blur-xl transition-opacity group-hover:opacity-100",
                stat.glow,
              )}
            />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                {stat.title}
              </span>
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl border p-2 shadow-2xs transition-transform duration-200 group-hover:scale-105",
                  stat.iconBg,
                )}
              >
                <Icon className="size-5" />
              </div>
            </div>

            <div className="relative z-10 mt-3 space-y-1.5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {stat.value.toLocaleString()}
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                    stat.badgeClass,
                  )}
                >
                  {stat.subtext}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
