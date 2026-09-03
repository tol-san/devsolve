"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Coins,
  Globe,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Activity,
  DollarSign,
  Building2,
  FileCode,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Tag,
} from "lucide-react";
import {
  ReportItem,
  useGetReportByIdQuery,
} from "@/lib/redux/services/reportsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { MarkdownView } from "@/components/ui/markdown-view";
import { WeaknessDisplay } from "@/components/reports/WeaknessDisplay";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportQuickViewModalProps {
  report: ReportItem | null;
  onClose: () => void;
}

export function ReportQuickViewModal({
  report,
  onClose,
}: ReportQuickViewModalProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Lazy fetch richer report detail when the modal is open
  const { data: reportDetail } = useGetReportByIdQuery(report?.id || "", {
    skip: !report?.id,
  });

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!report) return null;

  const isRetesting =
    report.status === "RETESTING" || (report as any).rawStatus === "RETESTING";
  const retests = reportDetail?.retestHistory || report.retestHistory || [];
  const latestRetest = retests.length > 0 ? retests[retests.length - 1] : null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(report.reportId);
    setCopiedId(true);
    toast.success(`Copied Report ID ${report.reportId}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedEndpoint(true);
    toast.success("Target endpoint copied to clipboard");
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleNavigateDetail = () => {
    onClose();
    router.push(`/dashboard/my-reports/${report.id}`);
  };

  // Severity Accent Theme
  const getSeverityAccent = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CRITICAL":
        return {
          gradient: "from-rose-500 via-red-500 to-amber-500",
          glow: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
        };
      case "HIGH":
        return {
          gradient: "from-orange-500 via-amber-500 to-yellow-500",
          glow: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          badgeBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
        };
      case "MEDIUM":
        return {
          gradient: "from-amber-500 via-blue-500 to-indigo-500",
          glow: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
        };
      case "LOW":
      default:
        return {
          gradient: "from-slate-500 via-blue-500 to-indigo-500",
          glow: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          badgeBg: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
        };
    }
  };

  const severityAccent = getSeverityAccent(report.severity);

  // Status Stepper Stages
  const getLifecycleStage = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return 1;
      case "TRIAGING":
        return 2;
      case "ACCEPTED":
      case "RETESTING":
        return 3;
      case "RESOLVED":
      case "REJECTED":
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = getLifecycleStage(report.status);

  const steps = [
    { number: 1, label: "Submitted", desc: "Received" },
    { number: 2, label: "Triage", desc: "CVSS Verification" },
    { number: 3, label: isRetesting ? "Retest Verification" : "Validated", desc: isRetesting ? "Fix Deployed" : "Accepted" },
    { number: 4, label: report.status === "REJECTED" ? "Closed" : "Resolved", desc: report.status === "REJECTED" ? "Rejected" : "Bounty Paid" },
  ];

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card text-card-foreground rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl ring-1 ring-foreground/10 border border-border/80 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        >
          {/* Top Accent Gradient Bar */}
          <div
            className={cn(
              "h-1.5 w-full bg-gradient-to-r",
              isRetesting
                ? "from-cyan-400 via-teal-400 to-blue-500 animate-pulse"
                : severityAccent.gradient
            )}
          />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-border bg-muted/25 space-y-3.5">
            {/* Top Row: ID Badge + Badges + Close Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Click to copy Report ID"
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-foreground font-mono text-xs font-bold hover:bg-muted hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="text-primary font-mono">{report.reportId}</span>
                  {copiedId ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>

                <SeverityBadge
                  severity={
                    (reportDetail?.settledSeverity ||
                      report.settledSeverity ||
                      reportDetail?.agreedSeverity ||
                      reportDetail?.triageSeverity ||
                      reportDetail?.reportedSeverity ||
                      report.severity) as any
                  }
                />
                <StatusBadge status={report.status} />

                {(reportDetail?.dispute || report.dispute) && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                      (reportDetail?.dispute?.status || report.dispute?.status) === "OPEN"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    )}
                  >
                    Dispute: {reportDetail?.dispute?.status || report.dispute?.status}
                  </Badge>
                )}

                {reportDetail?.cvssScore && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full border-border bg-background text-foreground"
                  >
                    CVSS {reportDetail.cvssScore}
                  </Badge>
                )}

                {isRetesting && (
                  <Badge
                    variant="outline"
                    className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] uppercase gap-1 px-2.5 py-0.5"
                  >
                    <RotateCcw className="size-2.5 animate-spin-slow" />
                    <span>Retest Action Required</span>
                  </Badge>
                )}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-xl size-8.5 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer transition-colors"
              >
                <X className="size-4.5" />
              </Button>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
              {report.title}
            </h2>

            {/* Program & Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="size-6 rounded-lg bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-[11px]">
                    {report.avatarLetter}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">
                  {report.program}
                </span>
              </div>

              {report.submittedAt && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-muted-foreground/70" />
                    <span>Submitted {new Date(report.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </>
              )}

              {report.type && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Building2 className="size-3.5 text-muted-foreground/70" />
                    <span>{report.type} Program</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Retest Action Banner (When Retesting is active) */}
            {isRetesting && (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent p-4 sm:p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-xs">
                      <RotateCcw className="size-5 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Remediation Fix Verification Requested
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Attempt #{latestRetest?.attemptNumber || 1} &bull; Fix deployed by program team
                      </p>
                    </div>
                  </div>

                  {latestRetest?.environment && (
                    <Badge
                      variant="outline"
                      className="border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold text-xs uppercase px-2.5 py-1"
                    >
                      {latestRetest.environment}
                    </Badge>
                  )}
                </div>

                {/* Retest Bonus & Endpoint Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {Number(latestRetest?.bountyReward) > 0 && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold text-xs">
                      <Coins className="size-4 text-emerald-500 shrink-0" />
                      <span>+${Number(latestRetest?.bountyReward).toLocaleString()} Bonus on verified fix</span>
                    </div>
                  )}
                  {latestRetest?.targetEndpoint && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/80 border border-border text-muted-foreground font-mono text-xs truncate">
                      <Globe className="size-4 text-cyan-500 shrink-0" />
                      <span className="truncate">{latestRetest.targetEndpoint}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lifecycle Progress Pipeline */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Triage Pipeline
                </span>
                <span className="font-bold text-foreground text-xs">
                  {report.status}
                </span>
              </div>

              {/* Progress Steps Visual */}
              <div className="grid grid-cols-4 gap-2 relative">
                {steps.map((step) => {
                  const isCompleted = step.number < currentStage || (step.number === 4 && report.status === "RESOLVED");
                  const isCurrent = step.number === currentStage && report.status !== "RESOLVED";

                  return (
                    <div
                      key={step.number}
                      className="flex flex-col items-center text-center space-y-1.5"
                    >
                      {/* Step Indicator Dot / Icon */}
                      <div
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border",
                          isCompleted
                            ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                            : isCurrent
                            ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                            : "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="size-3.5 stroke-[3]" />
                        ) : (
                          step.number
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="space-y-0.5">
                        <span
                          className={cn(
                            "text-xs font-bold block leading-tight",
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground block hidden sm:block">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Glassmorphism Key Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Severity Card */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2 hover:border-border transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Severity
                  </span>
                  <div className="p-1 rounded-md bg-muted text-muted-foreground">
                    <ShieldAlert className="size-3.5" />
                  </div>
                </div>
                <div>
                  <SeverityBadge severity={report.severity} />
                </div>
              </div>

              {/* Status Card */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2 hover:border-border transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <div className="p-1 rounded-md bg-muted text-muted-foreground">
                    <Activity className="size-3.5" />
                  </div>
                </div>
                <div>
                  <StatusBadge status={report.status} />
                </div>
              </div>

              {/* Reward Card */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2 hover:border-border transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Reward
                  </span>
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Coins className="size-3.5" />
                  </div>
                </div>
                <div>
                  {report.isBountyHighlight ? (
                    <span className="inline-flex items-center gap-1 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                      <DollarSign className="size-3.5" />
                      <span>{report.bountyOrRep.replace("$", "")}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-foreground block truncate">
                      {report.bountyOrRep}
                    </span>
                  )}
                </div>
              </div>

              {/* Scope & Program Type Card */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2 hover:border-border transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Scope
                  </span>
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Layers className="size-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block truncate">
                    {reportDetail?.environment || report.type || "Bounty Program"}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Endpoint Preview (If available) */}
            {reportDetail?.targetEndpoint && (
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-blue-500" />
                    Target Asset &amp; Endpoint
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyEndpoint(reportDetail.targetEndpoint || "")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copiedEndpoint ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-background border border-border font-mono text-xs text-foreground truncate select-all">
                  {reportDetail.targetEndpoint}
                </div>
              </div>
            )}

            {/* Weakness & Vulnerability Summary Preview */}
            {(reportDetail?.weakness || reportDetail?.description) && (
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground" />
                    Vulnerability Classification
                  </span>
                  <div className="max-w-[70%]">
                    <WeaknessDisplay
                      weakness={
                        reportDetail?.weaknessObj ||
                        report.weaknessObj ||
                        reportDetail?.weakness ||
                        null
                      }
                      suggestedWeakness={
                        reportDetail?.suggestedWeakness ||
                        report.suggestedWeakness
                      }
                    />
                  </div>
                </div>
                {reportDetail?.description && (
                  <div className="max-h-56 overflow-y-auto pr-1 text-xs leading-relaxed text-foreground/90">
                    <MarkdownView
                      source={reportDetail.description}
                      className="[&.wmde-markdown]:!text-xs sm:[&.wmde-markdown]:!text-xs [&.wmde-markdown]:!leading-relaxed text-foreground"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Activity Metadata Footer Strip */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <Clock className="size-4 text-primary shrink-0" />
                <span className="hidden sm:inline">Last Activity:</span>
                <strong className="text-foreground truncate">
                  {report.lastActivityDate}
                </strong>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider border-border bg-background px-2.5 py-0.5 shrink-0"
              >
                {report.lastActivityBadge}
              </Badge>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-border bg-muted/20">
            <button
              type="button"
              onClick={handleCopyId}
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCode className="size-3.5" />
              <span>Report Code: <strong className="font-mono text-foreground">{report.reportId}</strong></span>
            </button>

            <div className="flex items-center gap-2.5 ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs sm:text-sm h-9.5 px-4 font-semibold cursor-pointer border-border hover:bg-muted"
              >
                Close
              </Button>
              <Button
                onClick={handleNavigateDetail}
                className={cn(
                  "rounded-xl text-xs sm:text-sm h-9.5 px-5 font-semibold gap-2 shadow-xs cursor-pointer text-white transition-all",
                  isRetesting
                    ? "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20"
                )}
              >
                {isRetesting ? (
                  <>
                    <RotateCcw className="size-4 animate-spin-slow" />
                    <span>Start Retest Verification</span>
                  </>
                ) : (
                  <>
                    <span>Full Report &amp; PoC</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

