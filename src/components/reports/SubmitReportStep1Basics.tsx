"use client";

import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Target, CheckCircle2, Building2 } from "lucide-react";
import {
  SubmitReportFormValues,
  ENVIRONMENTS,
  SEVERITY_LABELS,
  parseCvssScore,
  severityForCvss,
} from "@/lib/validations/report";
import { VulnerabilityCategoryCombobox } from "@/components/reports/VulnerabilityCategoryCombobox";
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

const SEVERITY_OPTIONS = [
  { id: "CRITICAL", label: "Critical", scoreRange: "9.0–10.0" },
  { id: "HIGH", label: "High", scoreRange: "7.0–8.9" },
  { id: "MEDIUM", label: "Medium", scoreRange: "4.0–6.9" },
  { id: "LOW", label: "Low", scoreRange: "0.1–3.9" },
  { id: "INFO", label: "Info", scoreRange: "0.0" },
] as const;

const CWE_MAP: Record<string, { cwe: string; score: string; vector: string }> = {
  "Insecure Direct Object Reference (IDOR)": {
    cwe: "CWE-639",
    score: "8.1",
    vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  },
  "SQL Injection (SQLi)": {
    cwe: "CWE-89",
    score: "9.8",
    vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  },
  "Remote Code Execution (RCE)": {
    cwe: "CWE-94",
    score: "10.0",
    vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
  },
  "Cross-Site Scripting (XSS - Stored)": {
    cwe: "CWE-79",
    score: "7.2",
    vector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:L/I:L/A:N",
  },
  "Cross-Site Scripting (XSS - Reflected)": {
    cwe: "CWE-79",
    score: "6.1",
    vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
  },
  "Server-Side Request Forgery (SSRF)": {
    cwe: "CWE-918",
    score: "8.6",
    vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N",
  },
};

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
  const selectedSeverity = watch("severity") || "CRITICAL";
  const selectedCategory = watch("category");
  const selectedEnvironment = watch("environment") || "PRODUCTION";

  /* Auto-suggest the CWE and CVSS for the chosen category — and the severity
     that score implies.
     Setting the score without the severity is what produced reports the
     backend refuses outright: picking SSRF filled in 8.6 while the severity
     stayed wherever it was, and "a CVSS score of 8.6 is rated HIGH, which does
     not match the reported severity LOW" came back as a 400 at submit. */
  useEffect(() => {
    if (selectedCategory && CWE_MAP[selectedCategory]) {
      const info = CWE_MAP[selectedCategory];
      setValue("cweIdentifier", info.cwe);
      setValue("cvssScore", info.score);
      setValue("cvssVector", info.vector);

      const score = parseCvssScore(info.score);
      if (score !== null) {
        setValue("severity", severityForCvss(score), { shouldValidate: true });
      }
    }
  }, [selectedCategory, setValue]);

  const suggestedScore = parseCvssScore(watch("cvssScore"));

  /**
   * Choosing a severity by hand wins over the score a category suggested.
   *
   * The score is not shown on this step — it arrives silently with the
   * category — so the severity buttons are the only thing the reader sees, and
   * their choice has to be the one that stands. A suggestion left behind that
   * rates differently is dropped along with its vector, since a vector implies
   * the score it produces. The CWE stays: it describes the class of bug, not
   * how bad this instance is.
   */
  const handleSeverityChange = (severity: SubmitReportFormValues["severity"]) => {
    setValue("severity", severity, { shouldValidate: true });

    if (suggestedScore !== null && severityForCvss(suggestedScore) !== severity) {
      setValue("cvssScore", "", { shouldValidate: true });
      setValue("cvssVector", "");
    }
  };

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
      <div className="flex items-center gap-3.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Step 1: Target & Classification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Specify the affected target asset, vulnerability title, and severity rating.
          </p>
        </div>
      </div>

      {/* Target Program Display / Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {programTitle}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
            <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Select a program..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
          <label htmlFor="targetAsset" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Target Endpoint / Asset URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="targetAsset"
            placeholder="e.g. https://api.nexacloud.com/v1/invoices/1337"
            {...register("targetAsset")}
            className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-mono"
          />
          {errors.targetAsset && (
            <p className="text-xs text-red-500 font-medium">{errors.targetAsset.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
            <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
          className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between"
        >
          <span>Date discovered</span>
          <span className="text-xs text-slate-500 font-normal">optional</span>
        </label>
        <Input
          id="discoveredAt"
          type="date"
          /* Today is the last selectable day — a discovery cannot have happened
             yet, and the browser refuses it before the schema has to. */
          max={new Date().toISOString().slice(0, 10)}
          {...register("discoveredAt")}
          className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm sm:max-w-64"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
        <label htmlFor="title" className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>Vulnerability Title <span className="text-red-500">*</span></span>
          <span className="text-xs text-slate-500 font-normal">Clear & descriptive title</span>
        </label>
        <Input
          id="title"
          placeholder="e.g., IDOR in invoice download endpoint allows unauthorized data access"
          {...register("title")}
          className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-base"
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Vulnerability Category / Weakness <span className="text-red-500">*</span>
        </label>
        {/* Searchable rather than a closed list, and free entry when nothing
            fits. Nothing downstream validates this against the catalogue, so a
            fixed list only ever filed the unusual findings — the ones worth
            reading — under "Other Security Issue". */}
        <VulnerabilityCategoryCombobox
          id="category"
          value={watch("category") || ""}
          weaknessId={watch("weaknessId") || ""}
          onChange={({ category, weaknessId }) => {
            setValue("category", category, {
              shouldValidate: true,
              shouldDirty: true,
            });
            /* Cleared, not left behind: a free-text category that kept the
               previous pick's id would file the report under the wrong CWE. */
            setValue("weaknessId", weaknessId ?? "", { shouldDirty: true });
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
            Search the CWE catalogue, or type your own if none of it fits.
          </p>
        )}
      </div>

      {/* Severity Rating Selector */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>Claimed Severity Rating <span className="text-red-500">*</span></span>
          <span className="text-xs text-slate-500 font-normal">Self-assessed impact level</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SEVERITY_OPTIONS.map((opt) => {
            const isSelected = selectedSeverity === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSeverityChange(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold tracking-wider uppercase">{opt.label}</div>
                <div
                  className={`text-[11px] mt-1.5 font-medium ${
                    isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  CVSS {opt.scoreRange}
                </div>
              </button>
            );
          })}
        </div>

        {/* The score reaches the report either way, so it is stated rather than
            applied behind the reader's back — it is what the severity is
            checked against on the way in. */}
        {suggestedScore !== null && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Submitting with{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              CVSS {suggestedScore.toFixed(1)}
            </span>
            , suggested for this category and rated{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {SEVERITY_LABELS[severityForCvss(suggestedScore)]}
            </span>
            . Picking a different severity above clears it.
          </p>
        )}

        {errors.cvssScore && (
          <p className="text-sm font-medium text-red-500">
            {errors.cvssScore.message}
          </p>
        )}
      </div>
    </div>
  );
}
