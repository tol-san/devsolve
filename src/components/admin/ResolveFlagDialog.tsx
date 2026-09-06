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
import {
  useResolveFlagMutation,
  useResolveFlagTargetMutation,
  type FlagResponse,
} from "@/lib/redux/services/admin/adminFlagsApi";
import { useGetTargetModerationHistoryQuery } from "@/lib/redux/services/admin/moderationActionsApi";
import {
  FLAGGABLE_TYPE_LABELS,
  flagResolveSchema,
  isTakedownTarget,
  type AdminFlaggableType,
  type FlagTarget,
} from "@/lib/validations/moderation";
import { messageOf } from "@/lib/discussions/format";

const MAX_NOTE = 2000;

export interface BulkTargetDescriptor {
  flaggableType: AdminFlaggableType;
  flaggableId: string;
  target: FlagTarget;
  reportCount?: number;
}

interface ResolveFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag?: FlagResponse | null;
  bulkTarget?: BulkTargetDescriptor | null;
  onDone?: () => void;
}

/**
 * Resolving closes reports. Ticking "remove the content" also takes the post
 * down for good. Supports single report resolution or target-level bulk resolution.
 */
export function ResolveFlagDialog({
  open,
  onOpenChange,
  flag,
  bulkTarget,
  onDone,
}: ResolveFlagDialogProps) {
  const [note, setNote] = useState("");
  const [removeContent, setRemoveContent] = useState(false);
  const [resolveSingleFlag, { isLoading: isSingleLoading }] =
    useResolveFlagMutation();
  const [resolveTargetFlags, { isLoading: isBulkLoading }] =
    useResolveFlagTargetMutation();

  const isBulk = Boolean(bulkTarget);
  const isLoading = isSingleLoading || isBulkLoading;

  const flaggableType = (bulkTarget?.flaggableType ??
    flag?.flaggableType) as AdminFlaggableType;
  const flaggableId = bulkTarget?.flaggableId ?? flag?.flaggableId ?? "";
  const target: FlagTarget | undefined = bulkTarget?.target ?? flag?.target;

  const label = FLAGGABLE_TYPE_LABELS[flaggableType] ?? flaggableType;
  const isDeleted = target?.contentStatus === "DELETED";
  const canRemove = isTakedownTarget(flaggableType) && !isDeleted;

  const { data: history } = useGetTargetModerationHistoryQuery(
    { targetType: flaggableType, targetId: flaggableId },
    { skip: !open || !flaggableId },
  );

  const parsed = useMemo(
    () => flagResolveSchema.safeParse({ resolutionNote: note, removeContent }),
    [note, removeContent],
  );
  const canConfirm = parsed.success && !isLoading;

  const onConfirm = async () => {
    if (!parsed.success) return;

    try {
      if (isBulk && bulkTarget) {
        const result = await resolveTargetFlags({
          flaggableType: bulkTarget.flaggableType,
          flaggableId: bulkTarget.flaggableId,
          resolutionNote: parsed.data.resolutionNote,
          removeContent: parsed.data.removeContent,
        }).unwrap();

        if (result.affected === 0) {
          toast.info("Already handled", {
            description: "Another moderator already handled these reports.",
          });
        } else {
          toast.success(
            removeContent
              ? `${label} removed and ${result.affected} report${result.affected === 1 ? "" : "s"} resolved`
              : `${result.affected} report${result.affected === 1 ? "" : "s"} resolved`,
            {
              description: removeContent
                ? "The reports are closed and the content is down."
                : "The reports are closed and the content stays up.",
            },
          );
        }
      } else if (flag) {
        await resolveSingleFlag({
          id: flag.id,
          resolutionNote: parsed.data.resolutionNote,
          removeContent: parsed.data.removeContent,
        }).unwrap();

        toast.success(removeContent ? `${label} removed` : "Report resolved", {
          description: removeContent
            ? "The report is closed and the content is down."
            : "The report is closed and the content stays up.",
        });
      }

      onOpenChange(false);
      onDone?.();
    } catch (caught: unknown) {
      const err = caught as { status?: number; data?: { message?: string } };
      if (err?.status === 409) {
        toast.info("Already reviewed", {
          description: "This report has already been reviewed by another moderator.",
        });
        onOpenChange(false);
        onDone?.();
        return;
      }
      toast.error(messageOf(caught, "That report could not be resolved."));
    }
  };

  const title =
    target?.title ||
    target?.snippet ||
    (isDeleted ? "Deleted content" : `Untitled ${label.toLowerCase()}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isBulk
              ? `Resolve all reports on this ${label.toLowerCase()}`
              : "Resolve this report"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Resolves all open reports on this item at once. The note is recorded in the moderation audit trail.`
              : `Closes the report. The note is kept in the audit trail as the reason.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              {bulkTarget?.reportCount && bulkTarget.reportCount > 1 && (
                <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {bulkTarget.reportCount} reports
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-bold text-foreground">
              {title}
            </p>
            {target?.authorName && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                by {target.authorName}
                {target.contentStatus ? ` · ${target.contentStatus}` : ""}
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
                      : "Leave off to close reports and keep the post up."}
                  </p>
                </div>
                <Switch
                  id="remove-content"
                  checked={removeContent}
                  onCheckedChange={setRemoveContent}
                  className="mt-0.5 shrink-0 cursor-pointer"
                />
              </div>

              {removeContent && flaggableType === "COMMENT" && (
                <p className="mt-2.5 flex items-start gap-2 border-t border-rose-500/25 pt-2.5 text-sm text-amber-800 dark:text-amber-200">
                  <MessageSquare aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  The comment row stays and its text is blanked, so replies
                  underneath it survive.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-muted/25 px-3.5 py-2.5 text-sm text-muted-foreground">
              {isDeleted
                ? "The content is already deleted, so there is nothing left to remove."
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
            {removeContent
              ? isBulk
                ? "Resolve all and remove"
                : "Resolve and remove"
              : isBulk
                ? "Resolve all reports"
                : "Resolve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

