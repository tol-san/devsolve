"use client";

import { motion } from "motion/react";
import { AlertTriangle, CheckCircle, Copy, ShieldAlert, XCircle } from "lucide-react";
import { SeverityStats } from "@/lib/types/profile/types";

interface SeverityBreakdownProps {
  severity: SeverityStats;
}

const SEVERITY_CONFIG: Array<{
  key: keyof Pick<SeverityStats, "critical" | "high" | "medium" | "low">;
  label: string;
  badgeClass: string;
  barColor: string;
  bgLight: string;
}> = [
  {
    key: "critical",
    label: "Critical",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    barColor: "bg-red-500",
    bgLight: "bg-red-500/5",
  },
  {
    key: "high",
    label: "High",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    barColor: "bg-orange-500",
    bgLight: "bg-orange-500/5",
  },
  {
    key: "medium",
    label: "Medium",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    barColor: "bg-amber-400",
    bgLight: "bg-amber-500/5",
  },
  {
    key: "low",
    label: "Low",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    barColor: "bg-blue-500",
    bgLight: "bg-blue-500/5",
  },
];

export default function SeverityBreakdown({ severity }: SeverityBreakdownProps) {
  const totalFindings =
    severity.critical + severity.high + severity.medium + severity.low;
  const max = Math.max(severity.critical, severity.high, severity.medium, severity.low, 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Vulnerability Impact & Severity
            </h2>
            <p className="text-xs text-muted-foreground">
              Breakdown of valid reports classified by CVSS severity
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {totalFindings} total findings
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {SEVERITY_CONFIG.map((row) => {
          const value = severity[row.key];
          const pct = totalFindings > 0 ? (value / totalFindings) * 100 : 0;
          const barPct = Math.max((value / max) * 100, value > 0 ? 6 : 0);

          return (
            <div key={row.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${row.badgeClass}`}>
                  {row.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="font-extrabold tabular-nums text-foreground">
                    {value}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${row.barColor}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
        <div className="flex flex-col items-center rounded-xl bg-muted/40 p-3 text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <XCircle className="size-3.5 text-red-500" />
            <span>Rejected</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular-nums text-red-500">
            {severity.rejected}
          </p>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-muted/40 p-3 text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Copy className="size-3.5 text-amber-500" />
            <span>Duplicate</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular-nums text-amber-500">
            {severity.duplicate}
          </p>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-muted/40 p-3 text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CheckCircle className="size-3.5 text-emerald-500" />
            <span>Retests</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {severity.retests}
          </p>
        </div>
      </div>
    </div>
  );
}
