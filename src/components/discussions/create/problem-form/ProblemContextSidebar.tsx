"use client";

import React from "react";
import { motion } from "motion/react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import {
  Boxes,
  Bug,
  Compass,
  Gauge,
  HelpCircle,
  Rocket,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PROBLEM_TYPE_DESCRIPTIONS,
  type ProblemType,
} from "@/lib/validations/problem";
import {
  CARD_CLASS,
  CONTROL_CLASS,
  PROBLEM_TYPE_ITEMS,
  SDLC_ITEMS,
  SDLC_SELECT_ITEMS,
  SEVERITY_ITEMS,
  SEVERITY_SELECT_ITEMS,
  type ProblemFormInput,
} from "./types-and-constants";

interface ProblemContextSidebarProps {
  control: Control<ProblemFormInput, unknown>;
  errors: FieldErrors<ProblemFormInput>;
  submitting: boolean;
  loadingCategories: boolean;
  categoriesFailed: boolean;
  categoryItems: { value: string; label: string }[];
  categorySelectItems: { value: string | null; label: string }[];
  problemType?: string | null;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BUG: Bug,
  HOW_TO: HelpCircle,
  ARCHITECTURE: Boxes,
  PERFORMANCE: Gauge,
  SECURITY: ShieldAlert,
  DEPLOYMENT: Rocket,
  GENERAL: Compass,
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-rose-500",
};

export function ProblemContextSidebar({
  control,
  errors,
  submitting,
  loadingCategories,
  categoriesFailed,
  categoryItems,
  categorySelectItems,
  problemType,
}: ProblemContextSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04, ease: "easeOut" }}
    >
      <Card
        id="section-context"
        className={CARD_CLASS}
        aria-labelledby="problem-context-heading"
      >
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <h2
                  id="problem-context-heading"
                  className="text-base font-bold tracking-tight text-foreground"
                >
                  Classification
                </h2>
                <p className="text-xs text-muted-foreground">
                  Channel and routing
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/10 text-primary text-xs font-semibold"
            >
              Required
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <FieldGroup className="space-y-5">
            {/* Category */}
            <Field
              data-invalid={Boolean(errors.categoryId)}
              data-disabled={
                submitting ||
                loadingCategories ||
                categoryItems.length === 0 ||
                undefined
              }
            >
              <FieldLabel
                htmlFor="problem-category"
                className="text-xs font-semibold text-foreground"
              >
                Category
                <span
                  aria-hidden="true"
                  className="text-destructive font-bold ml-0.5"
                >
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </FieldLabel>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    items={categorySelectItems}
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    disabled={
                      submitting ||
                      loadingCategories ||
                      categoryItems.length === 0
                    }
                  >
                    <SelectTrigger
                      ref={field.ref}
                      id="problem-category"
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.categoryId)}
                      aria-describedby={
                        errors.categoryId
                          ? "problem-category-error"
                          : "problem-category-help"
                      }
                      className={cn(CONTROL_CLASS, "w-full")}
                    >
                      <SelectValue
                        placeholder={
                          loadingCategories
                            ? "Loading categories…"
                            : categoryItems.length === 0
                              ? "No categories available"
                              : "Choose a category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="rounded-xl"
                    >
                      <SelectGroup>
                        {categoryItems.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription id="problem-category-help">
                {categoriesFailed
                  ? "Categories could not be loaded. Reload the page to try again."
                  : "Required. Routes your question to the relevant domain forum."}
              </FieldDescription>
              <FieldError id="problem-category-error">
                {errors.categoryId?.message}
              </FieldError>
            </Field>

            {/* Problem Type */}
            <Field
              data-invalid={Boolean(errors.problemType)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel
                htmlFor="problem-type"
                className="text-xs font-semibold text-foreground"
              >
                Problem type
                <span
                  aria-hidden="true"
                  className="text-destructive font-bold ml-0.5"
                >
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </FieldLabel>

              <Controller
                control={control}
                name="problemType"
                render={({ field }) => {
                  return (
                    <div className="space-y-2">
                      {/* Fast Toggle Pills for Bug vs How-To */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => field.onChange("BUG")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            field.value === "BUG"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs"
                              : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          )}
                        >
                          <Bug className="size-3 text-amber-500" />
                          Bug Report
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => field.onChange("HOW_TO")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            field.value === "HOW_TO"
                              ? "border-primary/40 bg-primary/10 text-primary font-semibold shadow-2xs"
                              : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          )}
                        >
                          <HelpCircle className="size-3 text-primary" />
                          How-to
                        </button>
                      </div>

                      {/* Dropdown for full list */}
                      <Select
                        items={PROBLEM_TYPE_ITEMS}
                        name={field.name}
                        value={field.value ?? null}
                        onValueChange={(value) =>
                          field.onChange(value ?? undefined)
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger
                          ref={field.ref}
                          id="problem-type"
                          onBlur={field.onBlur}
                          aria-invalid={Boolean(errors.problemType)}
                          aria-describedby={
                            errors.problemType
                              ? "problem-type-error"
                              : "problem-type-help"
                          }
                          className={cn(CONTROL_CLASS, "w-full")}
                        >
                          <SelectValue placeholder="All types…" />
                        </SelectTrigger>
                        <SelectContent
                          alignItemWithTrigger={false}
                          className="rounded-xl"
                        >
                          <SelectGroup>
                            {PROBLEM_TYPE_ITEMS.map((item) => {
                              const Icon = TYPE_ICONS[item.value] ?? Compass;
                              return (
                                <SelectItem key={item.value} value={item.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="size-3.5 text-muted-foreground" />
                                    <span>{item.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }}
              />
              <FieldDescription id="problem-type-help">
                {problemType
                  ? PROBLEM_TYPE_DESCRIPTIONS[problemType as ProblemType]
                  : "Bug reports require reproduction steps; general questions are flexible."}
              </FieldDescription>
              <FieldError id="problem-type-error">
                {errors.problemType?.message}
              </FieldError>
            </Field>

            {/* Severity */}
            <Field
              data-invalid={Boolean(errors.severity)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel
                htmlFor="problem-severity"
                className="text-xs font-semibold text-foreground"
              >
                Severity
              </FieldLabel>
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select
                    items={SEVERITY_SELECT_ITEMS}
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger
                      ref={field.ref}
                      id="problem-severity"
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.severity)}
                      aria-describedby={
                        errors.severity
                          ? "problem-severity-error"
                          : "problem-severity-help"
                      }
                      className={cn(CONTROL_CLASS, "w-full")}
                    >
                      <SelectValue placeholder="Not specified" />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="rounded-xl"
                    >
                      <SelectGroup>
                        <SelectItem value={null}>
                          Not specified
                        </SelectItem>
                        {SEVERITY_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  SEVERITY_COLORS[item.value] ?? "bg-muted-foreground",
                                )}
                              />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription id="problem-severity-help">
                Impact level (Optional).
              </FieldDescription>
              <FieldError id="problem-severity-error">
                {errors.severity?.message}
              </FieldError>
            </Field>

            {/* SDLC Phase */}
            <Field
              data-invalid={Boolean(errors.sdlcPhase)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel
                htmlFor="problem-sdlc-phase"
                className="text-xs font-semibold text-foreground"
              >
                SDLC phase
              </FieldLabel>
              <Controller
                control={control}
                name="sdlcPhase"
                render={({ field }) => (
                  <Select
                    items={SDLC_SELECT_ITEMS}
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger
                      ref={field.ref}
                      id="problem-sdlc-phase"
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.sdlcPhase)}
                      aria-describedby={
                        errors.sdlcPhase
                          ? "problem-sdlc-phase-error"
                          : "problem-sdlc-phase-help"
                      }
                      className={cn(CONTROL_CLASS, "w-full")}
                    >
                      <SelectValue placeholder="Choose a phase" />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="rounded-xl"
                    >
                      <SelectGroup>
                        <SelectItem value={null}>Not specified</SelectItem>
                        {SDLC_ITEMS.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription id="problem-sdlc-phase-help">
                Where in development it surfaced (Optional).
              </FieldDescription>
              <FieldError id="problem-sdlc-phase-error">
                {errors.sdlcPhase?.message}
              </FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
