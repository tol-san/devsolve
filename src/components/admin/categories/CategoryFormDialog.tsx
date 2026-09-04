"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryIconField, type IconIntent } from "./CategoryIconField";
import {
  CATEGORY_SCOPES,
  categoryCreateSchema,
  type CategoryCreateInput,
  type CategoryCreateValues,
} from "@/lib/validations/category";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryIconMutation,
  useRemoveCategoryIconMutation,
  type CategoryResponse,
} from "@/lib/redux/services/categoriesApi";

function errorMessage(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "data" in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (typeof message === "string" && message) return message;
  }
  return undefined;
}

interface CategoryFormBodyProps {
  category: CategoryResponse | null;
  onClose: () => void;
}

function CategoryFormBody({ category, onClose }: CategoryFormBodyProps) {
  const isEdit = Boolean(category);
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [uploadIcon, { isLoading: uploadingIcon }] =
    useUploadCategoryIconMutation();
  const [removeIcon, { isLoading: removingIcon }] =
    useRemoveCategoryIconMutation();

  const saving = creating || updating || uploadingIcon || removingIcon;

  const [icon, setIcon] = useState<IconIntent>({ kind: "keep" });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryCreateInput, unknown, CategoryCreateValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: category
      ? {
          name: category.name,
          scope: category.scope,
          description: category.description ?? "",
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive ?? true,
        }
      : {
          name: "",
          scope: "PROBLEM",
          description: "",
          sortOrder: 0,
          isActive: true,
        },
  });

  const applyIcon = async (id: string) => {
    if (icon.kind === "file") {
      await uploadIcon({ id, file: icon.file }).unwrap();
    } else if (icon.kind === "remove") {
      await removeIcon(id).unwrap();
    }
  };

  const onSubmit = async (values: CategoryCreateValues) => {
    const body = {
      ...values,
      iconUrl: icon.kind === "url" ? icon.url : undefined,
    };

    let saved: CategoryResponse;

    try {
      saved = category
        ? await updateCategory({ id: category.id, body }).unwrap()
        : await createCategory(body).unwrap();
    } catch (error) {
      toast.error(
        isEdit ? "Failed to update category." : "Failed to create category.",
        { description: errorMessage(error) },
      );
      return;
    }

    try {
      await applyIcon(saved.id);
    } catch (error) {
      toast.warning(
        isEdit
          ? "Category updated, but the icon didn't."
          : "Category created, but the icon didn't.",
        {
          description:
            errorMessage(error) ?? "Reopen it to try the icon again.",
        },
      );
      onClose();
      return;
    }

    toast.success(isEdit ? "Category updated." : "Category created.");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit category" : "New category"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {isEdit
            ? "Changes apply everywhere this category is already used."
            : "Categories group problems and showcases on the public index."}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-semibold text-foreground"
            >
              Name
            </label>
            <Input
              id="category-name"
              maxLength={50}
              placeholder="e.g. API Security"
              {...register("name")}
              className="h-11 rounded-xl border-border bg-background text-foreground text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.name?.message && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category-scope"
              className="text-sm font-semibold text-foreground"
            >
              Scope
            </label>
            <Controller
              control={control}
              name="scope"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger
                    id="category-scope"
                    className="h-11 w-full rounded-xl border-border bg-background text-foreground text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground p-1 shadow-lg">
                    {CATEGORY_SCOPES.map((scope) => (
                      <SelectItem
                        key={scope}
                        value={scope}
                        className="cursor-pointer rounded-lg py-2 text-sm font-medium capitalize hover:bg-muted"
                      >
                        {scope.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.scope?.message && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {errors.scope.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category-description"
            className="text-sm font-semibold text-foreground"
          >
            Description
          </label>
          <Textarea
            id="category-description"
            rows={3}
            maxLength={500}
            placeholder="What belongs in this category?"
            {...register("description")}
            className="rounded-xl border-border bg-background text-foreground text-sm focus-visible:ring-2 focus-visible:ring-primary"
          />
          {errors.description?.message && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <CategoryIconField
            currentUrl={category?.iconUrl}
            value={icon}
            onChange={setIcon}
          />

          <div className="space-y-2">
            <label
              htmlFor="category-sort"
              className="text-sm font-semibold text-foreground"
            >
              Sort order
            </label>
            <Input
              id="category-sort"
              type="number"
              min={0}
              {...register("sortOrder")}
              className="h-11 rounded-xl border-border bg-background text-foreground text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.sortOrder?.message && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {errors.sortOrder.message}
              </p>
            )}
          </div>
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Active
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inactive categories stay on existing posts but disappear from
                  the pickers.
                </p>
              </div>
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 rounded-xl border-border bg-card text-sm font-semibold text-foreground hover:bg-accent cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryResponse | null;
  session: number;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  session,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <CategoryFormBody
          key={session}
          category={category ?? null}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
