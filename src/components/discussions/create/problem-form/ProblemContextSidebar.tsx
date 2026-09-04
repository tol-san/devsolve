"use client";

import React from "react";
import { motion } from "motion/react";
import { Control, Controller, FieldErrors } from "react-hook-form";
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
      <Card className={CARD_CLASS} aria-labelledby="problem-context-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>
            <h2
              id="problem-context-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Context
            </h2>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Help the right people find and understand the problem.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <FieldGroup className="space-y-6">
            <Field
              data-invalid={Boolean(errors.categoryId)}
              data-disabled={
                submitting ||
                loadingCategories ||
                categoryItems.length === 0 ||
                undefined
              }
            >
              <FieldLabel htmlFor="problem-category" className="text-sm font-semibold text-foreground">
                Category
                <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
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
                  : "Required. This is how the problem is filed and found."}
              </FieldDescription>
              <FieldError id="problem-category-error">
                {errors.categoryId?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={Boolean(errors.problemType)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel htmlFor="problem-type" className="text-sm font-semibold text-foreground">
                Problem type
                <span aria-hidden="true" className="text-destructive font-bold ml-0.5">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </FieldLabel>
              <Controller
                control={control}
                name="problemType"
                render={({ field }) => (
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
                      <SelectValue placeholder="Choose a type" />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="rounded-xl"
                    >
                      <SelectGroup>
                        {PROBLEM_TYPE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription id="problem-type-help">
                {problemType
                  ? PROBLEM_TYPE_DESCRIPTIONS[problemType as ProblemType]
                  : "What kind of problem this is."}
              </FieldDescription>
              <FieldError id="problem-type-error">
                {errors.problemType?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={Boolean(errors.severity)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel htmlFor="problem-severity" className="text-sm font-semibold text-foreground">
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
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription id="problem-severity-help">
                Optional. How much this is costing you.
              </FieldDescription>
              <FieldError id="problem-severity-error">
                {errors.severity?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={Boolean(errors.sdlcPhase)}
              data-disabled={submitting || undefined}
            >
              <FieldLabel htmlFor="problem-sdlc-phase" className="text-sm font-semibold text-foreground">
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
                Optional. Where in the software lifecycle the issue appears.
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
