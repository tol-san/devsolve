"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { FieldConflict } from "./types-and-constants";

interface ProblemBannersProps {
  isEdit: boolean;
  preparedDraft: ProblemResponse | null;
  latestDraft: ProblemResponse | null;
  dismissedDraftBanner: boolean;
  onDismissDraftBanner: () => void;
  onLoadDraft: (draft: ProblemResponse) => void;
  conflictData: {
    fresh: ProblemResponse;
    diffs: FieldConflict[];
  } | null;
  onForceOverwrite: () => void;
  onDiscardAndReload: () => void;
  onClearConflict: () => void;
}

export function ProblemBanners({
  isEdit,
  preparedDraft,
  latestDraft,
  dismissedDraftBanner,
  onDismissDraftBanner,
  onLoadDraft,
  conflictData,
  onForceOverwrite,
  onDiscardAndReload,
  onClearConflict,
}: ProblemBannersProps) {
  return (
    <>
      {!isEdit && !preparedDraft && latestDraft && !dismissedDraftBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:px-4 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground truncate">
                Unpublished draft found: &ldquo;{latestDraft.title}&rdquo;
              </div>
              <div className="text-xs text-muted-foreground">
                Would you like to resume where you left off?
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => onLoadDraft(latestDraft)}
              className="h-8 text-xs font-medium px-3 cursor-pointer"
            >
              Resume draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDismissDraftBanner}
              className="h-8 text-xs text-muted-foreground hover:text-foreground px-2.5 cursor-pointer"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {conflictData && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs sm:text-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  Problem Updated on Server
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The problem was updated on the server while you were editing. Review the differences below before choosing whether to overwrite or keep the server version.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={onClearConflict}
              className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
            {conflictData.diffs.map((diff) => (
              <div
                key={diff.field}
                className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 py-1.5 border-b border-border/40 last:border-0 text-xs"
              >
                <span className="font-medium text-foreground">{diff.label}</span>
                <div className="text-muted-foreground">
                  <span className="text-[11px] uppercase font-semibold text-amber-600 dark:text-amber-400 block sm:inline mr-1">
                    Server:
                  </span>
                  <span className="line-clamp-2">{diff.serverValue}</span>
                </div>
                <div className="text-foreground">
                  <span className="text-[11px] uppercase font-semibold text-primary block sm:inline mr-1">
                    Your version:
                  </span>
                  <span className="line-clamp-2">{diff.authorValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={onForceOverwrite}
              className="h-8 text-xs font-medium cursor-pointer"
            >
              Overwrite server version
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onDiscardAndReload}
              className="h-8 text-xs font-medium cursor-pointer"
            >
              Discard my changes & reload
            </Button>
          </div>
        </motion.div>
      )}

      {preparedDraft && !isEdit && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>
              Editing saved draft: <strong>{preparedDraft.title || "Untitled draft"}</strong>. Changes will update this draft.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
