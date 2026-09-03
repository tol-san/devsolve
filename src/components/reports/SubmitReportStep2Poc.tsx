"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form";
import { FileText, ArrowLeft, Send, Loader2, Bookmark, Link2, Plus, X } from "lucide-react";
import { SubmitReportFormValues } from "@/lib/validations/report";
import { PocTemplateToolbar } from "@/components/reports/PocTemplateToolbar";
import { MarkdownEditor } from "@/components/reports/MarkdownEditor";
import { FileUploadDropzone, AttachedFile } from "@/components/reports/FileUploadDropzone";
import { ContentScanStatus } from "@/components/security/ContentScanStatus";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SubmitReportStep2PocProps {
  register: UseFormRegister<SubmitReportFormValues>;
  control: Control<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  attachedFiles: AttachedFile[];
  externalLinks?: string[];
  linkErrors?: Record<number, string>;
  referenceLinksError?: string | null;
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
  onAddExternalLink?: () => void;
  onRemoveExternalLink?: (index: number) => void;
  onUpdateExternalLink?: (index: number, val: string) => void;
  onInsertTemplate: (template: string) => void;
  onPrevStep: () => void;
  onSaveDraft: () => void;
  onSubmitReport: () => void;
}

export function SubmitReportStep2Poc({
  register,
  control,
  errors,
  attachedFiles,
  externalLinks = [""],
  linkErrors = {},
  referenceLinksError,
  isSubmitting,
  submitError,
  isDraftSaved,
  canSubmitReport = true,
  draftStatus,
  onAddFiles,
  onRemoveFile,
  onAddExternalLink,
  onRemoveExternalLink,
  onUpdateExternalLink,
  onInsertTemplate,
  onPrevStep,
  onSaveDraft,
  onSubmitReport,
}: SubmitReportStep2PocProps) {
  return (
    <div className="space-y-8 font-sans">
      {/* Section Header */}
      <div className="flex items-start sm:items-center gap-3.5 pb-3 border-b border-border">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs mt-0.5 sm:mt-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Step 2: Proof of Concept & Evidence
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Provide the complete technical write-up, reproduction steps, and attachments.
          </p>
        </div>
      </div>

      {/* Description & Summary Markdown Editor */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-sm font-semibold text-foreground">
            Attachments & Screenshots
          </label>
          <span className="text-xs text-muted-foreground">PNG, JPG, HTTP logs, or videos</span>
        </div>

        <FileUploadDropzone
          files={attachedFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
          disabled={isSubmitting}
        />
      </div>

      {/* Reference Links & PoC Media */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Link2 className="size-4 text-muted-foreground" />
            <span>Reference Links & Video PoCs</span>
          </label>
          <span className="text-xs text-muted-foreground">
            Loom, YouTube, CVE articles, or advisories (up to 10)
          </span>
        </div>

        {referenceLinksError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
            {referenceLinksError}
          </div>
        )}

        <div className="space-y-2.5">
          {externalLinks.map((link, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={link}
                  onChange={(e) => onUpdateExternalLink?.(idx, e.target.value)}
                  placeholder="https://example.com/advisory or Loom demo URL"
                  className={cn(
                    "bg-card text-foreground h-11 text-sm border-border flex-1 font-mono",
                    linkErrors?.[idx] && "border-red-500 ring-1 ring-red-500/40"
                  )}
                  disabled={isSubmitting}
                />
                {(externalLinks.length > 1 || link.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={() => onRemoveExternalLink?.(idx)}
                    disabled={isSubmitting}
                    className="size-10 rounded-xl text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-muted/50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    aria-label={`Remove reference link ${idx + 1}`}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {linkErrors?.[idx] && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium pl-1">
                  {linkErrors[idx]}
                </p>
              )}
            </div>
          ))}
        </div>

        {externalLinks.length < 10 && (
          <button
            type="button"
            onClick={onAddExternalLink}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer pt-1"
          >
            <Plus className="size-4" />
            <span>Add another reference link</span>
          </button>
        )}
      </div>

      <ContentScanStatus
        active={isSubmitting}
        fileCount={attachedFiles.length}
        includesLinks
      />

      {/* Submission Compliance Checkbox */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("checklistAgreeTerms")}
            className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0"
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
      <div className="pt-6 border-t border-border flex flex-col gap-4">
        {draftStatus && (
          <div className="flex items-center justify-center sm:justify-start">
            {draftStatus}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Step 1</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
            >
              <Bookmark className="w-4 h-4 shrink-0" />
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 dark:hover:bg-muted transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Security check in progress…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Submit Vulnerability Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
