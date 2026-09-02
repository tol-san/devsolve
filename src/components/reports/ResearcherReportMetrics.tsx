"use client";

import React from "react";
import {
  FileText,
  RotateCcw,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResearcherReportMetricsProps {
  total: number;
  retestCount: number;
  underTriageCount: number;
  resolvedCount: number;
  programsCount: number;
  activeTab: "All" | "Retesting" | "Open" | "Resolved";
  onTabChange: (tab: "All" | "Retesting" | "Open" | "Resolved") => void;
  isLoading?: boolean;
}

export function ResearcherReportMetrics({
  total,
  retestCount,
  underTriageCount,
  resolvedCount,
  programsCount,
  activeTab,
  onTabChange,
  isLoading = false,
}: ResearcherReportMetricsProps) {
  const metrics = [
    {
      id: "All" as const,
      title: "Total Submissions",
      value: total,
      helper: `Across ${programsCount} program${programsCount === 1 ? "" : "s"}`,
      icon: FileText,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      activeRing: "ring-2 ring-blue-500 bg-blue-500/5",
    },
    {
      id: "Retesting" as const,
      title: "Retest Requests",
      value: retestCount,
      helper: retestCount > 0 ? "Fixes awaiting your test" : "No pending retests",
      icon: RotateCcw,
      iconBg:
        retestCount > 0
          ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
          : "bg-muted text-muted-foreground",
      activeRing: "ring-2 ring-cyan-500 bg-cyan-500/5",
      isActionRequired: retestCount > 0,
    },
    {
      id: "Open" as const,
      title: "Under Triage",
      value: underTriageCount,
      helper: "Awaiting review & validation",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      activeRing: "ring-2 ring-amber-500 bg-amber-500/5",
    },
    {
      id: "Resolved" as const,
      title: "Resolved & Accepted",
      value: resolvedCount,
      helper: "Closed vulnerabilities",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      activeRing: "ring-2 ring-emerald-500 bg-emerald-500/5",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl cursor-pointer transition-all duration-200"
          >
            <Card
              className={cn(
                "relative overflow-hidden rounded-2xl bg-card/90 text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                isActive && item.activeRing,
                item.isActionRequired &&
                  !isActive &&
                  "ring-1 ring-cyan-500/40 bg-gradient-to-br from-cyan-500/10 via-card to-card"
              )}
            >
              {/* Highlight badge for action required */}
              {item.isActionRequired && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider animate-pulse">
                  <Sparkles className="size-2.5" />
                  <span>Action</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shrink-0",
                      item.iconBg
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        item.id === "Retesting" && retestCount > 0 && "animate-spin-slow"
                      )}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground/80 truncate">
                      {item.helper}
                    </span>
                  </div>
                </div>

                {!item.isActionRequired && (
                  <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-foreground/70 transition-colors shrink-0" />
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                )}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {isActive ? "Filtered" : "Filter"} &rarr;
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </section>
  );
}
