"use client";

import React from "react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Send, Lock, AlertTriangle, Check, CheckCircle2, BookmarkCheck } from "lucide-react";
import { SubmitReportFormValues, environmentLabel } from "@/lib/validations/report";
import { AttachedFile } from "@/components/reports/FileUploadDropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Program } from "@/lib/types/programs/types";

interface SubmitReportReviewStepProps {
  register: UseFormRegister<SubmitReportFormValues>;
  watch: UseFormWatch<SubmitReportFormValues>;
  attachedFiles: AttachedFile[];
  reproduceStepsList: string[];
  isSubmitting: boolean;
  submitError: string | null;
  isDraftSaved: boolean;
  onGoToStep: (step: number) => void;
  onSaveDraft: () => void;
  onSubmitReport: () => void;
  selectedProgram?: Program | null;
}

export function SubmitReportReviewStep({
  register,
  watch,
  attachedFiles,
  reproduceStepsList,
  isSubmitting,
  submitError,
  isDraftSaved,
  onGoToStep,
  onSaveDraft,
  onSubmitReport,
  selectedProgram,
}: SubmitReportReviewStepProps) {
  const values = watch();

  const isChecklistComplete =
    values.checklistInScope &&
    values.checklistNotDuplicate &&
    values.checklistReproducible &&
    values.checklistNoPii &&
    values.checklistAgreeTerms;

  const companyInitials = selectedProgram?.organizationName
    ? selectedProgram.organizationName.substring(0, 2).toUpperCase()
    : "CV";

  return (
    <div className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Review & Submit
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verify every section before sending — reports cannot be edited after submission
          </p>
        </div>
      </div>

      {/* Main Review Overview Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Dynamic Program Header inside Review Box */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              {companyInitials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedProgram?.name || "Security Program"}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {selectedProgram?.organizationName || "Company"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 text-xs font-semibold gap-1.5 px-3 py-1 rounded-xl">
            <Lock className="w-3.5 h-3.5" />
            <span>Scope verified</span>
          </Badge>
        </div>

        {/* 1. REPORT TITLE CARD */}
        <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              REPORT TITLE
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => onGoToStep(2)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 h-auto p-0 hover:underline"
            >
              Edit
            </Button>
          </div>

          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {values.title ? (
              values.title
            ) : (
              <span className="text-red-500 font-normal">Missing — required</span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 text-xs font-bold rounded-md px-2.5 py-0.5">
              {values.severity || "Critical"}
            </Badge>
            {values.category && (
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 text-xs font-semibold rounded-md px-2.5 py-0.5">
                {values.category}
              </Badge>
            )}
          </div>
        </div>

        {/* 2. TARGET CARD */}
        <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TARGET
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => onGoToStep(1)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 h-auto p-0 hover:underline"
            >
              Edit
            </Button>
          </div>

          <div className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">
            {values.targetAsset ? (
              values.targetAsset
            ) : (
              <span className="text-red-500 font-sans font-normal">Missing — required</span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 text-xs font-semibold rounded-md px-2.5 py-0.5">
              {environmentLabel(values.environment)}
            </Badge>
          </div>
        </div>

        {/* 3. REPORT CARD */}
        <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              REPORT DETAILS
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => onGoToStep(3)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 h-auto p-0 hover:underline"
            >
              Edit
            </Button>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {values.summaryPoC ? (
              values.summaryPoC
            ) : (
              <span className="text-red-500">Summary missing — required</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-1 font-medium">
            <span>{reproduceStepsList.length} repro steps</span>
            <span>·</span>
            {values.impact ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Impact included
              </span>
            ) : (
              <span className="text-red-500">Impact missing</span>
            )}
          </div>
        </div>

        {/* 4. PROOF OF CONCEPT CARD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PROOF OF CONCEPT
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => onGoToStep(4)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 h-auto p-0 hover:underline"
            >
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {values.pocPayload ? "Payload included" : "No payload — recommended"}
            </span>
            <span>·</span>
            <span>{attachedFiles.length} attachments</span>
          </div>
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Submission Checklist
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("checklistInScope")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
            />
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100">
              The affected asset is listed in this program's in-scope targets
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("checklistNotDuplicate")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
            />
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100">
              I searched for existing reports and believe this is not a duplicate
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("checklistReproducible")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
            />
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100">
              My steps to reproduce are clear and I can reproduce this myself
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("checklistNoPii")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
            />
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100">
              I have not included real user PII or exfiltrated data in this report
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("checklistAgreeTerms")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
            />
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100">
              I have read and agree to the program's disclosure policy and rules
            </span>
          </label>
        </div>

        {/* Warning callout banner if checklist incomplete */}
        {!isChecklistComplete && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-sm font-medium text-amber-900 dark:text-amber-300 leading-relaxed mt-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              Complete all checklist items to enable submission. This maintains report quality and speeds up triage.
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm font-semibold text-red-600 dark:text-red-400">
          {submitError}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="flex-1 h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 gap-2 cursor-pointer shadow-2xs"
          >
            {isDraftSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Draft Saved</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Save as Draft</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            disabled={!isChecklistComplete || isSubmitting}
            onClick={onSubmitReport}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Submitting Report..." : "Submit Solution"}</span>
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          By submitting, you agree to responsible disclosure and the program's rules. Expected first response: 2 days.
        </p>
      </div>
    </div>
  );
}

