"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useResolveReportMutation,
  useAwardRecognitionMutation,
} from "@/lib/redux/services/reportsApi";
import { apiErrorMessage } from "@/lib/api/error-message";
import { pointsFor } from "@/lib/reports/reputation";

type ResolveReportDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  severity: string;
  /** Named in the award warning, so it is clear who gets paid. */
  submitterName?: string;
  onSuccess?: () => void;
};

const PRESET_RESOLUTIONS = [
  "Patch deployed to production and verified. Vulnerability resolved.",
  "Remediation fix released in latest build. Target endpoint secured.",
  "Configuration updated and access control verified. Issue resolved.",
];

export function ResolveReportDialog({
  isOpen,
  onOpenChange,
  reportId,
  reportTitle,
  severity,
  submitterName,
  onSuccess,
}: ResolveReportDialogProps) {
  const [note, setNote] = useState("");
  const [awardHallOfThanks, setAwardHallOfThanks] = useState(true);
  const [resolveReport, { isLoading: isResolving }] = useResolveReportMutation();
  const [awardRecognition, { isLoading: isAwarding }] = useAwardRecognitionMutation();

  const isLoading = isResolving || isAwarding;

  /* What resolving will cost, quoted from the same severity the call sends.
     This is the one place the policy table may be used: it describes a
     payment that has not happened yet. Once it has, the number to show is
     the report's own `reputationPoints`. */
  const reputationAward = pointsFor(severity);

  const handleResolve = async () => {
    try {
      await resolveReport({
        id: reportId,
        severity,
        resolutionNote: note.trim() || undefined,
      }).unwrap();

      if (awardHallOfThanks) {
        try {
          await awardRecognition({
            reportId,
            title: `Hall of Thanks - ${severity || "Security"} Finding`,
            description:
              note.trim() ||
              `Publicly recognized for responsibly disclosing vulnerability #${reportId.slice(0, 8)}.`,
          }).unwrap();
          toast.success("Researcher inducted into Hall of Thanks!");
        } catch (recErr) {
          console.warn("Recognition award skipped or already granted:", recErr);
        }
      }

      toast.success("Report marked as Resolved", {
        description: `Vulnerability report #${reportId.slice(0, 8)} has been successfully resolved.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to resolve report", {
        description: apiErrorMessage(
          error,
          "The report service did not respond. Nothing was changed.",
        ),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl border-border bg-card text-card-foreground shadow-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-start sm:items-center gap-2.5 text-primary">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Mark as Resolved
              </DialogTitle>
              <DialogDescription className="mt-0.5 break-words text-sm text-muted-foreground">
                Closing report #{reportId.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* What is being closed. Quiet by design: it is orientation, not a
              decision, and the two amber blocks it used to compete with left
              the irreversible warning with no emphasis of its own. */}
          <dl className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 text-sm">
            <dt className="sr-only">Report</dt>
            <dd className="font-semibold leading-snug text-foreground break-words">
              {reportTitle}
            </dd>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <dt>Severity</dt>
                <dd className="font-semibold text-foreground">{severity}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt>Researcher</dt>
                <dd className="font-semibold text-foreground">
                  {submitterName || "the reporter"}
                </dd>
              </div>
            </div>
          </dl>

          {/* The one emphasis in the dialog. Resolving pays the researcher and
              cannot be taken back, so it is stated before the button rather
              than discovered after it. */}
          {reputationAward !== null && (
            <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0" />
                <h3 className="text-sm font-bold">This cannot be undone</h3>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                {reputationAward === 0 ? (
                  <>
                    Resolving credits{" "}
                    <strong>{submitterName || "the reporter"}</strong> with no
                    reputation, as an informational finding.
                  </>
                ) : (
                  <>
                    Resolving awards{" "}
                    <strong className="tabular-nums">
                      {reputationAward.toLocaleString()} reputation
                    </strong>{" "}
                    to <strong>{submitterName || "the reporter"}</strong>{" "}
                    immediately.
                  </>
                )}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                Priced from the {severity.toLowerCase()} severity above. It is
                paid once and never taken back — correcting the severity later
                will not change it. Any bounty is separate and stays yours to
                decide.
              </p>
            </section>
          )}

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="resolution-note"
                className="text-sm font-semibold text-foreground"
              >
                Resolution note{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <span className="text-xs text-muted-foreground">
                Shared with the researcher
              </span>
            </div>

            <Textarea
              id="resolution-note"
              placeholder="What was changed, and where. For example: input sanitisation added to the invoice export endpoint, deployed in build 2.4.1."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none border-border bg-background text-sm leading-relaxed"
            />

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_RESOLUTIONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setNote(preset)}
                  title={preset}
                  className="max-w-full truncate rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Neutral, not amber: this is an optional courtesy, and dressing it
              as a warning gave it the same weight as the irreversible award. */}
          <label
            htmlFor="resolve-hall-of-thanks"
            className="flex cursor-pointer select-none items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:bg-muted/40"
          >
            <input
              type="checkbox"
              id="resolve-hall-of-thanks"
              checked={awardHallOfThanks}
              onChange={(e) => setAwardHallOfThanks(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary"
            />
            <span className="min-w-0 space-y-0.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="size-3.5 text-amber-500" />
                Add to the Hall of Thanks
              </span>
              <span className="block text-sm leading-relaxed text-muted-foreground">
                Publicly credits {submitterName || "the researcher"} on your
                program and organization leaderboards.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 w-full cursor-pointer rounded-xl border-border text-sm font-semibold sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleResolve}
            disabled={isLoading}
            className="h-10 w-full cursor-pointer gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <span>Confirm Resolution</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
