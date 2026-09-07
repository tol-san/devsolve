"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gavel,
  Loader2,
  Scale,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import type { DisputeDetail } from "@/lib/types/reports/types";
import {
  useAcceptSeverityMutation,
  useRejectSeverityMutation,
} from "@/lib/redux/services/reportsApi";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import {
  isAwaitingReporter,
  isDisputeSettled,
  isWithAdministrator,
} from "@/lib/reports/dispute";
import { formatDate, formatDateTime } from "@/lib/format/datetime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const MAX_REASON = 5000;

type SeverityDisputePanelProps = {
  reportId: string;
  dispute: DisputeDetail | null | undefined;
  reportedSeverity?: string | null;
  triageSeverity?: string | null;
  isReporter: boolean;
  className?: string;
};

const SEVERITY_DOT: Record<string, string> = {
  Critical: "bg-rose-500",
  CRITICAL: "bg-rose-500",
  High: "bg-orange-500",
  HIGH: "bg-orange-500",
  Medium: "bg-amber-500",
  MEDIUM: "bg-amber-500",
  Low: "bg-blue-500",
  LOW: "bg-blue-500",
};

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  CRITICAL: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  High: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Low: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  LOW: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

function SeverityBadge({ value, label }: { value?: string | null; label?: string }) {
  if (!value) return null;
  const dot = SEVERITY_DOT[value] ?? "bg-muted-foreground";
  const badge = SEVERITY_BADGE[value] ?? "border-border bg-muted text-muted-foreground";
  const display = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  return (
    <div className="flex flex-col gap-1 min-w-0">
      {label && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold shadow-2xs",
          badge,
        )}
      >
        <span className={cn("size-2 rounded-full shrink-0", dot)} />
        {display}
      </span>
    </div>
  );
}

function SeverityComparison({
  reported,
  triaged,
}: {
  reported?: string | null;
  triaged?: string | null;
}) {
  if (!reported && !triaged) return null;

  return (
    <div className="flex items-end gap-3">
      <SeverityBadge value={reported} label="You claimed" />
      {reported && triaged && (
        <div className="flex flex-col items-center gap-1 pb-1.5">
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        </div>
      )}
      <SeverityBadge value={triaged} label="Company triaged" />
    </div>
  );
}

export function SeverityDisputePanel({
  reportId,
  dispute,
  reportedSeverity,
  triageSeverity,
  isReporter,
  className,
}: SeverityDisputePanelProps) {
  const [reason, setReason] = useState("");
  const [confirmingAccept, setConfirmingAccept] = useState(false);

  const [acceptSeverity, { isLoading: isAccepting }] =
    useAcceptSeverityMutation();
  const [rejectSeverity, { isLoading: isRejecting }] =
    useRejectSeverityMutation();

  if (!dispute) return null;

  const busy = isAccepting || isRejecting;

  const onError = (error: unknown, fallback: string) => {
    const status = apiErrorStatus(error);
    if (status === 404) {
      toast.error("Report not found", {
        description: "No report exists at this address, or it is not yours to answer.",
      });
      return;
    }
    if (status === 409) {
      toast.error("Nothing to answer", {
        description: "This report has no severity decision waiting on you.",
      });
      return;
    }
    toast.error(fallback, { description: apiErrorMessage(error, "") || undefined });
  };

  const handleAccept = async () => {
    try {
      await acceptSeverity({ id: reportId }).unwrap();
      setConfirmingAccept(false);
      toast.success("Severity accepted", {
        description: "The rating is final and the report continues from here.",
      });
    } catch (error) {
      onError(error, "That severity could not be accepted");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    try {
      await rejectSeverity({ id: reportId, reason }).unwrap();
      setReason("");
      toast.success("Sent to an administrator", {
        description: "They will rule between the two ratings.",
      });
    } catch (error) {
      onError(error, "That severity could not be refused");
    }
  };

  /* ─── SETTLED ───────────────────────────────────────────────────────── */
  if (isDisputeSettled(dispute)) {
    const displaySev = dispute.resolvedSeverity
      ? dispute.resolvedSeverity.charAt(0).toUpperCase() +
        dispute.resolvedSeverity.slice(1).toLowerCase()
      : null;

    return (
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-card p-5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10",
          className,
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent opacity-60 blur-2xl" />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                <CheckCircle2 className="size-4.5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">Severity Dispute Settled</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This dispute has been resolved and the final rating is locked</p>
              </div>
            </div>
            {displaySev && (
              <SeverityBadge value={dispute.resolvedSeverity ?? undefined} />
            )}
          </div>

          {/* Resolution notes */}
          {dispute.resolutionNotes && (
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin decision</p>
              <p className="text-sm leading-relaxed text-foreground">{dispute.resolutionNotes}</p>
            </div>
          )}

          {/* Researcher's case */}
          {dispute.reason && (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Researcher's case</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{dispute.reason}</p>
            </div>
          )}

          {/* Timestamp */}
          {dispute.resolvedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 shrink-0" />
              <span>Resolved {formatDateTime(dispute.resolvedAt, "")}</span>
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  /* ─── WITH ADMINISTRATOR ─────────────────────────────────────────────── */
  if (isWithAdministrator(dispute)) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10",
          className,
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-60 blur-2xl" />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted text-muted-foreground shadow-2xs shrink-0">
              <Gavel className="size-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Under Administrator Review</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Neither side can act until the admin rules</p>
            </div>
          </div>

          {/* Severity comparison */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Severity in dispute</p>
            <SeverityComparison reported={reportedSeverity} triaged={triageSeverity} />
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            The researcher did not agree with the triage rating, so it has gone to a platform administrator. An admin will review both sides and assign the final rating.
          </p>

          {/* Researcher's case */}
          {dispute.reason && (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Researcher's case</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{dispute.reason}</p>
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  /* ─── AWAITING REPORTER — company-side view ──────────────────────────── */
  if (isAwaitingReporter(dispute) && !isReporter) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-card p-5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10",
          className,
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent opacity-60 blur-2xl" />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
              <CalendarClock className="size-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Waiting for researcher's response</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dispute.respondBy
                  ? `Deadline: ${formatDate(dispute.respondBy, "no deadline set")}`
                  : "No deadline set"}
              </p>
            </div>
          </div>

          {/* Severity comparison */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">Severity in question</p>
            <SeverityComparison reported={reportedSeverity} triaged={triageSeverity} />
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing to do here. If the researcher accepts, or does not answer by the deadline, your triage rating stands automatically. If they refuse, an administrator rules on it.
          </p>
        </div>
      </motion.section>
    );
  }

  /* ─── AWAITING REPORTER — reporter-side view ─────────────────────────── */
  if (isAwaitingReporter(dispute) && isReporter) {
    const canRefuse = reason.trim().length > 0 && !busy;
    const charCount = reason.length;
    const overLimit = charCount > MAX_REASON;

    const displayTriage =
      triageSeverity
        ? triageSeverity.charAt(0).toUpperCase() + triageSeverity.slice(1).toLowerCase()
        : "the triage rating";

    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-card p-5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10",
          className,
        )}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent opacity-70 blur-2xl" />

        <div className="relative z-10 space-y-5">
          {/* Header with urgency indicator */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
                <Scale className="size-4.5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Confirm the severity of your report
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The company rated your finding differently
                </p>
              </div>
            </div>
            {/* Pulsing action required badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 shadow-2xs shrink-0">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              Action required
            </span>
          </div>

          {/* Severity comparison card */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Severity in dispute</p>
            <SeverityComparison reported={reportedSeverity} triaged={triageSeverity} />
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
              The company triaged this lower than your claim. Only downgrades require your confirmation.
            </p>
          </div>

          {/* Deadline */}
          {dispute.respondBy && (
            <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-muted/30 p-3.5">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold text-foreground">
                  Respond by {formatDate(dispute.respondBy, "the deadline")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you don&apos;t respond, the triage rating stands automatically. Only the severity rating settles — your report itself is unaffected either way.
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Actions explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Accept option */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Accept their rating</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{displayTriage}</strong> becomes the final severity. Fastest path to resolution.
              </p>
              <Button
                type="button"
                onClick={() => setConfirmingAccept(true)}
                disabled={busy}
                size="sm"
                className="w-full mt-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
              >
                {isAccepting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Accept {displayTriage}
              </Button>
            </div>

            {/* Refuse option */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <XCircle className="size-3.5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Dispute & escalate</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A platform admin will review both ratings and make the final call.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleReject}
                disabled={!canRefuse}
                title={reason.trim() ? undefined : "Provide your reasoning below first"}
                size="sm"
                className="w-full mt-1 rounded-xl border-rose-500/30 bg-card hover:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold text-xs h-9 gap-1.5 shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRejecting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Gavel className="size-3.5" />
                )}
                Refuse and escalate
              </Button>
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="severity-refusal-reason"
                className="text-sm font-semibold text-foreground"
              >
                Why you disagree
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(required to escalate)</span>
              </label>
              <span className={cn(
                "text-xs tabular-nums",
                overLimit ? "text-rose-600 font-bold" : "text-muted-foreground",
              )}>
                {charCount.toLocaleString()}/{MAX_REASON.toLocaleString()}
              </span>
            </div>
            <Textarea
              id="severity-refusal-reason"
              rows={4}
              value={reason}
              maxLength={MAX_REASON}
              onChange={(event) => setReason(event.target.value)}
              placeholder="What makes this more severe than the team's rating? Describe the impact, reachability, and what an attacker could do with it…"
              className="resize-none border-border bg-background text-sm leading-relaxed focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              An administrator is choosing between two ratings. <strong className="text-foreground">&ldquo;I disagree&rdquo;</strong> gives them nothing to work with — explain what they should weigh.
            </p>
          </div>
        </div>

        {/* Accept confirmation dialog */}
        <AlertDialog
          open={confirmingAccept}
          onOpenChange={(open) => {
            if (!open && !isAccepting) setConfirmingAccept(false);
          }}
        >
          <AlertDialogContent className="rounded-2xl border border-border/80 bg-card shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2.5 text-foreground">
                <span className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs shrink-0">
                  <AlertTriangle className="size-4.5" />
                </span>
                Accept {displayTriage} severity?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                This is <strong className="text-foreground">permanent</strong>. Once accepted, the severity becomes final — the company cannot re-triage around it, and you cannot appeal afterwards.
                <br /><br />
                If you are unsure, refuse instead — an administrator will review both ratings fairly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAccepting} className="rounded-xl">
                Go back
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleAccept();
                }}
                disabled={isAccepting}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold gap-2"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Accepting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Yes, accept {displayTriage}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.section>
    );
  }

  return null;
}
