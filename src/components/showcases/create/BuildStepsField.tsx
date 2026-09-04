"use client";

import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  ImageIcon,
  Network,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { CodeSnippetField } from "./CodeSnippetField";
import { ImageDropField } from "./ImageDropField";
import { DiagramBuilderModal } from "@/components/showcases/diagram/DiagramBuilderModal";
import type { AppNode } from "@/components/showcases/diagram/types";
import type { Edge } from "@xyflow/react";
import type { CreateShowcaseFormValues } from "@/lib/validations/showcase";
import { cn } from "@/lib/utils";

const newKey = () =>
  `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const createEmptyStep = () => ({
  key: newKey(),
  serverId: undefined,
  title: "",
  description: "",
  codeSnippet: "",
  codeLanguage: "typescript",
  imageUrl: "",
  diagramUrl: "",
  imageFile: undefined,
  diagramFile: undefined,
});

export function BuildStepsField() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateShowcaseFormValues>();

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "steps",
  });

  const [open, setOpen] = useState<string[]>(() =>
    fields.length ? [fields[0].key] : [],
  );
  const [diagramModalStepIndex, setDiagramModalStepIndex] = useState<number | null>(null);
  const [stepDiagrams, setStepDiagrams] = useState<
    Record<string, { nodes: AppNode[]; edges: Edge[] }>
  >({});

  const toggle = (key: string) =>
    setOpen((current) =>
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key],
    );

  const addStep = () => {
    const step = createEmptyStep();
    append(step);
    setOpen((current) => [...current, step.key]);
  };

  const duplicateStep = (index: number) => {
    const source = watch(`steps.${index}`);
    const copy = {
      ...source,
      key: newKey(),
      serverId: undefined,
      title: `${source.title} (copy)`,
    };
    insert(index + 1, copy);
    setOpen((current) => [...current, copy.key]);
  };

  const steps = watch("steps") ?? [];
  const stepErrors = errors.steps;

  const readyCount = steps.filter(
    (step) => step?.title?.trim() && step?.description?.trim(),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Walk through how it was built. At least one step is required.
        </p>
        <span
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums transition-colors",
            readyCount === fields.length
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {readyCount}/{fields.length} ready
        </span>
      </div>

      {typeof stepErrors?.message === "string" && (
        <p className="text-sm font-medium text-destructive">{stepErrors.message}</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const isOpen = open.includes(field.key);
          const step = steps[index];
          const rowError = Array.isArray(stepErrors)
            ? stepErrors[index]
            : undefined;
          const isReady = Boolean(
            step?.title?.trim() && step?.description?.trim(),
          );

          return (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "overflow-hidden rounded-xl border bg-card text-card-foreground transition-colors",
                rowError
                  ? "border-destructive/50"
                  : isOpen
                    ? "border-primary/40"
                    : "border-border",
              )}
            >
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <span className="relative shrink-0">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-colors duration-300",
                      isReady
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>

                  {isReady && (
                    <motion.span
                      aria-hidden
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-background text-primary ring-1 ring-primary/30"
                    >
                      <Check className="size-2.5" strokeWidth={4} />
                    </motion.span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => toggle(field.key)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "truncate text-base font-semibold",
                      step?.title
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step?.title || "Untitled step"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  {step?.codeSnippet ? (
                    <Code2 className="hidden size-4 text-muted-foreground sm:block" />
                  ) : null}
                  {step?.imageUrl || step?.imageFile ? (
                    <ImageIcon className="size-4 text-muted-foreground" />
                  ) : null}
                  {step?.diagramUrl || step?.diagramFile ? (
                    <Network className="size-4 text-muted-foreground" />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => duplicateStep(index)}
                    aria-label={`Duplicate step ${index + 1}`}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Copy className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label={`Delete step ${index + 1}`}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div className="space-y-5 border-t border-border p-4 sm:p-5">
                      <div className="space-y-2">
                        <label
                          htmlFor={`step-title-${field.id}`}
                          className="text-sm font-semibold text-foreground"
                        >
                          Step title
                        </label>
                        <Input
                          id={`step-title-${field.id}`}
                          maxLength={255}
                          placeholder="e.g. Wire the OAuth callback"
                          {...register(`steps.${index}.title`)}
                          className="h-11 rounded-xl border-border bg-background text-base"
                        />
                        {rowError?.title?.message && (
                          <p className="text-sm font-medium text-destructive">
                            {rowError.title.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                          Description
                        </label>
                        <MarkdownEditor
                          value={step?.description ?? ""}
                          onChange={(next) =>
                            setValue(`steps.${index}.description`, next ?? "", {
                              shouldValidate: true,
                            })
                          }
                          placeholder="What happens in this step, and why?"
                          height={220}
                          error={Boolean(rowError?.description)}
                        />
                        {rowError?.description?.message && (
                          <p className="text-sm font-medium text-destructive">
                            {rowError.description.message}
                          </p>
                        )}
                      </div>

                      <CodeSnippetField
                        value={step?.codeSnippet ?? ""}
                        language={step?.codeLanguage ?? "typescript"}
                        onChange={(next) =>
                          setValue(`steps.${index}.codeSnippet`, next)
                        }
                        onLanguageChange={(next) =>
                          setValue(`steps.${index}.codeLanguage`, next)
                        }
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <ImageDropField
                          compact
                          label="Screenshot"
                          hint="Optional · PNG, JPG or WebP"
                          aspectClassName="aspect-video"
                          value={step?.imageUrl}
                          onChange={(url) =>
                            setValue(`steps.${index}.imageUrl`, url)
                          }
                          file={step?.imageFile ?? null}
                          onFileChange={(next) =>
                            setValue(`steps.${index}.imageFile`, next ?? undefined)
                          }
                        />
                        <ImageDropField
                          compact
                          label="Diagram"
                          hint="Optional · architecture or flow"
                          aspectClassName="aspect-video"
                          allowDraw
                          onOpenDraw={() => setDiagramModalStepIndex(index)}
                          value={step?.diagramUrl}
                          onChange={(url) =>
                            setValue(`steps.${index}.diagramUrl`, url)
                          }
                          file={step?.diagramFile ?? null}
                          onFileChange={(next) =>
                            setValue(
                              `steps.${index}.diagramFile`,
                              next ?? undefined,
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addStep}
        className="h-12 w-full rounded-xl border-2 border-dashed border-border bg-background text-base font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-primary"
      >
        <Plus data-icon="inline-start" />
        Add step
      </Button>

      <DiagramBuilderModal
        open={diagramModalStepIndex !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDiagramModalStepIndex(null);
        }}
        stepTitle={
          diagramModalStepIndex !== null
            ? steps[diagramModalStepIndex]?.title ||
              `Step ${diagramModalStepIndex + 1}`
            : undefined
        }
        initialNodes={
          diagramModalStepIndex !== null && fields[diagramModalStepIndex]
            ? stepDiagrams[fields[diagramModalStepIndex].key]?.nodes ?? []
            : []
        }
        initialEdges={
          diagramModalStepIndex !== null && fields[diagramModalStepIndex]
            ? stepDiagrams[fields[diagramModalStepIndex].key]?.edges ?? []
            : []
        }
        initialDiagramUrl={
          diagramModalStepIndex !== null
            ? steps[diagramModalStepIndex]?.diagramUrl
            : undefined
        }
        initialFile={
          diagramModalStepIndex !== null
            ? (steps[diagramModalStepIndex]?.diagramFile as File | undefined)
            : undefined
        }
        onSaveDiagram={(file, previewUrl, nodes, edges) => {
          if (diagramModalStepIndex !== null) {
            const currentKey = fields[diagramModalStepIndex]?.key;
            if (currentKey) {
              setStepDiagrams((prev) => ({
                ...prev,
                [currentKey]: { nodes, edges },
              }));
              setOpen((cur) =>
                cur.includes(currentKey) ? cur : [...cur, currentKey],
              );
            }
            setValue(`steps.${diagramModalStepIndex}.diagramFile`, file, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue(`steps.${diagramModalStepIndex}.diagramUrl`, "", {
              shouldDirty: true,
            });
          }
        }}
      />
    </div>
  );
}
