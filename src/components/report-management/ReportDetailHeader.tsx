"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Coins,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Mail,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Tag,
  User,
  X,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownView } from "@/components/ui/markdown-view";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import {
  awaitingVerdictLabel,
  openRetestAttempt,
  retestDeadline,
} from "@/lib/reports/retest";
import { ThankResearcherDialog } from "@/components/report-management/ThankResearcherDialog";
import { cn } from "@/lib/utils";

type ReportDetailHeaderProps = {
  detail: ReportManagementDetail;
};

function getStatusBadge(detail: ReportManagementDetail) {
  const raw = (detail.rawStatus || (detail as any).state || detail.status || "").toUpperCase();
  const lastRetest = detail.retestHistory && detail.retestHistory.length > 0
    ? detail.retestHistory[detail.retestHistory.length - 1]
    : null;
  const isReopenedFromFailedRetest =
    (raw === "VALID_CONFIRMED" || raw === "ACCEPTED") && lastRetest?.verdict === "STILL_VULNERABLE";

  if (isReopenedFromFailedRetest) {
    return (
      <Badge
        variant="outline"
        className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs"
      >
        <ShieldAlert className="size-3.5 text-rose-500" />
        REOPENED &bull; RETEST FAILED
      </Badge>
    );
  }

  if (raw === "RESOLVED") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <ShieldCheck className="size-3.5 text-purple-500" />
        RESOLVED &amp; PAID
      </Badge>
    );
  }

  if (raw === "RETESTING" || raw === "NEEDS_MORE_INFO" || raw === "WAITING_FOR_RETEST") {
    return (
      <Badge
        variant="outline"
        className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs"
      >
        <RotateCcw className="size-3.5 text-cyan-500 animate-spin-slow" />
        RETESTING IN PROGRESS
      </Badge>
    );
  }

  if (raw === "ACCEPTED" || raw === "VALID_CONFIRMED" || detail.isReviewed) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        TRIAGED &amp; CONFIRMED
      </Badge>
    );
  }

  if (raw === "REJECTED" || raw === "DUPLICATE") {
    return (
      <Badge
        variant="outline"
        className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <X className="size-3.5 text-red-500" />
        REJECTED
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
    >
      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
      PENDING REVIEW
    </Badge>
  );
}

function getSeverityBadge(
  severity: ReportManagementDetail["severity"],
  cvssScore?: string
) {
  switch (severity) {
    case "Critical":
      return (
        <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <ShieldAlert className="size-3.5" />
          CRITICAL {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    case "High":
      return (
        <Badge className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <CircleAlert className="size-3.5" />
          HIGH {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    case "Medium":
      return (
        <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <CircleAlert className="size-3.5" />
          MEDIUM {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          LOW {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
  }
}

export function ReportDetailHeader({ detail }: ReportDetailHeaderProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const profileIdentifier = detail.submitterId || detail.submitter;
  const { data: profileOverview } = useGetProfileByUsernameQuery(
    profileIdentifier,
    {
      skip: !profileIdentifier,
    }
  );

  const profile = profileOverview?.profile;
  const displayName =
    profile?.displayName || (profile as any)?.fullName || detail.submitter;
  const username =
    profile?.username ||
    detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");

  const rawEmail = detail.submitterEmail?.trim();
  const contactEmail =
    (profile as any)?.email ||
    (rawEmail &&
    !rawEmail.includes("@devsolve.local") &&
    !rawEmail.includes("@devsolve.io")
      ? rawEmail
      : "");

  const cleanReportId = detail.reportId.startsWith("#")
    ? detail.reportId
    : `#${detail.reportId}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(cleanReportId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const { memberships } = useCompanyAccess();
  const targetOrgId = detail.organizationId || (detail as any)?.organization?.id;
  const orgMembership = targetOrgId
    ? memberships.find((m) => m.organizationId === targetOrgId)
    : memberships[0];

  const canAward = Boolean(
    orgMembership &&
    orgMembership.organizationStatus === "ACTIVE" &&
    (orgMembership.owner || orgMembership.permissions?.includes("AWARD_REWARDS"))
  );

  const rawStatus = (detail.rawStatus || (detail as any).state || detail.status || "").toUpperCase();
  const isResolved = rawStatus === "RESOLVED";
  const hasSeverity = Boolean(detail.severity);
  const showThankButton = canAward && isResolved && hasSeverity;

  const isWaitingForRetest =
    rawStatus === "RETESTING" ||
    rawStatus === "WAITING_FOR_RETEST";
  const isReviewed =
    (rawStatus === "ACCEPTED" || rawStatus === "VALID_CONFIRMED" || detail.isReviewed) &&
    !isWaitingForRetest &&
    !isResolved;

  const lastRetest = detail.retestHistory && detail.retestHistory.length > 0
    ? detail.retestHistory[detail.retestHistory.length - 1]
    : null;
  /* The attempt still owed an answer, which is the one carrying a deadline. */
  const openRetest = openRetestAttempt(detail.retestHistory);
  const openRetestDue = retestDeadline(openRetest?.dueAt);
  const isReopenedFromFailedRetest =
    (rawStatus === "VALID_CONFIRMED" || rawStatus === "ACCEPTED") &&
    lastRetest?.verdict === "STILL_VULNERABLE";

  return (
    <div className="space-y-5">
      {/* 1. Breadcrumbs & Top Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/80">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <Link
            href="/dashboard/report-management"
            className="transition-colors hover:text-foreground"
          >
            Report Management
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <div className="inline-flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-lg border border-border">
            <span className="font-mono font-bold text-foreground text-xs">
              {cleanReportId}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy Report ID"
            >
              {copiedId ? (
                <span className="text-[10px] font-bold text-emerald-500">Copied</span>
              ) : (
                <span className="text-[10px] font-medium opacity-75">Copy</span>
              )}
            </button>
          </div>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/report-management">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              <span>Back to Queue</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <Eye className="size-3.5 text-muted-foreground" />
            <span>Preview Summary</span>
          </Button>

          {/* Dedicated Thank Researcher / Recognition Dialog (gated on ACTIVE member with AWARD_REWARDS or Owner + RESOLVED report with severity) */}
          {showThankButton && (
            <ThankResearcherDialog detail={detail} />
          )}

          {isWaitingForRetest ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-9 px-3.5 gap-1.5 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center"
              >
                <RotateCcw className="size-3.5 text-blue-500" />
                <span>Waiting for Retest</span>
              </Badge>

              <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  <span>Edit Severity</span>
                </Button>
              </Link>
            </div>
          ) : isReviewed ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-9 px-3.5 gap-1.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Review Completed</span>
              </Badge>

              <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  <span>Edit Severity</span>
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
              <Button
                size="sm"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Review & Adjust Severity</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Report Overview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Badge variant="outline" className="font-mono font-bold text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 shrink-0">
                    {cleanReportId}
                  </Badge>
                  <h3 className="font-bold text-base text-foreground truncate max-w-sm sm:max-w-md">
                    {detail.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(detail.severity, detail.cvssScore)}
                  {getStatusBadge(detail)}
                  <span className="text-xs text-muted-foreground">
                    Submitted by <strong>{detail.submitter}</strong> on {detail.submittedDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Executive Summary
                  </h4>
                  <div className="text-sm text-foreground/90 font-medium bg-muted/30 p-3.5 rounded-xl border border-border/80">
                    {detail.summary ? (
                      <MarkdownView source={detail.summary} className="text-xs sm:text-sm leading-relaxed" />
                    ) : (
                      detail.assessmentSummary
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Endpoint
                  </h4>
                  <code className="block text-xs font-mono font-semibold bg-muted/40 p-2.5 rounded-lg border border-border break-all">
                    {detail.httpMethod ? `${detail.httpMethod} ` : ""}
                    {detail.affectedUrl}
                  </code>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reproduction Summary
                  </h4>
                  <ol className="space-y-1.5 list-decimal pl-5 text-xs text-muted-foreground">
                    {detail.reproductionSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-xl text-xs h-8"
                >
                  Close Preview
                </Button>

                <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
                  <Button
                    size="sm"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{detail.isReviewed ? "Edit Severity Review" : "Open Severity Review"}</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Title Banner Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden p-0 py-0 gap-0">
        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* Top Row: Badges & Title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-200 dark:border-blue-500/20 px-2.5 py-0.5 rounded-md"
              >
                {cleanReportId}
              </Badge>

              {getSeverityBadge(detail.severity, detail.cvssScore)}

              {getStatusBadge(detail)}

              {detail.dispute && (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs",
                    detail.dispute.status === "OPEN"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                  )}
                >
                  <ShieldAlert className="size-3.5" />
                  <span>DISPUTE: {detail.dispute.status}</span>
                </Badge>
              )}

              {detail.hasSeverityDisagreement && !detail.dispute && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs"
                >
                  <CircleAlert className="size-3.5 text-amber-500" />
                  <span>SEVERITY CONTESTED</span>
                </Badge>
              )}

              <Badge
                variant="outline"
                className="bg-muted/70 text-foreground border-border font-semibold text-xs px-2.5 py-0.5 rounded-full"
              >
                {detail.type} Program
              </Badge>

              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1"
              >
                <Lock className="size-3" />
                Scope Verified
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug break-words">
              {detail.title}
            </h1>

            {/* Dispute / Severity Disagreement Alert Banner */}
            {detail.dispute && detail.dispute.status === "OPEN" ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <ShieldAlert className="size-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">Severity Disputed &mdash; Action Locked</p>
                  <p className="text-muted-foreground leading-relaxed">
                    The severity of this report has been contested (Status: OPEN). An administrative dispute review is currently active. The organization cannot resolve this report until the dispute is settled.
                    {detail.reportedSeverity && detail.triageSeverity && (
                      <span className="block mt-1 font-semibold text-foreground">
                        Reported: {detail.reportedSeverity} &bull; Triaged: {detail.triageSeverity}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : detail.hasSeverityDisagreement ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <CircleAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">Severity Disagreement</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Reporter claimed <strong>{detail.reportedSeverity}</strong>, but triage assessed as <strong>{detail.triageSeverity}</strong>. The final severity remains unsettled.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Key Facts Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/80 text-sm">
            {/* Submitter */}
            <div className="space-y-1 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <User className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Researcher</span>
              </span>
              <div className="min-w-0">
                <Link
                  href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                  className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate inline-flex items-center gap-1 group max-w-full"
                  title={`View ${displayName}'s public profile`}
                >
                  <span className="truncate">{displayName}</span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 truncate block font-medium"
                    title={`Email ${displayName}`}
                  >
                    {contactEmail}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono truncate block">
                    @{username}
                  </span>
                )}
              </div>
            </div>

            {/* Target Asset */}
            <div className="space-y-1 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <Globe className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Target Asset</span>
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-xs font-bold text-foreground truncate" title={detail.affectedUrl}>
                  {detail.affectedUrl || detail.assets[0] || "Target Asset"}
                </p>
                {detail.httpMethod && (
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                    {detail.httpMethod}
                  </span>
                )}
              </div>
            </div>

            {/* Reward Range */}
            <div className="space-y-1 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <Coins className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Bounty Estimate</span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
                  {detail.bountyRange}
                </p>
                <span className="text-xs text-muted-foreground font-medium truncate block">
                  Standard Matrix
                </span>
              </div>
            </div>

            {/* Submitted Date & Time */}
            <div className="space-y-1 min-w-0 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <CalendarDays className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Submitted At</span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate" title={detail.submittedDate}>
                  {detail.submittedDate}
                </p>
                <span className="text-xs text-muted-foreground font-medium truncate block">
                  Triage Queue Intake
                </span>
              </div>
            </div>
          </div>

          {/* Retest Status Context Banners */}
          {isWaitingForRetest && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200 font-bold text-sm">
                  <RotateCcw className="size-4 text-cyan-500 animate-spin-slow shrink-0" />
                  <span>Retest in progress (attempt #{openRetest?.attemptNumber || lastRetest?.attemptNumber || 1})</span>
                </div>
                {openRetest?.environment && (
                  <Badge variant="outline" className="text-xs font-bold uppercase border-cyan-500/30 bg-background text-cyan-700 dark:text-cyan-300 w-fit">
                    {openRetest.environment}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{displayName}</strong> has been
                asked to re-run their proof of concept on the deployed fix.
              </p>
              {/* The deadline the attempt lapses on, when it has one. */}
              <p
                className={cn(
                  "text-sm font-semibold",
                  openRetestDue?.isOverdue
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-cyan-900 dark:text-cyan-200",
                )}
              >
                {awaitingVerdictLabel(openRetest?.dueAt)}
              </p>
              {openRetest?.targetEndpoint && (
                <div className="flex items-center gap-1.5 text-sm font-mono text-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/70 truncate">
                  <Globe className="size-3 text-cyan-500 shrink-0" />
                  <span className="truncate">{openRetest.targetEndpoint}</span>
                </div>
              )}
            </div>
          )}

          {isReopenedFromFailedRetest && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
                <ShieldAlert className="size-4 text-rose-500 shrink-0" />
                <span>Report Reopened &mdash; Remediation Failed on Retest Attempt #{lastRetest?.attemptNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Researcher <strong className="text-foreground">{displayName}</strong> verified the patch on {lastRetest?.environment || "Staging"} and flagged this vulnerability as <strong className="text-rose-600 dark:text-rose-400">Still Vulnerable</strong>.
              </p>
              {lastRetest?.resultNotes && (
                <div className="p-2.5 rounded-lg bg-background border border-border text-xs font-medium text-foreground italic leading-relaxed">
                  &ldquo;{lastRetest.resultNotes}&rdquo;
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
