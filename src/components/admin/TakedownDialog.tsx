"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, History, Loader2, MessageSquare, Trash2 } from "lucide-react";

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
import { useTakeDownContentMutation } from "@/lib/redux/services/admin/takedownApi";
import { useGetTargetModerationHistoryQuery } from "@/lib/redux/services/admin/moderationActionsApi";
import {
  FLAGGABLE_TYPE_LABELS,
  takedownSchema,
  type TakedownTarget,
} from "@/lib/validations/moderation";
import { messageOf } from "@/lib/discussions/format";

const MAX_REASON = 2000;

interface TakedownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: TakedownTarget;
  targetId: string;
  /** Shown so the admin can see exactly what they are removing. */
  targetTitle?: string | null;
  targetAuthor?: string | null;
  onDone?: () => void;
}

export function TakedownDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
  targetAuthor,
  onDone,
}: TakedownDialogProps) {
  const [reason, setReason] = useState("");
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const [takeDown, { isLoading }] = useTakeDownContentMutation();

  // Clear the typed reason whenever the dialog opens on a different item, so a
  // reason written for one post can never be submitted against another.
  if (open && openedFor !== targetId) {
    setOpenedFor(targetId);
    setReason("");
  }

  // Prior actions on this exact item, so the decision is not made blind.
  const { data: history, isLoading: isLoadingHistory } =
    useGetTargetModerationHistoryQuery(
      { targetType, targetId },
      { skip: !open || !targetId },
    );

  const parsed = useMemo(() => takedownSchema.safeParse({ reason }), [reason]);
  const canConfirm = parsed.success && !isLoading;
  const label = FLAGGABLE_TYPE_LABELS[targetType];

  const onConfirm = async () => {
    if (!parsed.success) return;

    try {
      const result = await takeDown({
        targetType,
        targetId,
        reason: parsed.data.reason,
      }).unwrap();

      if (result.alreadyGone) {
        toast.info("Already removed", {
          description: `That ${label.toLowerCase()} was taken down or deleted before you confirmed.`,
        });
      } else {
        toast.success(`${label} removed`, {
          description: "The action is recorded in the audit trail.",
        });
      }

      onOpenChange(false);
      onDone?.();
    } catch (caught) {
      toast.error(messageOf(caught, `That ${label.toLowerCase()} could not be removed.`));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Trash2 className="size-4" />
            </span>
            Remove this {label.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            This cannot be undone. There is no way to restore the{" "}
            {label.toLowerCase()} once it is removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-bold text-foreground">
              {targetTitle?.trim() || `Untitled ${label.toLowerCase()}`}
            </p>
            {targetAuthor && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                by {targetAuthor}
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {targetId}
            </p>
          </div>

          {targetType === "COMMENT" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
              <MessageSquare
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                The comment row stays and its text is blanked, so replies
                underneath it survive.
              </p>
            </div>
          )}

          <PriorActions
            isLoading={isLoadingHistory}
            count={history?.length ?? 0}
            entries={history ?? []}
          />

          <div className="space-y-1.5">
            <Label htmlFor="takedown-reason" className="text-sm font-semibold">
              Reason for removal
            </Label>
            <Textarea
              id="takedown-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={MAX_REASON}
              rows={3}
              placeholder="Explain what rule this breaks. The author may read this back one day."
              className="resize-none bg-background text-base"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Required — the confirm button stays disabled until you write one.
              </span>
              <span
                className={
                  reason.length > MAX_REASON - 100
                    ? "font-semibold text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }
              >
                {reason.length}/{MAX_REASON}
              </span>
            </div>
          </div>
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
            className="cursor-pointer rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" className="size-4" />
            )}
            Remove permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PriorActions({
  isLoading,
  count,
  entries,
}: {
  isLoading: boolean;
  count: number;
  entries: { id: string; action: string; adminName: string; createdAt: string; reason: string | null }[];
}) {
  if (isLoading) {
    return (
      <div className="h-14 animate-pulse rounded-xl border border-border bg-muted/40" />
    );
  }

  if (count === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
        <History aria-hidden="true" className="size-3.5 shrink-0" />
        No prior moderation on this item.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
        <AlertTriangle aria-hidden="true" className="size-3.5" />
        Actioned before ({count})
      </p>
      <ul className="mt-2 space-y-1.5">
        {entries.slice(0, 3).map((entry) => (
          <li key={entry.id} className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">{entry.action}</span> by{" "}
            {entry.adminName} ·{" "}
            {new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {entry.reason ? (
              <span className="block truncate text-xs opacity-80">
                {entry.reason}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
