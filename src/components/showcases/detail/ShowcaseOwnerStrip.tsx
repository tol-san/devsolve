"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Edit3, Trash2, ShieldAlert, Loader2 } from "lucide-react";
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
import { useDeleteShowcaseMutation } from "@/lib/redux/services/showcasesApi";
import type { ShowcaseViewer } from "@/lib/redux/services/showcasesApi";

interface ShowcaseOwnerStripProps {
  showcaseId: string;
  viewer?: ShowcaseViewer;
}

export function ShowcaseOwnerStrip({
  showcaseId,
  viewer,
}: ShowcaseOwnerStripProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteShowcase, { isLoading: isDeleting }] =
    useDeleteShowcaseMutation();

  if (!viewer?.owner) return null;

  const canEdit = viewer.canEdit;
  const canDelete = viewer.canDelete;
  const isEditUnderReview = viewer.editUnderReview;

  const handleDelete = async () => {
    try {
      await deleteShowcase(showcaseId).unwrap();
      toast.success("Showcase deleted successfully.");
      setDeleteDialogOpen(false);
      router.push("/showcases");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to delete showcase";
      toast.error(msg || "Failed to delete showcase");
    }
  };

  return (
    <section aria-label="Author controls" className="space-y-3">
      {/* Moderator revision notice banner */}
      {isEditUnderReview && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold block">Revision Under Review</span>
            <span>
              Your edit is waiting on a moderator — visitors still see the
              published version.
            </span>
          </div>
        </div>
      )}

      {/* Owner controls strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldAlert className="size-4 text-primary" />
          <span>You are the author of this showcase</span>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/dashboard/showcases/${showcaseId}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Edit3 className="size-3.5 text-primary" />
              <span>Edit Showcase</span>
            </Link>
          )}

          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/40 shadow-2xs"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Showcase?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete this showcase? This action will
              permanently remove the post and its walkthrough steps.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Showcase</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
