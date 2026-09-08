"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Plus,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    "rounded-xl border-border/80 bg-background text-foreground text-sm sm:text-base shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
    >
      <Card
        id="section-diagnosis"
        className={CARD_CLASS}
        aria-labelledby="problem-diagnosis-heading"
      >
        <CardHeader className="p-5 sm:p-6 pb-4 sm:pb-4 border-b border-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                  isBug
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                    : "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {isBug ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <Activity className="size-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground font-bold">03.</span>
                  <h2
                    id="problem-diagnosis-heading"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    Diagnosis & Reproduction
                  </h2>
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "self-start sm:self-auto shrink-0 text-xs font-semibold",
                isBug
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground font-normal",
              )}
            >
              {isBug ? "Required for Bugs" : "Optional"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
          <FieldGroup className="gap-5 sm:gap-6">
            {/* Expected vs Actual Behavior */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                data-invalid={Boolean(errors.expectedBehavior)}
                data-disabled={submitting || undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel
                    htmlFor="problem-expected"
                    className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Expected behaviour
                    {isBug && (
                      <span
                        aria-hidden="true"
                        className="text-destructive font-bold"
                      >
                        *
                      </span>
                    )}
                  </FieldLabel>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {expectedBehavior.length} / 5,000
                  </span>
                </div>
                <Textarea
                  id="problem-expected"
                  maxLength={5_000}
                  rows={4}
                  placeholder="Describe what should have happened or what you intended to achieve."
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
                  <FieldLabel
                    htmlFor="problem-actual"
                    className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5"
                  >
                    <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                    Actual behaviour
                    {isBug && (
                      <span
                        aria-hidden="true"
                        className="text-destructive font-bold"
                      >
                        *
                      </span>
                    )}
                  </FieldLabel>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {actualBehavior.length} / 5,000
                  </span>
                </div>
                <Textarea
                  id="problem-actual"
                  maxLength={5_000}
                  rows={4}
                  placeholder="Describe what actually happened, symptoms, or unexpected results."
                  aria-invalid={Boolean(errors.actualBehavior)}
                  disabled={submitting}
                  className={textareaClass}
                  {...register("actualBehavior")}
                />
                <FieldError>{errors.actualBehavior?.message}</FieldError>
              </Field>
            </div>

            {/* Reproduction Steps */}
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
                <div className="rounded-xl border border-dashed border-border/80 p-4 text-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    No steps added yet. A clear 1-2-3 sequence is the fastest way to get a working solution.
                  </p>
                </div>
              ) : (
                <FieldGroup className="gap-2.5 mt-2">
                  <AnimatePresence initial={false}>
                    {reproductionSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold tabular-nums border border-primary/20"
                        >
                          {index + 1}
                        </span>
                        <Input
                          aria-label={`Step ${index + 1}`}
                          maxLength={1_000}
                          value={step}
                          placeholder={`Step ${index + 1}: e.g. Call POST /api/v1/auth with expired token`}
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
                          size="icon"
                          aria-label={`Remove step ${index + 1}`}
                          disabled={submitting}
                          onClick={() =>
                            onSetSteps(
                              reproductionSteps.filter((_, i) => i !== index),
                            )
                          }
                          className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
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
                className="mt-3 rounded-xl cursor-pointer text-xs font-medium"
              >
                <Plus className="size-3.5 mr-1" aria-hidden="true" />
                Add step
              </Button>
              <FieldError>{errors.reproductionSteps?.message}</FieldError>
            </FieldSet>

            {/* Error Message / Stack Trace */}
            <Field
              data-invalid={Boolean(errors.errorMessage)}
              data-disabled={submitting || undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel
                  htmlFor="problem-error"
                  className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5"
                >
                  <Terminal className="size-3.5 text-muted-foreground" />
                  Error output or stack trace
                </FieldLabel>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {errorMessage.length.toLocaleString()} / 10,000
                </span>
              </div>

              <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border/60 text-xs font-mono text-muted-foreground">
                  <span>Terminal / Console output</span>
                  <span className="text-[10px]">Unedited</span>
                </div>
                <Textarea
                  id="problem-error"
                  maxLength={10_000}
                  rows={6}
                  spellCheck={false}
                  placeholder="Paste terminal log, stack trace, or compiler output here..."
                  aria-invalid={Boolean(errors.errorMessage)}
                  disabled={submitting}
                  className="rounded-none border-0 bg-background text-foreground font-mono text-xs leading-relaxed focus-visible:ring-0"
                  {...register("errorMessage")}
                />
              </div>

              <FieldDescription>
                Paste the stack trace unedited. The lines before and after often contain the missing context.
              </FieldDescription>
              <FieldError>{errors.errorMessage?.message}</FieldError>
            </Field>

            {/* What you have already tried */}
            <Field
              data-invalid={Boolean(errors.attemptsTried)}
              data-disabled={submitting || undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <FieldLabel
                  htmlFor="problem-attempts"
                  className="text-sm font-semibold text-foreground"
                >
                  What you have already tried
                </FieldLabel>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {attemptsTried.length.toLocaleString()} / 5,000
                </span>
              </div>
              <Textarea
                id="problem-attempts"
                maxLength={5_000}
                rows={3}
                placeholder="Mention solutions, workarounds, or documentation steps you already tested so the community doesn't repeat them."
                aria-invalid={Boolean(errors.attemptsTried)}
                disabled={submitting}
                className={textareaClass}
                {...register("attemptsTried")}
              />
              <FieldError>{errors.attemptsTried?.message}</FieldError>
            </Field>

            {/* Environment details */}
            <FieldSet>
              <div className="flex items-center justify-between gap-3">
                <FieldLegend className="text-sm font-semibold text-foreground">
                  Where it happens (Environment)
                </FieldLegend>
                <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                  {environmentFields.length}/{MAX_ENVIRONMENTS}
                </Badge>
              </div>

              {environmentFields.length === 0 ? (
                <FieldDescription>
                  OS, browser, Docker version, or runtime environments (e.g. Node 20 on Ubuntu 24.04).
                </FieldDescription>
              ) : (
                <FieldGroup className="gap-2.5 mt-2">
                  <AnimatePresence initial={false}>
                    {environmentFields.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto] rounded-xl border border-border/60 bg-card/60 p-3"
                      >
                        <Field
                          data-invalid={Boolean(
                            errors.environment?.[index]?.technology,
                          )}
                          data-disabled={submitting || undefined}
                        >
                          <FieldLabel
                            htmlFor={`problem-environment-${index}`}
                            className="text-xs font-semibold text-foreground"
                          >
                            Environment / Platform
                          </FieldLabel>
                          <Input
                            id={`problem-environment-${index}`}
                            maxLength={100}
                            placeholder="e.g. macOS Sonoma, Chrome, Docker"
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
                            className="text-xs font-semibold text-foreground"
                          >
                            Version
                          </FieldLabel>
                          <Input
                            id={`problem-environment-version-${index}`}
                            maxLength={50}
                            placeholder="e.g. 14.5, 126.0"
                            disabled={submitting}
                            className={CONTROL_CLASS}
                            {...register(`environment.${index}.version`)}
                          />
                          <FieldError>
                            {errors.environment?.[index]?.version?.message}
                          </FieldError>
                        </Field>

                        <div className="pt-5 sm:pt-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove environment ${index + 1}`}
                            disabled={submitting}
                            onClick={() => onRemoveEnvironment(index)}
                            className="size-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
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
                className="mt-3 rounded-xl cursor-pointer text-xs font-medium"
              >
                <Plus className="size-3.5 mr-1" aria-hidden="true" />
                Add environment
              </Button>
            </FieldSet>

            {/* Repository URL */}
            <Field
              data-invalid={Boolean(errors.repositoryUrl)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel
                htmlFor="problem-repository"
                className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5"
              >
                <GitBranch className="size-3.5 text-muted-foreground" />
                Repository URL
              </FieldLabel>
              <Input
                id="problem-repository"
                maxLength={1_000}
                inputMode="url"
                placeholder="https://github.com/username/repository"
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
                A public repository or minimal reproduction branch (optional, must start with https://).
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
