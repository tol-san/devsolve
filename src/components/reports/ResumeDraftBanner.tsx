"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, FileClock, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReportDraftResponse } from "@/lib/validations/report-draft";

function when(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Offers back an unfinished report for this program.
 *
 * Offered, never applied on its own. Silently repopulating the form is how
 * somebody submits last week's half-written draft without registering that is
 * what they are doing — and the reporter may have come back deliberately to
 * start again.
 */
export function ResumeDraftBanner({
  draft,
  onResume,
  onDiscard,
}: {
  draft: ReportDraftResponse;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const saved = when(draft.updatedAt ?? draft.createdAt);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-500/25 dark:bg-blue-500/10"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
        >
          <FileClock className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            You have an unfinished report for this program
          </p>
          <p className="truncate text-sm text-blue-800/80 dark:text-blue-300/80">
            {draft.title?.trim() || "Untitled report"}
            {saved ? ` · saved ${saved}` : null}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onResume}
          className="cursor-pointer rounded-xl"
        >
          <Check data-icon="inline-start" />
          Resume
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDiscard}
          className="cursor-pointer rounded-xl text-blue-900/70 hover:bg-blue-100 hover:text-blue-900 dark:text-blue-300/80 dark:hover:bg-blue-500/20 dark:hover:text-blue-200"
        >
          <X data-icon="inline-start" />
          Start fresh
        </Button>
      </div>
    </motion.div>
  );
}

/** "Saving…" / "Draft saved", shown next to the step controls. */
export function DraftStatus({
  isSaving,
  savedAt,
  error,
}: {
  isSaving: boolean;
  savedAt: string | null;
  error: string | null;
}) {
  if (error) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
        {error}
      </span>
    );
  }

  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
        Saving draft…
      </span>
    );
  }

  if (!savedAt) return null;

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      Draft saved {when(savedAt)}
    </span>
  );
}

export default ResumeDraftBanner;
