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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateShowcaseReviewStatusMutation } from "@/lib/redux/services/admin/showcaseReviewApi";
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

const MAX_REASON = 2000;

interface ShowcaseDecisionDialogProps {
  showcaseId: string;
  title: string;
  decision: Extract<ShowcaseReviewStatus, "APPROVED" | "REJECTED"> | null;
  isOpen: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function ShowcaseDecisionDialog({
  showcaseId,
  title,
  decision,
  isOpen,
  onClose,
  onDone,
}: ShowcaseDecisionDialogProps) {
  const [updateStatus, { isLoading }] = useUpdateShowcaseReviewStatusMutation();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [opened, setOpened] = useState({ isOpen, showcaseId, decision });
  if (
    opened.isOpen !== isOpen ||
    opened.showcaseId !== showcaseId ||
    opened.decision !== decision
  ) {
    setOpened({ isOpen, showcaseId, decision });
    setReason("");
    setError(null);
  }

  if (!decision) return null;

  const isReject = decision === "REJECTED";

  const submit = async () => {
    const trimmed = reason.trim();
    if (isReject && !trimmed) {
      setError("Tell the author what needs to change.");
      return;
    }

    try {
      await updateStatus({
        id: showcaseId,
        body: {
          reviewStatus: decision,
          rejectionReason: trimmed || undefined,
        },
      }).unwrap();

      toast.success(
        isReject ? "Changes requested" : "Showcase approved and published",
        { description: title },
      );
      onClose();
      onDone?.();
    } catch (caught) {
      setError(messageOf(caught, "The decision could not be saved."));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
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
            {isReject ? "Request changes" : "Approve showcase"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {isReject ? (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {title}
                </span>{" "}
                stays unpublished and the author sees your note.
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {title}
                </span>{" "}
                goes live on the showcase index straight away.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label
              htmlFor="showcase-review-reason"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              {isReject ? "What needs to change" : "Note (optional)"}
            </Label>
            <span className="text-xs tabular-nums text-slate-400">
              {reason.length}/{MAX_REASON}
            </span>
          </div>
          <Textarea
            id="showcase-review-reason"
            value={reason}
            maxLength={MAX_REASON}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError(null);
            }}
            placeholder={
              isReject
                ? "e.g. The build guide stops at step 2 — the deployment step is missing, and the cover image is a placeholder."
                : "Anything worth recording with this decision."
            }
            className="min-h-28 rounded-xl border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {error && (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2.5 pt-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-11 rounded-xl px-5 text-sm font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={isLoading}
            className={cn(
              "h-11 rounded-xl px-6 text-sm font-bold text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]",
              isReject
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Saving…
              </>
            ) : isReject ? (
              "Request changes"
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
