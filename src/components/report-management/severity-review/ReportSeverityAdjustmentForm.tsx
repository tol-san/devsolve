"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
  ShieldCheck,
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
} from "@/lib/redux/services/reportsApi";
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

  // Form State
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityOption>(
    (detail.severity as SeverityOption) || "Medium"
  );
  const [bountyAmount, setBountyAmount] = useState<string>(
    SEVERITY_DEFAULTS[(detail.severity as SeverityOption) || "Medium"].bounty
  );
  const [explanation, setExplanation] = useState("");
  const [findingsSummary, setFindingsSummary] = useState(
    detail.assessmentSummary || ""
  );
  const [decisionReason, setDecisionReason] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Sync state when detail data arrives from API
  useEffect(() => {
    if (detail?.severity) {
      const sev = (detail.severity as SeverityOption) || "Medium";
      setSelectedSeverity(sev);
      if (SEVERITY_DEFAULTS[sev]) {
        setBountyAmount(SEVERITY_DEFAULTS[sev].bounty);
      }
    }
    if (detail?.assessmentSummary) {
      setFindingsSummary(detail.assessmentSummary);
    }
  }, [detail?.severity, detail?.assessmentSummary]);

  // Dialog & Workflow State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<boolean | null>(null);
  const [rejectionSuccess, setRejectionSuccess] = useState<boolean | null>(null);

  // RTK Mutations
  const [approveReport, { isLoading: isApproving }] = useApproveReportMutation();
  const [rejectReport, { isLoading: isRejecting }] = useRejectReportMutation();

  const handleSeverityChange = (option: SeverityOption) => {
    setSelectedSeverity(option);
    setBountyAmount(SEVERITY_DEFAULTS[option].bounty);
  };

  const handleConfirmApproval = async () => {
    const numericBounty = parseFloat(bountyAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(numericBounty) || numericBounty <= 0) {
      toast.error("A reward amount is required and must be greater than zero.");
      return;
    }

    try {
      await approveReport({
        id: String(detail.id),
        severity: selectedSeverity,
        explanation,
        findingsSummary,
        decisionReason,
        improvementSuggestions,
        bountyAmount: `$${numericBounty}`,
        files: selectedFiles,
      }).unwrap();

      setShowApprovalModal(false);
      setApprovalSuccess(true);
      onOutcomeChange?.("approved");
    } catch (err) {
      console.error("Failed to approve report:", err);
      setShowApprovalModal(false);
      toast.error(
        apiErrorMessage(err, "The report could not be approved. Try again."),
      );
    }
  };

  const handleConfirmRejection = async () => {
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

  const username = detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const profileIdentifier = detail.submitterId || username;

  const handleCopyResolution = async () => {
    try {
      const summaryText = `[DevSolve Triage Resolution]\nReport: #${detail.reportId} - ${detail.title}\nStatus: APPROVED\nSeverity: ${selectedSeverity}\nBounty Award: $${bountyAmount} USD\nResearcher: ${detail.submitter}\nDecision: ${decisionReason || "Severity verified and validated according to program bounty rubric."}`;
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // ignore
    }
  };

  // Success State Card View (Executive Resolution Dashboard)
  if (approvalSuccess) {
    return (
      <Card className="rounded-3xl border border-emerald-500/30 bg-card p-6 sm:p-10 text-card-foreground shadow-2xl overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center space-y-7"
        >
          {/* Animated Hero Badge */}
          <div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10 shadow-lg">
            <CheckCircle2 className="size-10" />
          </div>

          {/* Title & Tag Strip */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                APPROVED & CONFIRMED
              </Badge>
              <Badge variant="outline" className="font-mono text-xs font-bold border-border bg-muted/50 px-2.5 py-0.5">
                {detail.reportId.startsWith("#") ? detail.reportId : `#${detail.reportId}`}
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
                Reward Dispatched
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Vulnerability Report Approved & Reward Dispatched
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The submission was formally accepted. Severity was adjusted to{" "}
              <strong className="text-foreground font-bold">{selectedSeverity}</strong>, and an authorized bounty of{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${bountyAmount} USD</strong> has been allocated to{" "}
              <Link
                href={`/profile/${encodeURIComponent(profileIdentifier)}`}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>{detail.submitter}</span>
                <ExternalLink className="size-3" />
              </Link>.
            </p>
          </div>

          {/* 4-Column Executive Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full text-left">
            <div className="p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Final Severity
              </span>
              <div>
                <p className="text-base font-bold text-foreground">{selectedSeverity}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{detail.cvssScore} CVSS</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <Coins className="size-3.5" />
                Bounty Award
              </span>
              <div>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">${bountyAmount} USD</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-0.5">Queued for Payout</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Status Outcome
              </span>
              <div>
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">VALID_CONFIRMED</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Ready for Resolution</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/40 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="size-3.5" />
                Researcher
              </span>
              <div>
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

          {/* Audit & Workflow Breakdown Box */}
          <div className="w-full rounded-2xl border border-border bg-muted/30 p-5 text-left space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Automated Triage Actions Logged
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>Severity updated to {selectedSeverity} ({detail.cvssScore})</span>
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

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
            <Link href={`/dashboard/report-management/${detail.id}`}>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 cursor-pointer gap-2 shadow-xs">
                <span>View Updated Report Details</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/dashboard/report-management">
              <Button
                variant="outline"
                className="rounded-xl border-border bg-card font-semibold text-xs h-10 px-4 cursor-pointer gap-2"
              >
                <ArrowLeft className="size-4" />
                <span>Return to Report Queue</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              onClick={handleCopyResolution}
              className="rounded-xl text-xs h-10 px-3.5 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
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
      <Card className="rounded-3xl border border-red-500/30 bg-card p-6 sm:p-10 text-card-foreground shadow-2xl overflow-hidden relative">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-500/15 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center space-y-7"
        >
          <div className="flex size-20 items-center justify-center rounded-3xl bg-red-500/15 text-red-600 dark:text-red-400 ring-8 ring-red-500/10 shadow-lg">
            <ShieldX className="size-10" />
          </div>

          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                REJECTED & CLOSED
              </Badge>
              <Badge variant="outline" className="font-mono text-xs font-bold border-border bg-muted/50 px-2.5 py-0.5">
                {detail.reportId.startsWith("#") ? detail.reportId : `#${detail.reportId}`}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Report Submission Rejected
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Report {detail.reportId.startsWith("#") ? detail.reportId : `#${detail.reportId}`} has been marked as rejected. Triage reasoning has been documented and feedback was shared back to researcher <strong>{detail.submitter}</strong>.
            </p>
          </div>

          {decisionReason && (
            <div className="w-full max-w-lg rounded-2xl border border-border bg-muted/40 p-4 text-left text-xs space-y-1">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">Rejection Reason</span>
              <p className="text-muted-foreground leading-relaxed">{decisionReason}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard/report-management">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 cursor-pointer gap-2 shadow-xs">
                <ArrowLeft className="size-4" />
                <span>Return to Report Queue</span>
              </Button>
            </Link>
            <Link href={`/dashboard/report-management/${detail.id}`}>
              <Button variant="outline" className="rounded-xl border-border bg-card font-semibold text-xs h-10 px-4 cursor-pointer gap-2">
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
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Severity Adjustment & Triage Decision
          </CardTitle>
          <p className="text-base text-muted-foreground">
            Confirm the final company severity rating, award bounty rewards, and provide feedback to the researcher.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* 1. Severity Rating Selector */}
          <FieldGroup>
            <Field className="rounded-2xl border border-border bg-muted/40 p-5">
              <FieldLabel className="text-foreground font-semibold text-base">
                1. Select Verified Severity
              </FieldLabel>
              <FieldContent>
                <ToggleGroup
                  value={[selectedSeverity]}
                  onValueChange={(value) => {
                    const next = value[value.length - 1];
                    if (next) {
                      handleSeverityChange(next as SeverityOption);
                    }
                  }}
                  className="flex w-full flex-wrap gap-2 mt-2"
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      variant="outline"
                      className={cn(
                        "rounded-xl border px-5 py-2.5 font-semibold text-sm cursor-pointer transition-all",
                        getSeverityClass(option, selectedSeverity === option)
                      )}
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription className="text-muted-foreground mt-3">
                  Claimed researcher severity:{" "}
                  <span className="font-semibold text-foreground">
                    {detail.severity} ({detail.cvssScore})
                  </span>
                  . Company decision rating:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedSeverity}
                  </span>
                </FieldDescription>
              </FieldContent>
            </Field>

            {/* 2. Bounty Allocation (Money only) */}
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <Field>
                <FieldLabel htmlFor="bounty-reward" className="text-foreground font-semibold flex items-center gap-1.5">
                  <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Bounty Reward Amount (USD) <span className="text-rose-500 font-bold">*</span>
                </FieldLabel>
                <FieldContent className="mt-1.5">
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
                      className="pl-7 bg-card text-foreground font-semibold text-base"
                    />
                  </div>
                  <FieldDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Bounties are paid by your organization. A researcher&apos;s reputation is set by the platform from the finding&apos;s severity when the report is recognised.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>

            {/* 3. Internal Adjustment Explanation */}
            <Field>
              <FieldLabel htmlFor="adjustment-explanation" className="text-foreground font-semibold">
                Internal team explanation for adjustment
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="adjustment-explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Document why the severity was adjusted from the initial researcher claim. This note is retained for internal audit and security team records."
                  className="min-h-28 border border-border bg-card text-foreground text-base focus-visible:ring-1 focus-visible:ring-ring"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* 4. Feedback to Researcher Box */}
          <div className="rounded-3xl border border-border bg-muted/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                Feedback to Researcher
              </Badge>
              <span className="text-xs text-muted-foreground">
                Visible to {detail.submitter}
              </span>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="findings-summary" className="text-foreground font-semibold">
                  Summary of validation findings (Markdown supported)
                </FieldLabel>
                <FieldContent className="mt-2">
                  <MarkdownEditor
                    id="findings-summary"
                    value={findingsSummary}
                    onChange={(value) => setFindingsSummary(value || "")}
                    placeholder="Document validation findings, reproduction confirmation, and technical evidence..."
                    height={280}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="decision-reason" className="text-foreground font-semibold">
                  Reason for severity determination
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="decision-reason"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Explain the impact assessment, prerequisites, and severity rating clearly."
                    className="min-h-20 border border-border bg-card text-foreground text-base focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="improvement-suggestions" className="text-foreground font-semibold">
                  Suggestions for future reports (Optional)
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="improvement-suggestions"
                    value={improvementSuggestions}
                    onChange={(e) => setImprovementSuggestions(e.target.value)}
                    placeholder="Help the researcher submit higher-fidelity reports in future scopes."
                    className="min-h-20 border border-border bg-card text-foreground text-base focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>

          {/* 5. Internal File Attachments */}
          <div className="rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 p-5">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-blue-600 dark:text-blue-400 ring-1 ring-border">
                <CloudUpload className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-foreground">
                  Upload internal notes, logs, or verification screenshots
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload logs, validation transcripts, or remediation notes supporting the decision.
                </p>
              </div>
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                Choose files
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
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.map((fileName) => (
                  <Badge
                    key={fileName}
                    variant="outline"
                    className="border-border bg-muted text-muted-foreground"
                  >
                    {fileName}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {/* 6. Action Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">
                Triage Decision for Report #{detail.reportId}
              </p>
              <p className="text-sm text-muted-foreground">
                Target: <span className="font-semibold text-foreground">{selectedSeverity}</span> · Bounty: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${bountyAmount} USD</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                disabled={isApproving || isRejecting}
                className="rounded-xl border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer font-semibold"
              >
                <ShieldX className="size-4" />
                <span>Reject Submission</span>
              </Button>

              <Button
                type="button"
                onClick={() => setShowApprovalModal(true)}
                disabled={isApproving || isRejecting}
                className="rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white cursor-pointer px-5 shadow-xs gap-2"
              >
                <CheckCircle2 className="size-4" />
                <span>Approve Report & Issue Bounty</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Approval Confirmation Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-emerald-500/10 px-5 py-4 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Confirm Report Approval
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Report #{detail.reportId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApprovalModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
                <p className="text-muted-foreground">
                  You are about to officially approve this vulnerability report and authorize the reward payment to <strong>{detail.submitter}</strong>.
                </p>

                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Final Severity:</span>
                    <Badge className="bg-blue-600 text-white font-bold text-xs">
                      {selectedSeverity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Bounty Award:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${bountyAmount} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Researcher:</span>
                    <Link
                      href={`/profile/${encodeURIComponent(detail.submitterId || detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_"))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline inline-flex items-center gap-1 group"
                      title={`View ${detail.submitter}'s public profile`}
                    >
                      <span>{detail.submitter}</span>
                    </Link>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/70 leading-relaxed">
                    Bounties are paid directly by your organization. Reputation is assigned separately by the platform upon resolution recognition.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-5 py-3.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isApproving}
                  className="rounded-xl text-xs h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmApproval}
                  disabled={isApproving}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 gap-2 cursor-pointer shadow-xs"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      <span>Confirm & Issue Bounty</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Rejection Confirmation Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-red-500/10 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/20 text-red-600 dark:text-red-400">
                    <ShieldX className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Confirm Report Rejection
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Report #{detail.reportId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRejectModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
                <div className="flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>Are you sure you want to reject this submission? This will close the report and notify <strong>{detail.submitter}</strong>.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for rejection
                  </label>
                  <Textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Provide clear rationale (e.g. Out of Scope, Intended Behavior, Duplicate, Missing PoC)."
                    className="min-h-24 bg-card text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-5 py-3.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                  className="rounded-xl text-xs h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmRejection}
                  disabled={isRejecting}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-5 gap-2 cursor-pointer shadow-xs"
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
    </>
  );
}
