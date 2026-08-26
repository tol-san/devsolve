"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Target, CheckCircle2, Building2 } from "lucide-react";
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
  const [isChangingProgram, setIsChangingProgram] = useState(false);
  const selectedProgramId = watch("programId");
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
      <div className="flex items-center gap-3.5 pb-2 border-b border-border">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Step 1: Target & Classification
          </h2>
          <p className="text-sm text-muted-foreground">
            Specify the affected target asset, vulnerability title, and severity rating.
          </p>
        </div>
      </div>

      {/* Target Program Display / Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Target Security Program <span className="text-red-500">*</span>
          </label>
          {selectedProgram && !isChangingProgram && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Target Program Selected
            </span>
          )}
        </div>

        {selectedProgram && !isChangingProgram ? (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {programTitle}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {companySubtext}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangingProgram(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
            >
              Change Program
            </button>
          </div>
        ) : (
          <Select
            value={selectedProgramId || undefined}
            onValueChange={(val) => {
              if (val) {
                setValue("programId", val, { shouldValidate: true });
                setIsChangingProgram(false);
              }
            }}
          >
            <SelectTrigger className="w-full h-12 bg-card border-border text-foreground">
              <SelectValue placeholder="Select a program..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {programs.map((prog: any) => {
                const label = prog.name || prog.title || prog.companyName || `Program #${prog.id.slice(0, 8)}`;
                return (
                  <SelectItem key={prog.id} value={prog.id} className="cursor-pointer py-2.5">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
        <label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Vulnerability Title <span className="text-red-500">*</span></span>
          <span className="text-xs text-muted-foreground font-normal">Clear & descriptive title</span>
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
