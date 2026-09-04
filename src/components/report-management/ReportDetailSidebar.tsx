"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  MapPin,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Tag,
  Trophy,
  User,
  XCircle,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { ResolveReportDialog } from "@/components/report-management/ResolveReportDialog";
import { RetestRequestDialog } from "@/components/report-management/RetestRequestDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import { useReopenResolvedReportMutation } from "@/lib/redux/services/reportsApi";
import { apiErrorMessage } from "@/lib/api/error-message";
import { toApiSeverity } from "@/lib/reports/severity";
import { isDisputeSettled } from "@/lib/reports/dispute";
import {
  awaitingVerdictLabel,
  formatBountyAmount,
  hasBountyReward,
  openRetestAttempt,
  retestDeadline,
} from "@/lib/reports/retest";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { WeaknessDisplay } from "@/components/reports/WeaknessDisplay";

type ReportDetailSidebarProps = {
  detail: ReportManagementDetail;
  onRefresh?: () => void;
};

export function ReportDetailSidebar({ detail, onRefresh }: ReportDetailSidebarProps) {
  const [copiedVector, setCopiedVector] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRetestDialog, setShowRetestDialog] = useState(false);

  const [reopenReport, { isLoading: isReopening }] =
    useReopenResolvedReportMutation();

  const profileIdentifier = detail.submitterId || detail.submitter;

  const { data: profileOverview, isLoading: isLoadingProfile } =
    useGetProfileByUsernameQuery(profileIdentifier, {
      skip: !profileIdentifier,
    });

  const profile = profileOverview?.profile;
  const stats = profileOverview?.stats;

  const displayName =
    profile?.displayName || (profile as any)?.fullName || detail.submitter;
  const username =
    profile?.username ||
    detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const contactEmail =
    (profile as any)?.email || detail.submitterEmail?.trim() || "";
  const avatarUrl =
    profile?.avatarUrl || (detail as any).submitterAvatarUrl;
  const biography = profile?.bio;
  const country = profile?.location || (profile as any)?.country;
  const joinedAt = profile?.memberSince || (profile as any)?.joinedDate;
  const coverImageUrl = profile?.coverUrl || (profile as any)?.coverImageUrl;

  const { canAny, isOwner, hasCompanyAccess } = useCompanyAccess();
  const canRequestRetest = !hasCompanyAccess || isOwner || canAny(["TRIAGE_REPORTS", "MANAGE_PROGRAM_STATE"]);

  const rawStatus = (detail.rawStatus || (detail as any).state || detail.status || "").toUpperCase();
  const isResolved = rawStatus === "RESOLVED";
  const isWaitingForRetest =
    rawStatus === "RETESTING" ||
    rawStatus === "WAITING_FOR_RETEST";
  const isNeedsMoreInfo = rawStatus === "NEEDS_MORE_INFO";
  const isRejected = rawStatus === "REJECTED" || rawStatus === "DUPLICATE";
  const lastRetest = detail.retestHistory && detail.retestHistory.length > 0
    ? detail.retestHistory[detail.retestHistory.length - 1]
    : null;
  const isSeverityFinal = isDisputeSettled(detail.dispute);

  const openRetest = openRetestAttempt(detail.retestHistory);
  const openRetestDue = retestDeadline(openRetest?.dueAt);
  const openRetestBonus = hasBountyReward(openRetest?.bountyReward)
    ? formatBountyAmount(openRetest?.bountyReward)
    : null;
  const openRestDueTone = openRetestDue?.isOverdue
    ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    : openRetestDue?.isUrgent
      ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
      : "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  const isReopenedFromFailedRetest =
    (rawStatus === "VALID_CONFIRMED" || rawStatus === "ACCEPTED") &&
    lastRetest?.verdict === "STILL_VULNERABLE";
  const isConfirmed =
    (rawStatus === "ACCEPTED" || rawStatus === "VALID_CONFIRMED" || detail.isReviewed) &&
    !isWaitingForRetest &&
    !isResolved &&
    !isRejected &&
    !isReopenedFromFailedRetest;

  const hasOpenDispute = detail.dispute?.status === "OPEN";

  const handleCopyVector = async () => {
    try {
      await navigator.clipboard.writeText(detail.vectorString);
      setCopiedVector(true);
      setTimeout(() => setCopiedVector(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleReopen = async () => {
    const severity = toApiSeverity(detail.severity);
    if (!severity) {
      toast.error("Report could not be reopened", {
        description: `"${detail.severity}" is not a severity this report can be reopened at.`,
      });
      return;
    }

    try {
      await reopenReport({ id: String(detail.id), triageSeverity: severity }).unwrap();
      toast.success("Report reopened", {
        description: "It is back with the team as a confirmed finding.",
      });
      onRefresh?.();
    } catch (error) {
      toast.error("Report could not be reopened", {
        description: apiErrorMessage(
          error,
          "The triage service did not respond. Nothing was changed.",
        ),
      });
    }
  };

  const handleCopyEmail = async () => {
    if (!contactEmail) return;
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  const cweNumber = detail.cweIdentifier.replace(/[^0-9]/g, "");
  const cweUrl = cweNumber
    ? `https://cwe.mitre.org/data/definitions/${cweNumber}.html`
    : "#";

  const profileHref = `/profile/${encodeURIComponent(profileIdentifier)}`;

  return (
    <>
      <aside className="space-y-5 lg:sticky lg:top-6 min-w-0">
        <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden min-w-0 p-0 py-0 gap-0">
          <CardHeader className="bg-muted/40 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-3.5 [.border-b]:pb-3 sm:[.border-b]:pb-3.5">
            <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Triage & Moderation</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4 min-w-0">
            {isResolved ? (
              <div className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-3.5 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <ShieldCheck className="size-4 text-purple-500 shrink-0" />
                  <span>Vulnerability Resolved</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                  Remediation fix has been confirmed and deployed. Severity rating is recorded as{" "}
                  <strong className="text-foreground">{detail.severity}</strong>{" "}
                  {detail.cvssScore && detail.cvssScore !== "N/A"
                    ? `(${detail.cvssScore} CVSS)`
                    : ""}.
                </p>

                <div className="space-y-2 pt-1">
                  {canRequestRetest && (
                    <Button
                      type="button"
                      onClick={() => setShowRetestDialog(true)}
                      className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm gap-2 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="size-4" />
                      <span>Request retest</span>
                    </Button>
                  )}

                  {canRequestRetest && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReopen}
                      disabled={isReopening}
                      className="w-full h-9 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-sm gap-2 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="size-4 text-amber-500" />
                      <span>{isReopening ? "Reopening…" : "Reopen report"}</span>
                    </Button>
                  )}

                  <Link
                    href={`/dashboard/report-management/${detail.id}/severity-review`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Re-evaluate / review log
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isWaitingForRetest ? (
              <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-3.5 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <RotateCcw className="size-4 text-blue-500 animate-spin-slow shrink-0" />
                  <span>Retest in progress</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  Attempt #{openRetest?.attemptNumber ?? lastRetest?.attemptNumber ?? 1} is
                  with {detail.submitter}. They answer either way &mdash; there
                  is nothing for them to accept first.
                </p>

                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm font-semibold",
                    openRestDueTone,
                  )}
                >
                  <Calendar className="size-3.5 shrink-0" />
                  <span>{awaitingVerdictLabel(openRetest?.dueAt)}</span>
                </div>

                {openRetestBonus && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{openRetestBonus}</strong>{" "}
                    bonus is paid on whichever verdict they give, and only
                    withheld if the attempt goes unanswered.
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  {canRequestRetest && (
                    <Button
                      type="button"
                      disabled
                      title="A retest is already awaiting the researcher"
                      className="w-full h-9 rounded-xl bg-blue-600 text-white font-semibold text-sm gap-2 shadow-xs disabled:opacity-50"
                    >
                      <RotateCcw className="size-4" />
                      <span>Request retest</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    disabled={hasOpenDispute}
                    onClick={() => setShowResolveDialog(true)}
                    className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="size-4" />
                    <span>{hasOpenDispute ? "Resolution Locked (Dispute Open)" : "Force Mark as Resolved"}</span>
                  </Button>
                  {hasOpenDispute && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-tight">
                      A report with an open dispute cannot be resolved by the organization.
                    </p>
                  )}

                  <Link
                    href={`/dashboard/report-management/${detail.id}/severity-review`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                    >
                      <Sliders className="size-3.5" />
                      <span>Adjust / Re-evaluate Severity</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isReopenedFromFailedRetest ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                  <ShieldAlert className="size-4 text-rose-500 shrink-0" />
                  <span>Report Reopened &mdash; Failed Retest</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                  The researcher tested Attempt #{lastRetest?.attemptNumber} and verified that the vulnerability is <strong className="text-rose-600 dark:text-rose-400">Still Vulnerable</strong>.
                </p>
                {lastRetest?.resultNotes && (
                  <div className="p-2.5 rounded-lg bg-background border border-border/80 text-xs font-medium text-foreground italic leading-relaxed">
                    &ldquo;{lastRetest.resultNotes}&rdquo;
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    disabled={hasOpenDispute}
                    onClick={() => setShowResolveDialog(true)}
                    className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="size-4" />
                    <span>{hasOpenDispute ? "Resolution Locked (Dispute Open)" : "Mark as Resolved (Fix Deployed)"}</span>
                  </Button>
                  {hasOpenDispute && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-tight">
                      A report with an open dispute cannot be resolved by the organization.
                    </p>
                  )}

                  <Link
                    href={`/dashboard/report-management/${detail.id}/severity-review`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                    >
                      <Sliders className="size-3.5" />
                      <span>Adjust / Re-evaluate Severity</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isConfirmed ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-3 min-w-0">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Finding Confirmed & Triaged</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                  This finding is valid. Severity is confirmed as{" "}
                  <strong className="text-foreground">{detail.severity}</strong>{" "}
                  {detail.cvssScore && detail.cvssScore !== "N/A"
                    ? `(${detail.cvssScore} CVSS)`
                    : ""}.
                </p>

                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    disabled={hasOpenDispute}
                    onClick={() => setShowResolveDialog(true)}
                    className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="size-4" />
                    <span>{hasOpenDispute ? "Resolution Locked (Dispute Open)" : "Mark as Resolved"}</span>
                  </Button>
                  {hasOpenDispute && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-tight">
                      A report with an open dispute cannot be resolved by the organization.
                    </p>
                  )}

                  {isSeverityFinal ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      The severity is settled and can no longer be changed.
                    </p>
                  ) : (
                    <Link
                      href={`/dashboard/report-management/${detail.id}/severity-review`}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                      >
                        <Sliders className="size-3.5" />
                        <span>Adjust / Re-evaluate Severity</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review findings, validate CVSS scoring, and assign appropriate bounty rewards.
                </p>

                <div className="space-y-2.5 pt-1">
                  <Link
                    href={`/dashboard/report-management/${detail.id}/severity-review`}
                    className="block"
                  >
                    <Button
                      className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white text-xs gap-2 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Accept & Adjust Severity</span>
                    </Button>
                  </Link>

                  <a
                    href={`mailto:${contactEmail}?subject=Information request regarding report #${detail.reportId}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-2 cursor-pointer shadow-2xs"
                    >
                      <AlertCircle className="size-4 text-amber-500" />
                      <span>Request Information</span>
                    </Button>
                  </a>

                  <Link
                    href={`/dashboard/report-management/${detail.id}/severity-review?action=reject`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-xl border-red-500/20 bg-red-500/5 hover:bg-red-500/15 font-semibold text-red-600 dark:text-red-400 text-xs gap-2 cursor-pointer shadow-2xs"
                    >
                      <XCircle className="size-4" />
                      <span>Reject Submission</span>
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden min-w-0 p-0 py-0 gap-0">
        <CardHeader className="bg-muted/40 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-3.5 [.border-b]:pb-3 sm:[.border-b]:pb-3.5">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Classification Snapshot</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3.5 text-sm min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">Weakness</span>
            <div className="text-right text-xs font-bold text-foreground max-w-[65%]">
              <WeaknessDisplay
                weakness={detail.weaknessObj || (detail.suggestedWeakness ? null : detail.vulnerabilityType)}
                suggestedWeakness={detail.suggestedWeakness}
              />
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">CVSS Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">{detail.cvssScore}</span>
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0 text-[10px] font-bold rounded-md",
                  detail.severity === "Critical" && "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
                  detail.severity === "High" && "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
                  detail.severity === "Medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                  detail.severity === "Low" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                )}
              >
                {detail.severity}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Vector String</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyVector}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-1.5 cursor-pointer"
              >
                {copiedVector ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <code className="block p-2 rounded-lg bg-muted font-mono text-[11px] text-foreground font-semibold break-all">
              {detail.vectorString}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden min-w-0 p-0 py-0 gap-0">
        <CardHeader className="bg-muted/40 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-3.5 [.border-b]:pb-3 sm:[.border-b]:pb-3.5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Researcher Profile</span>
          </CardTitle>
          <Link
            href={profileHref}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View Profile</span>
            <ExternalLink className="size-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {isLoadingProfile ? (
                  <div className="size-12 rounded-full bg-muted animate-pulse ring-1 ring-border shadow-xs" />
                ) : avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-12 rounded-full object-cover ring-1 ring-border shadow-xs"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base ring-1 ring-border shadow-xs">
                    {detail.submitterInitials}
                  </div>
                )}
                {profile && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-card">
                    <Check className="size-2.5 text-white stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <Link href={profileHref} className="group block">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight truncate">
                    {isLoadingProfile ? (
                      <span className="inline-block h-4 w-24 rounded bg-muted animate-pulse" />
                    ) : (
                      displayName
                    )}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground font-mono truncate">@{username}</p>
              </div>
            </div>

            {contactEmail && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEmail}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
                <a
                  href={`mailto:${contactEmail}`}
                  className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title={`Email ${displayName}`}
                >
                  <Mail className="size-3" />
                </a>
              </div>
            )}
          </div>

          {biography && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 break-words">
              {biography}
            </p>
          )}

          {stats && (
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-muted/30 p-2 text-center">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Rep</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <Trophy className="size-3 text-amber-500 shrink-0" />
                  <span className="truncate">{(stats.reputation ?? 0).toLocaleString()}</span>
                </p>
              </div>
              <div className="space-y-0.5 border-x border-border min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Reports</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{stats.reportsSubmitted ?? (stats as any).totalReports ?? 0}</span>
                </p>
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Accepted</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <Check className="size-3 text-blue-500 shrink-0" />
                  <span className="truncate">{stats.accepted ?? (stats as any).acceptedReports ?? (stats as any).validReports ?? 0}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {country && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{country}</span>
              </div>
            )}
            {joinedAt && (
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 shrink-0" />
                <span className="truncate">Joined {joinedAt}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="size-3.5 shrink-0" />
              <span className="truncate">Submitted {detail.submittedDate}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Program Scope</span>
              <span className="font-semibold text-foreground">{detail.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Report Status</span>
              <span
                className={cn(
                  "font-bold",
                  detail.status === "Open"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {detail.status}
              </span>
            </div>
          </div>

          <Link href={profileHref} className="block pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Full Researcher Profile</span>
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <ResolveReportDialog
        isOpen={showResolveDialog}
        onOpenChange={setShowResolveDialog}
        reportId={String(detail.id)}
        reportTitle={detail.title}
        severity={detail.severity || "Medium"}
        submitterName={displayName}
        onSuccess={onRefresh}
      />

      <RetestRequestDialog
        isOpen={showRetestDialog}
        onOpenChange={setShowRetestDialog}
        reportId={String(detail.id)}
        reportTitle={detail.title}
        submitterName={displayName}
        severity={detail.severity || "Medium"}
        defaultEndpoint={detail.affectedUrl || detail.assets?.[0] || ""}
        reportState={rawStatus}
        onSuccess={onRefresh}
      />
    </aside>
    </>
  );
}

