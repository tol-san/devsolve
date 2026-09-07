"use client";

export const dynamic = "force-dynamic";

const SEVERITY_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  useGetReportConfirmationByIdQuery,
  useUpdateConfirmReportMutation,
  useResolveAdminDisputeMutation,
} from "@/lib/redux/services/adminApi";
import { formatDateTime } from "@/lib/format/datetime";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ShieldAlert,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Copy,
  Check,
  FileText,
  Paperclip,
  Flame,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Lock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

type DetailTab = "overview" | "poc" | "discussion" | "audit";

export default function ReportConfirmationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const { data: report, isLoading, isError } = useGetReportConfirmationByIdQuery(id, {
    skip: !id,
  });
  const [updateConfirm] = useUpdateConfirmReportMutation();
  const [resolveDispute] = useResolveAdminDisputeMutation();

  const [severityOverride, setSeverityOverride] = useState<
    "Critical" | "High" | "Medium" | "Low" | null
  >(null);
  const [rewardOverride, setRewardOverride] = useState<string | null>(null);
  const [noteOverride, setNoteOverride] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  if (isLoading) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-lg" />
        <div className="h-44 bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="h-96 bg-muted rounded-2xl" />
          </div>
          <div className="h-[500px] bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="space-y-6 w-full pb-12">
        <Link
          href="/dashboard/report-confirmation"
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Triage Queue
        </Link>
        <Card className="rounded-2xl border border-border bg-card p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Report Not Found
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The requested report ID `{id}` could not be located in the platform confirmation queue.
          </p>
          <Button
            onClick={() => router.push("/dashboard/report-confirmation")}
            className="rounded-xl font-semibold bg-foreground hover:bg-foreground/90 text-background cursor-pointer px-6 h-10 text-sm"
          >
            Return to Confirmation Queue
          </Button>
        </Card>
      </div>
    );
  }

  const claimedCvss = report.cvssScore ? `CVSS ${report.cvssScore}` : undefined;
  type SeverityBox = {
    tier: "Critical" | "High" | "Medium" | "Low" | "None" | null;
    cvss?: string;
    typicalReward?: string;
  };
  const hackerSev: SeverityBox = report.hackerClaimedSeverity ?? {
    tier: report.reportedSeverity ?? report.severity ?? null,
    cvss: claimedCvss,
  };
  const companySev: SeverityBox = report.companyConfirmedSeverity ?? {
    tier: report.triageSeverity ?? report.severity ?? null,
    cvss: claimedCvss,
  };

  const selectedSeverity: "Critical" | "High" | "Medium" | "Low" =
    severityOverride ??
    (companySev.tier && companySev.tier !== "None" ? companySev.tier : null) ??
    (hackerSev.tier && hackerSev.tier !== "None" ? hackerSev.tier : null) ??
    (report.severity && (report.severity as string) !== "None" ? report.severity : null) ??
    "Medium";
  const severitiesAgree = hackerSev.tier === selectedSeverity;

  const rewardAmount =
    rewardOverride ?? report.rewardAmount ?? report.rewardEstimate ?? "";
  const adminNote = noteOverride ?? report.triageNotes ?? "";
  const companyReasoning = report.companyReasoning ?? "";

  const handleCopyPayload = () => {
    if (report.pocPayload) {
      navigator.clipboard.writeText(report.pocPayload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleAction = async (status: "CONFIRMED" | "REJECTED" | "ESCALATED") => {
    setIsSubmitting(true);
    try {
      if (report?.disputeId) {
        await resolveDispute({
          id: report.disputeId,
          status: status === "REJECTED" ? "DISMISSED" : "RESOLVED",
          finalSeverity: (selectedSeverity.toUpperCase()) as any,
          resolutionNotes: adminNote || `Admin ruled severity as ${selectedSeverity}`,
        }).unwrap().catch((e) => console.warn("Failed resolving dispute via admin disputes API:", e));
      }

      await updateConfirm({
        id: report.id,
        status,
        severity: selectedSeverity,
        rewardAmount: rewardAmount,
        companyReasoning: companyReasoning,
        triageNotes: adminNote,
      });
      router.push("/dashboard/report-confirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: DetailTab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview & Scope" },
    { id: "poc", label: "PoC & Evidence", count: report.attachments?.length },
    { id: "discussion", label: "Discussion Thread", count: report.discussionThread?.length },
    { id: "audit", label: "Audit Timeline", count: report.auditLog?.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/dashboard/report-confirmation"
              className="hover:text-foreground flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Triage Queue
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono font-bold text-foreground">
              {report.reportCode || `DS-${report.id}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Report Validation & Triage Review
          </h1>
        </div>

        <Badge
          variant="outline"
          className="rounded-full px-3.5 py-1 text-sm font-bold border-border self-start sm:self-center"
        >
          Status: {report.status}
        </Badge>
      </header>

      <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {report.researcherUsername ? (
              <Link
                href={`/profile/${encodeURIComponent(report.researcherUsername)}`}
                title={`View @${report.researcherUsername}'s profile`}
                className="group shrink-0 block"
              >
                {report.researcherAvatarUrl ? (
                  <div className="size-14 rounded-2xl overflow-hidden border border-border shadow-2xs group-hover:border-primary/50 group-hover:ring-2 group-hover:ring-primary/20 transition duration-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.researcherAvatarUrl}
                      alt={report.researcherName}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`size-14 rounded-2xl flex items-center justify-center font-bold text-base shadow-2xs group-hover:border-primary/50 transition duration-200 ${
                      report.avatarColor || "bg-purple-600 text-white"
                    }`}
                  >
                    {report.researcherName ? report.researcherName.replace("@", "").slice(0, 2).toUpperCase() : "DS"}
                  </div>
                )}
              </Link>
            ) : report.researcherAvatarUrl ? (
              <div className="size-14 rounded-2xl overflow-hidden border border-border shadow-2xs shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.researcherAvatarUrl}
                  alt={report.researcherName}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`size-14 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${
                  report.avatarColor || "bg-purple-600 text-white"
                }`}
              >
                {report.researcherName ? report.researcherName.replace("@", "").slice(0, 2).toUpperCase() : "DS"}
              </div>
            )}

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-muted-foreground px-2.5 py-0.5 rounded-md bg-muted border border-border">
                  {report.reportCode || `DS-${report.id}`}
                </span>
                <Badge variant="outline" className="rounded-md px-3 py-0.5 text-xs font-semibold border-border">
                  {report.category}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug break-words">
                {report.title}
              </h2>
            </div>
          </div>

          <div className="shrink-0 flex items-center md:items-start justify-start md:justify-end">
            {report.severity ? (
              <SeverityBadge severity={report.severity} />
            ) : (
              <DisputedSeverityPair
                reportedSeverity={report.reportedSeverity || hackerSev.tier}
                triageSeverity={report.triageSeverity || companySev.tier}
                cvssScore={report.cvssScore}
                size="sm"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border text-sm">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5 shrink-0" /> Researcher
            </span>
            {report.researcherUsername ? (
              <Link
                href={`/profile/${encodeURIComponent(report.researcherUsername)}`}
                className="font-bold text-foreground hover:text-primary hover:underline transition truncate block"
                title={`View @${report.researcherUsername}'s profile`}
              >
                <span>{report.researcherName}</span>{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  (@{report.researcherUsername})
                </span>
              </Link>
            ) : (
              <p className="font-bold text-foreground truncate">{report.researcherName}</p>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" /> Target Program
            </span>
            <p className="font-bold text-foreground truncate" title={report.companyName}>
              {report.companyName}{" "}
              {report.programName && report.programName !== report.companyName && `(${report.programName})`}
            </p>
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Coins className="size-3.5 text-emerald-500 shrink-0" /> Confirmed Reward
            </span>
            <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base truncate">{rewardAmount}</p>
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" /> Timeline
            </span>
            <p className="font-medium text-foreground text-xs truncate">
              Submitted {report.submittedAt ? (report.submittedAt.includes("T") || report.submittedAt.includes("-") ? formatDateTime(report.submittedAt) : report.submittedAt) : "Recently"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card
            className={cn(
              "rounded-2xl border p-6 space-y-5 shadow-2xs",
              severitiesAgree
                ? "border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-amber-200/90 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-extrabold uppercase tracking-wider",
                  severitiesAgree
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-amber-800 dark:text-amber-300",
                )}
              >
                Severity Verdict Matrix
              </span>

              <Badge
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-2xs",
                  severitiesAgree
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800"
                    : "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/60 dark:text-amber-100 dark:border-amber-800",
                )}
              >
                {severitiesAgree ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {severitiesAgree ? "Severities agree" : "Severity overridden"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card/70 border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Researcher claimed
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      (hackerSev.tier && SEVERITY_DOT[hackerSev.tier]) || "bg-slate-500",
                    )}
                  />
                  <span className="text-lg font-extrabold text-foreground">
                    {hackerSev.tier}
                  </span>
                </div>
                {(hackerSev.cvss || hackerSev.typicalReward || report.cvssVector) && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {hackerSev.cvss && <div>{hackerSev.cvss}</div>}
                    {report.cvssVector && (
                      <div className="font-mono text-[11px] text-muted-foreground break-all">
                        {report.cvssVector}
                      </div>
                    )}
                    {hackerSev.typicalReward && (
                      <div>{hackerSev.typicalReward}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-card/70 border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Company confirmed
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      SEVERITY_DOT[selectedSeverity],
                    )}
                  />
                  <span className="text-lg font-extrabold text-foreground">
                    {selectedSeverity}
                  </span>
                  {severityOverride !== null &&
                    severityOverride !== companySev.tier && (
                      <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Not saved
                      </span>
                    )}
                </div>
                {(companySev.cvss || companySev.typicalReward) && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {companySev.cvss && <div>{companySev.cvss}</div>}
                    {companySev.typicalReward && (
                      <div>{companySev.typicalReward}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Reward based on confirmed severity
              </span>
              {rewardAmount ? (
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                  {rewardAmount}
                </span>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  Not set
                </span>
              )}
            </div>
          </Card>

          {report.disputeReason && (
            <Card className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Researcher&apos;s Case for Dispute</span>
                </div>
                {report.disputeStatus && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase border-rose-500/30 text-rose-700 dark:text-rose-300">
                    Dispute: {report.disputeStatus}
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground bg-background/80 p-4 rounded-xl border border-rose-500/20 whitespace-pre-wrap">
                {report.disputeReason}
              </p>
            </Card>
          )}

          <Card className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span>{report.companyName}&apos;s Reasoning</span>
            </div>
            <p
              className={cn(
                "text-sm leading-relaxed font-normal",
                companyReasoning
                  ? "text-foreground"
                  : "italic text-muted-foreground",
              )}
            >
              {companyReasoning ||
                "No reasoning has been recorded for this decision."}
            </p>
          </Card>

          <div className="bg-card rounded-xl border border-border p-1.5 shadow-2xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer shrink-0 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && (
                      <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                      Vulnerability Description
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed bg-muted/40 p-4 rounded-xl border border-border break-words whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Flame className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                      Security &amp; Threat Impact
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed bg-muted/40 p-4 rounded-xl border border-border break-words whitespace-pre-wrap">
                      {report.impact}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Target Scope URL</span>
                      <div className="font-mono text-sm font-bold text-foreground break-all flex items-center justify-between">
                        <span>{report.targetAsset || "N/A"}</span>
                        {report.targetAsset && (
                          <a
                            href={report.targetAsset}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">CVSS Vector Rating</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-rose-600 text-white font-bold text-xs px-2 py-0.5">
                          {report.cvssScore || "N/A"}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {report.cvssVector || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "poc" && (
              <motion.div
                key="poc"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                      Steps to Reproduce
                    </h3>
                    {report.reproduceSteps && report.reproduceSteps.length > 0 ? (
                      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 font-mono text-sm text-foreground">
                        {report.reproduceSteps.map((step, idx) => (
                          <div key={idx} className="leading-relaxed flex items-start gap-2">
                            <span className="text-muted-foreground font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No reproduction steps listed.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground">
                        Proof of Concept Code Payload
                      </h3>
                      {report.pocPayload && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyPayload}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                        >
                          {copiedPayload ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1.5" />
                              Copy Code
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {report.pocPayload ? (
                      <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-sm overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
                        <code>{report.pocPayload}</code>
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">No payload code snippet provided.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Paperclip className="w-4.5 h-4.5 text-muted-foreground" />
                      Evidence & Attachments
                    </h3>

                    {report.attachments && report.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40 text-sm font-semibold text-foreground hover:bg-muted/60 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </div>
                            {att.size && (
                              <span className="text-xs font-normal text-muted-foreground shrink-0 ml-2">
                                {att.size}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No attachments provided.</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "discussion" && (
              <motion.div
                key="discussion"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2 text-base font-bold text-foreground">
                      <MessageSquare className="w-4.5 h-4.5 text-muted-foreground" />
                      <span>Discussion Thread</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {report.discussionThread?.length || 0} messages
                    </span>
                  </div>

                  <div className="space-y-4">
                    {report.discussionThread && report.discussionThread.length > 0 ? (
                      report.discussionThread.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-3.5 text-sm">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              msg.role === "HACKER"
                                ? "bg-purple-600 text-white"
                                : msg.role === "COMPANY"
                                ? "bg-slate-800 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {msg.author.replace("@", "").slice(0, 2).toUpperCase()}
                          </div>

                          <div className="space-y-1.5 flex-1 p-4 rounded-xl bg-muted/40 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {msg.author}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2 py-0 text-[10px] font-extrabold tracking-wider uppercase border-border"
                                >
                                  {msg.role}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium">
                                {msg.timestamp}
                              </span>
                            </div>

                            <p className="text-foreground leading-relaxed text-sm">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No messages in discussion thread.</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "audit" && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
                  <h3 className="text-base font-bold text-foreground">
                    Audit & Triage History
                  </h3>
                  {report.auditLog && report.auditLog.length > 0 ? (
                    <div className="space-y-5 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {report.auditLog.map((log) => (
                        <div key={log.id} className="relative space-y-1">
                          <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-foreground">{log.action}</span>
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">By: {log.actor}</p>
                          {log.note && (
                            <div className="text-sm p-3 rounded-xl bg-muted text-foreground mt-1.5 border border-border">
                              {log.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No audit activity logged yet.</p>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-6 sticky top-6">
          <Card className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 text-base font-bold text-foreground border-b border-border pb-3">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Triage Audit Decision</span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Confirmed Severity Tier
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(["Critical", "High", "Medium", "Low"] as const).map((sev) => (
                  <Button
                    key={sev}
                    type="button"
                    variant={selectedSeverity === sev ? "default" : "outline"}
                    onClick={() => setSeverityOverride(sev)}
                    className={`rounded-xl h-10 text-xs font-bold cursor-pointer transition ${
                      selectedSeverity === sev
                        ? sev === "Critical"
                          ? "bg-rose-600 text-white shadow-2xs"
                          : sev === "High"
                          ? "bg-orange-500 text-white shadow-2xs"
                          : sev === "Medium"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-slate-700 text-white shadow-2xs"
                        : "border-border text-foreground hover:bg-slate-50"
                    }`}
                  >
                    {sev}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Confirmed Bounty Amount
              </Label>
              <Input
                value={rewardAmount}
                onChange={(e) => setRewardOverride(e.target.value)}
                placeholder="e.g. $1,800"
                className="h-10 bg-card border-border rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Triager Rationale Note
              </Label>
              <textarea
                value={adminNote}
                onChange={(e) => setNoteOverride(e.target.value)}
                placeholder="Internal note or message to include with your decision..."
                rows={4}
                className="w-full p-3.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border">
              <Button
                disabled={isSubmitting}
                onClick={() => handleAction("CONFIRMED")}
                className="w-full rounded-xl h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm & Route to Program
              </Button>
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleAction("ESCALATED")}
                className="w-full rounded-xl h-10 font-semibold border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-sm cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-purple-600" />
                Escalate to Security Lead
              </Button>
              <Button
                variant="destructive"
                disabled={isSubmitting}
                onClick={() => handleAction("REJECTED")}
                className="w-full rounded-xl h-10 font-semibold text-sm cursor-pointer"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject / Mark Invalid
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </motion.div>
  );
}
