"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Coins,
  ExternalLink,
  Lock,
  Mail,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
  User,
  XCircle,
} from "lucide-react";

import type { ReportDetail } from "@/lib/types/reports/types";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { ResolveReportDialog } from "@/components/report-management/ResolveReportDialog";
import { RetestRequestDialog } from "@/components/report-management/RetestRequestDialog";
import { ThankResearcherDialog } from "@/components/report-management/ThankResearcherDialog";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { WeaknessDisplay } from "@/components/reports/WeaknessDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import { useReopenResolvedReportMutation } from "@/lib/redux/services/reportsApi";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { formatDateTime } from "@/lib/format/datetime";
import { apiErrorMessage } from "@/lib/api/error-message";
import { toApiSeverity } from "@/lib/reports/severity";
import { pointsFor } from "@/lib/reports/reputation";
import {
  awaitingVerdictLabel,
  formatBountyAmount,
  hasBountyReward,
  openRetestAttempt,
  retestDeadline,
} from "@/lib/reports/retest";
import { cn } from "@/lib/utils";

interface ReportManagementSidebarProps {
  report: ReportDetail;
  detail: ReportManagementDetail;
  onRefresh?: () => void;
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-semibold text-foreground text-right break-words min-w-0">
        {value ?? "Not provided"}
      </span>
    </div>
  );
}

export function ReportManagementSidebar({
  report,
  detail,
  onRefresh,
}: ReportManagementSidebarProps) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRetestDialog, setShowRetestDialog] = useState(false);

  const [reopenReport, { isLoading: isReopening }] =
    useReopenResolvedReportMutation();

  const { canAny, isOwner, hasCompanyAccess } = useCompanyAccess();
  const canRequestRetest =
    !hasCompanyAccess ||
    isOwner ||
    canAny(["TRIAGE_REPORTS", "MANAGE_PROGRAM_STATE"]);

  const rawStatus = (
    detail.rawStatus ||
    (report as any).state ||
    report.status ||
    ""
  ).toUpperCase();
  const isResolved = rawStatus === "RESOLVED";
  const isWaitingForRetest =
    rawStatus === "RETESTING" || rawStatus === "WAITING_FOR_RETEST";
  const isRejected = rawStatus === "REJECTED" || rawStatus === "DUPLICATE";
  const isConfirmedOrAccepted =
    rawStatus === "ACCEPTED" ||
    rawStatus === "VALID_CONFIRMED" ||
    detail.isReviewed;

  const lastRetest =
    detail.retestHistory && detail.retestHistory.length > 0
      ? detail.retestHistory[detail.retestHistory.length - 1]
      : null;
  const isReopenedFromFailedRetest =
    (rawStatus === "VALID_CONFIRMED" || rawStatus === "ACCEPTED") &&
    lastRetest?.verdict === "STILL_VULNERABLE";

  const openRetest = openRetestAttempt(detail.retestHistory);
  const openRetestDueLabel = awaitingVerdictLabel(openRetest?.dueAt);
  const openRetestBonus = hasBountyReward(openRetest?.bountyReward)
    ? formatBountyAmount(openRetest?.bountyReward)
    : null;

  // Submitter Profile lookup
  const profileIdentifier =
    report.reporterUsername ||
    report.reporterId ||
    detail.submitterId ||
    detail.submitter;
  const { data: profileOverview } = useGetProfileByUsernameQuery(
    profileIdentifier,
    {
      skip: !profileIdentifier,
    },
  );
  const profile = profileOverview?.profile;

  const researcherDisplayName =
    report.reporterName ||
    profile?.displayName ||
    (profile as any)?.fullName ||
    detail.submitter ||
    "Researcher";
  const researcherUsername =
    report.reporterUsername ||
    profile?.username ||
    detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const researcherAvatarUrl =
    (report as any).reporterAvatarUrl ||
    profile?.avatarUrl ||
    (detail as any).submitterAvatarUrl;
  const researcherEmail =
    report.reporterEmail ||
    (profile as any)?.email ||
    detail.submitterEmail?.trim() ||
    "";
  const researcherReputation =
    profileOverview?.stats?.reputation ??
    (report as any).reporter?.reputation ??
    (report as any).reputationPoints ??
    null;

  const effectiveSeverity =
    report.settledSeverity ||
    report.agreedSeverity ||
    report.triageSeverity ||
    report.reportedSeverity ||
    report.severity ||
    "MEDIUM";

  const expectedReputation = pointsFor(effectiveSeverity);
  const totalBountyAwarded =
    report.rewards?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) ?? 0;

  const handleReopen = async () => {
    const severity = toApiSeverity(effectiveSeverity) || "MEDIUM";
    try {
      await reopenReport({
        id: String(detail.id),
        triageSeverity: severity,
      }).unwrap();
      toast.success("Report reopened for further investigation.");
      onRefresh?.();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to reopen report."));
    }
  };

  return (
    <aside className="space-y-6">
      {/* 1. Triage Actions & Workflow Controls */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="size-3.5 text-blue-600 dark:text-blue-400" />
            Triage &amp; Workflow
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted font-bold text-foreground">
            {rawStatus}
          </span>
        </div>

        {/* Retest In Progress Banner */}
        {isWaitingForRetest && openRetest && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-200 text-xs font-bold">
              <RotateCcw className="size-3.5 animate-spin-slow text-cyan-500 shrink-0" />
              <span>Retest Attempt #{openRetest.attemptNumber} Active</span>
            </div>
            {openRetestDueLabel && (
              <p className="text-xs text-muted-foreground">
                Researcher response {openRetestDueLabel}
              </p>
            )}
            {openRetestBonus && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <Coins className="size-3.5 text-emerald-500 shrink-0" />
                <span>Bonus: {openRetestBonus}</span>
              </div>
            )}
          </div>
        )}

        {/* Reopened from Failed Retest Alert */}
        {isReopenedFromFailedRetest && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold">
              <ShieldAlert className="size-3.5 text-rose-500 shrink-0" />
              <span>Retest Reported Still Vulnerable</span>
            </div>
            <p className="text-muted-foreground">
              The researcher verified the fix and reported that the vulnerability remains active.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Proceed to Severity Review */}
          <Link
            href={`/dashboard/report-management/${detail.id}/severity-review`}
            className="block"
          >
            <Button
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-10 gap-2 shadow-xs cursor-pointer"
            >
              <span>{isConfirmedOrAccepted || isResolved ? "Adjust Severity & Triage" : "Proceed to Severity Review"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          {/* Only on a resolved report. The API allows a retest from
              `RESOLVED` and nowhere else — it answers "Only a resolved report
              can be sent for retest, and this one is <state>" otherwise — so
              on a new or confirmed report this was an enabled button that
              could only ever produce a 409. It is hidden rather than
              disabled: before resolution a retest is not a step that is
              temporarily unavailable, it is not part of the workflow yet. */}
          {canRequestRetest && isResolved && (
            <Button
              variant="outline"
              onClick={() => setShowRetestDialog(true)}
              className="w-full rounded-xl h-9.5 text-xs font-semibold gap-1.5 cursor-pointer bg-card hover:bg-muted"
            >
              <RotateCcw className="size-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Request Retest</span>
            </Button>
          )}

          {/* Resolve & Award Bounty Button */}
          {!isResolved && !isRejected && (
            <Button
              onClick={() => setShowResolveDialog(true)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9.5 gap-1.5 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="size-4" />
              <span>Resolve &amp; Award Bounty</span>
            </Button>
          )}

          {/* Hall of Thanks Induction: If resolved, allow thanking; if not, show locked state */}
          {isResolved ? (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Hall of Thanks
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  Unlocked
                </span>
              </div>
              <ThankResearcherDialog
                detail={detail}
                triggerLabel="Induct into Hall of Thanks"
                variant="outline"
                size="sm"
                triggerClassName="w-full rounded-xl h-9 text-xs font-semibold gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/30"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReopen}
                disabled={isReopening}
                className="w-full rounded-xl h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reopen Report
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500/70" />
                  Hall of Thanks
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground font-mono">
                  Locked
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Researchers can be inducted into the Hall of Thanks once the company resolves the report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Severity & CVSS Assessment */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Severity &amp; Risk
          </h4>
          {report.dispute && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                report.dispute.status === "OPEN"
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
              )}
            >
              Dispute {report.dispute.status}
            </Badge>
          )}
        </div>

        <div>
          {report.severity ? (
            <SeverityBadge severity={report.severity} />
          ) : (
            <DisputedSeverityPair
              reportedSeverity={report.reportedSeverity || report.claimedSeverity}
              triageSeverity={report.triageSeverity || report.confirmedSeverity}
              cvssScore={report.cvssScore}
              size="md"
            />
          )}
        </div>

        {/* Severity Disagreement Alert */}
        {(report.hasSeverityDisagreement ||
          (report.agreedSeverity === null &&
            report.triageSeverity != null &&
            report.reportedSeverity != null &&
            report.triageSeverity !== report.reportedSeverity)) && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CircleAlert className="size-3.5 text-amber-500 shrink-0" />
              <span>Severity Disagreement</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Reported as{" "}
              <strong>{report.reportedSeverity || report.claimedSeverity}</strong>
              , but triage assessed as{" "}
              <strong>{report.triageSeverity || report.confirmedSeverity}</strong>.
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-2 border-t border-border text-sm">
          <Fact
            label="Claimed by Researcher"
            value={report.reportedSeverity || report.claimedSeverity || "Medium"}
          />
          <Fact
            label="Triage Confirmed"
            value={
              report.triageSeverity ||
              report.confirmedSeverity ||
              "Pending Triage"
            }
          />
          {report.agreedSeverity && (
            <Fact label="Agreed Severity" value={report.agreedSeverity} />
          )}
          <Fact
            label="CVSS Score"
            value={report.cvssScore ? String(report.cvssScore) : "Pending Review"}
          />
          {report.cvssVector && (
            <div className="space-y-1 pt-1">
              <span className="text-muted-foreground text-xs">CVSS Vector</span>
              <p className="font-mono text-xs text-foreground break-all">
                {report.cvssVector}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bounty & Reward Allocation */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Bounty &amp; Award Status
        </h4>
        {totalBountyAwarded > 0 ? (
          <div className="text-2xl font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 inline-block">
            ${totalBountyAwarded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ) : (
          <div className="text-sm font-semibold text-muted-foreground bg-muted/50 p-2.5 rounded-xl border border-border">
            Awaiting Resolution Award
          </div>
        )}

        <div className="space-y-2 pt-1 border-t border-border text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Reputation on Resolution</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <Trophy className="size-3 text-amber-500" />
              {report.reputationPoints ? `${report.reputationPoints} pts (Awarded)` : expectedReputation ? `+${expectedReputation} pts` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Hall of Thanks</span>
            <span className="font-medium flex items-center gap-1">
              {isResolved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-500" />
                  Eligible for Induction
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Lock className="size-3 text-muted-foreground" />
                  Unlocks upon Resolution
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Program Policy</span>
            <span className="font-medium text-foreground truncate max-w-[140px]">
              {report.program}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Finding & Scope Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Finding &amp; Scope Details
        </h4>
        <div className="space-y-2.5 text-sm">
          <Fact label="Asset Type" value={report.assetType || "URL"} />
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground shrink-0">Environment</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-bold uppercase px-2 py-0.5 rounded-md",
                report.environment === "PRODUCTION"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
              )}
            >
              {report.environment || "Production"}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground shrink-0">Weakness</span>
            <div className="text-right min-w-0 max-w-[65%]">
              <WeaknessDisplay
                weakness={report.weaknessObj || report.weakness}
                suggestedWeakness={report.suggestedWeakness}
              />
            </div>
          </div>
          {report.discoveredAt && (
            <Fact label="Discovered" value={report.discoveredAt} />
          )}
          {report.targetEndpoint && (
            <div className="space-y-1 pt-1">
              <span className="text-muted-foreground text-xs">Target Endpoint</span>
              <p className="font-mono text-xs text-foreground break-all p-2 rounded-lg bg-muted/50 border border-border">
                {report.targetEndpoint}
              </p>
            </div>
          )}
          <div className="pt-1 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="size-3 text-muted-foreground" />
              Disclosure Status
            </span>
            <span className="font-semibold text-foreground">
              Private &bull; Not Disclosed
            </span>
          </div>
        </div>
      </div>

      {/* 5. Submitter / Researcher Profile Panel */}
      <div className="bg-card p-5 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="size-3.5 text-blue-600 dark:text-blue-400" />
            Researcher Profile
          </h4>
          {researcherUsername && (
            <Link
              href={`/profile/${encodeURIComponent(researcherUsername)}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Profile</span>
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-3">
          <div className="flex items-center gap-3">
            {researcherAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={researcherAvatarUrl}
                alt={researcherDisplayName}
                className="size-11 rounded-full object-cover ring-1 ring-border shadow-2xs shrink-0"
              />
            ) : (
              <div className="size-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                {researcherDisplayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <p className="font-bold text-sm text-foreground truncate">
                {researcherDisplayName}
              </p>
              <p className="text-xs text-muted-foreground font-medium truncate">
                @{researcherUsername}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/70 text-xs">
            {researcherEmail && (
              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{researcherEmail}</span>
              </div>
            )}
            {researcherReputation !== null && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Trophy className="size-3 text-amber-500 shrink-0" />
                <span>{researcherReputation} Reputation Points</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ResolveReportDialog
        isOpen={showResolveDialog}
        onOpenChange={setShowResolveDialog}
        reportId={String(detail.id)}
        reportTitle={report.title}
        severity={effectiveSeverity}
        submitterName={researcherDisplayName}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      <RetestRequestDialog
        isOpen={showRetestDialog}
        onOpenChange={setShowRetestDialog}
        reportId={String(detail.id)}
        reportTitle={report.title}
        severity={effectiveSeverity}
        submitterName={researcherDisplayName}
        defaultEndpoint={report.targetEndpoint || undefined}
        reportState={rawStatus}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </aside>
  );
}
