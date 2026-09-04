"use client";

import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hostOf, type CreateShowcaseFormValues } from "@/lib/validations/showcase";

const LABEL_HINTS = [
  "Figma file",
  "API docs",
  "Design system",
  "Postman collection",
];

export function ResourceLinksField() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateShowcaseFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resourceLinks",
  });

  const rows = watch("resourceLinks") ?? [];
  const rowErrors = Array.isArray(errors.resourceLinks)
    ? errors.resourceLinks
    : undefined;

  return (
    <div className="space-y-3">
      {fields.length > 0 && (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => {
              const host = hostOf(rows[index]?.url ?? "");
              const error =
                rowErrors?.[index]?.label?.message ??
                rowErrors?.[index]?.url?.message;

              return (
                <motion.div
                  key={field.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <Input
                      placeholder={
                        LABEL_HINTS[index % LABEL_HINTS.length] ?? "Label"
                      }
                      aria-label={`Resource ${index + 1} label`}
                      {...register(`resourceLinks.${index}.label`)}
                      className="h-11 w-40 shrink-0 rounded-xl border-border bg-background text-base"
                    />

                    <div className="relative flex-1">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        inputMode="url"
                        placeholder="figma.com/file/…"
                        aria-label={`Resource ${index + 1} URL`}
                        {...register(`resourceLinks.${index}.url`)}
                        className="h-11 rounded-xl border-border bg-background pl-9 text-base"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove resource ${index + 1}`}
                      className="mt-1.5 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {error ? (
                    <p className="pl-1 text-sm font-medium text-destructive">
                      {error}
                    </p>
                  ) : host ? (
                    <span className="ml-42 inline-flex items-center rounded-lg bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
                      {host}
                    </span>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ key: `res-${Date.now()}`, label: "", url: "" })}
        className="h-11 rounded-xl text-sm font-semibold"
      >
        <Plus data-icon="inline-start" />
        Add resource link
      </Button>
    </div>
  );
}
