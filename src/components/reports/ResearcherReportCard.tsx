"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Eye,
  RotateCcw,
  DollarSign,
  Award,
  ChevronRight,
  Clock,
  Building2,
} from "lucide-react";
import { ReportItem } from "@/lib/redux/services/reportsApi";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";
import { useGetProgramByIdQuery } from "@/lib/redux/services/program/programsApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { cn } from "@/lib/utils";

function formatReportDisplayTitle(title?: string | null, weaknessName?: string | null): string {
  if (!title || !title.trim() || title.trim().toLowerCase() === "untitled" || title.trim().toLowerCase() === "untitled report") {
    return weaknessName ? `${weaknessName} Finding` : "Vulnerability Report";
  }
  const trimmed = title.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      if (url.pathname && url.pathname !== "/" && url.pathname.length > 1) {
        const seg = url.pathname.split("/").filter(Boolean).pop();
        return seg ? `Security Finding: ${seg}` : `Security Finding at ${url.pathname}`;
      }
      return `Target Finding: ${url.hostname}`;
    } catch {
      return weaknessName ? `${weaknessName} Finding` : "Vulnerability Report";
    }
  }
  return trimmed;
}

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
  const [imageError, setImageError] = useState(false);
  const isRetesting =
    report.status === "RETESTING" || report.rawStatus === "RETESTING";

  // If program is "Unknown Program" or missing, attempt to fetch program info
  const needsProgramFetch =
    !report.program || report.program === "Unknown Program" || !report.organizationId;
  const { data: programData } = useGetProgramByIdQuery(report.programId ?? "", {
    skip: !report.programId || !needsProgramFetch,
  });

  const effectiveOrgId =
    report.organizationId ||
    programData?.organizationId ||
    programData?.organization?.id;

  // If org logo or name is missing, attempt to fetch organization info
  const needsOrgFetch =
    !report.organizationLogoUrl || !report.organizationName;
  const { data: orgData } = useGetOrganizationByIdQuery(effectiveOrgId ?? "", {
    skip: !effectiveOrgId || !needsOrgFetch,
  });

  const displayOrgName =
    report.organizationName ||
    orgData?.name ||
    programData?.organizationName ||
    programData?.organization?.name;

  const displayProgramName =
    report.program && report.program !== "Unknown Program"
      ? report.program
      : programData?.name || "Security Program";

  const displayLogoUrl = !imageError
    ? report.organizationLogoUrl ||
      orgData?.logoUrl ||
      programData?.organization?.logoUrl ||
      programData?.logoUrl
    : null;

  const initials = (displayOrgName || displayProgramName || "OR")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "OR";

  const companyHref = effectiveOrgId ? `/company?id=${effectiveOrgId}` : "/company";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/20",
        isRetesting &&
          "ring-1 ring-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.07] via-card to-card"
      )}
    >
      <div className="space-y-3.5">
        {/* Header: Organization Logo + Org/Program Info + Quick View */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Link
              href={companyHref}
              onClick={(e) => e.stopPropagation()}
              className="size-10 rounded-xl border border-border bg-card flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              {displayLogoUrl ? (
                <Image
                  src={displayLogoUrl}
                  alt={displayOrgName || "Organization"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <Avatar className="size-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-foreground font-bold text-xs">
                  <AvatarFallback className="rounded-xl font-bold bg-transparent text-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {displayOrgName ? (
                  <Link
                    href={companyHref}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold text-foreground hover:text-primary hover:underline transition-colors truncate max-w-[170px] inline-flex items-center gap-1"
                  >
                    <Building2 className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{displayOrgName}</span>
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-foreground truncate max-w-[170px]">
                    {displayProgramName}
                  </span>
                )}
                {displayOrgName && displayProgramName && displayProgramName !== displayOrgName && (
                  <>
                    <span className="text-xs text-muted-foreground/50">·</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {displayProgramName}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <Link
                  href={`/dashboard/my-reports/${report.id}`}
                  className="font-mono text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{report.reportId}</span>
                  {isRetesting && (
                    <span className="size-1.5 rounded-full bg-cyan-500 animate-ping inline-block" />
                  )}
                </Link>
              </div>
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

        {/* Report Title */}
        <Link href={`/dashboard/my-reports/${report.id}`} className="block group/title">
          <h3 className="text-[15px] sm:text-base font-bold text-foreground line-clamp-2 group-hover/title:text-primary transition-colors leading-snug">
            {formatReportDisplayTitle(report.title, report.suggestedWeakness || report.weaknessObj?.name)}
          </h3>
        </Link>

        {/* Severity, Status & Type Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {report.severity ? (
            <SeverityBadge severity={report.severity} />
          ) : (Boolean(report.isDisputed) ||
              Boolean(report.dispute) ||
              (Boolean(report.triageSeverity) &&
                Boolean(report.reportedSeverity) &&
                report.triageSeverity !== report.reportedSeverity)) ? (
            <DisputedSeverityPair
              reportedSeverity={report.reportedSeverity}
              triageSeverity={report.triageSeverity}
              size="sm"
            />
          ) : report.triageSeverity ? (
            <div className="flex items-center gap-1.5">
              <SeverityBadge severity={report.triageSeverity} />
              <span className="text-[11px] font-semibold text-muted-foreground">Org assessed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <SeverityBadge severity={report.reportedSeverity} fallbackText="Pending Triage" />
              <span className="text-[11px] text-muted-foreground">Claimed</span>
            </div>
          )}
          <StatusBadge status={report.status} />
          {report.type && (
            <Badge
              variant="secondary"
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50"
            >
              {report.type}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer: Bounty/Reputation + Date + View Button */}
      <div className="mt-5 pt-4 border-t border-border/70 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          {report.bountyOrRep?.startsWith("$") ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-2xs">
              <DollarSign className="size-3.5" />
              <span>{report.bountyOrRep}</span>
            </span>
          ) : report.bountyOrRep?.includes("Reputation") ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 shadow-2xs">
              <Award className="size-3.5 text-indigo-500" />
              <span>{report.bountyOrRep}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground bg-muted/60 border border-border/60">
              {report.bountyOrRep}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3 shrink-0" />
            <span>{report.lastActivityDate}</span>
          </div>
        </div>

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
          <Link href={`/dashboard/my-reports/${report.id}`} className="w-full group/btn">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-semibold h-9 justify-between px-3.5 cursor-pointer hover:bg-muted hover:border-primary/40 transition-all shadow-2xs"
            >
              <span>View Report Details</span>
              <ChevronRight className="size-3.5 text-muted-foreground group-hover/btn:translate-x-0.5 group-hover/btn:text-primary transition-all" />
            </Button>
          </Link>
        )}
      </div>
    </motion.article>
  );
}
