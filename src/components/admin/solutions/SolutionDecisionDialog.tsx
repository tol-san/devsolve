"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateSolutionReviewStatusMutation } from "@/lib/redux/services/admin/solutionAdminApi";
import { messageOf } from "@/lib/discussions/format";

export type SolutionDecision = "APPROVED" | "REJECTED";

const MAX_REASON = 2000;

interface SolutionDecisionDialogProps {
  solutionId: string;
  title: string;
  decision: SolutionDecision | null;
  isOpen: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function SolutionDecisionDialog({
  solutionId,
  title,
  decision,
  isOpen,
  onClose,
  onDone,
}: SolutionDecisionDialogProps) {
  const [review, { isLoading }] = useUpdateSolutionReviewStatusMutation();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const [opened, setOpened] = useState({ isOpen, solutionId, decision });
  if (
    opened.isOpen !== isOpen ||
    opened.solutionId !== solutionId ||
    opened.decision !== decision
  ) {
    setOpened({ isOpen, solutionId, decision });
    setError(null);
    setReason("");
  }

  if (!decision) return null;

  const isReject = decision === "REJECTED";
  const trimmedReason = reason.trim();
  const reasonMissing = isReject && trimmedReason.length === 0;

  const submit = async () => {
    if (reasonMissing) {
      setError("Say why it is being rejected — the author is shown this.");
      return;
    }

    try {
      await review({
        id: solutionId,
        reviewStatus: decision,
        rejectionReason: isReject ? trimmedReason : undefined,
      }).unwrap();

      toast.success(isReject ? "Solution rejected" : "Solution approved", {
        description: title,
      });
      onClose();
      onDone?.();
    } catch (caught) {
      setError(messageOf(caught, "The decision could not be saved."));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border border-slate-200 bg-white p-6 sm:max-w-lg dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            {isReject ? (
              <XCircle className="size-5 text-rose-600" aria-hidden="true" />
            ) : (
              <CheckCircle2
                className="size-5 text-emerald-600"
                aria-hidden="true"
              />
            )}
            {isReject ? "Reject solution" : "Approve solution"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {title || "This answer"}
            </span>{" "}
            {isReject
              ? "is turned away and stays off the problem it answers."
              : "appears on the problem it answers straight away, where the asker can accept it."}
          </DialogDescription>
        </DialogHeader>

        {isReject && (
          <div className="space-y-2">
            <label
              htmlFor="solution-rejection-reason"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Reason <span className="text-rose-500">*</span>
            </label>
            <Textarea
              id="solution-rejection-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError(null);
              }}
              maxLength={MAX_REASON}
              rows={4}
              placeholder="What is wrong with it, and what would make it publishable."
              disabled={isLoading}
              aria-invalid={reasonMissing && Boolean(error)}
              className="rounded-xl border-slate-300 bg-white text-base dark:border-slate-700 dark:bg-slate-950"
            />
            <p className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>The author is shown this, so make it actionable.</span>
              <span className="tabular-nums">
                {reason.length}/{MAX_REASON.toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-rose-600" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={isLoading || reasonMissing}
            className={
              isReject
                ? "rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                : "rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : isReject ? (
              "Reject"
            ) : (
              "Approve and publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
