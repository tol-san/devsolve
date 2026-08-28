import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";

import type { ManagedReport } from "@/components/report-management/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ReportManagementListProps = {
  reports: ManagedReport[];
  filteredCount: number;
};

function typeBadgeClass(type: ManagedReport["type"]) {
  return type === "Bounty"
    ? "border-blue-200 bg-blue-600 text-white dark:border-blue-500/30"
    : "border-border bg-foreground text-background";
}

function statusBadgeClass(status: ManagedReport["status"]) {
  return status === "Open"
    ? "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300"
    : "border-border bg-muted text-muted-foreground";
}

function severityBadgeClass(severity: ManagedReport["severity"]) {
  if (severity === "Critical")
    return "border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-500/20 dark:text-rose-300";
  if (severity === "High")
    return "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-500/20 dark:text-amber-300";
  if (severity === "Medium")
    return "border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-500/20 dark:text-blue-300";
  return "border-border bg-muted text-muted-foreground";
}

export function ReportManagementList({
  reports,
  filteredCount,
}: ReportManagementListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3.5 sm:px-6">Report</TableHead>
            <TableHead className="px-4 py-3.5 sm:px-6">Type</TableHead>
            <TableHead className="px-4 py-3.5 sm:px-6">Status</TableHead>
            <TableHead className="px-4 py-3.5 sm:px-6">Severity</TableHead>
            <TableHead className="px-4 py-3.5 sm:px-6">Submitted</TableHead>
            <TableHead className="px-4 py-3.5 text-right sm:px-6">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={FileSearch}
              title="No reports match the current filters"
              description="The queue still holds reports — the type, status or severity you picked is hiding them."
            />
          ) : (
            reports.map((report, index) => (
              <MotionTableRow
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="group"
              >
                <TableCell className="px-4 py-4 whitespace-normal sm:px-6">
                  <div className="flex items-start gap-3">
                    <Avatar
                      size="lg"
                      className="rounded-xl border border-border bg-muted text-foreground"
                    >
                      <AvatarFallback className="rounded-xl bg-muted font-semibold text-foreground">
                        {report.authorInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {report.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <span>{report.authorEmail}</span>
                        <span className="text-muted-foreground/50">&bull;</span>
                        <span>Report #{report.id}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {report.assets.slice(0, 2).map((asset) => (
                          <span
                            key={asset}
                            className="inline-flex max-w-[150px] truncate rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 sm:px-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-sm font-semibold",
                      typeBadgeClass(report.type)
                    )}
                  >
                    {report.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4 sm:px-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-sm font-semibold",
                      statusBadgeClass(report.status)
                    )}
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4 sm:px-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-sm font-semibold",
                      severityBadgeClass(report.severity)
                    )}
                  >
                    {report.severity}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4 text-sm font-medium text-muted-foreground sm:px-6">
                  {report.submittedAt}
                </TableCell>
                <TableCell className="px-4 py-4 text-right sm:px-6">
                  <Link
                    href={`/dashboard/report-management/${report.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-xl"
                    )}
                  >
                    Review
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </TableCell>
              </MotionTableRow>
            ))
          )}
        </TableBody>
      </Table>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-border bg-muted/40 p-4 sm:flex-row">
        <span className="text-sm font-medium text-muted-foreground">
          Showing {reports.length} of {filteredCount} matching reports
        </span>
        <span className="text-sm text-muted-foreground">
          Review queue updated for the latest moderation activity
        </span>
      </footer>
    </div>
  );
}
