"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, Controller, UseFormWatch } from "react-hook-form";
import { FileText, ArrowLeft, Send, CheckCircle2, ShieldCheck, Loader2, Bookmark } from "lucide-react";
import { SubmitReportFormValues } from "@/lib/validations/report";
import { PocTemplateToolbar } from "@/components/reports/PocTemplateToolbar";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { FileUploadDropzone, AttachedFile } from "@/components/reports/FileUploadDropzone";

interface SubmitReportStep2PocProps {
  register: UseFormRegister<SubmitReportFormValues>;
  control: Control<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  watch: UseFormWatch<SubmitReportFormValues>;
  attachedFiles: AttachedFile[];
  isSubmitting: boolean;
  submitError: string | null;
  isDraftSaved: boolean;
  /**
   * Whether the company behind the chosen program has cleared this reporter.
   * Only submission is gated — writing and saving are not — so this disables
   * the one button and leaves the rest of the step alone.
   */
  canSubmitReport?: boolean;
  /** Live autosave state, rendered beside the manual save. */
  draftStatus?: React.ReactNode;
  onAddFiles: (files: AttachedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onInsertTemplate: (template: string) => void;
  onPrevStep: () => void;
  onSaveDraft: () => void;
  onSubmitReport: () => void;
}

export function SubmitReportStep2Poc({
  register,
  control,
  errors,
  watch,
  attachedFiles,
  isSubmitting,
  submitError,
  isDraftSaved,
  canSubmitReport = true,
  draftStatus,
  onAddFiles,
  onRemoveFile,
  onInsertTemplate,
  onPrevStep,
  onSaveDraft,
  onSubmitReport,
}: SubmitReportStep2PocProps) {
  const agreeTerms = watch("checklistAgreeTerms");

  return (
    <div className="space-y-8 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-3.5 pb-2 border-b border-border">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Step 2: Proof of Concept & Evidence
          </h2>
          <p className="text-sm text-muted-foreground">
            Provide the complete technical write-up, reproduction steps, and attachments.
          </p>
        </div>
      </div>

      {/* Description & Summary Markdown Editor */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="summaryPoC" className="text-sm font-semibold text-foreground">
            Vulnerability Write-up & Proof of Concept <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-muted-foreground">Supports GitHub Markdown</span>
        </div>

        {/* Quick Insert Template Chips */}
        <PocTemplateToolbar onInsertTemplate={onInsertTemplate} />

        <Controller
          name="summaryPoC"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value || ""}
              onChange={(val) => field.onChange(val || "")}
              error={!!errors.summaryPoC}
            />
          )}
        />
        {errors.summaryPoC && (
          <p className="text-xs text-red-500 font-medium">{errors.summaryPoC.message}</p>
        )}
      </div>

      {/* File & Screenshot Attachments */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Attachments & Screenshots
          </label>
          <span className="text-xs text-muted-foreground">PNG, JPG, HTTP logs, or videos</span>
        </div>

        <FileUploadDropzone
          files={attachedFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
        />
      </div>

      {/* Submission Compliance Checkbox */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("checklistAgreeTerms")}
            className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 mt-0.5"
          />
          <div className="text-sm text-foreground leading-relaxed font-medium">
            I confirm that this report is in-scope, reproducible, and does not contain exfiltrated user PII or destructive payloads.
          </div>
        </label>
      </div>

      {/* Submit Error Callout */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-300">
          {submitError}
        </div>
      )}

      {/* Footer Navigation & Submit Actions */}
      <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1</span>
        </button>

        <div className="flex items-center gap-3">
          {draftStatus}

          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span>{isDraftSaved ? "Draft Saved!" : "Save Draft"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || !canSubmitReport}
            onClick={onSubmitReport}
            /* The notice above carries the reason and the way out; this just
               says why the button itself is dead for a pointer that hovers
               it. */
            title={
              canSubmitReport
                ? undefined
                : "This organization has not approved you to report to its programs yet."
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 dark:hover:bg-muted transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Report...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Vulnerability Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
