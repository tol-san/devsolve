"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Coins,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  ShieldAlert,
  Upload,
} from "lucide-react";
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
  useSubmitRetestMutation,
  useUploadReportAttachmentMutation,
  type RetestSummary,
  type RetestVerdict,
} from "@/lib/redux/services/reportsApi";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import {
  formatBountyAmount,
  hasBountyReward,
  retestDeadline,
  verdictDueLabel,
} from "@/lib/reports/retest";
import { cn } from "@/lib/utils";

export type RetestAttachmentOption = {
  id?: string;
  name: string;
  type: string;
  size?: string;
};

type SubmitRetestModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  /** The open attempt, which carries the deadline, target and any bonus. */
  attempt: RetestSummary | null;
  /** Everything already attached to this report — the only ids the API takes. */
  attachments?: RetestAttachmentOption[];
  initialVerdict?: RetestVerdict;
  onSuccess?: () => void;
};

/**
 * The researcher's answer to a retest.
 *
 * Two verdicts and nothing else: there is no accept or decline step upstream,
 * so this never offers one. Evidence is chosen from the attachments already on
 * the report, because `attachmentIds` is validated against exactly that set —
 * a report in `RETESTING` is still attachment-editable, so a new file can be
 * uploaded here first and is then selectable like the rest.
 */
export function SubmitRetestModal({
  isOpen,
  onOpenChange,
  reportId,
  reportTitle,
  attempt,
  attachments = [],
  initialVerdict = "VERIFIED_FIXED",
  onSuccess,
}: SubmitRetestModalProps) {
  const [verdict, setVerdict] = useState<RetestVerdict>(initialVerdict);
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [submitRetest, { isLoading: isSubmitting }] = useSubmitRetestMutation();
  const [uploadAttachment] = useUploadReportAttachmentMutation();

  /* Reset as the dialog opens, adjusting state during render rather than in
     an effect: the verdict the opener picked is a prop, and reconciling it
     after a paint would flash the previous answer. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setVerdict(initialVerdict);
      setSelectedIds([]);
    }
  }

  /* Only attachments the backend can resolve to an id are offerable — one
     without an id would come back as "Attachment ... is not on this report". */
  const selectable = useMemo(
    () =>
      attachments.filter(
        (file): file is RetestAttachmentOption & { id: string } =>
          Boolean(file.id),
      ),
    [attachments],
  );

  const deadline = retestDeadline(attempt?.dueAt);
  const dueLabel = verdictDueLabel(attempt?.dueAt);
  const bonus = hasBountyReward(attempt?.bountyReward)
    ? formatBountyAmount(attempt?.bountyReward)
    : null;

  const toggleAttachment = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploaded = (await uploadAttachment({ reportId, file }).unwrap()) as {
        id?: string;
        attachmentId?: string;
      };

      const newId = uploaded?.id || uploaded?.attachmentId;
      if (newId) {
        /* Selected straight away: it was uploaded to be submitted. The list
           itself refreshes from the report the upload invalidated. */
        setSelectedIds((current) => [...current, newId]);
      }
      toast.success("Evidence uploaded", { description: file.name });
    } catch (error) {
      toast.error("Upload failed", {
        description: apiErrorMessage(
          error,
          "The file could not be attached to this report.",
        ),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitRetest({
        id: reportId,
        verdict,
        notes: notes.trim() || undefined,
        attachmentIds: selectedIds.length ? selectedIds : undefined,
      }).unwrap();

      toast.success(
        verdict === "VERIFIED_FIXED"
          ? "Verdict submitted: verified fixed"
          : "Verdict submitted: still vulnerable",
        {
          description:
            verdict === "VERIFIED_FIXED"
              ? "The report stays resolved and the organization has been notified."
              : "The report has been reopened for the organization to look at again.",
        },
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      /* A non-reporter gets a 404, deliberately: the report's existence is not
         public, so it is reported as not found rather than as forbidden. */
      const status = apiErrorStatus(error);
      toast.error(
        status === 404 ? "Report not found" : "Verdict could not be submitted",
        {
          description:
            status === 404
              ? "No report exists at this address, or it is not yours to answer."
              : apiErrorMessage(
                  error,
                  "The retest service did not respond. Nothing was submitted.",
                ),
        },
      );
    }
  };

  const isLoading = isSubmitting || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl border-border bg-card text-card-foreground shadow-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Submit your retest verdict
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5 break-words">
                Attempt #{attempt?.attemptNumber ?? 1}
                {attempt?.environment
                  ? ` on ${attempt.environment.toLowerCase()}`
                  : ""}
                {" · "}
                report #{reportId.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* What was asked for, and by when */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-2 text-sm">
            <p className="font-semibold text-foreground break-words">
              {reportTitle}
            </p>
            {attempt?.targetEndpoint && (
              <p className="text-muted-foreground font-mono text-xs break-all">
                {attempt.targetEndpoint}
              </p>
            )}
            {attempt?.requestNotes && (
              <p className="text-muted-foreground leading-relaxed break-words">
                &ldquo;{attempt.requestNotes}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {dueLabel && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                    deadline?.isOverdue
                      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                      : deadline?.isUrgent
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {dueLabel}
                </span>
              )}
              {bonus && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Coins className="size-3.5" />
                  {bonus} bonus, paid when you submit your verdict
                </span>
              )}
            </div>
          </div>

          {/* Verdict */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-foreground">
              Your verdict
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setVerdict("VERIFIED_FIXED")}
                aria-pressed={verdict === "VERIFIED_FIXED"}
                className={cn(
                  "flex flex-col gap-1.5 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                  verdict === "VERIFIED_FIXED"
                    ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "border-border bg-muted/40 hover:bg-muted",
                )}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">
                    Verified fixed
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                  You could not reproduce it. The report stays resolved.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerdict("STILL_VULNERABLE")}
                aria-pressed={verdict === "STILL_VULNERABLE"}
                className={cn(
                  "flex flex-col gap-1.5 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                  verdict === "STILL_VULNERABLE"
                    ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20"
                    : "border-border bg-muted/40 hover:bg-muted",
                )}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-red-500 shrink-0" />
                  <span className="text-sm font-bold text-foreground">
                    Still vulnerable
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                  It still reproduces. The report is reopened for the team.
                </p>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="retest-notes"
                className="text-sm font-semibold text-foreground"
              >
                What you found{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <span className="text-xs text-muted-foreground">
                {notes.length} / 5000
              </span>
            </div>
            <Textarea
              id="retest-notes"
              placeholder={
                verdict === "VERIFIED_FIXED"
                  ? "How you retested and what happened — e.g. the original payload now returns 403 with no data."
                  : "How it still reproduces — the payload, the response, and anything that changed since the fix."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={5000}
              className="resize-none text-sm border-border bg-background leading-relaxed"
            />
          </div>

          {/* Evidence: this report's attachments, plus anything added now */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Paperclip className="size-4 text-muted-foreground" />
              Evidence from this report
            </span>

            {selectable.length > 0 ? (
              <ul className="space-y-1.5 rounded-xl border border-border bg-background p-2">
                {selectable.map((file) => {
                  const isImage = file.type?.startsWith("image/");
                  const checked = selectedIds.includes(file.id);
                  return (
                    <li key={file.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleAttachment(file.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left cursor-pointer transition-colors",
                          checked ? "bg-blue-500/10" : "hover:bg-muted",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                            checked
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-border bg-background",
                          )}
                        >
                          {checked && <Check className="size-3" />}
                        </span>
                        {isImage ? (
                          <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                        ) : (
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm text-foreground truncate">
                          {file.name}
                        </span>
                        {file.size && (
                          <span className="ml-auto text-xs text-muted-foreground shrink-0">
                            {file.size}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                This report has no attachments yet. Upload your retest evidence
                below to attach it to your verdict.
              </p>
            )}

            <label className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer w-fit">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              <span>{isUploading ? "Uploading…" : "Upload new evidence"}</span>
              <input
                type="file"
                className="sr-only"
                disabled={isLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleUpload(file);
                }}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl border-border cursor-pointer text-sm h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto rounded-xl font-semibold gap-2 cursor-pointer shadow-xs text-white text-sm h-9",
              verdict === "VERIFIED_FIXED"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700",
            )}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : verdict === "VERIFIED_FIXED" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <ShieldAlert className="size-4" />
            )}
            <span>
              {verdict === "VERIFIED_FIXED"
                ? "Submit: verified fixed"
                : "Submit: still vulnerable"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
