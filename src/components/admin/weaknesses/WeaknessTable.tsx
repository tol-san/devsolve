"use client";

import React, { useState } from "react";
import { Loader2, PencilLine, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteWeaknessMutation } from "@/lib/redux/services/adminWeaknessesApi";
import type { Weakness } from "@/lib/redux/services/weaknessesApi";

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function WeaknessTable({
  weaknesses,
  totalCount,
  onEdit,
}: {
  weaknesses: Weakness[];
  totalCount: number;
  onEdit: (weakness: Weakness) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<Weakness | null>(null);
  const [deleteWeakness, { isLoading: isDeleting }] = useDeleteWeaknessMutation();

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteWeakness(pendingDelete.id).unwrap();
      toast.success(`Removed ${pendingDelete.name ?? "the weakness"}.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        errorMessage(error, "The weakness could not be deleted."),
      );
    }
  }

  if (!weaknesses.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="size-6" />
        </span>
        <p className="text-base font-semibold text-foreground">
          {totalCount === 0
            ? "The catalogue is empty"
            : "Nothing matches those filters"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {totalCount === 0
            ? "Add the weaknesses your researchers should classify reports against."
            : "Clear the search or show retired entries to see more."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table className="min-w-3xl">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 sm:px-6">CWE</TableHead>
              <TableHead className="px-4 py-3 sm:px-6">Name</TableHead>
              <TableHead className="px-4 py-3 sm:px-6">Description</TableHead>
              <TableHead className="px-4 py-3 sm:px-6">Status</TableHead>
              <TableHead className="px-4 py-3 text-right sm:px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weaknesses.map((weakness, index) => {
              const isRetired = weakness.isActive === false;

              return (
                <MotionTableRow
                  key={weakness.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index, 12) * 0.02 }}
                >
                  <TableCell className="px-4 py-3.5 sm:px-6">
                      {weakness.cweId ? (
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {weakness.cweId}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                  </TableCell>

                  <TableCell className="px-4 py-3.5 whitespace-normal sm:px-6">
                    <span className="text-sm font-semibold text-foreground">
                      {weakness.name}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-md px-4 py-3.5 whitespace-normal sm:px-6">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {weakness.description || "—"}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3.5 sm:px-6">
                    <Badge
                      variant={isRetired ? "secondary" : "tag"}
                      className="rounded-lg text-sm"
                    >
                      {isRetired ? "Retired" : "Active"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3.5 text-right sm:px-6">
                    <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${weakness.name}`}
                          onClick={() => onEdit(weakness)}
                          className="cursor-pointer rounded-xl"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${weakness.name}`}
                          onClick={() => setPendingDelete(weakness)}
                          className="cursor-pointer rounded-xl text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                    </div>
                  </TableCell>
                </MotionTableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="px-4 py-3 text-sm font-medium text-muted-foreground sm:px-6"
              >
                Showing {weaknesses.length} of {totalCount}{" "}
                {totalCount === 1 ? "weakness" : "weaknesses"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Reports already classified against it keep the name in their
              write-up, but it will no longer be offered on new ones. Retiring
              it instead keeps the link intact — edit it and switch it to
              retired.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default WeaknessTable;
