"use client";

import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Pencil, Tags, Trash2 } from "lucide-react";
import {
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  type CategoryResponse,
} from "@/lib/redux/services/categoriesApi";

interface CategoryTableProps {
  categories: CategoryResponse[];
  totalCount?: number;
  onEdit: (category: CategoryResponse) => void;
}

function CategoryIcon({ url }: { url?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      {url && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt=""
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <Tags className="size-4 text-slate-300 dark:text-slate-600" />
      )}
    </span>
  );
}

export function CategoryTable({
  categories,
  totalCount,
  onEdit,
}: CategoryTableProps) {
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [pendingDelete, setPendingDelete] = useState<CategoryResponse | null>(
    null,
  );

  const toggleActive = async (category: CategoryResponse, next: boolean) => {
    try {
      await updateCategory({
        id: category.id,
        body: { isActive: next },
      }).unwrap();
      toast.success(next ? "Category activated." : "Category deactivated.");
    } catch {
      toast.error("Failed to update the category.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete.id).unwrap();
      toast.success("Category deleted.");
      setPendingDelete(null);
    } catch {
      toast.error("Failed to delete the category.", {
        description: "It may still be in use by existing posts.",
      });
    }
  };

  const shown = categories.length;
  const total = totalCount ?? shown;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">
                Category
              </TableHead>
              <TableHead className="px-4">
                Scope
              </TableHead>
              <TableHead className="hidden px-4 lg:table-cell">
                Description
              </TableHead>
              <TableHead className="px-4">
                Order
              </TableHead>
              <TableHead className="px-4">
                Active
              </TableHead>
              <TableHead className="px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {shown === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 p-0 text-center">
                  <Card className="gap-3 border-none bg-transparent py-8 shadow-none">
                    <CardHeader className="grid justify-items-center gap-3 px-8 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Tags className="size-6" />
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        {total === 0
                          ? "No categories yet"
                          : "No matching categories found"}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {total === 0
                          ? "Create one to give problems and showcases somewhere to live."
                          : "Try another search, scope, or state filter."}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </TableCell>
              </TableRow>
            )}

            <AnimatePresence initial={false}>
              {categories.map((category) => (
                <MotionTableRow
                  key={category.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="last:border-0"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3 py-0.5">
                      <CategoryIcon url={category.iconUrl} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {category.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="rounded-lg capitalize bg-muted text-muted-foreground border-border">
                      {category.scope.toLowerCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden max-w-md px-4 py-3 lg:table-cell">
                    <p className="truncate text-sm text-muted-foreground">
                      {category.description || "—"}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm font-medium text-muted-foreground tabular-nums">
                    {category.sortOrder ?? "—"}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Switch
                      checked={category.isActive ?? false}
                      onCheckedChange={(next) => toggleActive(category, next)}
                      aria-label={`${category.isActive ? "Deactivate" : "Activate"} ${category.name}`}
                    />
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(category)}
                        aria-label={`Delete ${category.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>

        {shown > 0 && (
          <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/40 px-4 py-3">
            <div className="text-sm font-medium text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {shown}
              </span>{" "}
              of{" "}
              <span className="font-bold text-foreground">
                {total}
              </span>{" "}
              {total === 1 ? "category" : "categories"}
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{pendingDelete?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Posts already filed under this category keep pointing at it. If
              you only want it out of the pickers, switch it to inactive
              instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
