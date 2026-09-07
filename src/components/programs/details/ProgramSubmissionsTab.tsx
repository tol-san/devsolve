"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Bug,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  Award,
  Calendar,
  Layers,
} from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";
import { ReportItem } from "@/lib/types/reports/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import SeverityBadge from "@/components/reports/SeverityBadge";
import StatusBadge from "@/components/reports/StatusBadge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface ProgramSubmissionsTabProps {
  program: ProgramDetail;
  reports?: ReportItem[];
  isLoading?: boolean;
}

export const ProgramSubmissionsTab: React.FC<ProgramSubmissionsTabProps> = ({
  program,
  reports = [],
  isLoading = false,
}) => {
  const lp = useLocalePath();
  const submitReportHref = lp(`/dashboard/submit-report?programId=${program.id}`);

  const underTriageCount = reports.filter(
    (r) =>
      r.status === "TRIAGING" ||
      r.status === "SUBMITTED" ||
      (r as any).rawStatus === "TRIAGING",
  ).length;

  const resolvedCount = reports.filter(
    (r) =>
      r.status === "RESOLVED" ||
      r.status === "ACCEPTED" ||
      (r as any).rawStatus === "RESOLVED",
  ).length;

  return (
    <motion.div
      key="submissions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bug className="size-6 text-blue-600 dark:text-blue-400" />
              <span>Your Submissions</span>
            </h2>
            <Badge variant="secondary" className="font-bold text-xs">
              {reports.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Vulnerability reports and findings you have submitted for{" "}
            <span className="font-semibold text-foreground">{program.name}</span>.
          </p>
        </div>

        <Link href={submitReportHref} className="shrink-0">
          <Button className="w-full sm:w-auto h-10 rounded-xl font-semibold text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer">
            <Zap className="size-3.5" />
            <span>Submit a Report</span>
          </Button>
        </Link>
      </div>

      {/* Mini Metrics Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card p-4 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
              <Layers className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>Total Submitted</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {reports.length}
            </p>
          </div>

          <div className="bg-card p-4 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Clock className="size-3.5" />
              <span>Under Triage</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {underTriageCount}
            </p>
          </div>

          <div className="bg-card p-4 rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="size-3.5" />
              <span>Accepted / Resolved</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {resolvedCount}
            </p>
          </div>
        </div>
      )}

      {/* Reports Table or Empty State */}
      {isLoading ? (
        <div className="bg-card rounded-2xl p-8 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="space-y-3">
            <div className="h-12 bg-muted/60 rounded-xl" />
            <div className="h-12 bg-muted/60 rounded-xl" />
            <div className="h-12 bg-muted/60 rounded-xl" />
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 sm:p-14 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
            <Bug className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">
              No Submissions Yet
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You haven&apos;t submitted any vulnerability reports for this program yet. Find a vulnerability within the defined scope to submit your first finding.
            </p>
          </div>
          <div className="pt-2">
            <Link href={submitReportHref}>
              <Button className="rounded-xl font-semibold text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer">
                <Zap className="size-3.5" />
                Submit Your First Report
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="py-3.5 px-4 sm:px-6">Report ID</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Vulnerability Title</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Severity</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Status</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Reward / Status</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Activity</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report, idx) => (
                <TableRow
                  key={report.id || idx}
                  className="border-border hover:bg-muted/40 transition-colors group"
                >
                  <TableCell className="py-4 px-4 sm:px-6">
                    <Link
                      href={lp(`/dashboard/my-reports/${report.id}`)}
                      className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      {report.reportId || `#${report.id.slice(0, 8).toUpperCase()}`}
                    </Link>
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6 max-w-xs">
                    <Link
                      href={lp(`/dashboard/my-reports/${report.id}`)}
                      className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 text-sm block"
                    >
                      {report.title}
                    </Link>
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6">
                    <SeverityBadge severity={report.severity} />
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6">
                    <StatusBadge status={report.status} />
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6">
                    <span className="text-xs font-semibold text-foreground">
                      {report.bountyOrRep || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6 text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span>{report.lastActivityDate || "Recently"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-4 sm:px-6 text-right">
                    <Link href={lp(`/dashboard/my-reports/${report.id}`)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-semibold gap-1 text-muted-foreground group-hover:text-foreground cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};
