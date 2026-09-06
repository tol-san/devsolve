"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Clock, ArrowRight, User } from "lucide-react";

import type { ManagedReport } from "@/components/report-management/types";
import {
  getWorkflowStatusBadge,
  getSeverityBadge,
  getTypeBadgeClass,
  getDisplayReportId,
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/25",
        isRetesting &&
          "ring-1 ring-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.06] via-card to-card",
      )}
    >
      <div className="space-y-4">
        {/* Top Header: Submitter + Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted border border-border shadow-2xs">
              {report.programLogo ? (
                <Image
                  src={report.programLogo}
                  alt={`${report.title} logo`}
                  width={36}
                  height={36}
                  className="size-8 object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {report.authorInitials || <User className="size-4 text-muted-foreground" />}
                </span>
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-xs font-semibold text-foreground truncate block">
                {report.author}
              </span>
              <span className="text-[11px] text-muted-foreground truncate block">
                {report.authorEmail || "Security Researcher"}
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
            <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
              {report.title}
            </h3>
          </Link>
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {report.summary || "No vulnerability summary provided."}
          </p>
        </div>

        {/* Meta Badges Row: ID, Type, Severity */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
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

          <div className="ml-auto shrink-0">{getSeverityBadge(report)}</div>
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
                {asset}
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
