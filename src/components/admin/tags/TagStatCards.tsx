"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Tag, Activity, Sparkles, AlertCircle } from "lucide-react";
import type { TagResponse } from "@/lib/redux/services/tagsApi";
import { cn } from "@/lib/utils";

interface TagStatCardsProps {
  tags: TagResponse[];
  isLoading?: boolean;
}

export function TagStatCards({ tags, isLoading = false }: TagStatCardsProps) {
  const stats = useMemo(() => {
    const total = tags.length;
    const inUse = tags.filter((t) => (t.usageCount ?? 0) > 0).length;
    const unused = tags.filter((t) => (t.usageCount ?? 0) === 0).length;

    const sortedByUsage = [...tags].sort(
      (a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0),
    );
    const topTag = sortedByUsage[0]?.usageCount
      ? `#${sortedByUsage[0].name} (${sortedByUsage[0].usageCount})`
      : "None";

    return [
      {
        id: "total",
        label: "Total Tags",
        value: total,
        subtext: "Community & system tags",
        icon: Tag,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
      },
      {
        id: "in-use",
        label: "In Active Use",
        value: inUse,
        subtext: "Linked to posts & showcases",
        icon: Activity,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
      },
      {
        id: "unused",
        label: "Unused / Orphan",
        value: unused,
        subtext: "Zero references across posts",
        icon: AlertCircle,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
      },
      {
        id: "top-tag",
        label: "Most Active Tag",
        value: topTag,
        subtext: "Highest community usage",
        icon: Sparkles,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-500/10",
      },
    ];
  }, [tags]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border bg-muted/50 p-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="space-y-1 min-w-0 pr-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <p
                className={cn(
                  "font-bold tracking-tight text-foreground truncate",
                  typeof stat.value === "string" ? "text-lg font-mono" : "text-2xl",
                )}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">{stat.subtext}</p>
            </div>
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                stat.bgColor,
                stat.color,
              )}
            >
              <Icon className="size-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
