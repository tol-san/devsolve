"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCompanyReportsQueueQuery } from "@/lib/redux/services/reportsApi";
import { formatDate } from "@/lib/discussions/format";

interface DashboardRecentReportsTableProps {
  programId?: string;
}

const SEVERITY_BADGES: Record<string, string> = {
  CRITICAL: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  NONE: "bg-muted text-muted-foreground border-border",
};

const STATE_BADGES: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  TRIAGING: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  NEEDS_MORE_INFO: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  VALID_CONFIRMED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  RETESTING: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  RESOLVED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  DUPLICATE: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function DashboardRecentReportsTable({
  programId,
}: DashboardRecentReportsTableProps) {
  const { data, isLoading } = useGetCompanyReportsQueueQuery({
    programId,
    size: 8,
    sort: "submittedAt,desc",
  });

  const reports = data?.content ?? [];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-2 border-b border-border/70">
        <div className="w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary shrink-0" />
            <span>Recent Vulnerability Reports</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Latest submissions waiting for triage or resolution
          </p>
        </div>
        <Link
          href="/dashboard/report-management"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap"
        >
          <span>View all reports</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Report
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Severity
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Submitted
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No recent reports found in queue.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const sev = (
                  report.triageSeverity ??
                  report.severity ??
                  report.reportedSeverity ??
                  "LOW"
                ).toUpperCase();
                const state = (report.state ?? "NEW").toUpperCase();
                const reportCode =
                  report.reportCode ||
                  report.reportId ||
                  `RPT-${report.id.slice(0, 8).toUpperCase()}`;

                return (
                  <TableRow
                    key={report.id}
                    className="border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="max-w-[240px] py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate">
                          {report.title || "Untitled Vulnerability"}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {reportCode}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          SEVERITY_BADGES[sev] || SEVERITY_BADGES.NONE
                        }`}
                      >
                        {sev}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          STATE_BADGES[state] || STATE_BADGES.NEW
                        }`}
                      >
                        {state.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap py-3.5 px-4">
                      {report.submittedAt || report.createdAt
                        ? formatDate(report.submittedAt || report.createdAt || "")
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right py-3.5 px-4">
                      <Link
                        href={`/dashboard/report-management?reportId=${report.id}`}
                        className="inline-flex h-8 items-center rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        Triage
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
