"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ChevronRight,
  Scale,
  Tag,
  Globe,
  Shield,
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

  const initials = (report.researcherName || report.researcherUsername || "DS")
    .replace(/[@#]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs hover:shadow-md hover:border-primary/40 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200">
        {/* Ambient subtle primary glow on hover */}
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300" />

        <CardContent className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-3.5 space-y-3">
          {/* Top Header: Classification Badges & Bounty Reward */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Report Code */}
              {report.reportCode && (
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/80 shadow-2xs">
                  {report.reportCode}
                </span>
              )}

              {/* Status Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border shadow-2xs",
                  statusMeta.badge,
                )}
              >
                <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
                {statusMeta.label}
              </span>

              {/* Severity Badge OR Disputed Split Pill */}
              {hasDispute ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs shadow-2xs">
                  <Scale className="size-3 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Disputed
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="text-muted-foreground">Hacker:</span>
                  <strong className="text-foreground font-semibold">
                    {SEVERITY_CONFIG[reportedSev]?.label ?? reportedSev.toUpperCase()}
                  </strong>
                  <span className="text-muted-foreground">vs</span>
                  <span className="text-muted-foreground">Org:</span>
                  <strong className="text-foreground font-semibold">
                    {SEVERITY_CONFIG[triageSev]?.label ?? triageSev.toUpperCase()}
                  </strong>
                </div>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border shadow-2xs",
                    sevMeta.badge,
                  )}
                >
                  <span className={cn("size-2 rounded-full shrink-0", sevMeta.dot)} />
                  <span>{sevMeta.label} Severity</span>
                </span>
              )}

              {/* CVSS Score Pill if available */}
              {report.cvssScore && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded-lg bg-muted text-foreground border border-border/80 shadow-2xs">
                  CVSS {report.cvssScore}
                </span>
              )}

              {/* Category Tag */}
              {report.category && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/60 shadow-2xs">
                  <Tag className="size-3 text-muted-foreground/80" />
                  {report.category}
                </span>
              )}

              {/* CWE Identifier Tag */}
              {report.cwe && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-medium px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground border border-border/50 shadow-2xs">
                  {report.cwe}
                </span>
              )}
            </div>

            {/* Bounty Reward Pill */}
            {(report.rewardAmount || report.rewardEstimate) && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <Coins className="size-3.5 shrink-0" />
                <span>
                  {report.rewardAmount
                    ? `Reward: ${report.rewardAmount}`
                    : `Est: ${report.rewardEstimate}`}
                </span>
              </span>
            )}
          </div>

          {/* Middle Body: Avatar + Title & Target Details with generous gap */}
          <div className="flex items-start gap-4 pt-0.5">
            {/* Researcher Avatar */}
            <div className="relative shrink-0 pt-0.5">
              {report.researcherUsername ? (
                <Link
                  href={`/profile/${encodeURIComponent(report.researcherUsername)}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`View @${report.researcherUsername}'s profile`}
                  className="block group/avatar"
                >
                  {report.researcherAvatarUrl ? (
                    <div className="size-11 sm:size-12 rounded-2xl overflow-hidden border border-border shadow-2xs group-hover/avatar:border-primary/50 group-hover/avatar:ring-2 group-hover/avatar:ring-primary/20 transition-all duration-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.researcherAvatarUrl}
                        alt={report.researcherName}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "size-11 sm:size-12 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider border shadow-2xs group-hover/avatar:border-primary/50 transition-all duration-200 select-none",
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
                  )}
                </Link>
              ) : report.researcherAvatarUrl ? (
                <div className="size-11 sm:size-12 rounded-2xl overflow-hidden border border-border shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.researcherAvatarUrl}
                    alt={report.researcherName}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "size-11 sm:size-12 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider border shadow-2xs transition-all select-none",
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
              )}
              {hasDispute && (
                <div
                  title="Severity dispute between researcher and organization"
                  className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-background text-[9px] font-bold"
                >
                  <Scale className="size-2.5" />
                </div>
              )}
            </div>

            {/* Title & Metadata Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="min-w-0">
                <Link
                  href={`/dashboard/report-confirmation/${report.id}`}
                  className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 break-all leading-snug"
                >
                  <span>{report.title}</span>
                  {isUrlTitle && (
                    <ExternalLink className="size-4 inline ml-1.5 text-muted-foreground shrink-0 opacity-70" />
                  )}
                </Link>
              </h3>

              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Researcher:</span>
                  {report.researcherUsername ? (
                    <Link
                      href={`/profile/${encodeURIComponent(report.researcherUsername)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                      title={`View @${report.researcherUsername}'s profile`}
                    >
                      <span>{report.researcherName}</span>
                      <span className="font-normal text-muted-foreground text-xs">
                        (@{report.researcherUsername})
                      </span>
                    </Link>
                  ) : (
                    <strong className="text-foreground font-semibold">
                      {report.researcherName}
                    </strong>
                  )}
                  {report.researcherReputation !== undefined && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 shadow-2xs">
                      ★ {report.researcherReputation.toLocaleString()} rep
                    </span>
                  )}
                </span>

                <span className="text-muted-foreground/30">•</span>

                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Target:</span>
                  <strong className="text-foreground font-semibold">
                    {report.companyName}
                  </strong>
                  {report.programName && report.programName !== report.companyName && (
                    <span className="font-normal text-muted-foreground">
                      ({report.programName})
                    </span>
                  )}
                </span>

                {report.targetAsset && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60 font-mono shadow-2xs">
                      <Globe className="size-3 text-muted-foreground/70" />
                      <span className="truncate max-w-[200px]">{report.targetAsset}</span>
                    </span>
                  </>
                )}
              </div>

              {report.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 break-words mt-1 leading-relaxed">
                  {report.description}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Footer: Submission Timestamp & Action Buttons with Compact Spacing */}
          <div className="pt-2.5 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <span>Submitted {report.submittedAt}</span>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {report.status === "PENDING" && onQuickAction && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickAction(report, "REJECTED")}
                    className="h-9 px-3.5 rounded-xl border-border hover:border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 text-xs font-semibold cursor-pointer transition-colors shadow-2xs gap-1.5"
                  >
                    <XCircle className="size-3.5" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickAction(report, "CONFIRMED")}
                    className="h-9 px-3.5 rounded-xl border-border hover:border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold cursor-pointer transition-colors shadow-2xs gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Confirm</span>
                  </Button>
                </>
              )}

              <Link href={`/dashboard/report-confirmation/${report.id}`}>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-2xs transition-colors inline-flex items-center gap-1.5"
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
