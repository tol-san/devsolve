"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarClock,
  Coins,
  FileWarning,
  Globe,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import { isNotFoundError } from "@/lib/api/query-error";
import { useReportDetail } from "@/components/reports/hooks/useReportDetail";
import { ReportDetailHeader } from "@/components/reports/ReportDetailHeader";
import { RejectedReportView } from "@/components/reports/RejectedReportView";
import { ReportStatusTracker } from "@/components/reports/ReportStatusTracker";
import { ReportSummaryTab } from "@/components/reports/ReportSummaryTab";
import { ReportEarnings } from "@/components/reports/ReportEarnings";
import { RetestHistoryTimeline } from "@/components/report-management/RetestHistoryTimeline";
import { SubmitRetestModal } from "@/components/report-management/SubmitRetestModal";
import {
  formatBountyAmount,
  hasBountyReward,
  latestRetestAttempt,
  openRetestAttempt,
  retestDeadline,
  verdictDueLabel,
} from "@/lib/reports/retest";

export default function ReportDetailPage() {
  const [showRetestModal, setShowRetestModal] = useState(false);
  const [selectedVerdict, setSelectedVerdict] = useState<"VERIFIED_FIXED" | "STILL_VULNERABLE">("VERIFIED_FIXED");
  /* Cached and shared with every other screen that asks, so this costs one
     request per session. `session.user.id` would not do: it is better-auth's
     id, and `reporterId` is the backend's. */
  const { data: session } = authClient.useSession();
  const { data: me } = useGetProfileByUsernameQuery("me", { skip: !session });
  const {
    reportId,
    report,
    isLoading,
    isError,
    error,
    refetch,
    isRejected,
    activeTab,
    setActiveTab,
    copiedPayload,
    handleBack,
    handleCopyPayload,
  } = useReportDetail();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-primary/20" />
          <span className="text-sm font-medium text-muted-foreground">Loading report details...</span>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    const notFound = isNotFoundError(error);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex max-w-xl flex-col items-center rounded-[24px] bg-card px-6 py-12 text-center ring-1 ring-foreground/5 dark:ring-foreground/10 sm:px-12"
      >
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        >
          <FileWarning className="size-7" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          {notFound ? "Report not found" : "We couldn't load this report"}
        </h1>

        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          {notFound
            ? "No report exists at this address. It may have been withdrawn, or the link may be out of date."
            : "The report service did not respond. Nothing is wrong with your report — this is on our side."}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {!notFound && (
            <Button onClick={() => refetch()} className="h-11 rounded-xl px-5 font-semibold">
              <RotateCcw data-icon="inline-start" />
              Try again
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-11 rounded-xl px-5 font-semibold"
          >
            <ArrowLeft data-icon="inline-start" />
            Back to my reports
          </Button>
        </div>
      </motion.div>
    );
  }

  const rawState = (report as any)?.rawStatus || (report as any)?.state || report?.status;
  const isRetesting = rawState === "RETESTING";
  const retestHistory = report?.retestHistory || [];
  /* The attempt to answer is the open one, found by `completedAt` — not the
     newest, which is only the same thing until someone answers it. */
  const openRetest = openRetestAttempt(retestHistory);
  const latestRetest = latestRetestAttempt(retestHistory);
  const retestDue = retestDeadline(openRetest?.dueAt);
  const retestDueLabel = verdictDueLabel(openRetest?.dueAt);
  const retestBonus = hasBountyReward(openRetest?.bountyReward)
    ? formatBountyAmount(openRetest?.bountyReward)
    : null;
  /* Only the reporter may answer — anyone else gets a 404 from the submit
     endpoint, deliberately. When either id is missing the form is left in
     place rather than hidden: this is the reporter's own list, and a false
     negative would lock the one person entitled to answer out of answering. */
  const isReporter =
    !me?.profile.id || !report.reporterId || me.profile.id === report.reporterId;
  const canSubmitVerdict = isRetesting && isReporter;

  const isReopenedFromFailedRetest =
    (rawState === "VALID_CONFIRMED" || rawState === "ACCEPTED" || rawState === "TRIAGING") &&
    latestRetest?.verdict === "STILL_VULNERABLE";

  const handleOpenRetest = (verdict: "VERIFIED_FIXED" | "STILL_VULNERABLE") => {
    setSelectedVerdict(verdict);
    setShowRetestModal(true);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Header Bar */}
      <ReportDetailHeader
        reportId={report.reportId}
        program={report.program}
        submittedAgo={report.submittedAgo}
        submittedAt={report.submittedAt}
        isRejected={isRejected}
        onBack={handleBack}
      />

      {/* The open retest, and the two answers it can be given */}
      {canSubmitVerdict && (
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0">
                <RotateCcw className="size-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Retest requested &bull; Attempt #{openRetest?.attemptNumber ?? 1}
                  </h3>
                  {openRetest?.environment && (
                    <Badge variant="outline" className="text-xs font-bold uppercase border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      {openRetest.environment}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  The organization deployed a fix and asked you to re-run your
                  proof of concept. Answer either way &mdash; there is nothing
                  to accept first.
                </p>
              </div>
            </div>

            {/* Both verdicts, offered evenly. Neither is an accept step. */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => handleOpenRetest("VERIFIED_FIXED")}
                className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-1.5 cursor-pointer shadow-xs px-3.5"
              >
                <ShieldCheck className="size-4" />
                <span>Verified fixed</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleOpenRetest("STILL_VULNERABLE")}
                className="h-9 rounded-xl border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold text-sm gap-1.5 cursor-pointer shadow-2xs px-3.5"
              >
                <ShieldAlert className="size-4" />
                <span>Still vulnerable</span>
              </Button>
            </div>
          </div>

          {/* The deadline, the bonus and the target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
            {retestDueLabel && (
              <div
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border font-semibold",
                  retestDue?.isOverdue
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                    : retestDue?.isUrgent
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200",
                )}
              >
                <CalendarClock className="size-4 shrink-0" />
                <span>
                  {retestDueLabel}
                  {retestDue && !retestDue.isOverdue ? ` (${retestDue.absolute})` : ""}
                </span>
              </div>
            )}
            {retestBonus && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold">
                <Coins className="size-4 text-emerald-500 shrink-0" />
                <span>{retestBonus} bonus, paid when you submit your verdict</span>
              </div>
            )}
            {openRetest?.targetEndpoint && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border/70 bg-background/70 font-mono text-muted-foreground truncate">
                <Globe className="size-4 text-blue-500 shrink-0" />
                <span className="truncate">{openRetest.targetEndpoint}</span>
              </div>
            )}
          </div>

          {openRetest?.requestNotes && (
            <div className="p-3 rounded-xl border border-border/70 bg-background/60 text-sm text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block mb-0.5">
                What they asked for:
              </span>
              &ldquo;{openRetest.requestNotes}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Reopened from Failed Retest Alert Banner */}
      {isReopenedFromFailedRetest && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
            <ShieldAlert className="size-4 text-rose-500 shrink-0" />
            <span>Finding Reopened &mdash; You Reported Still Vulnerable on Attempt #{latestRetest?.attemptNumber}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your verification feedback indicated that the deployed fix is incomplete. The organization has been notified to re-evaluate and develop a revised remediation.
          </p>
          {latestRetest?.resultNotes && (
            <div className="p-3 rounded-xl bg-background/80 border border-border/70 text-xs italic text-foreground leading-relaxed">
              &ldquo;{latestRetest.resultNotes}&rdquo;
            </div>
          )}
        </div>
      )}

      {isRejected ? (
        /* REJECTED REPORT DETAIL VIEW */
        <RejectedReportView
          report={report}
          copiedPayload={copiedPayload}
          onCopyPayload={handleCopyPayload}
        />
      ) : (
        /* STANDARD ACCEPTED/TRIAGING/RESOLVED REPORT DETAIL VIEW */
        <div className="space-y-6">
          {/* Report Title & Status Stepper Card */}
          <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-4 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {report.title}
            </h2>
            <ReportStatusTracker status={report.status} />
          </div>

          {/* Only renders once reputation has actually been awarded. */}
          <ReportEarnings report={report} />

          {/* Navigation Tabs */}
          <div className="flex items-center p-1 bg-muted/60 rounded-xl gap-1 border border-border w-full sm:w-auto self-start">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "summary"
                  ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("retest")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "retest"
                  ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Retest History ({retestHistory.length})
            </button>
          </div>

          {/* Tab Content Render */}
          {activeTab === "summary" ? (
            <ReportSummaryTab report={report} />
          ) : (
            <RetestHistoryTimeline history={retestHistory} audience="reporter" />
          )}
        </div>
      )}

      {/* The verdict form. The mutation writes the returned report into the
          cache itself, so there is nothing to refetch on success. */}
      <SubmitRetestModal
        isOpen={showRetestModal}
        onOpenChange={setShowRetestModal}
        reportId={reportId}
        reportTitle={report.title}
        attempt={openRetest}
        attachments={report.attachments}
        initialVerdict={selectedVerdict}
      />
    </motion.section>
  );
}
