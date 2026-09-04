import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { SubmitReportFormValues } from "@/lib/validations/report";
import { PocTemplateToolbar } from "@/components/reports/PocTemplateToolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubmitReportDetailsSectionProps {
  register: UseFormRegister<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  onInsertTemplate: (templateText: string) => void;
}

export function SubmitReportDetailsSection({
  register,
  errors,
  onInsertTemplate,
}: SubmitReportDetailsSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          3. Report Summary & Proof of Concept (PoC)
        </h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Report Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Blind SQL Injection in payment gateway /charge endpoint"
          {...register("title")}
          className="bg-white text-base sm:text-sm border-slate-300 font-medium"
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="summaryPoC" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Detailed Steps to Reproduce & PoC <span className="text-red-500">*</span>
          </Label>
          <span className="text-xs text-slate-400 font-medium">Markdown Supported</span>
        </div>

        <PocTemplateToolbar onInsertTemplate={onInsertTemplate} />

        <textarea
          id="summaryPoC"
          rows={12}
          placeholder="Describe exact steps, HTTP requests, payloads, and reproduction steps..."
          {...register("summaryPoC")}
          className="w-full p-3.5 rounded-b-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed resize-y"
        />
        {errors.summaryPoC && (
          <p className="text-xs text-red-500 font-medium">{errors.summaryPoC.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <div className="space-y-2">
          <Label htmlFor="impact" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Security & Business Impact <span className="text-slate-400 font-normal">(Optional)</span>
          </Label>
          <textarea
            id="impact"
            rows={3}
            placeholder="Explain potential damage, unauthorized access scope, or financial impact..."
            {...register("impact")}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remediation" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Suggested Remediation <span className="text-slate-400 font-normal">(Optional)</span>
          </Label>
          <textarea
            id="remediation"
            rows={3}
            placeholder="Provide code fixes, configuration updates, or mitigation steps..."
            {...register("remediation")}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
