"use client";

import { motion } from "motion/react";
import { ArrowLeft, FileWarning, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isNotFoundError } from "@/lib/api/query-error";
import { useReportDetail } from "@/components/reports/hooks/useReportDetail";
import { ReportDetailHeader } from "@/components/reports/ReportDetailHeader";
import { RejectedReportView } from "@/components/reports/RejectedReportView";
import { ReportStatusTracker } from "@/components/reports/ReportStatusTracker";
import { ReportSummaryTab } from "@/components/reports/ReportSummaryTab";
import { ReportRetestTab } from "@/components/reports/ReportRetestTab";

export default function ReportDetailPage() {
  const {
    reportId,
    report,
    isLoading,
    isError,
    error,
    refetch,
    isRejected,
    setIsForceRejected,
    activeTab,
    setActiveTab,
    copiedPayload,
    retestHistory,
    handleBack,
    handleInitiateRetest,
    handleResetRetest,
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

  /* A report that cannot be loaded says so. This used to be indistinguishable
     from loading — the query answered a failure with a mock report, and on the
     paths where it did not, the page sat on its spinner for ever. */
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

      {isRejected ? (
        /* REJECTED REPORT DETAIL VIEW */
        <RejectedReportView
          report={report}
          copiedPayload={copiedPayload}
          onCopyPayload={handleCopyPayload}
        />
      ) : (
        /* STANDARD ACCEPTED/TRIAGING REPORT DETAIL VIEW */
        <div className="space-y-6">
          {/* Report Title & Status Stepper Card */}
          <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-4 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {report.title}
            </h2>
            <ReportStatusTracker status={report.status} />
          </div>

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
            <ReportRetestTab
              retestHistory={retestHistory}
              onInitiateRetest={handleInitiateRetest}
              onResetRetest={handleResetRetest}
            />
          )}
        </div>
      )}
    </motion.section>
  );
}
