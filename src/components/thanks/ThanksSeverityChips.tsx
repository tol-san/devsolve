"use client";

import React from "react";
import type { Severity } from "@/lib/types/thanks/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThanksSeverityChipsProps {
  bySeverity?: Partial<Record<Severity, number>>;
  className?: string;
  variant?: "chips" | "compact";
}

const SEVERITY_METADATA: Record<
  Severity,
  { label: string; badgeClass: string; barColor: string }
> = {
  CRITICAL: {
    label: "Critical",
    badgeClass:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    barColor: "bg-red-500",
  },
  HIGH: {
    label: "High",
    badgeClass:
      "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    barColor: "bg-orange-500",
  },
  MEDIUM: {
    label: "Medium",
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    barColor: "bg-amber-500",
  },
  LOW: {
    label: "Low",
    badgeClass:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    barColor: "bg-blue-500",
  },
  NONE: {
    label: "None",
    badgeClass:
      "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
    barColor: "bg-slate-500",
  },
};

const ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"];

export function ThanksSeverityChips({
  bySeverity = {},
  className,
  variant = "chips",
}: ThanksSeverityChipsProps) {
  const activeEntries = ORDER.map((sev) => ({
    severity: sev,
    count: bySeverity[sev] ?? 0,
    ...SEVERITY_METADATA[sev],
  })).filter((item) => item.count > 0);

  if (activeEntries.length === 0) {
    return (
      <span className="text-xs text-muted-foreground/70 italic">
        General recognition
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        {activeEntries.map((item) => (
          <span
            key={item.severity}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold",
              item.badgeClass
            )}
            title={`${item.count} ${item.label} severity`}
          >
            <span className="font-bold">{item.count}</span>
            <span className="text-[10px] opacity-80">{item.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {activeEntries.map((item) => (
        <Badge
          key={item.severity}
          variant="outline"
          className={cn(
            "rounded-lg px-2 py-0.5 text-xs font-semibold gap-1 transition-colors",
            item.badgeClass
          )}
        >
          <span className="font-bold tabular-nums">{item.count}</span>
          <span>{item.label}</span>
        </Badge>
      ))}
    </div>
  );
}
