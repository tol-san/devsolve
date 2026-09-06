"use client";

import React from "react";
import { ShieldCheck, Timer, CheckCircle, Target } from "lucide-react";
import type { SlaMetrics } from "@/lib/types/analytics/types";

interface DashboardSlaStripProps {
  sla: SlaMetrics;
}

export function DashboardSlaStrip({ sla }: DashboardSlaStripProps) {
  const isCompliant = sla.slaCompliancePercentage >= 90;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 lg:p-6 shadow-2xs backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ShieldCheck className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                SLA Performance & Response Targets
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0 self-start sm:self-auto">
                Target ≤ {sla.triageTargetHours}h triage
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Response velocity metrics based on confirmed submissions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-border/60 shrink-0">
          <div className="flex items-center justify-between sm:flex-col sm:items-start p-3 sm:p-0 rounded-xl bg-muted/30 sm:bg-transparent border border-border/50 sm:border-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Timer className="size-3.5 text-muted-foreground shrink-0" />
              <span>Mean Triage</span>
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums sm:mt-1">
              {sla.meanTimeToTriageHours.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">h</span>
            </span>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-start p-3 sm:p-0 rounded-xl bg-muted/30 sm:bg-transparent border border-border/50 sm:border-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="size-3.5 text-muted-foreground shrink-0" />
              <span>Mean Resolution</span>
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums sm:mt-1">
              {sla.meanTimeToResolveDays.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">d</span>
            </span>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-start p-3 sm:p-0 rounded-xl bg-muted/30 sm:bg-transparent border border-border/50 sm:border-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="size-3.5 text-muted-foreground shrink-0" />
              <span>SLA Compliance</span>
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold tabular-nums sm:mt-1 ${
                isCompliant
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {sla.slaCompliancePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
