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
          <div className="flex items-start sm:items-center gap-2.5 text-purple-600 dark:text-purple-400">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Mark as Resolved
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 break-words">
                Confirm remediation deployment and close report #{reportId.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1 text-sm">
            <p className="font-semibold text-foreground break-words">{reportTitle}</p>
            <p className="text-muted-foreground">
              Confirmed severity:{" "}
              <span className="font-bold text-foreground">{severity}</span>
            </p>
          </div>

          {/* Resolving is what pays the researcher, and it cannot be taken
              back — so the number is stated before the button, not after. */}
          {reputationAward !== null && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="text-sm font-bold">This cannot be undone</span>
              </div>

              <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm text-amber-900 dark:text-amber-200">
                <span>Resolving awards</span>
                <span className="inline-flex items-baseline gap-1 font-extrabold tabular-nums">
                  <Sparkles className="size-3.5 self-center" />
                  {reputationAward === 0
                    ? "no reputation"
                    : `${reputationAward.toLocaleString()} reputation`}
                </span>
                <span>
                  to {submitterName ? submitterName : "the reporter"}
                  {reputationAward === 0
                    ? ", as an informational finding."
                    : " immediately."}
                </span>
              </p>

              <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                DevSolve prices this from the {severity.toLowerCase()} severity
                above. It is paid once and is never taken back — correcting the
                severity later will not change it. Any bounty is separate and
                stays yours to decide.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Resolution Summary / Note (Optional)
            </label>
            <Textarea
              placeholder="Describe the fix or patch applied (e.g. Patch deployed to production, input sanitation added)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none text-xs sm:text-sm border-border bg-background leading-relaxed"
            />

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Quick templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_RESOLUTIONS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setNote(preset)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hall of Thanks Induction Toggle */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 flex items-start gap-3">
            <input
              type="checkbox"
              id="resolve-hall-of-thanks"
              checked={awardHallOfThanks}
              onChange={(e) => setAwardHallOfThanks(e.target.checked)}
              className="size-4 rounded mt-0.5 text-blue-600 focus:ring-blue-500 border-border cursor-pointer shrink-0"
            />
            <label
              htmlFor="resolve-hall-of-thanks"
              className="text-xs space-y-0.5 cursor-pointer select-none"
            >
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                Induct researcher into Hall of Thanks
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Publicly honors {submitterName || "the researcher"} on your program &amp; organization&apos;s public Hall of Thanks leaderboard.
              </p>
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl border-border cursor-pointer text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleResolve}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 cursor-pointer shadow-xs text-xs h-9"
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
