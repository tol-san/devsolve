"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Clock, ArrowRight, Shield } from "lucide-react";

import type { ManagedReport } from "@/components/report-management/types";
import {
  getWorkflowStatusBadge,
  getSeverityBadge,
  getTypeBadgeClass,
  getDisplayReportId,
  formatAssetLabel,
  formatReportTitle,
} from "./ManagedReportCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ManagedReportGridCardProps {
  report: ManagedReport;
  index: number;
}

export function ManagedReportGridCard({ report, index }: ManagedReportGridCardProps) {
  const reportId = getDisplayReportId(report);
  const visibleAssets = report.assets.slice(0, 2);
  const hiddenAssetsCount = Math.max(0, report.assets.length - visibleAssets.length);
  const isRetesting =
    report.queueState === "RETESTING" ||
    (report as unknown as { state?: string }).state === "RETESTING";

  const orgLogo = report.organizationLogoUrl || report.programLogo;
  const orgName = report.organizationName;
  const progName = report.programName;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/25 min-w-0",
        isRetesting &&
          "ring-1 ring-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.06] via-card to-card",
      )}
    >
      <div className="space-y-3 sm:space-y-3.5 min-w-0">
        {/* Top Header: Program/Org Context + Status */}
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted border border-border shadow-2xs">
              {orgLogo ? (
                <Image
                  src={orgLogo}
                  alt={orgName || "Organization logo"}
                  width={28}
                  height={28}
                  className="size-6 object-contain"
                  unoptimized
                />
              ) : (
                <Shield className="size-3.5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0 flex items-center gap-1 text-xs leading-tight">
              {orgName ? (
                <>
                  <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[150px]" title={orgName}>
                    {orgName}
                  </span>
                  <span className="text-muted-foreground/40 shrink-0">/</span>
                </>
              ) : null}
              <span className="text-muted-foreground truncate" title={progName || "Program"}>
                {progName || "Program"}
              </span>
            </div>
          </div>

          <div className="shrink-0">{getWorkflowStatusBadge(report)}</div>
        </div>

        {/* Title + Summary */}
        <div className="space-y-1.5 min-w-0">
          <Link
            href={`/dashboard/report-management/${report.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug break-all [word-break:break-word]">
              {formatReportTitle(report.title)}
            </h3>
          </Link>
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
            {report.summary || "No vulnerability summary provided."}
          </p>
        </div>

        {/* Submitter / Researcher Section */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/50 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border shadow-2xs">
              {report.authorAvatarUrl ? (
                <Image
                  src={report.authorAvatarUrl}
                  alt={report.author}
                  width={28}
                  height={28}
                  className="size-7 object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <span className="text-[10px] font-bold text-foreground">
                  {report.authorInitials || "SR"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground truncate max-w-[140px]" title={report.author}>
                {report.author}
              </span>
              {report.authorUsername && (
                <span className="text-[11px] text-muted-foreground truncate hidden xs:inline">
                  @{report.authorUsername}
                </span>
              )}
            </div>
          </div>

          {typeof report.authorReputation === "number" && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-bold rounded-md border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-0.5 shrink-0"
            >
              <span>★</span>
              <span>{report.authorReputation.toLocaleString()}</span>
            </Badge>
          )}
        </div>

        {/* Meta Badges Row: ID, Type, Severity */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground border border-border">
              {reportId}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "h-6 px-2 text-[11px] font-bold rounded-full",
                getTypeBadgeClass(report.type),
              )}
            >
              {report.type}
            </Badge>
          </div>

          <div className="shrink-0">{getSeverityBadge(report)}</div>
        </div>

        {/* Assets Section */}
        {report.assets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visibleAssets.map((asset) => (
              <span
                key={asset}
                className="inline-flex max-w-[200px] truncate rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                title={asset}
              >
                {formatAssetLabel(asset)}
              </span>
            ))}
            {hiddenAssetsCount > 0 && (
              <span className="inline-flex rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{hiddenAssetsCount} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Date + Action Link */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
          <span className="truncate">{report.submittedAt}</span>
        </div>

        <Link
          href={`/dashboard/report-management/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-all hover:underline"
        >
          <span>Review</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
