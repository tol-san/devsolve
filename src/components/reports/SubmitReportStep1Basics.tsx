"use client";

import React from "react";
import Link from "next/link";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Target, CheckCircle2, Building2, ArrowUpRight } from "lucide-react";
import {
  SubmitReportFormValues,
  ENVIRONMENTS,
} from "@/lib/validations/report";
import { VulnerabilityCategoryCombobox } from "@/components/reports/VulnerabilityCategoryCombobox";
import {
  SeverityCvssField,
  type Severity,
} from "@/components/reports/SeverityCvssField";
import { Input } from "@/components/ui/input";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubmitReportStep1BasicsProps {
  register: UseFormRegister<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  setValue: UseFormSetValue<SubmitReportFormValues>;
  watch: UseFormWatch<SubmitReportFormValues>;
  programs: any[];
  isLoading: boolean;
  selectedProgram?: any | null;
}

export function SubmitReportStep1Basics({
  register,
  errors,
  setValue,
  watch,
  programs,
  isLoading,
  selectedProgram,
}: SubmitReportStep1BasicsProps) {
  const lp = useLocalePath();
  const selectedEnvironment = watch("environment") || "PRODUCTION";

  const programTitle =
    selectedProgram?.name ||
    selectedProgram?.title ||
    selectedProgram?.companyName ||
    "Security Program";

  const companySubtext =
    selectedProgram?.companyName ||
    selectedProgram?.organizationName ||
    "Active Security Program";

  return (
    <div className="space-y-8 font-sans">
      {/* Section Header */}
      <div className="flex items-start sm:items-center gap-3.5 pb-3 border-b border-border">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs mt-0.5 sm:mt-0">
          <Target className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Step 1: Target & Classification
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Specify the affected target asset, vulnerability title, and severity rating.
          </p>
        </div>
      </div>

      {/* Target Security Program

          A report is filed against one program, and which one decides the
          scope, the reward bands and the triage queue — so it is chosen by
          browsing the programs, not guessed from a list of names in a
          dropdown. A name alone cannot tell you whether your finding is in
          scope. "Change" therefore leads back to the browser, and the chosen
          programme returns here through its own "Submit report" button. */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-semibold text-foreground whitespace-nowrap">
            Target Security Program <span className="text-red-500">*</span>
          </label>
          {selectedProgram && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 whitespace-nowrap shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span><span className="hidden sm:inline">Target Program </span>Selected</span>
            </span>
          )}
        </div>

        {selectedProgram ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-border bg-muted/40 p-4 shadow-2xs">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">
                  {programTitle}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {companySubtext}
                </div>
              </div>
            </div>

            <Link
              href={lp("/dashboard/programs")}
              className="inline-flex shrink-0 items-center justify-end gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 self-end sm:self-auto"
            >
              Change
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                No program selected
              </p>
              <p className="text-xs text-muted-foreground">
                Reports are filed against a specific program. Pick the one whose
                scope covers what you found.
              </p>
            </div>
            <Link
              href={lp("/dashboard/programs")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90"
            >
              <Building2 className="h-4 w-4" />
              Browse programs
            </Link>
          </div>
        )}
        {errors.programId && (
          <p className="text-xs text-red-500 font-medium">{errors.programId.message}</p>
        )}
      </div>

      {/* Target Asset URL & Environment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="targetAsset" className="text-sm font-semibold text-foreground">
            Target Endpoint / Asset URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="targetAsset"
            placeholder="e.g. https://api.nexacloud.com/v1/invoices/1337"
            {...register("targetAsset")}
            className="h-12 bg-card border-border text-foreground text-sm font-mono"
          />
          {errors.targetAsset && (
            <p className="text-xs text-red-500 font-medium">{errors.targetAsset.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Environment
          </label>
          <Select
            value={selectedEnvironment}
            onValueChange={(val) => {
              if (val) {
                setValue(
                  "environment",
                  val as SubmitReportFormValues["environment"],
                  { shouldValidate: true, shouldDirty: true },
                );
              }
            }}
          >
            <SelectTrigger className="h-12 bg-card border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {ENVIRONMENTS.map((env) => (
                <SelectItem key={env.value} value={env.value}>
                  {env.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Discovery date */}
      <div className="space-y-2">
        <label
          htmlFor="discoveredAt"
          className="text-sm font-semibold text-foreground flex items-center justify-between"
        >
          <span>Date discovered</span>
          <span className="text-xs text-muted-foreground font-normal">optional</span>
        </label>
        <Input
          id="discoveredAt"
          type="date"
          /* Today is the last selectable day — a discovery cannot have happened
             yet, and the browser refuses it before the schema has to. */
          max={new Date().toISOString().slice(0, 10)}
          {...register("discoveredAt")}
          className="h-12 bg-card border-border text-foreground text-sm sm:max-w-64"
        />
        <p className="text-xs text-muted-foreground font-medium">
          When you first observed the issue. Helps triage judge how long the
          exposure has been live.
        </p>
        {errors.discoveredAt && (
          <p className="text-xs text-red-500 font-medium">
            {errors.discoveredAt.message}
          </p>
        )}
      </div>

      {/* Vulnerability Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold text-foreground flex flex-wrap items-center justify-between gap-2">
          <span className="whitespace-nowrap">Vulnerability Title <span className="text-red-500">*</span></span>
          <span className="text-xs text-muted-foreground font-normal shrink-0">Clear & descriptive title</span>
        </label>
        <Input
          id="title"
          placeholder="e.g., IDOR in invoice download endpoint allows unauthorized data access"
          {...register("title")}
          className="h-12 bg-card border-border text-foreground text-base"
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Vulnerability Category / Weakness{" "}
          <span className="font-normal text-muted-foreground">optional</span>
        </label>
        {/* Searchable rather than a closed list, and free entry when nothing
            fits. Nothing downstream validates this against the catalogue, so a
            fixed list only ever filed the unusual findings — the ones worth
            reading — under "Other Security Issue". */}
        <VulnerabilityCategoryCombobox
          id="category"
          value={watch("category") || ""}
          weaknessId={watch("weaknessId") || ""}
          onChange={({ category, weaknessId, cweId }) => {
            setValue("category", category, {
              shouldValidate: true,
              shouldDirty: true,
            });
            /* Cleared together. "I'm not sure" must not leave the previous
               pick's id behind and file the report under the wrong CWE. */
            setValue("weaknessId", weaknessId ?? "", { shouldDirty: true });
            setValue("cweIdentifier", cweId ?? "", { shouldDirty: true });
          }}
          invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : "category-hint"}
        />
        {errors.category ? (
          <p id="category-error" className="text-xs text-red-500 font-medium">
            {errors.category.message}
          </p>
        ) : (
          <p id="category-hint" className="text-xs text-muted-foreground">
            Search the CWE catalogue by name or CWE id. Not sure? Leave it —
            triage will classify it.
          </p>
        )}
      </div>

      {/* Severity — asked once.

          This was two questions that the API cross-checks and rejects when
          they disagree: a five-way severity picker, plus a CVSS score
          suggested from the chosen category. A reporter could pick High, take
          a suggested 9.1, and be refused on submit for a contradiction the
          form had built for them. `SeverityCvssField` makes the vector the
          single source: pick a level, or answer the CVSS metrics and let the
          score and severity fall out of them. */}
      <div className="pt-2">
        <SeverityCvssField
          value={{
            severity:
              watch("severity") === "INFO" ? "" : (watch("severity") as Severity),
            cvssVector: watch("cvssVector") || "",
            cvssScore: watch("cvssScore") || "",
          }}
          onChange={(next) => {
            if (next.severity) {
              setValue("severity", next.severity, { shouldValidate: true });
            }
            setValue("cvssVector", next.cvssVector, { shouldValidate: true });
            setValue("cvssScore", next.cvssScore, { shouldValidate: true });
          }}
          error={errors.severity?.message ?? errors.cvssScore?.message}
        />
      </div>
    </div>
  );
}
