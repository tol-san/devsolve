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
    <div className="rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6 shadow-2xs backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left header */}
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
              <span>SLA Performance & Response Targets</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Target ≤ {sla.triageTargetHours}h triage
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Response velocity metrics based on confirmed submissions
            </p>
          </div>
        </div>

        {/* Right metrics strip */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
          {/* Metric 1: Mean Time to Triage */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Timer className="size-3.5 text-muted-foreground" />
              <span>Mean Triage</span>
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums mt-1">
              {sla.meanTimeToTriageHours.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">h</span>
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              vs {sla.triageTargetHours}h target
            </span>
          </div>

          {/* Metric 2: Mean Time to Resolve */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="size-3.5 text-muted-foreground" />
              <span>Mean Resolution</span>
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums mt-1">
              {sla.meanTimeToResolveDays.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">d</span>
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">From triage to fix</span>
          </div>

          {/* Metric 3: SLA Compliance */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="size-3.5 text-muted-foreground" />
              <span>SLA Compliance</span>
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold tabular-nums mt-1 ${
                isCompliant
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {sla.slaCompliancePercentage.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              within {sla.triageTargetHours}h SLA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
