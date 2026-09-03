"use client";

import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import type { TopVulnerabilityCategory } from "@/lib/types/analytics/types";

interface DashboardTopCweBarsProps {
  categories: TopVulnerabilityCategory[];
}

export function DashboardTopCweBars({ categories }: DashboardTopCweBarsProps) {
  // Sort descending by count
  const sorted = [...categories].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="size-5 text-primary" />
            <span>Top Vulnerability Classes (CWE)</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Most prevalent weakness categories across submissions
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
          {categories.length} categories
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No vulnerability categories classified in this window.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {sorted.map((cwe) => (
            <div key={cwe.cweId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md shrink-0">
                    {cwe.cweId}
                  </span>
                  <span className="font-semibold text-foreground truncate">
                    {cwe.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
                  {cwe.criticalCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <ShieldAlert className="size-3.5" />
                      <span>{cwe.criticalCount} crit</span>
                    </span>
                  )}
                  <span className="font-bold text-foreground">
                    {cwe.count}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({cwe.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Progress bar representing share of all reports */}
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(cwe.percentage, 2))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
