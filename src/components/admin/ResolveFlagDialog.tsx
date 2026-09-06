"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, MessageSquare } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { useResolveFlagMutation, type FlagResponse } from "@/lib/redux/services/admin/adminFlagsApi";
import { useGetTargetModerationHistoryQuery } from "@/lib/redux/services/admin/moderationActionsApi";
import type { ContentPreview } from "@/lib/redux/services/admin/flaggedContentApi";
import {
  FLAGGABLE_TYPE_LABELS,
  flagResolveSchema,
  isTakedownTarget,
} from "@/lib/validations/moderation";
import { messageOf } from "@/lib/discussions/format";

const MAX_NOTE = 2000;

interface ResolveFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: FlagResponse;
  preview?: ContentPreview;
  onDone?: () => void;
}

/**
 * Resolving closes the report. Ticking "remove the content" also takes the post
 * down for good, so the two are one dialog with an explicit, off-by-default
 * switch rather than two buttons that look alike.
 */
export function ResolveFlagDialog({
  open,
  onOpenChange,
  flag,
  preview,
  onDone,
}: ResolveFlagDialogProps) {
  const [note, setNote] = useState("");
  const [removeContent, setRemoveContent] = useState(false);
  const [resolveFlag, { isLoading }] = useResolveFlagMutation();

  const label = FLAGGABLE_TYPE_LABELS[flag.flaggableType] ?? flag.flaggableType;
  const canRemove = isTakedownTarget(flag.flaggableType) && !preview?.missing;

  const { data: history } = useGetTargetModerationHistoryQuery(
    { targetType: flag.flaggableType, targetId: flag.flaggableId },
    { skip: !open || !flag.flaggableId },
  );

  const parsed = useMemo(
    () => flagResolveSchema.safeParse({ resolutionNote: note, removeContent }),
    [note, removeContent],
  );
  const canConfirm = parsed.success && !isLoading;

  const onConfirm = async () => {
    if (!parsed.success) return;

    try {
      await resolveFlag({
        id: flag.id,
        resolutionNote: parsed.data.resolutionNote,
        removeContent: parsed.data.removeContent,
      }).unwrap();

      toast.success(removeContent ? `${label} removed` : "Report resolved", {
        description: removeContent
          ? "The report is closed and the content is down."
          : "The report is closed and the content stays up.",
      });
      onOpenChange(false);
      onDone?.();
    } catch (caught) {
      toast.error(messageOf(caught, "That report could not be resolved."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Resolve this report</DialogTitle>
          <DialogDescription>
            Closes the report. The note is kept in the audit trail as the reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-bold text-foreground">
              {preview?.title ?? `Untitled ${label.toLowerCase()}`}
            </p>
            {preview?.authorName && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                by {preview.authorName}
              </p>
            )}
          </div>

          {history && history.length > 0 && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              This item has been actioned {history.length} time
              {history.length === 1 ? "" : "s"} before — most recently{" "}
              {history[0].action.toLowerCase()} by {history[0].adminName}.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="resolution-note" className="text-sm font-semibold">
              Resolution note
            </Label>
            <Textarea
              id="resolution-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE}
              rows={3}
              placeholder="What did you decide, and why? The author may read this back one day."
              className="resize-none bg-background text-base"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Required.</span>
              <span className="text-muted-foreground">
                {note.length}/{MAX_NOTE}
              </span>
            </div>
          </div>

          {canRemove ? (
            <div
              className={`rounded-xl border p-3.5 transition-colors ${
                removeContent
                  ? "border-rose-500/40 bg-rose-500/5"
                  : "border-border bg-muted/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label
                    htmlFor="remove-content"
                    className="text-sm font-semibold text-foreground"
                  >
                    Also remove the {label.toLowerCase()}
                  </Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {removeContent
                      ? "The content comes down permanently. This cannot be undone."
                      : "Leave off to close the report and keep the post up."}
                  </p>
                </div>
                <Switch
                  id="remove-content"
                  checked={removeContent}
                  onCheckedChange={setRemoveContent}
                  className="mt-0.5 shrink-0 cursor-pointer"
                />
              </div>

              {removeContent && flag.flaggableType === "COMMENT" && (
                <p className="mt-2.5 flex items-start gap-2 border-t border-rose-500/25 pt-2.5 text-sm text-amber-800 dark:text-amber-200">
                  <MessageSquare aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  The comment row stays and its text is blanked, so replies
                  underneath it survive.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-muted/25 px-3.5 py-2.5 text-sm text-muted-foreground">
              {preview?.missing
                ? "The content is already gone, so there is nothing left to remove."
                : "This content type cannot be taken down from here."}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={!canConfirm}
            className={`cursor-pointer rounded-xl disabled:opacity-50 ${
              removeContent ? "bg-rose-600 text-white hover:bg-rose-700" : ""
            }`}
          >
            {isLoading ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Check aria-hidden="true" className="size-4" />
            )}
            {removeContent ? "Resolve and remove" : "Resolve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
