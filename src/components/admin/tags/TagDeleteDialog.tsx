"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTagMutation, type TagResponse } from "@/lib/redux/services/tagsApi";

interface TagDeleteDialogProps {
  tag: TagResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TagDeleteDialog({
  tag,
  open,
  onOpenChange,
  onSuccess,
}: TagDeleteDialogProps) {
  const [force, setForce] = useState(false);
  const [deleteTag, { isLoading }] = useDeleteTagMutation();

  if (!tag) return null;

  const inUse = (tag.usageCount ?? 0) > 0;

  const handleDelete = async () => {
    try {
      const res = await deleteTag({
        id: tag.id,
        force: inUse ? force : false,
      }).unwrap();

      const unlinkedTotal =
        (res.unlinkedProblems ?? 0) +
        (res.unlinkedShowcases ?? 0) +
        (res.unlinkedRevisions ?? 0);

      if (unlinkedTotal > 0) {
        toast.success(
          `Tag #${tag.name} removed and unlinked from ${unlinkedTotal} item${
            unlinkedTotal === 1 ? "" : "s"
          }.`,
        );
      } else {
        toast.success(`Tag #${tag.name} deleted successfully.`);
      }

      onSuccess?.();
      onOpenChange(false);
      setForce(false);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete tag.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border text-card-foreground p-6 shadow-xl space-y-4">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Trash2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Delete Tag
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Permanently remove{" "}
                <span className="font-semibold text-foreground font-mono">
                  #{tag.name}
                </span>{" "}
                from the platform.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {inUse ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4.5 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold">This tag is actively used</p>
                <p>
                  It is currently tagged on{" "}
                  <strong className="font-semibold">{tag.usageCount}</strong> community
                  problem{tag.usageCount === 1 ? "" : "s"} or showcase
                  {tag.usageCount === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
              <div className="space-y-0.5 pr-3">
                <label
                  htmlFor="force-unlink"
                  className="text-xs font-bold text-foreground cursor-pointer"
                >
                  Force delete and unlink
                </label>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Automatically removes this tag from all existing discussions and
                  showcases.
                </p>
              </div>
              <Switch
                id="force-unlink"
                checked={force}
                onCheckedChange={setForce}
                aria-label="Force delete and unlink"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            This tag has <span className="font-semibold text-foreground">0</span> active
            references. Deleting it is safe and will immediately remove it from tag
            suggestions.
          </p>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl h-10 text-xs font-semibold border-border bg-card text-foreground cursor-pointer hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading || (inUse && !force)}
            className="rounded-xl h-10 text-xs font-bold cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-2xs disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="size-4 mr-1.5" />
            )}
            <span>Delete Tag</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
