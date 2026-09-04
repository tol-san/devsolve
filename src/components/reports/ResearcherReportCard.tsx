"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Eye,
  RotateCcw,
  DollarSign,
  Award,
  ChevronRight,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";
import { ReportItem } from "@/lib/redux/services/reportsApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { cn } from "@/lib/utils";

interface ResearcherReportCardProps {
  report: ReportItem;
  index: number;
  onQuickView: (report: ReportItem) => void;
}

export function ResearcherReportCard({
  report,
  index,
  onQuickView,
}: ResearcherReportCardProps) {
  const isRetesting =
    report.status === "RETESTING" || (report as any).rawStatus === "RETESTING";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        isRetesting &&
          "ring-1 ring-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.07] via-card to-card"
      )}
    >
      {/* Top Header: Program info + Quick Preview */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs shrink-0 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 rounded-xl font-bold">
                {report.avatarLetter}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-muted-foreground truncate block">
                {report.program}
              </span>
              <Link
                href={`/dashboard/my-reports/${report.id}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                {report.reportId}
                {isRetesting && (
                  <span className="size-1.5 rounded-full bg-cyan-500 animate-ping inline-block" />
                )}
              </Link>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onQuickView(report)}
            aria-label="Quick preview"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
          >
            <Eye className="size-4" />
          </Button>
        </div>

        {/* Title */}
        <Link href={`/dashboard/my-reports/${report.id}`} className="block group">
          <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {report.title}
          </h3>
        </Link>

        {/* Severity & Status Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {report.severity ? (
            <SeverityBadge severity={report.severity} />
          ) : (
            <DisputedSeverityPair
              reportedSeverity={report.reportedSeverity}
              triageSeverity={report.triageSeverity}
              size="sm"
            />
          )}
          <StatusBadge status={report.status} />
          {report.type && (
            <Badge
              variant="secondary"
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
            >
              {report.type}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Footer: Bounty/Rep + Last Activity + Primary CTA */}
      <div className="mt-5 pt-4 border-t border-border/70 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Bounty or Reputation Badge */}
          {report.isBountyHighlight ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-2xs">
              <DollarSign className="size-3.5" />
              <span>{report.bountyOrRep}</span>
            </span>
          ) : report.bountyOrRep === "Reputation" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-indigo-600 bg-indigo-500/10 dark:text-indigo-300 border border-indigo-500/20">
              <Award className="size-3.5" />
              <span>Reputation</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {report.bountyOrRep}
            </span>
          )}

          {/* Activity Date */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            <span>{report.lastActivityDate}</span>
          </div>
        </div>

        {/* Action Button */}
        {isRetesting ? (
          <Link href={`/dashboard/my-reports/${report.id}`} className="w-full">
            <Button
              size="sm"
              className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="size-3.5 animate-spin-slow" />
              <span>Verify Remediation Fix</span>
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/my-reports/${report.id}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-semibold h-8.5 justify-between px-3 cursor-pointer hover:bg-muted transition-colors"
            >
              <span>View Report Details</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Button>
          </Link>
        )}
      </div>
    </motion.article>
  );
}
