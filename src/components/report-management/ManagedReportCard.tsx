"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Clock, RotateCcw } from "lucide-react";

import type { ManagedReport } from "@/components/report-management/types";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { reportListGridClass } from "@/components/report-management/report-list-layout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function getTypeBadgeClass(type: ManagedReport["type"]) {
  return type === "Bounty"
    ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
    : "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300";
}

export function getWorkflowStatusBadge(report: ManagedReport) {
  if (report.queueState === "APPROVED") {
    return (
      <Badge
        variant="outline"
        className="h-7 min-w-[96px] justify-center rounded-full px-2.5 text-[11px] font-bold border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5"
      >
        <CheckCircle2 className="size-3 text-emerald-500" />
        <span>CONFIRMED</span>
      </Badge>
    );
  }

  if (
    report.queueState === "RETESTING" ||
    (report as unknown as { state?: string }).state === "RETESTING"
  ) {
    return (
      <Badge
        variant="outline"
        className="h-7 min-w-[96px] justify-center rounded-full px-2.5 text-[11px] font-bold border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 inline-flex items-center gap-1.5"
      >
        <RotateCcw className="size-3 text-cyan-500 animate-spin-slow" />
        <span>RETESTING</span>
      </Badge>
    );
  }

  if (report.queueState === "UNDER_REVIEW") {
    return (
      <Badge
        variant="outline"
        className="h-7 min-w-[96px] justify-center rounded-full px-2.5 text-[11px] font-bold border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300 inline-flex items-center gap-1.5"
      >
        <Clock className="size-3 text-blue-500" />
        <span>TRIAGING</span>
      </Badge>
    );
  }

  if (report.status === "Closed" || report.queueState === "CLOSED") {
    return (
      <Badge
        variant="outline"
        className="h-7 min-w-[96px] justify-center rounded-full px-2.5 text-[11px] font-bold border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300 inline-flex items-center gap-1.5"
      >
        <ShieldCheck className="size-3 text-purple-500" />
        <span>RESOLVED</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="h-7 min-w-[96px] justify-center rounded-full px-2.5 text-[11px] font-bold border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5"
    >
      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>PENDING</span>
    </Badge>
  );
}

export function getSeverityBadge(report: ManagedReport) {
  if (!report.severity) {
    return (
      <DisputedSeverityPair
        reportedSeverity={report.reportedSeverity}
        triageSeverity={report.triageSeverity}
        cvssScore={report.cvssScore ? String(report.cvssScore) : undefined}
        size="sm"
      />
    );
  }
  switch (report.severity) {
    case "Critical":
      return (
        <Badge className="h-7 min-w-[84px] justify-center rounded-full px-2.5 text-[11px] font-bold bg-red-600 text-white shadow-2xs">
          CRITICAL
        </Badge>
      );
    case "High":
      return (
        <Badge className="h-7 min-w-[84px] justify-center rounded-full px-2.5 text-[11px] font-bold bg-orange-500 text-white shadow-2xs">
          HIGH
        </Badge>
      );
    case "Medium":
      return (
        <Badge className="h-7 min-w-[84px] justify-center rounded-full px-2.5 text-[11px] font-bold bg-amber-500 text-white shadow-2xs">
          MEDIUM
        </Badge>
      );
    default:
      return (
        <Badge className="h-7 min-w-[84px] justify-center rounded-full px-2.5 text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
          LOW
        </Badge>
      );
  }
}

export const badgeBaseClass =
  "h-7 min-w-[80px] justify-center rounded-full px-3 text-[12px] font-semibold";

export type ManagedReportCardProps = {
  report: ManagedReport;
  isLast?: boolean;
};

export function getDisplayReportId(report: ManagedReport) {
  if (report.reportId?.trim()) return report.reportId;

  const rawId = String(report.id);
  if (/^\d+$/.test(rawId)) {
    return `RPT-2026-${rawId.padStart(5, "0")}`;
  }

  return `RPT-${rawId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function ManagedReportCard({
  report,
  isLast = false,
}: ManagedReportCardProps) {
  const reportId = getDisplayReportId(report);
  const visibleAssets = report.assets.slice(0, 2);
  const hiddenAssetsCount = Math.max(0, report.assets.length - visibleAssets.length);

  return (
    <Link
      href={`/dashboard/report-management/${report.id}`}
      aria-label={`Open report ${report.title}`}
      className={cn(
        "group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/30",
        !isLast && "border-b border-border"
      )}
      onKeyDown={(event) => {
        if (event.key === " ") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      <div className="px-6 py-4.5 transition-colors duration-200 group-hover:bg-muted/40">
        <div className={cn(reportListGridClass, "items-center")}>
          <div className="min-w-0">
            <div className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted border border-border shadow-2xs">
                {report.programLogo ? (
                  <Image
                    src={report.programLogo}
                    alt={`${report.title} logo`}
                    width={44}
                    height={44}
                    className="size-10 object-contain"
                  />
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    {report.authorInitials}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="space-y-0.5">
                  <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">{reportId}</span>
                    <span className="text-muted-foreground/60">&bull;</span>
                    <span className="truncate">{report.author}</span>
                    <span className="text-muted-foreground/60">&bull;</span>
                    <span>{report.submittedAt}</span>
                  </p>
                </div>

                <p className="line-clamp-1 text-sm leading-relaxed text-muted-foreground">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {visibleAssets.map((asset) => (
              <span
                key={asset}
                className="inline-flex max-w-[165px] truncate rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                title={asset}
              >
                {asset}
              </span>
            ))}
            {hiddenAssetsCount > 0 ? (
              <span className="inline-flex rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{hiddenAssetsCount} more
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={cn(badgeBaseClass, getTypeBadgeClass(report.type))}
            >
              {report.type}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            {getWorkflowStatusBadge(report)}
          </div>

          <div className="flex items-center justify-center">
            {getSeverityBadge(report)}
          </div>
        </div>
      </div>
    </Link>
  );
}
