"use client";

import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Target,
  CheckCircle2,
  XCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";
import {
  SubmitReportFormValues,
  HTTP_METHODS,
  ENVIRONMENTS,
} from "@/lib/validations/report";
import { Program } from "@/lib/types/programs/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubmitReportTargetSectionProps {
  register: UseFormRegister<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  setValue: UseFormSetValue<SubmitReportFormValues>;
  watch: UseFormWatch<SubmitReportFormValues>;
  programs: any[];
  isLoading: boolean;
  selectedProgram?: any | null;
}

const HTTP_METHOD_STYLES: Record<string, { badge: string }> = {
  GET: {
    badge:
      "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/80",
  },
  POST: {
    badge:
      "bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200/90 dark:border-blue-800/80",
  },
  PUT: {
    badge:
      "bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800/80",
  },
  DELETE: {
    badge:
      "bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800/80",
  },
  PATCH: {
    badge:
      "bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/80",
  },
  OPTIONS: {
    badge:
      "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700",
  },
  HEAD: {
    badge:
      "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700",
  },
};

export function SubmitReportTargetSection({
  register,
  errors,
  setValue,
  watch,
  programs,
  isLoading,
  selectedProgram,
}: SubmitReportTargetSectionProps) {
  const selectedEnvironment = watch("environment") || "PRODUCTION";
  const selectedHttpMethod = watch("httpMethod") || "GET";
  const selectedProgramId = watch("programId");

  const companyInitials = selectedProgram?.organizationName
    ? selectedProgram.organizationName.substring(0, 2).toUpperCase()
    : "CV";

  const inScopeList: string[] =
    selectedProgram?.inScopeAssets && selectedProgram.inScopeAssets.length > 0
      ? selectedProgram.inScopeAssets.map((asset: any) =>
          typeof asset === "string"
            ? asset
            : asset?.identifier || asset?.name || "Unknown asset",
        )
      : [
          "api.nexacloud.com",
          "dashboard.nexacloud.com",
          "auth.nexacloud.com",
          "*.nexacloud.com (excluding out-of-scope)",
        ];

  // Program (list-shape) carries no exclusions/rules data — that only exists
  // on ProgramDetail, which this multi-program picker doesn't fetch — so this
  // section stays a placeholder until that's wired through.
  const outOfScopeList = [
    "cdn.nexacloud.com",
    "status.nexacloud.com",
    "Third-party integrations",
    "Production customer databases",
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Target & Scope
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Identify the exact affected asset within this program's authorized
            scope
          </p>
        </div>
      </div>

      {/* Dynamic Program Header Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
            {companyInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedProgram?.name || "Security Program"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {selectedProgram?.visibility === "PRIVATE" ? "Private" : "Public"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {selectedProgram?.engagementType === "RESPONSE" ? "Response" : "Bounty"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {selectedProgram?.organizationName || "Company"} · Max{" "}
              {selectedProgram?.maximumBounty
                ? `$${selectedProgram.maximumBounty.toLocaleString()}`
                : "$10,000"}{" "}
              · Avg response 2 days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
          <Lock className="w-4 h-4" />
          <span>Scope verified</span>
        </div>
      </div>

      {/* Dynamic In-Scope Targets Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          In-Scope Targets ({inScopeList.length})
        </h3>
        <div className="flex flex-wrap gap-3 py-1">
          {inScopeList.map((target: string) => (
            <Badge
              key={target}
              variant="outline"
              className="px-4 py-4 text-sm font-mono font-medium gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{target}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Dynamic Out-of-Scope Targets / Exclusions Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Out-of-Scope Rules & Exclusions
        </h3>
        <div className="flex flex-wrap gap-3 py-1">
          {outOfScopeList.map((target: string) => (
            <Badge
              key={target}
              variant="secondary"
              className="px-4 py-4 text-sm font-mono font-medium gap-2.5 opacity-90"
            >
              <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{target}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Inputs Form Section */}
      <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        {/* Affected URL / Endpoint */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="targetAsset"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              Affected URL / Endpoint <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              full URL including path and query
            </span>
          </div>
          <Input
            id="targetAsset"
            placeholder="https://api.example.com/v1/invoices/1337"
            {...register("targetAsset")}
            className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700"
          />
          {errors.targetAsset && (
            <p className="text-xs text-red-500 font-medium">
              {errors.targetAsset.message}
            </p>
          )}
        </div>

        {/* HTTP Method & Vulnerable Parameter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="httpMethod"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                HTTP Method <span className="text-red-500">*</span>
              </label>
            </div>
            <Select
              value={selectedHttpMethod}
              onValueChange={(val) =>
                setValue(
                  "httpMethod",
                  val as SubmitReportFormValues["httpMethod"],
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  },
                )
              }
            >
              <SelectTrigger
                id="httpMethod"
                className="w-full h-11 data-[size=default]:h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                      HTTP_METHOD_STYLES[selectedHttpMethod]?.badge ||
                      HTTP_METHOD_STYLES.GET.badge
                    }`}
                  >
                    {selectedHttpMethod}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-1.5 min-w-[140px]">
                {HTTP_METHODS.map((method) => (
                  <SelectItem
                    key={method}
                    value={method}
                    className="rounded-xl cursor-pointer py-2 px-3 text-sm font-semibold"
                  >
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        HTTP_METHOD_STYLES[method]?.badge ||
                        HTTP_METHOD_STYLES.GET.badge
                      }`}
                    >
                      {method}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="vulnerableParameter"
                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                Vulnerable Parameter
              </label>
              <span className="text-xs text-slate-500 font-medium">
                optional
              </span>
            </div>
            <Input
              id="vulnerableParameter"
              placeholder="e.g. user_id, redirect_uri"
              {...register("vulnerableParameter")}
              className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Environment Selection */}
        <div className="space-y-2 pt-1">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Environment <span className="text-red-500">*</span>
          </label>

          {/* Five now, matching the API's enum, so they wrap at two rows on a
              narrow screen rather than being squeezed into three columns. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ENVIRONMENTS.map((env) => {
              const isSelected = selectedEnvironment === env.value;
              const isProduction = env.value === "PRODUCTION";

              return (
                <button
                  key={env.value}
                  type="button"
                  onClick={() =>
                    setValue("environment", env.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={`h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isProduction
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {env.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Discovery date */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="discoveredAt"
              className="text-sm font-semibold text-foreground"
            >
              Date discovered
            </label>
            <span className="text-xs text-muted-foreground font-medium">optional</span>
          </div>
          <div className="sm:max-w-64">
            <DatePicker
              id="discoveredAt"
              value={watch("discoveredAt") ?? ""}
              onChange={(val: string) => setValue("discoveredAt", val, { shouldValidate: true })}
              max={new Date().toISOString().slice(0, 10)}
              placeholder="Select discovery date"
              className="h-11 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              error={Boolean(errors.discoveredAt)}
            />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            When you first observed the issue. Helps a triager establish how
            long the exposure has been live.
          </p>
          {errors.discoveredAt && (
            <p className="text-xs text-red-500 font-medium">
              {errors.discoveredAt.message}
            </p>
          )}
        </div>

        {/* Production Warning Callout */}
        {selectedEnvironment === "PRODUCTION" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-sm font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Production selected.</span> Confirm
              testing was non-destructive and did not access or retain real user
              data beyond the minimum needed to demonstrate impact.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
