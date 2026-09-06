"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ChevronRight,
  Scale,
  Shield,
  Tag,
} from "lucide-react";

interface ReportConfirmationCardProps {
  report: ReportConfirmationItem;
  onSelect?: (report: ReportConfirmationItem) => void;
  onQuickAction?: (report: ReportConfirmationItem, status: "CONFIRMED" | "REJECTED") => void;
}

const SEVERITY_CONFIG: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  critical: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold",
    dot: "bg-rose-500",
    label: "Critical",
  },
  high: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold",
    dot: "bg-orange-500",
    label: "High",
  },
  medium: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
    dot: "bg-amber-500",
    label: "Medium",
  },
  low: {
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold",
    dot: "bg-blue-500",
    label: "Low",
  },
};

const STATUS_CONFIG: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  PENDING: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 animate-pulse",
    label: "Pending Triage",
  },
  CONFIRMED: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Confirmed",
  },
  REJECTED: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    label: "Rejected",
  },
  ESCALATED: {
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    label: "Escalated",
  },
};

export function ReportConfirmationCard({
  report,
  onSelect,
  onQuickAction,
}: ReportConfirmationCardProps) {
  const reportedSev = (
    report.reportedSeverity ||
    report.hackerClaimedSeverity?.tier ||
    ""
  ).toLowerCase();

  const triageSev = (
    report.triageSeverity ||
    report.companyConfirmedSeverity?.tier ||
    ""
  ).toLowerCase();

  const explicitSev = (report.severity || "").toLowerCase();

  // True dispute only when both exist and they actually differ
  const hasDispute = Boolean(
    reportedSev && triageSev && reportedSev !== triageSev,
  );

  const fallbackSev = explicitSev || triageSev || reportedSev || "medium";
  const sevMeta = SEVERITY_CONFIG[fallbackSev] ?? SEVERITY_CONFIG.medium;
  const statusMeta = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING;

  const isUrlTitle =
    report.title.startsWith("http://") || report.title.startsWith("https://");

  const initials = report.researcherName
    ? report.researcherName.replace(/[@#]/g, "").slice(0, 2).toUpperCase()
    : "DS";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="rounded-2xl border border-border bg-card shadow-2xs hover:shadow-xs hover:border-border/80 transition-all duration-200">
        <CardContent className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Avatar & Report Content */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Report / Researcher Avatar */}
            <div className="relative shrink-0 mt-0.5">
              <div
                className={cn(
                  "size-11 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider border shadow-2xs transition select-none",
                  hasDispute
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : fallbackSev === "critical"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : fallbackSev === "high"
                        ? "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "border-primary/25 bg-primary/10 text-primary",
                )}
              >
                {initials}
              </div>
              {hasDispute && (
                <div
                  title="Severity dispute between researcher and organization"
                  className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-background text-[9px] font-bold"
                >
                  <Scale className="size-2.5" />
                </div>
              )}
            </div>

            {/* Info Body */}
            <div className="space-y-2 flex-1 min-w-0">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {report.reportCode && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    {report.reportCode}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold border",
                    statusMeta.badge,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
                  {statusMeta.label}
                </span>

                {report.category && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border/60">
                    <Tag className="size-3 text-muted-foreground/80" />
                    {report.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="min-w-0">
                <Link
                  href={`/dashboard/report-confirmation/${report.id}`}
                  className="text-base font-bold text-foreground hover:text-primary transition line-clamp-1 break-all leading-snug"
                >
                  <span>{report.title}</span>
                  {isUrlTitle && (
                    <ExternalLink className="size-3.5 inline ml-1.5 text-muted-foreground shrink-0 opacity-70" />
                  )}
                </Link>
              </h3>

              {/* Metadata Details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Researcher:</span>
                  <strong className="text-foreground font-semibold">
                    {report.researcherName}
                  </strong>
                </span>

                <span className="hidden sm:inline text-muted-foreground/40">•</span>

                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Target:</span>
                  <strong className="text-foreground font-semibold">
                    {report.companyName}
                  </strong>
                </span>

                <span className="hidden sm:inline text-muted-foreground/40">•</span>

                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Coins className="size-3.5 shrink-0" />
                  <span>
                    {report.rewardAmount
                      ? `Reward: ${report.rewardAmount}`
                      : `Est: ${report.rewardEstimate}`}
                  </span>
                </span>

                <span className="hidden sm:inline text-muted-foreground/40">•</span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground shrink-0" />
                  <span>{report.submittedAt}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Severity / Dispute & Actions Toolbar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-3 shrink-0 pt-3 xl:pt-0 border-t border-border/50 xl:border-0 w-full xl:w-auto">
            {/* Severity Pill OR Disputed Split Pill */}
            {hasDispute ? (
              <div className="flex flex-col gap-1 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1.5 text-xs shrink-0">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Scale className="size-3 text-amber-500 shrink-0" />
                  <span>Disputed Severity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-[11px] border",
                      SEVERITY_CONFIG[reportedSev]?.badge ??
                        "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        SEVERITY_CONFIG[reportedSev]?.dot ?? "bg-muted-foreground",
                      )}
                    />
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Hacker:
                    </span>
                    <strong>
                      {SEVERITY_CONFIG[reportedSev]?.label ??
                        reportedSev.toUpperCase()}
                    </strong>
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/80">
                    vs
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-[11px] border",
                      SEVERITY_CONFIG[triageSev]?.badge ??
                        "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        SEVERITY_CONFIG[triageSev]?.dot ?? "bg-muted-foreground",
                      )}
                    />
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Org:
                    </span>
                    <strong>
                      {SEVERITY_CONFIG[triageSev]?.label ??
                        triageSev.toUpperCase()}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border",
                    sevMeta.badge,
                  )}
                >
                  <span className={cn("size-2 rounded-full shrink-0", sevMeta.dot)} />
                  <span>{sevMeta.label} Severity</span>
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {report.status === "PENDING" && onQuickAction && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickAction(report, "REJECTED")}
                    className="h-9 px-3 rounded-xl border-border text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold cursor-pointer transition"
                  >
                    <XCircle className="size-3.5 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickAction(report, "CONFIRMED")}
                    className="h-9 px-3 rounded-xl border-border text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-semibold cursor-pointer transition"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" />
                    Confirm
                  </Button>
                </>
              )}

              <Link href={`/dashboard/report-confirmation/${report.id}`}>
                <Button
                  size="sm"
                  className="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-xs transition inline-flex items-center gap-1"
                >
                  <span>Review &amp; Triage</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
