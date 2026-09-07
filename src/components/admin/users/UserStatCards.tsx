"use client";

import React from "react";
import { FileText, ShieldAlert, UserCheck, Users } from "lucide-react";
import { AdminUserItem } from "@/lib/redux/services/adminApi";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "./UserFiltersBar";

interface UserStatCardsProps {
  users: AdminUserItem[];
  totalCount?: number;
  onSelectStatus?: (status: StatusFilter) => void;
  activeStatusFilter?: StatusFilter;
}

export function UserStatCards({
  users,
  totalCount,
  onSelectStatus,
  activeStatusFilter,
}: UserStatCardsProps) {
  const total = typeof totalCount === "number" ? totalCount : users.length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const totalReports = users.reduce((acc, u) => acc + (u.reportsSubmitted || 0), 0);
  const suspended = users.filter((u) => u.status === "SUSPENDED").length;

  const stats = [
    {
      title: "Total Users",
      value: total,
      subtext: suspended > 0 ? `${suspended} suspended` : "Registered accounts",
      icon: Users,
      filterKey: "ALL" as StatusFilter,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      glow: "from-blue-500/15 via-blue-500/5 to-transparent",
      badgeClass:
        suspended > 0
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          : "bg-muted text-muted-foreground border-border",
      hoverBorder: "hover:border-blue-500/30",
    },
    {
      title: "Active Users",
      value: activeCount,
      subtext: "Active accounts",
      icon: UserCheck,
      filterKey: "ACTIVE" as StatusFilter,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      glow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/30",
    },
    {
      title: "Reports Submitted",
      value: totalReports,
      subtext: "Across active users",
      icon: FileText,
      filterKey: undefined,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      glow: "from-purple-500/15 via-purple-500/5 to-transparent",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      hoverBorder: "hover:border-purple-500/30",
    },
    {
      title: "Suspended Accounts",
      value: suspended,
      subtext: suspended > 0 ? "Require admin review" : "No restrictions",
      icon: ShieldAlert,
      filterKey: "SUSPENDED" as StatusFilter,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      glow: "from-rose-500/15 via-rose-500/5 to-transparent",
      badgeClass:
        suspended > 0
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          : "bg-muted text-muted-foreground border-border",
      hoverBorder: "hover:border-rose-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isClickable = Boolean(onSelectStatus && stat.filterKey);
        const isSelected =
          activeStatusFilter !== undefined &&
          stat.filterKey !== undefined &&
          activeStatusFilter === stat.filterKey;

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => {
              if (isClickable && stat.filterKey) {
                onSelectStatus?.(stat.filterKey);
              }
            }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 hover:shadow-md",
              isSelected
                ? "border-primary ring-2 ring-primary/20 shadow-xs"
                : "border-border/80",
              stat.hoverBorder,
              isClickable && "cursor-pointer",
            )}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && stat.filterKey && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelectStatus?.(stat.filterKey);
              }
            }}
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
}
