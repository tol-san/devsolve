"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
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
import { useUpdateProblemModerationMutation } from "@/lib/redux/services/admin/problemReviewApi";

export type ProblemDecision = "PUBLISHED" | "REJECTED";

interface ProblemDecisionDialogProps {
  problemId: string;
  title: string;
  decision: ProblemDecision | null;
  isOpen: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function ProblemDecisionDialog({
  problemId,
  title,
  decision,
  isOpen,
  onClose,
  onDone,
}: ProblemDecisionDialogProps) {
  const [moderate, { isLoading }] = useUpdateProblemModerationMutation();
  const [error, setError] = useState<string | null>(null);

  const [opened, setOpened] = useState({ isOpen, problemId, decision });
  if (
    opened.isOpen !== isOpen ||
    opened.problemId !== problemId ||
    opened.decision !== decision
  ) {
    setOpened({ isOpen, problemId, decision });
    setError(null);
  }

  if (!decision) return null;

  const isReject = decision === "REJECTED";

  const submit = async () => {
    try {
      await moderate({ id: problemId, body: { status: decision } }).unwrap();

      toast.success(isReject ? "Problem rejected" : "Problem published", {
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
            {isReject ? "Reject problem" : "Approve problem"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {title}
            </span>{" "}
            {isReject
              ? "is turned away and stays off the problem feed."
              : "goes live on the problem feed straight away, open for solutions."}
          </DialogDescription>
        </DialogHeader>

        {isReject && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            The API takes no reason with a rejection, so the author is told
            nothing beyond the outcome.
          </p>
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
            disabled={isLoading}
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

function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
