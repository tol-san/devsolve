"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Shield,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ReportStatusTracker } from "@/components/reports/ReportStatusTracker";
import { ReportSummaryTab } from "@/components/reports/ReportSummaryTab";
import { RetestHistoryTimeline } from "@/components/report-management/RetestHistoryTimeline";
import { ReportManagementSidebar } from "@/components/report-management/ReportManagementSidebar";
import SeverityBadge from "@/components/reports/SeverityBadge";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { buildReportManagementDetailFromApiReport } from "@/components/report-management/mock-data";
import {
  useGetReportActivitiesQuery,
  useGetReportByIdQuery,
} from "@/lib/redux/services/reportsApi";
import { ReportTimeline } from "@/components/reports/ReportTimeline";
import { SeverityDisputePanel } from "@/components/reports/SeverityDisputePanel";
import { formatDateTime } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

function statusBadgeConfig(rawState: string) {
  const normalized = (rawState || "").toUpperCase();
  switch (normalized) {
    case "NEW":
    case "SUBMITTED":
      return {
        label: "New Submission",
        className:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        icon: AlertTriangle,
      };
    case "TRIAGING":
    case "NEEDS_MORE_INFO":
      return {
        label: "Under Triage",
        className:
          "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
        icon: Clock,
      };
    case "VALID_CONFIRMED":
    case "ACCEPTED":
      return {
        label: "Confirmed Valid",
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle2,
      };
    case "RETESTING":
    case "WAITING_FOR_RETEST":
      return {
        label: "Retest In Progress",
        className:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
        icon: RotateCcw,
      };
    case "RESOLVED":
      return {
        label: "Resolved & Closed",
        className:
          "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
        icon: ShieldCheck,
      };
    case "REJECTED":
    case "DUPLICATE":
      return {
        label: "Rejected",
        className:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        icon: XCircle,
      };
    default:
      return {
        label: rawState || "Pending",
        className: "border-border bg-muted text-foreground",
        icon: Clock,
      };
  }
}

export default function ReportManagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [activeTab, setActiveTab] = useState<"summary" | "retest">("summary");

  const {
    data: apiReport,
    isLoading: isReportLoading,
    isError,
    refetch: refetchReport,
  } = useGetReportByIdQuery(reportId, { skip: !reportId });

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useGetReportActivitiesQuery(reportId, { skip: !reportId });

  const handleRefresh = React.useCallback(() => {
    void refetchReport();
  }, [refetchReport]);

  const handleBack = () => {
    router.push("/dashboard/report-management");
  };

  const detail = React.useMemo(() => {
    if (apiReport) {
      return buildReportManagementDetailFromApiReport(apiReport);
    }
    return null;
  }, [apiReport]);

  if (isReportLoading || (!apiReport && !isError)) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-6 w-48 bg-muted/60 rounded-xl" />
        <div className="h-36 w-full bg-muted/40 rounded-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 w-full bg-muted/40 rounded-2xl" />
            <div className="h-48 w-full bg-muted/40 rounded-2xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="h-64 w-full bg-muted/40 rounded-2xl" />
            <div className="h-64 w-full bg-muted/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !apiReport || !detail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card p-8 sm:p-12 text-center border border-border shadow-xs"
      >
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
          <AlertCircle className="size-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Report Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          The requested report could not be found or you do not have permission
          to view it.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetchReport()}
            variant="outline"
            className="rounded-xl cursor-pointer"
          >
            <RotateCcw className="size-4 mr-1.5" />
            Retry
          </Button>
          <Link href="/dashboard/report-management">
            <Button className="rounded-xl cursor-pointer">Back to Queue</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const rawState = (
    (apiReport as any).state ||
    detail.rawStatus ||
    apiReport.status ||
    ""
  ).toUpperCase();
  const statusCfg = statusBadgeConfig(rawState);
  const StatusIcon = statusCfg.icon;

  const displaySubmitted = apiReport.submittedAt
    ? formatDateTime(apiReport.submittedAt)
    : apiReport.submittedAgo || "Recently";

  const cleanReportId = apiReport.reportId.startsWith("#")
    ? apiReport.reportId
    : `#${apiReport.reportId}`;

  const retestHistory = apiReport.retestHistory || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium"
        >
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <Link
            href="/dashboard/report-management"
            className="transition-colors hover:text-foreground"
          >
            Report Management
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground font-mono">
            {cleanReportId}
          </span>
        </nav>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="rounded-xl cursor-pointer bg-card text-foreground hover:bg-muted gap-1.5 h-9"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Queue</span>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              >
                {cleanReportId}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5",
                  statusCfg.className,
                )}
              >
                <StatusIcon className="size-3.5 shrink-0" />
                <span>{statusCfg.label}</span>
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight break-words leading-snug">
              {apiReport.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground font-medium pt-0.5">
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Program:</span>
                <strong className="text-foreground">{apiReport.program}</strong>
              </span>

              <span className="text-muted-foreground/40">&bull;</span>

              <span className="flex items-center gap-1.5">
                <User className="size-3.5 shrink-0" />
                <span>Researcher:</span>
                <strong className="text-foreground">
                  {apiReport.reporterName || "Researcher"}
                </strong>
                {apiReport.reporterUsername && (
                  <span className="text-muted-foreground">
                    (@{apiReport.reporterUsername})
                  </span>
                )}
              </span>

              <span className="text-muted-foreground/40">&bull;</span>

              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                <span>Submitted {displaySubmitted}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center md:items-start justify-start md:justify-end">
            {apiReport.severity ? (
              <SeverityBadge severity={apiReport.severity} />
            ) : (
              <DisputedSeverityPair
                reportedSeverity={apiReport.reportedSeverity || apiReport.claimedSeverity}
                triageSeverity={apiReport.triageSeverity || apiReport.confirmedSeverity}
                cvssScore={apiReport.cvssScore}
                size="sm"
              />
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <ReportStatusTracker status={apiReport.status} />
        </div>
      </div>

      {rawState === "NEW" && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  New Vulnerability Finding &bull; Action Required
                </h3>
                <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30 text-[10px] font-bold uppercase">
                  Pending Triage
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review the write-up and evidence below. Proceed to severity
                review to confirm CVSS score and finalize bounty eligibility.
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/report-management/${reportId}/severity-review`}
            className="shrink-0"
          >
            <Button
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Start Severity Review</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <SeverityDisputePanel
        reportId={reportId}
        dispute={apiReport.dispute}
        reportedSeverity={apiReport.reportedSeverity}
        triageSeverity={apiReport.triageSeverity}
        isReporter={false}
      />

      <ReportTimeline
        activities={activities}
        isLoading={activitiesLoading}
        isError={activitiesError}
      />

      <div className="flex items-center p-1 bg-muted/60 rounded-xl gap-1 border border-border w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
            activeTab === "summary"
              ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Vulnerability Details &amp; Evidence
        </button>
        <button
          onClick={() => setActiveTab("retest")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
            activeTab === "retest"
              ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Retest Verification ({retestHistory.length})
        </button>
      </div>

      {activeTab === "summary" ? (
        <ReportSummaryTab
          report={apiReport}
          sidebar={
            <ReportManagementSidebar
              report={apiReport}
              detail={detail}
              onRefresh={handleRefresh}
            />
          }
        />
      ) : (
        <RetestHistoryTimeline
          history={retestHistory}
          audience="organization"
        />
      )}
    </motion.section>
  );
}
