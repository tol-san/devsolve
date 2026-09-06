"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateWeaknessMutation,
  useUpdateWeaknessMutation,
} from "@/lib/redux/services/adminWeaknessesApi";
import type { Weakness } from "@/lib/redux/services/weaknessesApi";
import {
  weaknessCreateSchema,
  type WeaknessCreateInput,
  type WeaknessCreateValues,
} from "@/lib/validations/weakness";

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const message = (error as { data?: { message?: string } }).data?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function WeaknessFormDialog({
  open,
  onOpenChange,
  weakness,
  initialName,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weakness: Weakness | null;
  initialName?: string;
  session: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <WeaknessForm
          key={session}
          weakness={weakness}
          initialName={initialName}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function WeaknessForm({
  weakness,
  initialName,
  onDone,
}: {
  weakness: Weakness | null;
  initialName?: string;
  onDone: () => void;
}) {
  const isEdit = Boolean(weakness && weakness.id);
  const [createWeakness, { isLoading: isCreating }] = useCreateWeaknessMutation();
  const [updateWeakness, { isLoading: isUpdating }] = useUpdateWeaknessMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WeaknessCreateInput, unknown, WeaknessCreateValues>({
    resolver: zodResolver(weaknessCreateSchema),
    defaultValues: {
      name: weakness?.name ?? initialName ?? "",
      cweId: weakness?.cweId ?? "",
      description: weakness?.description ?? "",
      isActive: weakness?.isActive ?? true,
    },
  });

  const onSubmit = async (values: WeaknessCreateValues) => {
    const body = {
      name: values.name,
      cweId: values.cweId?.trim() ? values.cweId.trim().toUpperCase() : undefined,
      description: values.description?.trim() || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && weakness) {
        await updateWeakness({ id: weakness.id, body }).unwrap();
      } else {
        await createWeakness(body).unwrap();
      }
      toast.success(isEdit ? "Weakness updated." : "Weakness added.");
      onDone();
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          isEdit
            ? "The weakness could not be updated."
            : "The weakness could not be created.",
        ),
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit weakness" : "New weakness"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {isEdit
            ? "Reports already classified against this entry follow the change."
            : "Researchers pick from this catalogue when they classify a report."}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
          <div className="space-y-2">
            <label
              htmlFor="weakness-name"
              className="text-sm font-semibold text-foreground"
            >
              Name
            </label>
            <Input
              id="weakness-name"
              maxLength={255}
              placeholder="e.g. SQL Injection"
              {...register("name")}
              className="h-11 rounded-xl border-border bg-background text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.name?.message && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="weakness-cwe"
              className="text-sm font-semibold text-foreground"
            >
              CWE id
            </label>
            <Input
              id="weakness-cwe"
              maxLength={20}
              placeholder="CWE-89"
              {...register("cweId")}
              className="h-11 rounded-xl border-border bg-background font-mono text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.cweId?.message && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {errors.cweId.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="weakness-description"
            className="text-sm font-semibold text-foreground"
          >
            Description
            <span className="ml-1.5 font-normal text-muted-foreground">
              optional
            </span>
          </label>
          <Textarea
            id="weakness-description"
            rows={4}
            maxLength={2000}
            placeholder="What this class of bug is, so a researcher can tell it apart from its neighbours."
            {...register("description")}
            className="rounded-xl border-border bg-background text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
          {errors.description?.message && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {errors.description.message}
            </p>
          )}
        </div>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Offered on new reports
                </p>
                <p className="text-sm text-muted-foreground">
                  Turn this off to retire the entry. Existing reports keep it;
                  it just stops appearing in the picker.
                </p>
              </div>
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
                aria-label="Offered on new reports"
              />
            </div>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={isSaving}
            className="h-11 cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 cursor-pointer rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add weakness"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export default WeaknessFormDialog;
