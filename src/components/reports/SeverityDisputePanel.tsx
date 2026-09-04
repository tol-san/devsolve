"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Gavel,
  Loader2,
  Scale,
} from "lucide-react";
import { motion } from "motion/react";
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

function SeverityPair({
  reported,
  triaged,
}: {
  reported?: string | null;
  triaged?: string | null;
}) {
  if (!reported && !triaged) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {reported && (
        <span className="rounded-lg border border-border bg-background px-2.5 py-1 font-semibold text-foreground">
          Reported <span className="font-bold">{reported}</span>
        </span>
      )}
      {reported && triaged && (
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      )}
      {triaged && (
        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-900 dark:text-amber-200">
          Triaged as <span className="font-bold">{triaged}</span>
        </span>
      )}
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

  if (isDisputeSettled(dispute)) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">
            Severity settled
          </h3>
          {dispute.resolvedSeverity && (
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {dispute.resolvedSeverity}
            </span>
          )}
        </div>

        {dispute.resolutionNotes && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {dispute.resolutionNotes}
          </p>
        )}
        {dispute.reason && (
          <p className="mt-2 rounded-xl border border-border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              The researcher&apos;s case:{" "}
            </span>
            {dispute.reason}
          </p>
        )}
        {dispute.resolvedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDateTime(dispute.resolvedAt, "")}
          </p>
        )}
      </section>
    );
  }

  if (isWithAdministrator(dispute)) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <Gavel className="size-5 shrink-0 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">
            An administrator is deciding the severity
          </h3>
        </div>

        <div className="mt-3">
          <SeverityPair reported={reportedSeverity} triaged={triageSeverity} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The researcher did not agree with the triage rating, so it has gone to
          a platform administrator. Neither side can act until they rule.
        </p>

        {dispute.reason && (
          <p className="mt-2 rounded-xl border border-border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              The researcher&apos;s case:{" "}
            </span>
            {dispute.reason}
          </p>
        )}
      </section>
    );
  }

  if (isAwaitingReporter(dispute) && !isReporter) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-xs sm:p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <CalendarClock className="size-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Waiting for the researcher to confirm the severity
          </h3>
        </div>

        <div className="mt-3">
          <SeverityPair reported={reportedSeverity} triaged={triageSeverity} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
          There is nothing to do here. If they accept, or do not answer by{" "}
          <strong>{formatDate(dispute.respondBy, "the deadline")}</strong>, the
          triage rating stands. If they refuse, an administrator rules on it.
        </p>
      </section>
    );
  }

  if (isAwaitingReporter(dispute) && isReporter) {
    const canRefuse = reason.trim().length > 0 && !busy;

    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-xs sm:p-5",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <Scale className="size-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Confirm the severity of your report
          </h3>
        </div>

        <div className="mt-3">
          <SeverityPair reported={reportedSeverity} triaged={triageSeverity} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
          The team rated this differently from you. Accept their rating, or
          refuse it and a platform administrator will decide between the two.
        </p>

        {dispute.respondBy && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-amber-900/90 dark:text-amber-200/90">
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
            <span>
              Confirm by{" "}
              <strong>{formatDate(dispute.respondBy, "the deadline")}</strong>,
              or the triage severity stands. Your report is unaffected either
              way — only the rating settles.
            </span>
          </p>
        )}

        <div className="mt-4 space-y-2">
          <label
            htmlFor="severity-refusal-reason"
            className="text-sm font-semibold text-amber-900 dark:text-amber-200"
          >
            Why you disagree
          </label>
          <Textarea
            id="severity-refusal-reason"
            rows={4}
            value={reason}
            maxLength={MAX_REASON}
            onChange={(event) => setReason(event.target.value)}
            placeholder="What makes this more severe than the team's rating? Impact, reachability, what an attacker gets…"
            className="resize-none border-amber-500/30 bg-background text-sm leading-relaxed"
          />
          <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80">
            Needed only if you refuse. An administrator is choosing between two
            ratings, and &ldquo;I disagree&rdquo; gives them nothing to work
            with — say what they should weigh.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setConfirmingAccept(true)}
            disabled={busy}
            className="rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto"
          >
            {isAccepting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Accept {triageSeverity ?? "the triage rating"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            disabled={!canRefuse}
            title={
              reason.trim() ? undefined : "Give a reason before refusing"
            }
            className="rounded-xl border-border bg-card font-semibold sm:w-auto"
          >
            {isRejecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Gavel className="size-4" />
            )}
            Refuse and escalate
          </Button>
        </div>

        <AlertDialog
          open={confirmingAccept}
          onOpenChange={(open) => {
            if (!open && !isAccepting) setConfirmingAccept(false);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                Accept {triageSeverity ?? "the triage rating"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This is final. The rating becomes the report&apos;s severity,
                you cannot change your mind afterwards, and the team cannot
                re-triage around it. If you are unsure, refuse instead — an
                administrator will look at both ratings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAccepting}>
                Go back
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleAccept();
                }}
                disabled={isAccepting}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isAccepting ? "Accepting…" : "Yes, accept it"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.section>
    );
  }

  return null;
}
