"use client";

import React from "react";
import { motion } from "motion/react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="problem-details-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 font-mono text-xs">
              01
            </Badge>
            <div className="flex min-w-0 flex-col gap-0.5">
              <CardTitle>
                <h2
                  id="problem-details-heading"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Problem details
                </h2>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Give the community enough context to understand, diagnose, and reproduce what is going wrong.
              </CardDescription>
            </div>
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

                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {title.length} / 180
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

                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {description.length.toLocaleString()} / 20,000
                </span>
              </div>

              <div className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  Insert template:
                </span>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("expected")}
                  disabled={submitting}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                >
                  Expected vs Actual
                </button>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("steps")}
                  disabled={submitting}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                >
                  Steps to Reproduce
                </button>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => onInsertTemplate("logs")}
                  disabled={submitting}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline underline-offset-2"
                >
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
