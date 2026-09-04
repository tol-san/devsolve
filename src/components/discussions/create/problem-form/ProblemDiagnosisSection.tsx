"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CARD_CLASS,
  CONTROL_CLASS,
  MAX_ENVIRONMENTS,
  MAX_REPRODUCTION_STEPS,
  type ProblemFormInput,
} from "./types-and-constants";

interface ProblemDiagnosisSectionProps {
  register: UseFormRegister<ProblemFormInput>;
  errors: FieldErrors<ProblemFormInput>;
  submitting: boolean;
  isBug: boolean;
  expectedBehavior: string;
  actualBehavior: string;
  errorMessage: string;
  attemptsTried: string;
  reproductionSteps: string[];
  onSetSteps: (steps: string[]) => void;
  environmentFields: { id: string }[];
  onAppendEnvironment: (item: { technology: string; version: string }) => void;
  onRemoveEnvironment: (index: number) => void;
}

export function ProblemDiagnosisSection({
  register,
  errors,
  submitting,
  isBug,
  expectedBehavior,
  actualBehavior,
  errorMessage,
  attemptsTried,
  reproductionSteps,
  onSetSteps,
  environmentFields,
  onAppendEnvironment,
  onRemoveEnvironment,
}: ProblemDiagnosisSectionProps) {
  const textareaClass =
    "rounded-xl border-border bg-background text-foreground text-base shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="problem-diagnosis-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 font-mono text-xs">
              03
            </Badge>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle>
                <h2
                  id="problem-diagnosis-heading"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Diagnosis
                </h2>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                {isBug
                  ? "Required for Bug reports: expected behaviour, actual behaviour, and at least one reproduction step are mandatory."
                  : "Optional for general questions, but recommended: problems with clear steps and context get answered far sooner."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <FieldGroup className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                data-invalid={Boolean(errors.expectedBehavior)}
                data-disabled={submitting || undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="problem-expected" className="text-sm font-semibold text-foreground">
                    Expected behaviour
                    {isBug && (
                      <span
                        aria-hidden="true"
                        className="text-destructive font-bold ml-0.5"
                      >
                        *
                      </span>
                    )}
                  </FieldLabel>
                  <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                    {expectedBehavior.length}/5,000
                  </Badge>
                </div>
                <Textarea
                  id="problem-expected"
                  maxLength={5_000}
                  rows={4}
                  placeholder="What should have happened."
                  aria-invalid={Boolean(errors.expectedBehavior)}
                  disabled={submitting}
                  className={textareaClass}
                  {...register("expectedBehavior")}
                />
                <FieldError>{errors.expectedBehavior?.message}</FieldError>
              </Field>

              <Field
                data-invalid={Boolean(errors.actualBehavior)}
                data-disabled={submitting || undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="problem-actual" className="text-sm font-semibold text-foreground">
                    Actual behaviour
                    {isBug && (
                      <span
                        aria-hidden="true"
                        className="text-destructive font-bold ml-0.5"
                      >
                        *
                      </span>
                    )}
                  </FieldLabel>
                  <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                    {actualBehavior.length}/5,000
                  </Badge>
                </div>
                <Textarea
                  id="problem-actual"
                  maxLength={5_000}
                  rows={4}
                  placeholder="What happens instead."
                  aria-invalid={Boolean(errors.actualBehavior)}
                  disabled={submitting}
                  className={textareaClass}
                  {...register("actualBehavior")}
                />
                <FieldError>{errors.actualBehavior?.message}</FieldError>
              </Field>
            </div>

            <FieldSet>
              <div className="flex items-center justify-between gap-3">
                <FieldLegend className="text-sm font-semibold text-foreground">
                  Steps to reproduce
                  {isBug && (
                    <span
                      aria-hidden="true"
                      className="text-destructive font-bold ml-0.5"
                    >
                      *
                    </span>
                  )}
                </FieldLegend>
                <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                  {reproductionSteps.length}/{MAX_REPRODUCTION_STEPS}
                </Badge>
              </div>

              {reproductionSteps.length === 0 ? (
                <FieldDescription>
                  No steps yet. The smallest sequence that triggers it is the most useful thing on this page.
                </FieldDescription>
              ) : (
                <FieldGroup className="gap-3 mt-2">
                  <AnimatePresence initial={false}>
                    {reproductionSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold tabular-nums text-muted-foreground"
                        >
                          {index + 1}
                        </span>
                        <Input
                          aria-label={`Step ${index + 1}`}
                          maxLength={1_000}
                          value={step}
                          placeholder="e.g. Sign in, then refresh the callback page"
                          disabled={submitting}
                          className={cn(CONTROL_CLASS, "flex-1")}
                          onChange={(event) => {
                            const next = [...reproductionSteps];
                            next[index] = event.target.value;
                            onSetSteps(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-lg"
                          aria-label={`Remove step ${index + 1}`}
                          disabled={submitting}
                          onClick={() =>
                            onSetSteps(
                              reproductionSteps.filter((_, i) => i !== index),
                            )
                          }
                          className="shrink-0 rounded-xl cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </FieldGroup>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={
                  submitting ||
                  reproductionSteps.length >= MAX_REPRODUCTION_STEPS
                }
                onClick={() => onSetSteps([...reproductionSteps, ""])}
                className="mt-3 w-full rounded-xl sm:w-auto sm:self-start cursor-pointer"
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Add step
              </Button>
              <FieldError>{errors.reproductionSteps?.message}</FieldError>
            </FieldSet>

            <Field
              data-invalid={Boolean(errors.errorMessage)}
              data-disabled={submitting || undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="problem-error" className="text-sm font-semibold text-foreground">
                  Error output
                </FieldLabel>
                <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                  {errorMessage.length.toLocaleString()}/10,000
                </Badge>
              </div>
              <Textarea
                id="problem-error"
                maxLength={10_000}
                rows={6}
                spellCheck={false}
                placeholder="Paste the stack trace or console output, unedited."
                aria-invalid={Boolean(errors.errorMessage)}
                disabled={submitting}
                className={cn(
                  textareaClass,
                  "font-mono text-sm leading-relaxed",
                )}
                {...register("errorMessage")}
              />
              <FieldDescription>
                Paste it whole. The line you think is irrelevant is often the one that matters.
              </FieldDescription>
              <FieldError>{errors.errorMessage?.message}</FieldError>
            </Field>

            <Field
              data-invalid={Boolean(errors.attemptsTried)}
              data-disabled={submitting || undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="problem-attempts" className="text-sm font-semibold text-foreground">
                  What you have already tried
                </FieldLabel>
                <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                  {attemptsTried.length.toLocaleString()}/5,000
                </Badge>
              </div>
              <Textarea
                id="problem-attempts"
                maxLength={5_000}
                rows={4}
                placeholder="Saves everyone from suggesting it again."
                aria-invalid={Boolean(errors.attemptsTried)}
                disabled={submitting}
                className={textareaClass}
                {...register("attemptsTried")}
              />
              <FieldError>{errors.attemptsTried?.message}</FieldError>
            </Field>

            <FieldSet>
              <div className="flex items-center justify-between gap-3">
                <FieldLegend className="text-sm font-semibold text-foreground">
                  Where it happens
                </FieldLegend>
                <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                  {environmentFields.length}/{MAX_ENVIRONMENTS}
                </Badge>
              </div>

              {environmentFields.length === 0 ? (
                <FieldDescription>
                  Operating system, browser, runtime — whatever the problem depends on.
                </FieldDescription>
              ) : (
                <FieldGroup className="gap-3 mt-2">
                  <AnimatePresence initial={false}>
                    {environmentFields.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]"
                      >
                        <Field
                          data-invalid={Boolean(
                            errors.environment?.[index]?.technology,
                          )}
                          data-disabled={submitting || undefined}
                        >
                          <FieldLabel htmlFor={`problem-environment-${index}`}>
                            Name
                          </FieldLabel>
                          <Input
                            id={`problem-environment-${index}`}
                            maxLength={100}
                            placeholder="e.g. macOS"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                            {...register(`environment.${index}.technology`)}
                          />
                          <FieldError>
                            {errors.environment?.[index]?.technology?.message}
                          </FieldError>
                        </Field>

                        <Field
                          data-invalid={Boolean(
                            errors.environment?.[index]?.version,
                          )}
                          data-disabled={submitting || undefined}
                        >
                          <FieldLabel
                            htmlFor={`problem-environment-version-${index}`}
                          >
                            Version
                          </FieldLabel>
                          <Input
                            id={`problem-environment-version-${index}`}
                            maxLength={50}
                            placeholder="e.g. 15.2"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                            {...register(`environment.${index}.version`)}
                          />
                          <FieldError>
                            {errors.environment?.[index]?.version?.message}
                          </FieldError>
                        </Field>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-lg"
                          aria-label={`Remove environment ${index + 1}`}
                          disabled={submitting}
                          onClick={() => onRemoveEnvironment(index)}
                          className="justify-self-end rounded-xl sm:mt-7 cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </FieldGroup>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={
                  submitting ||
                  environmentFields.length >= MAX_ENVIRONMENTS
                }
                onClick={() =>
                  onAppendEnvironment({ technology: "", version: "" })
                }
                className="mt-3 w-full rounded-xl sm:w-auto sm:self-start cursor-pointer"
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Add environment
              </Button>
            </FieldSet>

            <Field
              data-invalid={Boolean(errors.repositoryUrl)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel htmlFor="problem-repository" className="text-sm font-semibold text-foreground">
                Repository URL
              </FieldLabel>
              <Input
                id="problem-repository"
                maxLength={1_000}
                inputMode="url"
                placeholder="https://github.com/…"
                aria-invalid={Boolean(errors.repositoryUrl)}
                aria-describedby={
                  errors.repositoryUrl
                    ? "problem-repository-error"
                    : "problem-repository-help"
                }
                disabled={submitting}
                className={CONTROL_CLASS}
                {...register("repositoryUrl")}
              />
              <FieldDescription id="problem-repository-help">
                A public repository that reproduces it, if you have one. Must start with https://.
              </FieldDescription>
              <FieldError id="problem-repository-error">
                {errors.repositoryUrl?.message}
              </FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
