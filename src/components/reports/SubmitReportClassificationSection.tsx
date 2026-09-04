"use client";

import React, { useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Shield, AlertTriangle } from "lucide-react";
import {
  SubmitReportFormValues,
  VULNERABILITY_CATEGORIES,
  SEVERITY_LABELS,
  parseCvssScore,
  claimableSeverityForCvss,
  severityForCvss,
} from "@/lib/validations/report";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubmitReportClassificationSectionProps {
  register: UseFormRegister<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  setValue: UseFormSetValue<SubmitReportFormValues>;
  watch: UseFormWatch<SubmitReportFormValues>;
}

/* `reportedSeverity` accepts LOW, MEDIUM, HIGH and CRITICAL — never NONE, and
   "Info" mapped to exactly that. Offering it produced a submission the API
   refuses, so the claim a reporter can make stops at Low. Triage can still
   settle a finding at NONE; that is its call, not the reporter's. */
const SEVERITY_OPTIONS = [
  { id: "CRITICAL", label: "Critical", scoreRange: "9.0–10.0", color: "red" },
  { id: "HIGH", label: "High", scoreRange: "7.0–8.9", color: "orange" },
  { id: "MEDIUM", label: "Medium", scoreRange: "4.0–6.9", color: "amber" },
  { id: "LOW", label: "Low", scoreRange: "0.1–3.9", color: "blue" },
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

export function SubmitReportClassificationSection({
  register,
  errors,
  setValue,
  watch,
}: SubmitReportClassificationSectionProps) {
  const selectedSeverity = watch("severity") || "CRITICAL";
  const selectedCategory = watch("category");

  /* Auto-suggest the CWE and CVSS for the chosen category — and the severity
     that score implies. Setting the score alone is what produced reports
     claiming, say, LOW severity with an 8.6 attached: the backend rates that
     score HIGH and rejects the pair outright. */
  useEffect(() => {
    if (selectedCategory && CWE_MAP[selectedCategory]) {
      const info = CWE_MAP[selectedCategory];
      setValue("cweIdentifier", info.cwe);
      setValue("cvssScore", info.score);
      setValue("cvssVector", info.vector);

      const score = parseCvssScore(info.score);
      const banded = score !== null ? claimableSeverityForCvss(score) : null;
      if (banded) {
        setValue("severity", banded, { shouldValidate: true });
      }
    }
  }, [selectedCategory, setValue]);

  /* The score is the authority on severity, so editing it moves the severity
     with it. The two cannot be set independently without one of them being
     wrong, and the backend refuses the combination rather than picking. */
  const handleScoreChange = (value: string) => {
    setValue("cvssScore", value, { shouldValidate: true, shouldDirty: true });

    const score = parseCvssScore(value);
    /* Null at 0.0, which is not a claimable band — the severity is left as
       the reporter set it rather than moved to a value the API refuses. */
    const banded = score !== null ? claimableSeverityForCvss(score) : null;
    if (banded) {
      setValue("severity", banded, { shouldValidate: true });
    }
  };

  const scoreDrivenSeverity = parseCvssScore(watch("cvssScore"));

  return (
    <div className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Vulnerability Classification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accurate classification speeds up triage and bounty determination
          </p>
        </div>
      </div>

      {/* Inputs Container */}
      <div className="space-y-5">
        {/* Report Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Report Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            placeholder="e.g. IDOR in /api/v1/invoices/{id} exposes arbitrary billing records"
            {...register("title")}
            className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Include vulnerability type, affected component, and impact in one clear sentence.
          </p>
          {errors.title && (
            <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Vulnerability Type / Category */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Vulnerability Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedCategory || ""}
            onValueChange={(val) =>
              setValue("category", val as SubmitReportFormValues["category"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              id="category"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs cursor-pointer"
            >
              <SelectValue placeholder="Select vulnerability type..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-1.5 max-h-72">
              {VULNERABILITY_CATEGORIES.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="rounded-xl cursor-pointer py-2.5 px-3 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800 transition-colors"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>
          )}
        </div>

        {/* Severity Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Severity <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-5 gap-2.5">
            {SEVERITY_OPTIONS.map((sev) => {
              const isSelected = selectedSeverity === sev.id;

              return (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setValue("severity", sev.id as SubmitReportFormValues["severity"])}
                  className={`h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? sev.id === "CRITICAL"
                        ? "bg-red-600 text-white shadow-xs"
                        : sev.id === "HIGH"
                        ? "bg-orange-600 text-white shadow-xs"
                        : sev.id === "MEDIUM"
                        ? "bg-amber-500 text-white shadow-xs"
                        : sev.id === "LOW"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-700 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {sev.label}
                </button>
              );
            })}
          </div>

          {/* Detailed Severity Breakdown Box */}
          <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  Critical Impact
                </span>
              </div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-white/80 dark:bg-black/30 px-2 py-0.5 rounded-md border border-red-200">
                CVSS 9.0–10.0
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              Full system compromise, data breach, or catastrophic impact
            </p>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Typically $3,000–$10,000+
            </div>
          </div>
        </div>

        {/* CWE & CVSS Score Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cweIdentifier" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                CWE Identifier
              </label>
              <span className="text-xs text-slate-500 font-medium">auto-suggested</span>
            </div>
            <Input
              id="cweIdentifier"
              placeholder="CWE-79"
              {...register("cweIdentifier")}
              className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cvssScore" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                CVSS Score (0.0–10.0)
              </label>
              <span className="text-xs text-slate-500 font-medium">optional</span>
            </div>
            <Input
              id="cvssScore"
              placeholder="8.1"
              inputMode="decimal"
              {...register("cvssScore", {
                onChange: (event) => handleScoreChange(event.target.value),
              })}
              className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700"
            />
            {scoreDrivenSeverity !== null ? (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Rated{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {SEVERITY_LABELS[severityForCvss(scoreDrivenSeverity)]}
                </span>{" "}
                — severity above follows this score.
              </p>
            ) : null}
            {errors.cvssScore && (
              <p className="text-xs text-red-500 font-medium">
                {errors.cvssScore.message}
              </p>
            )}
          </div>
        </div>

        {/* CVSS Vector String */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="cvssVector" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              CVSS Vector String
            </label>
            <span className="text-xs text-slate-500 font-medium">optional</span>
          </div>
          <Input
            id="cvssVector"
            placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
            {...register("cvssVector")}
            className="bg-white dark:bg-slate-900 h-11 text-sm font-mono border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

