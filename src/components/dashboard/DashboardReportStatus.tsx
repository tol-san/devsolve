"use client";

import React from "react";
import { ReportStatusDistribution } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardReportStatusProps {
  distribution: ReportStatusDistribution;
}

export const DashboardReportStatus: React.FC<DashboardReportStatusProps> = ({ distribution }) => {
  const t = useT();
  const { resolved, accepted, pending, other, total } = distribution;

  const items = [
    {
      label: t("dashboard.reportStatus.resolved"),
      count: resolved,
      color: "#10B981",
      bgClass: "bg-emerald-500",
      pillClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: t("dashboard.reportStatus.accepted"),
      count: accepted,
      color: "#3B82F6",
      bgClass: "bg-blue-500",
      pillClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      label: t("dashboard.reportStatus.pending"),
      count: pending,
      color: "#F59E0B",
      bgClass: "bg-amber-500",
      pillClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: t("dashboard.reportStatus.other"),
      count: other,
      color: "#94A3B8",
      bgClass: "bg-slate-400 dark:bg-neutral-500",
      pillClass: "bg-muted text-muted-foreground border-border",
    },
  ];

  const strokeWidth = 14;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = items.map((item) => {
    const percent = total > 0 ? item.count / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <h2 className="text-base font-semibold text-foreground">
            {t("dashboard.reportStatus.title")}
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {total} total filings
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-5">
          <div className="relative size-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="size-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                strokeWidth={strokeWidth}
                className="stroke-muted/50"
              />
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center select-none">
              <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {t("dashboard.reportStatus.total")}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2">
            {items.map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm py-1 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("size-2.5 rounded-full shadow-2xs", item.bgClass)} />
                    <span className="font-medium text-foreground text-xs sm:text-sm">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-bold text-foreground text-xs sm:text-sm">
                      {item.count}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal w-10 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
