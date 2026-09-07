"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  CloudUpload,
  Coins,
  AlertCircle,
  Copy,
  Lock,
  DollarSign,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
  ShieldCheck,
  Scale,
  ShieldX,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api/error-message";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format/datetime";
import {
  disputeStatusLabel,
  isAwaitingReporter,
  isDisputeBlocking,
  isDisputeSettled,
} from "@/lib/reports/dispute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import {
  useApproveReportMutation,
  useRejectReportMutation,
  useRequestMoreInfoMutation,
  useMarkDuplicateMutation,
} from "@/lib/redux/services/reportsApi";
import { DuplicateReportPickerModal } from "./DuplicateReportPickerModal";
import { cn } from "@/lib/utils";

const SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low", "Info"] as const;

type SeverityOption = (typeof SEVERITY_OPTIONS)[number];

const SEVERITY_DEFAULTS: Record<
  SeverityOption,
  { bounty: string; label: string }
> = {
  Critical: { bounty: "3500", label: "Critical Severity ($2,500 - $5,000)" },
  High: { bounty: "1800", label: "High Severity ($1,000 - $2,500)" },
  Medium: { bounty: "750", label: "Medium Severity ($250 - $1,000)" },
  Low: { bounty: "250", label: "Low Severity ($50 - $250)" },
  Info: { bounty: "0", label: "Informational (Recognition Only)" },
};

const SEVERITY_RANK: Record<SeverityOption, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  Info: 0,
};

function normalizeSeverity(sev?: string): SeverityOption {
  if (!sev) return "Medium";
  const lower = sev.toLowerCase();
  if (lower === "critical") return "Critical";
  if (lower === "high") return "High";
  if (lower === "medium") return "Medium";
  if (lower === "low") return "Low";
  if (lower === "info" || lower === "none") return "Info";
  return "Medium";
}

type ReportSeverityAdjustmentFormProps = {
  detail: ReportManagementDetail;
  onOutcomeChange?: (outcome: "approved" | "rejected") => void;
};

function getSeverityClass(option: SeverityOption, selected: boolean) {
  if (!selected) {
    return "border-border bg-card text-foreground hover:bg-muted";
  }

  if (option === "Critical") {
    return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-bold ring-1 ring-red-500/30";
  }
  if (option === "High") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30";
  }
  if (option === "Medium") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold ring-1 ring-sky-500/30";
  }
  if (option === "Low") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500/30";
  }

  return "border-border bg-muted text-foreground font-bold ring-1 ring-border";
}

export function ReportSeverityAdjustmentForm({
  detail,
  onOutcomeChange,
}: ReportSeverityAdjustmentFormProps) {
  const router = useRouter();
  const fileInputId = useId();

  const initialSev = normalizeSeverity(detail?.severity || detail?.triageSeverity || detail?.reportedSeverity || undefined);

  const [selectedSeverity, setSelectedSeverity] = useState<SeverityOption>(initialSev);
  const [bountyAmount, setBountyAmount] = useState<string>(
    SEVERITY_DEFAULTS[initialSev]?.bounty || "750"
  );
  const [explanation, setExplanation] = useState("");
  const [findingsSummary, setFindingsSummary] = useState(
    detail?.assessmentSummary || ""
  );
  const [decisionReason, setDecisionReason] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const researcherClaimedSeverity = normalizeSeverity(
    detail?.reportedSeverity || detail?.severity || undefined
  );
  const isDowngrade =
    SEVERITY_RANK[selectedSeverity] < SEVERITY_RANK[researcherClaimedSeverity];

  useEffect(() => {
    if (detail?.severity) {
      const sev = normalizeSeverity(detail.severity);
      setSelectedSeverity(sev);
      if (SEVERITY_DEFAULTS[sev]) {
        setBountyAmount(SEVERITY_DEFAULTS[sev].bounty);
      }
    }
    if (detail?.assessmentSummary) {
      setFindingsSummary(detail.assessmentSummary);
    }
  }, [detail?.severity, detail?.assessmentSummary]);

  const dispute = detail.dispute ?? null;
  const isBlockedByDispute = isDisputeBlocking(dispute);
  const isAwaitingReporterAnswer = isAwaitingReporter(dispute);
  const isSeverityFinal = isDisputeSettled(dispute);

  const reportState = (
    detail.rawStatus ||
    detail.status ||
    ""
  ).toUpperCase();
  const isAlreadyConfirmed =
    reportState === "VALID_CONFIRMED" || reportState === "ACCEPTED";

  const searchParams = useSearchParams();
  const actionParam = searchParams?.get("action");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDowngradeInfoModal, setShowDowngradeInfoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [moreInfoQuestion, setMoreInfoQuestion] = useState("");
  const [reclassifiedWeaknessId, setReclassifiedWeaknessId] = useState("");
  const [approvalSuccess, setApprovalSuccess] = useState<boolean | null>(null);
  const [rejectionSuccess, setRejectionSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (actionParam === "reject" && !isBlockedByDispute) {
      setShowRejectModal(true);
    }
  }, [actionParam, isBlockedByDispute]);

  const [approveReport, { isLoading: isApproving }] = useApproveReportMutation();
  const [rejectReport, { isLoading: isRejecting }] = useRejectReportMutation();
  const [requestMoreInfo, { isLoading: isAskingForInfo }] =
    useRequestMoreInfoMutation();
  const [markDuplicate, { isLoading: isMarkingDuplicate }] =
    useMarkDuplicateMutation();

  const handleRequestMoreInfo = async () => {
    if (isBlockedByDispute || !moreInfoQuestion.trim()) return;
    try {
      await requestMoreInfo({
        id: String(detail.id),
        severity: selectedSeverity,
        question: moreInfoQuestion,
      }).unwrap();
      setShowMoreInfoModal(false);
      setMoreInfoQuestion("");
      toast.success("Asked the reporter for more information");
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "The request could not be sent. Try again."),
      );
    }
  };

  const handleMarkDuplicate = async (targetReportId: string, note?: string) => {
    if (isBlockedByDispute || !targetReportId) return;
    try {
      await markDuplicate({
        id: String(detail.id),
        duplicateOfId: targetReportId.trim(),
        note: note || undefined,
      }).unwrap();
      setShowDuplicateModal(false);
      onOutcomeChange?.("rejected");
      toast.success("Closed as a duplicate");
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "The report could not be closed as a duplicate."),
      );
    }
  };

  const actionsDisabled = isApproving || isRejecting || isBlockedByDispute;

  const handleSeverityChange = (option: SeverityOption) => {
    setSelectedSeverity(option);
    setBountyAmount(SEVERITY_DEFAULTS[option]?.bounty || "750");
    if (SEVERITY_RANK[option] < SEVERITY_RANK[researcherClaimedSeverity]) {
      setShowDowngradeInfoModal(true);
    }
  };

  const handleConfirmApproval = async () => {
    if (isBlockedByDispute) return;

    const numericBounty = parseFloat(bountyAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(numericBounty) || numericBounty <= 0) {
      toast.error("A reward amount is required and must be greater than zero.");
      return;
    }

    try {
      await approveReport({
        id: String(detail.id),
        severity: selectedSeverity,
        explanation: explanation || decisionReason || findingsSummary,
        findingsSummary,
        decisionReason,
        improvementSuggestions,
        bountyAmount: `$${numericBounty}`,
        files: selectedFiles,
        weaknessId: reclassifiedWeaknessId || undefined,
        isDowngrade,
        deferReward: isDowngrade,
      }).unwrap();

      setShowApprovalModal(false);
      setApprovalSuccess(true);
      onOutcomeChange?.("approved");
      if (isDowngrade) {
        toast.info(
          "Triage submitted. A final severity is required before recording a reward — bounty will be queued until settled."
        );
      }
    } catch (err) {
      console.error("Failed to approve report:", err);
      setShowApprovalModal(false);
      const errMsg = apiErrorMessage(err, "The report could not be approved. Try again.");
      if (errMsg.toLowerCase().includes("final severity is required")) {
        setShowDowngradeInfoModal(true);
      } else {
        toast.error(errMsg);
      }
    }
  };

  const handleConfirmRejection = async () => {
    if (isBlockedByDispute) return;

    try {
      await rejectReport({
        id: String(detail.id),
        reason: decisionReason || "Submission closed after triage review.",
        explanation,
        decisionReason,
        files: selectedFiles,
      }).unwrap();

      setShowRejectModal(false);
      setRejectionSuccess(true);
      onOutcomeChange?.("rejected");
    } catch (err) {
      console.error("Failed to reject report:", err);
      setShowRejectModal(false);
      toast.error(
        apiErrorMessage(err, "The report could not be rejected. Try again."),
      );
    }
  };

  const [copiedSummary, setCopiedSummary] = useState(false);

  const cleanReportId = detail?.reportId
    ? String(detail.reportId).startsWith("#")
      ? detail.reportId
      : `#${detail.reportId}`
    : "#REPORT";

  const submitterName = detail?.submitter || "Researcher";
  const username = submitterName.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const profileIdentifier = detail?.submitterId || username;

  const handleCopyResolution = async () => {
    try {
      const summaryText = `[DevSolve Triage Resolution]\nReport: ${cleanReportId} - ${detail?.title || "Vulnerability Finding"}\nStatus: APPROVED\nSeverity: ${selectedSeverity}\nBounty Award: $${bountyAmount} USD\nResearcher: ${submitterName}\nDecision: ${decisionReason || "Severity verified and validated according to program bounty rubric."}`;
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // ignore
    }
  };

  if (approvalSuccess) {
    if (isDowngrade) {
      return (
        <Card className="rounded-3xl border border-amber-500/30 bg-card p-4 sm:p-8 md:p-10 text-card-foreground shadow-2xl overflow-hidden relative min-w-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7 min-w-0"
          >
            <div className="flex size-16 sm:size-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/10 shadow-lg shrink-0">
              <Scale className="size-8 sm:size-10" />
            </div>

            <div className="space-y-2.5 sm:space-y-3 max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  TRIAGED · AWAITING REPORTER
                </Badge>
                <Badge variant="outline" className="font-mono text-xs font-bold border-border bg-muted/50 px-2.5 py-0.5">
                  {cleanReportId}
                </Badge>
                <Badge variant="outline" className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded-full">
                  Reward Queued
                </Badge>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight break-words">
                Triage Decision Recorded & Awaiting Settlement
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                The report triage was recorded with proposed severity{" "}
                <strong className="text-foreground font-bold">{selectedSeverity}</strong>. Because this was adjusted lower than the researcher&apos;s claimed severity (<strong className="text-foreground">{researcherClaimedSeverity}</strong>), the report is subject to a 14-day researcher review. Per platform policy, <strong className="text-foreground">a final severity is required before recording a reward</strong>. The intended bounty of{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-bold">${bountyAmount} USD</strong> will be dispatched once the final severity is confirmed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full text-left min-w-0">
              <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Proposed Severity
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground truncate">{selectedSeverity}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 truncate">Pending Confirmation</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 truncate">
                  <Coins className="size-3.5 shrink-0" />
                  <span>Bounty Award</span>
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 truncate">${bountyAmount} USD</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80 font-semibold mt-0.5 truncate">Queued (Pending Final Severity)</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1 truncate">
                  <Scale className="size-3.5 shrink-0" />
                  <span>Dispute Status</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 truncate tracking-tight">
                    AWAITING_REPORTER
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">14-Day Review Window</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 truncate">
                  <User className="size-3.5 shrink-0" />
                  <span>Researcher</span>
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                    className="text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate block"
                  >
                    {detail.submitter}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono truncate">@{username}</p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-border bg-muted/30 p-4 sm:p-5 text-left space-y-3.5 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Automated Triage Actions Logged
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Check className="size-4 text-amber-500 shrink-0" />
                  <span>Triage severity set to {selectedSeverity} (was {researcherClaimedSeverity})</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Check className="size-4 text-amber-500 shrink-0" />
                  <span>Bounty payout queued: ${bountyAmount} USD (Settlement pending)</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Check className="size-4 text-amber-500 shrink-0" />
                  <span>Dispute confirmation notice sent to {detail.submitter}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Check className="size-4 text-amber-500 shrink-0" />
                  <span>Report entered Awaiting Reporter review (14-day window)</span>
                </div>
              </div>

              {decisionReason && (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  <strong className="text-foreground">Triage Rationale:</strong> {decisionReason}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
              <Link href={`/dashboard/report-management/${detail.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm h-10 px-5 cursor-pointer gap-2 shadow-xs justify-center">
                  <span>View Updated Report Details</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/dashboard/report-management" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl border-border bg-card font-semibold text-xs sm:text-sm h-10 px-4 cursor-pointer gap-2 justify-center">
                  <ArrowLeft className="size-4" />
                  <span>Back to Queue</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </Card>
      );
    }

    return (
      <Card className="rounded-3xl border border-emerald-500/30 bg-card p-4 sm:p-8 md:p-10 text-card-foreground shadow-2xl overflow-hidden relative min-w-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7 min-w-0"
        >
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10 shadow-lg shrink-0">
            <CheckCircle2 className="size-8 sm:size-10" />
          </div>

          <div className="space-y-2.5 sm:space-y-3 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                APPROVED & CONFIRMED
              </Badge>
              <Badge variant="outline" className="font-mono text-xs font-bold border-border bg-muted/50 px-2.5 py-0.5">
                {cleanReportId}
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
                Reward Dispatched
              </Badge>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight break-words">
              Vulnerability Report Approved & Reward Dispatched
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
              The submission was formally accepted. Severity was adjusted to{" "}
              <strong className="text-foreground font-bold">{selectedSeverity}</strong>, and an authorized bounty of{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${bountyAmount} USD</strong> has been allocated to{" "}
              <Link
                href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>{submitterName}</span>
                <ExternalLink className="size-3" />
              </Link>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full text-left min-w-0">
            <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Final Severity
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground truncate">{selectedSeverity}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                  {detail?.cvssScore && detail.cvssScore !== "N/A"
                    ? `${detail.cvssScore} CVSS`
                    : "Confirmed"}
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1 truncate">
                <Coins className="size-3.5 shrink-0" />
                <span>Bounty Award</span>
              </span>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">${bountyAmount} USD</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-0.5 truncate">Queued for Payout</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1 truncate">
                <ShieldCheck className="size-3.5 shrink-0" />
                <span>Status Outcome</span>
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 truncate tracking-tight">
                  VALID_CONFIRMED
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">Ready for Resolution</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2 min-w-0 overflow-hidden">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 truncate">
                <User className="size-3.5 shrink-0" />
                <span>Researcher</span>
              </span>
              <div className="min-w-0">
                <Link
                  href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                  className="text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate block"
                >
                  {detail.submitter}
                </Link>
                <p className="text-xs text-muted-foreground font-mono truncate">@{username}</p>
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border bg-muted/30 p-4 sm:p-5 text-left space-y-3.5 min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Automated Triage Actions Logged
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>
                  Severity updated to {selectedSeverity}
                  {detail?.cvssScore && detail.cvssScore !== "N/A"
                    ? ` (${detail.cvssScore})`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Bounty payout authorized: ${bountyAmount} USD</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Notification dispatched to {detail.submitter}</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Report status moved to APPROVED</span>
              </div>
            </div>

            {decisionReason && (
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                <strong className="text-foreground">Triage Rationale:</strong> {decisionReason}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
            <Link href={`/dashboard/report-management/${detail.id}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm h-10 px-5 cursor-pointer gap-2 shadow-xs justify-center">
                <span>View Updated Report Details</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/dashboard/report-management" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-border bg-card font-semibold text-xs sm:text-sm h-10 px-4 cursor-pointer gap-2 justify-center"
              >
                <ArrowLeft className="size-4" />
                <span>Return to Report Queue</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              onClick={handleCopyResolution}
              className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-10 px-3.5 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground justify-center"
            >
              {copiedSummary ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied Summary</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Resolution Summary</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  if (rejectionSuccess) {
    return (
      <Card className="rounded-3xl border border-red-500/30 bg-card p-4 sm:p-8 md:p-10 text-card-foreground shadow-2xl overflow-hidden relative min-w-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-500/15 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7 min-w-0"
        >
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-3xl bg-red-500/15 text-red-600 dark:text-red-400 ring-8 ring-red-500/10 shadow-lg shrink-0">
            <ShieldX className="size-8 sm:size-10" />
          </div>

          <div className="space-y-2.5 sm:space-y-3 max-w-2xl min-w-0">
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                REJECTED & CLOSED
              </Badge>
              <Badge variant="outline" className="font-mono text-xs font-bold border-border bg-muted/50 px-2.5 py-0.5">
                {cleanReportId}
              </Badge>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight break-words">
              Report Submission Rejected
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
              Report {cleanReportId} has been marked as rejected. Triage reasoning has been documented and feedback was shared back to researcher <strong>{submitterName}</strong>.
            </p>
          </div>

          {decisionReason && (
            <div className="w-full max-w-lg rounded-2xl border border-border bg-muted/40 p-4 text-left text-xs space-y-1 min-w-0">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">Rejection Reason</span>
              <p className="text-muted-foreground leading-relaxed">{decisionReason}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
            <Link href="/dashboard/report-management" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm h-10 px-6 cursor-pointer gap-2 shadow-xs justify-center">
                <ArrowLeft className="size-4" />
                <span>Return to Report Queue</span>
              </Button>
            </Link>
            <Link href={`/dashboard/report-management/${detail?.id || ""}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-xl border-border bg-card font-semibold text-xs sm:text-sm h-10 px-4 cursor-pointer gap-2 justify-center">
                <span>View Closed Report</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <>
      {isBlockedByDispute && dispute && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <Scale className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  {isAwaitingReporterAnswer
                    ? "Triage is on hold — waiting for the researcher"
                    : "Triage is on hold — the severity is disputed"}
                </h3>
                <span className="rounded-md border border-amber-500/30 bg-background/60 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  {disputeStatusLabel(dispute)}
                </span>
              </div>

              {isAwaitingReporterAnswer ? (
                <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  The researcher is confirming the severity you set. If they
                  accept it{dispute.respondBy ? ", or do not answer by " : ", or do not answer, "}
                  {dispute.respondBy && (
                    <strong>{formatDate(dispute.respondBy, "the deadline")}</strong>
                  )}
                  {dispute.respondBy ? ", " : ""}
                  your rating stands and triage continues. If they refuse, an
                  administrator rules on it. There is nothing to do here, and
                  the actions below stay disabled until it settles.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  An administrator has to rule on this dispute before the report
                  can be approved or rejected. Nothing you change here will
                  release it, and the actions below stay disabled until it is
                  settled.
                </p>
              )}

              {dispute.reason && !isAwaitingReporterAnswer && (
                <p className="rounded-xl border border-amber-500/20 bg-background/60 p-3 text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">
                    The researcher&apos;s case:{" "}
                  </span>
                  {dispute.reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isSeverityFinal && dispute && (
        <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                The severity is settled
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dispute.resolvedSeverity ? (
                  <>
                    It was settled at{" "}
                    <strong className="text-foreground">
                      {dispute.resolvedSeverity}
                    </strong>
                    .{" "}
                  </>
                ) : null}
                Once a rating is agreed it is final: the researcher cannot
                change their mind and it cannot be re-triaged around. The
                report can still be resolved from here.
              </p>
              {dispute.resolutionNotes && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dispute.resolutionNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs min-w-0 overflow-hidden">
        <CardHeader className="gap-2 p-4 sm:p-6 pb-2 sm:pb-2 min-w-0">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
            Severity Adjustment & Triage Decision
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Confirm the final company severity rating, award bounty rewards, and provide feedback to the researcher.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 pt-0 sm:pt-0 min-w-0">
          <FieldGroup className="min-w-0">
            <Field className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 min-w-0">
              <FieldLabel className="text-foreground font-semibold text-sm sm:text-base">
                1. Select Verified Severity
              </FieldLabel>
              <FieldContent className="min-w-0">
                <ToggleGroup
                  value={[selectedSeverity]}
                  onValueChange={(value) => {
                    const next = value[value.length - 1];
                    if (next) {
                      handleSeverityChange(next as SeverityOption);
                    }
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2 w-full"
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      variant="outline"
                      className={cn(
                        "rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm cursor-pointer transition-all w-full flex items-center justify-center text-center",
                        getSeverityClass(option, selectedSeverity === option)
                      )}
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Claimed researcher severity:{" "}
                  <span className="font-semibold text-foreground">
                    {researcherClaimedSeverity}
                    {detail?.cvssScore && detail.cvssScore !== "N/A"
                      ? ` (${detail.cvssScore})`
                      : ""}
                  </span>
                  . Company decision rating:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedSeverity}
                  </span>
                </FieldDescription>
                {isDowngrade && (
                  <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 min-w-0">
                      <Scale className="size-4 sm:size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 leading-relaxed">
                        <strong className="font-bold">Severity Downgrade ({researcherClaimedSeverity} → {selectedSeverity}):</strong>{" "}
                        <span>A final severity is required before recording a reward. Triage initiates a 14-day confirmation window.</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDowngradeInfoModal(true)}
                      className="text-xs font-semibold h-7 sm:h-8 px-3 rounded-lg border-amber-500/30 bg-background/80 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 shrink-0 cursor-pointer gap-1.5 self-start sm:self-center"
                    >
                      <AlertCircle className="size-3.5" />
                      <span>Policy Info</span>
                    </Button>
                  </div>
                )}
              </FieldContent>
            </Field>

            <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5 min-w-0">
              <Field className="min-w-0">
                <FieldLabel htmlFor="bounty-reward" className="text-foreground font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Bounty Reward Amount (USD)</span> <span className="text-rose-500 font-bold">*</span>
                </FieldLabel>
                <FieldContent className="mt-1.5 min-w-0">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <Input
                      id="bounty-reward"
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={bountyAmount}
                      onChange={(e) => setBountyAmount(e.target.value)}
                      placeholder="e.g. 750.00"
                      className="pl-7 bg-card text-foreground font-semibold text-base w-full"
                    />
                  </div>
                  <FieldDescription className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Bounties are money, paid by your organization, and this
                    field is the whole of it. Reputation is separate: DevSolve
                    awards it automatically from the finding&apos;s severity
                    when the report is resolved.
                  </FieldDescription>
                  {isDowngrade && (
                    <div className="mt-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Coins className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Reward queued:</strong> A final severity is required before recording a reward. This ${bountyAmount} USD bounty will be recorded once the severity is finalized.
                      </span>
                    </div>
                  )}
                </FieldContent>
              </Field>
            </div>

            <Field className="min-w-0">
              <FieldLabel htmlFor="adjustment-explanation" className="text-foreground font-semibold text-sm sm:text-base">
                Internal team explanation for adjustment
              </FieldLabel>
              <FieldContent className="min-w-0">
                <Textarea
                  id="adjustment-explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Document why the severity was adjusted from the initial researcher claim. This note is retained for internal audit and security team records."
                  className="min-h-28 border border-border bg-card text-foreground text-sm sm:text-base focus-visible:ring-1 focus-visible:ring-ring w-full"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="rounded-2xl sm:rounded-3xl border border-border bg-muted/40 p-4 sm:p-5 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                Feedback to Researcher
              </Badge>
              <span className="text-xs text-muted-foreground">
                Visible to {submitterName}
              </span>
            </div>

            <FieldGroup className="min-w-0">
              <Field className="min-w-0">
                <FieldLabel htmlFor="findings-summary" className="text-foreground font-semibold text-sm sm:text-base">
                  Summary of validation findings (Markdown supported)
                </FieldLabel>
                <FieldContent className="mt-2 min-w-0 max-w-full">
                  <MarkdownEditor
                    id="findings-summary"
                    value={findingsSummary}
                    onChange={(value) => setFindingsSummary(value || "")}
                    placeholder="Document validation findings, reproduction confirmation, and technical evidence..."
                    height={280}
                  />
                </FieldContent>
              </Field>

              <Field className="min-w-0">
                <FieldLabel htmlFor="decision-reason" className="text-foreground font-semibold text-sm sm:text-base">
                  Reason for severity determination
                </FieldLabel>
                <FieldContent className="min-w-0">
                  <Textarea
                    id="decision-reason"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Explain the impact assessment, prerequisites, and severity rating clearly."
                    className="min-h-20 border border-border bg-card text-foreground text-sm sm:text-base focus-visible:ring-1 focus-visible:ring-ring w-full"
                  />
                </FieldContent>
              </Field>

              <Field className="min-w-0">
                <FieldLabel htmlFor="improvement-suggestions" className="text-foreground font-semibold text-sm sm:text-base">
                  Suggestions for future reports (Optional)
                </FieldLabel>
                <FieldContent className="min-w-0">
                  <Textarea
                    id="improvement-suggestions"
                    value={improvementSuggestions}
                    onChange={(e) => setImprovementSuggestions(e.target.value)}
                    placeholder="Help the researcher submit higher-fidelity reports in future scopes."
                    className="min-h-20 border border-border bg-card text-foreground text-sm sm:text-base focus-visible:ring-1 focus-visible:ring-ring w-full"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>

          <div className="rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 p-4 sm:p-5 min-w-0">
            <div className="flex flex-col items-center justify-center gap-3 text-center min-w-0">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-blue-600 dark:text-blue-400 ring-1 ring-border shrink-0">
                <CloudUpload className="size-6" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  Upload internal notes, logs, or verification screenshots
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload logs, validation transcripts, or remediation notes supporting the decision.
                </p>
              </div>
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                <span>Choose files</span>
              </label>
              <input
                id={fileInputId}
                type="file"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setSelectedFiles(
                    Array.from(event.target.files ?? []).map((file) => file.name)
                  )
                }
              />
              <p className="text-xs text-muted-foreground">PNG, JPG, PDF, or MP4 up to 25MB</p>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2 max-w-full">
                {selectedFiles.map((fileName) => (
                  <Badge
                    key={fileName}
                    variant="outline"
                    className="border-border bg-muted text-muted-foreground max-w-full truncate text-xs"
                  >
                    {fileName}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 space-y-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-border/60 min-w-0">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm sm:text-base font-bold text-foreground truncate">
                  Triage Decision for Report {cleanReportId}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span>
                    Target: <span className="font-semibold text-foreground">{selectedSeverity}</span>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>
                    Bounty: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${bountyAmount} USD</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                disabled={actionsDisabled}
                title={
                  isBlockedByDispute
                    ? "An administrator must resolve the severity dispute first"
                    : undefined
                }
                className="w-full rounded-xl border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer font-semibold text-xs sm:text-sm h-10 px-3 justify-center gap-2"
              >
                <ShieldX className="size-4 shrink-0" />
                <span className="truncate">Reject Submission</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMoreInfoModal(true)}
                disabled={actionsDisabled}
                title={
                  isBlockedByDispute
                    ? "An administrator must resolve the severity dispute first"
                    : undefined
                }
                className="w-full rounded-xl border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer font-semibold text-xs sm:text-sm h-10 px-3 justify-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span className="truncate">Needs more info</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDuplicateModal(true)}
                disabled={actionsDisabled}
                title={
                  isBlockedByDispute
                    ? "An administrator must resolve the severity dispute first"
                    : undefined
                }
                className="w-full rounded-xl border-border bg-card hover:bg-muted cursor-pointer font-semibold text-xs sm:text-sm h-10 px-3 justify-center gap-2"
              >
                <Copy className="size-4 shrink-0" />
                <span className="truncate">Duplicate</span>
              </Button>

              <Button
                type="button"
                onClick={() => setShowApprovalModal(true)}
                disabled={actionsDisabled || isSeverityFinal}
                title={
                  isSeverityFinal
                    ? "The severity is settled and can no longer be changed"
                    : isBlockedByDispute
                      ? "An administrator must resolve the severity dispute first"
                      : undefined
                }
                className={cn(
                  "w-full rounded-xl text-white font-bold cursor-pointer px-3 sm:px-4 shadow-xs gap-2 text-xs sm:text-sm h-10 justify-center",
                  isDowngrade
                    ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600"
                    : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600"
                )}
              >
                {isDowngrade ? (
                  <Scale className="size-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="size-4 shrink-0" />
                )}
                <span className="truncate">
                  {isAlreadyConfirmed
                    ? "Update severity"
                    : isDowngrade
                      ? "Submit Triage (Queue Reward)"
                      : "Approve Report & Issue Bounty"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showApprovalModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  "flex items-center justify-between border-b border-border px-4 sm:px-5 py-3.5 sm:py-4 shrink-0",
                  isDowngrade ? "bg-amber-500/10" : "bg-emerald-500/10"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl shrink-0",
                      isDowngrade
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {isDowngrade ? (
                      <Scale className="size-5" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {isDowngrade ? "Confirm Triage Decision" : "Confirm Report Approval"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      Report {cleanReportId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApprovalModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed overflow-y-auto min-w-0">
                <p className="text-muted-foreground">
                  {isDowngrade
                    ? `You are about to triage this report at ${selectedSeverity} and submit your review feedback to ${submitterName}.`
                    : `You are about to officially approve this vulnerability report and authorize the reward payment to ${submitterName}.`}
                </p>

                {isDowngrade && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <Scale className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>A final severity is required before recording a reward</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                      Lowering severity from <strong>{researcherClaimedSeverity}</strong> to <strong>{selectedSeverity}</strong> initiates a 14-day researcher dispute review. Your triage assessment will be saved, and the bounty award of <strong>${bountyAmount} USD</strong> will be queued and recorded after the final severity is settled.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-muted/40 p-3.5 sm:p-4 space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">
                      {isDowngrade ? "Proposed Severity:" : "Final Severity:"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn("text-white font-bold text-xs", isDowngrade ? "bg-amber-600" : "bg-blue-600")}>
                        {selectedSeverity}
                      </Badge>
                      {isDowngrade && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                          (Pending 14-Day Review)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Bounty Award:</span>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${bountyAmount} USD
                      </span>
                      {isDowngrade && (
                        <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                          Queued (Held until settled)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Researcher:</span>
                    <Link
                      href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline inline-flex items-center gap-1 group truncate max-w-[200px]"
                      title={`View ${submitterName}'s public profile`}
                    >
                      <span className="truncate">{submitterName}</span>
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground pt-1 border-t border-border/70 leading-relaxed">
                    Bounties are paid directly by your organization. Reputation
                    is separate and automatic: DevSolve awards it on the
                    finding&apos;s severity the moment the report is resolved.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-border bg-card px-4 sm:px-5 py-3.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isApproving}
                  className="w-full sm:w-auto rounded-xl text-xs h-9 px-4 cursor-pointer justify-center"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmApproval}
                  disabled={isApproving}
                  className={cn(
                    "w-full sm:w-auto rounded-xl text-white font-bold text-xs h-9 px-5 gap-2 cursor-pointer shadow-xs justify-center",
                    isDowngrade
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>{isDowngrade ? "Submitting Triage..." : "Approving..."}</span>
                    </>
                  ) : (
                    <>
                      {isDowngrade ? (
                        <Scale className="size-3.5" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      <span>
                        {isDowngrade ? "Confirm Triage (Hold Reward)" : "Confirm & Issue Bounty"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMoreInfoModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowMoreInfoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 border-b border-border bg-amber-500/10 px-5 py-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">
                    Ask for more information
                  </h3>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    Report {cleanReportId}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The report moves to <strong>Needs more info</strong> and your
                  question is posted to its thread, so the reporter sees both
                  the status and what you asked.
                </p>
                <Textarea
                  autoFocus
                  rows={4}
                  value={moreInfoQuestion}
                  onChange={(event) => setMoreInfoQuestion(event.target.value)}
                  placeholder="What do you need from the reporter? A clearer reproduction, a payload, the account used…"
                  className="resize-none border-border bg-background text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowMoreInfoModal(false)}
                  disabled={isAskingForInfo}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestMoreInfo}
                  disabled={isAskingForInfo || !moreInfoQuestion.trim()}
                  className="rounded-xl bg-amber-600 font-semibold text-white hover:bg-amber-700"
                >
                  {isAskingForInfo ? "Sending…" : "Ask and update status"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        <DuplicateReportPickerModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          currentReport={detail}
          onConfirmDuplicate={handleMarkDuplicate}
          isSubmitting={isMarkingDuplicate}
        />

        {showRejectModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-red-500/10 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 shrink-0">
                    <ShieldX className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      Confirm Report Rejection
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      Report {cleanReportId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRejectModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed overflow-y-auto min-w-0">
                <div className="flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>Are you sure you want to reject this submission? This will close the report and notify <strong>{submitterName}</strong>.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for rejection
                  </label>
                  <Textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Provide clear rationale (e.g. Out of Scope, Intended Behavior, Duplicate, Missing PoC)."
                    className="min-h-24 bg-card text-foreground text-xs sm:text-sm w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-border bg-card px-4 sm:px-5 py-3.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                  className="w-full sm:w-auto rounded-xl text-xs h-9 px-4 cursor-pointer justify-center"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmRejection}
                  disabled={isRejecting}
                  className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-5 gap-2 cursor-pointer shadow-xs justify-center"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldX className="size-3.5" />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDowngradeInfoModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowDowngradeInfoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-amber-500/10 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Scale className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      Final Severity Required Before Rewarding
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      Severity Downgrade & Dispute Policy Notice
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDowngradeInfoModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed overflow-y-auto min-w-0">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Severity Assessment Comparison</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Researcher Claimed</span>
                      <Badge variant="outline" className="border-border bg-card font-bold text-xs w-fit">
                        {researcherClaimedSeverity}
                      </Badge>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-3" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold">Company Proposed</span>
                      <Badge className="bg-amber-500 text-white font-bold text-xs w-fit shadow-xs">
                        {selectedSeverity} (Downgraded)
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-muted-foreground">
                  <p>
                    You have assessed this finding as <strong className="text-foreground">{selectedSeverity}</strong>, which is lower than the researcher&apos;s submitted severity of <strong className="text-foreground">{researcherClaimedSeverity}</strong>.
                  </p>
                  <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Coins className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Why is immediate reward recording held?</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>A final severity is required before recording a reward.</strong> When an organization downgrades severity, the report enters an <strong>Awaiting Reporter</strong> dispute status giving the researcher 14 days to accept the adjustment or provide counter-evidence. Because the final rating is not yet settled, the platform cannot record the bounty payout immediately.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>What happens when you proceed?</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your technical triage assessment, notes, and intended bounty award of <strong className="text-emerald-600 dark:text-emerald-400">${bountyAmount} USD</strong> will be submitted. The bounty reward will be held in queue and automatically recorded once the researcher confirms or the 14-day review window elapses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-border bg-card px-4 sm:px-5 py-3.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSeverity(researcherClaimedSeverity);
                    setBountyAmount(SEVERITY_DEFAULTS[researcherClaimedSeverity]?.bounty || "750");
                    setShowDowngradeInfoModal(false);
                  }}
                  className="w-full sm:w-auto rounded-xl text-xs h-9 px-4 cursor-pointer justify-center"
                >
                  Keep {researcherClaimedSeverity} Severity
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowDowngradeInfoModal(false)}
                  className="w-full sm:w-auto rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 gap-2 cursor-pointer shadow-xs justify-center"
                >
                  <span>Understood, Continue with {selectedSeverity}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

