"use client";

import React from "react";
import { motion } from "motion/react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Columns2, FileText, ListOrdered, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { ProblemDuplicatePanel } from "@/components/discussions/create/ProblemDuplicatePanel";
import { cn } from "@/lib/utils";
import {
  CARD_CLASS,
  CONTROL_CLASS,
  type ProblemFormInput,
} from "./types-and-constants";

interface ProblemDetailsSectionProps {
  control: Control<ProblemFormInput, unknown>;
  register: UseFormRegister<ProblemFormInput>;
  errors: FieldErrors<ProblemFormInput>;
  submitting: boolean;
  title: string;
  description: string;
  errorMessage: string;
  problemId?: string;
  onInsertTemplate: (template: "expected" | "steps" | "logs") => void;
}

export function ProblemDetailsSection({
  control,
  register,
  errors,
  submitting,
  title,
  description,
  errorMessage,
  problemId,
  onInsertTemplate,
}: ProblemDetailsSectionProps) {
  const isTitleValid = title.trim().length >= 10 && title.trim().length <= 180;
  const isDescValid = description.trim().length >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card
        id="section-details"
        className={CARD_CLASS}
        aria-labelledby="problem-details-heading"
      >
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground font-bold">01.</span>
                  <h2
                    id="problem-details-heading"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    Problem Details
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Give the community enough context to understand, diagnose, and reproduce what is going wrong.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="self-start sm:self-auto shrink-0 border-primary/25 bg-primary/10 text-primary text-xs font-semibold"
            >
              Required
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <FieldGroup className="space-y-6">
            <Field
              data-invalid={Boolean(errors.title)}
              data-disabled={submitting || undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel
                  htmlFor="problem-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Problem title
                  <span
                    aria-hidden="true"
                    className="text-destructive font-bold ml-0.5"
                  >
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </FieldLabel>

                <span
                  className={cn(
                    "text-xs font-mono tabular-nums transition-colors",
                    isTitleValid
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {title.length} / 180 {title.length < 10 && "(min 10)"}
                </span>
              </div>

              <Input
                id="problem-title"
                maxLength={180}
                placeholder="e.g. OAuth callback intermittently loses PKCE state during redirect"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? "problem-title-error" : "problem-title-help"
                }
                required
                disabled={submitting}
                className={CONTROL_CLASS}
                {...register("title")}
              />

              <FieldDescription id="problem-title-help">
                Use 10–180 characters. Name the specific behavior and conditions rather than only the symptom.
              </FieldDescription>

              {errors.title?.message && (
                <FieldError id="problem-title-error">
                  {errors.title.message}
                </FieldError>
              )}

              <ProblemDuplicatePanel
                title={title}
                description={description}
                errorMessage={errorMessage}
                excludeId={problemId}
              />
            </Field>

            <Field
              data-invalid={Boolean(errors.description)}
              data-disabled={submitting || undefined}
              className="pt-2"
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel
                  htmlFor="problem-description"
                  className="text-sm font-semibold text-foreground"
                >
                  Description
                  <span
                    aria-hidden="true"
                    className="text-destructive font-bold ml-0.5"
                  >
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </FieldLabel>

                <span
                  className={cn(
                    "text-xs font-mono tabular-nums transition-colors",
                    isDescValid
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {description.length.toLocaleString()} / 20,000 {description.length < 30 && "(min 30)"}
                </span>
              </div>

              {/* Template Insertion Chips */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Insert template:
                </span>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("expected")}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-border cursor-pointer disabled:opacity-50"
                >
                  <Columns2 className="size-3 text-primary" />
                  Expected vs Actual
                </button>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("steps")}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-border cursor-pointer disabled:opacity-50"
                >
                  <ListOrdered className="size-3 text-primary" />
                  Steps to Reproduce
                </button>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("logs")}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-border cursor-pointer disabled:opacity-50"
                >
                  <Terminal className="size-3 text-primary" />
                  Error / Stack Trace
                </button>
              </div>

              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <MarkdownEditor
                    id="problem-description"
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value ?? "")}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    placeholder="Explain what you expected, what happened instead, and the smallest set of steps that reproduces it."
                    height={380}
                    maxLength={20_000}
                    error={Boolean(errors.description)}
                    disabled={submitting}
                    required
                    ariaDescribedBy={
                      errors.description
                        ? "problem-description-error"
                        : "problem-description-help"
                    }
                  />
                )}
              />

              <FieldDescription id="problem-description-help">
                Markdown and syntax highlighting are supported (minimum 30 characters). Include error output, environment details, and reproduction steps.
              </FieldDescription>

              {errors.description?.message && (
                <FieldError id="problem-description-error">
                  {errors.description.message}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
