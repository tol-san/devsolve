"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
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
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

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
    apiReport.rawStatus ||
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

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(cleanReportId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(apiReport.title);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      // ignore
    }
  };

  const isUrlTitle = /^https?:\/\//i.test((apiReport.title || "").trim());

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

      <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 border border-border bg-card p-5 sm:p-7 space-y-6 shadow-xs">
        {/* Subtle ambient gradient highlight in corner */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-60 blur-2xl" />

        <div className="relative z-10 space-y-5 sm:space-y-6">
          {/* Top Row: Report ID, Status badge, Severity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyId}
                title="Click to copy Report ID"
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 font-mono text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <span>{cleanReportId}</span>
                {copiedId ? (
                  <Check className="size-3 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
                ) : (
                  <Copy className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs",
                  statusCfg.className,
                )}
              >
                <StatusIcon className="size-3.5 shrink-0" />
                <span>{statusCfg.label}</span>
              </Badge>
            </div>

            <div className="shrink-0 flex items-center justify-start sm:justify-end">
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

          {/* Finding Title or Target Endpoint */}
          {isUrlTitle ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  <Globe className="size-3.5 shrink-0" />
                  Target Vulnerability Endpoint
                </span>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Reported target URI
                </span>
              </div>
              <div className="group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/80 transition-colors shadow-2xs">
                <div className="font-mono text-sm sm:text-base font-semibold text-foreground break-all select-all leading-relaxed">
                  {apiReport.title}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTitle}
                    className="h-8 px-2.5 gap-1.5 text-xs rounded-lg cursor-pointer bg-card hover:bg-muted shadow-2xs"
                  >
                    {copiedTitle ? (
                      <>
                        <Check className="size-3.5 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted-foreground" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight break-words leading-tight">
              {apiReport.title}
            </h1>
          )}

          {/* Tactile Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
            {/* Organization Chip */}
            {(apiReport.organizationName || detail.organizationName) && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm transition-all hover:bg-muted/70 hover:border-border shadow-2xs">
                {apiReport.organizationLogoUrl || detail.organizationLogoUrl ? (
                  <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card border border-border">
                    <Image
                      src={apiReport.organizationLogoUrl || detail.organizationLogoUrl!}
                      alt={apiReport.organizationName || detail.organizationName || "Organization"}
                      width={20}
                      height={20}
                      className="size-4 object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-card border border-border text-muted-foreground">
                    <Building2 className="size-3" />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs font-semibold">Org:</span>
                  {detail.organizationId ? (
                    <Link
                      href={`/company?id=${detail.organizationId}`}
                      className="font-bold text-foreground hover:text-primary transition-colors hover:underline"
                    >
                      {apiReport.organizationName || detail.organizationName}
                    </Link>
                  ) : (
                    <span className="font-bold text-foreground">
                      {apiReport.organizationName || detail.organizationName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Program Chip */}
            {apiReport.program && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm transition-all hover:bg-muted/70 hover:border-border shadow-2xs">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Shield className="size-3" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-xs font-semibold">Program:</span>
                  <span className="font-bold text-foreground">{apiReport.program}</span>
                </div>
              </div>
            )}

            {/* Researcher Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm transition-all hover:bg-muted/70 hover:border-border shadow-2xs">
              {apiReport.reporterAvatarUrl ? (
                <Image
                  src={apiReport.reporterAvatarUrl}
                  alt={apiReport.reporterName || "Researcher"}
                  width={20}
                  height={20}
                  className="size-5 rounded-full object-cover shrink-0 border border-border"
                  unoptimized
                />
              ) : (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-card border border-border text-muted-foreground">
                  <User className="size-3" />
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs font-semibold">Researcher:</span>
                <span className="font-bold text-foreground">
                  {apiReport.reporterName || "Researcher"}
                </span>
                {apiReport.reporterUsername && (
                  <Link
                    href={`/profile/${encodeURIComponent(apiReport.reporterUsername)}`}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hover:underline"
                  >
                    (@{apiReport.reporterUsername})
                  </Link>
                )}
              </div>
            </div>

            {/* Submission Date Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs sm:text-sm shadow-2xs">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-card border border-border text-muted-foreground">
                <Calendar className="size-3" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs font-semibold">Submitted:</span>
                <span className="font-medium text-foreground">{displaySubmitted}</span>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="pt-4 border-t border-border/70">
            <ReportStatusTracker status={apiReport.status} />
          </div>
        </div>
      </div>

      {rawState === "NEW" && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
          <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent opacity-60 blur-2xl" />
          <div className="relative z-10 flex items-start sm:items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
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
            className="relative z-10 shrink-0"
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
