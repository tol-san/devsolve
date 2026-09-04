import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { SubmitReportFormValues } from "@/lib/validations/report";
import { FileUploadDropzone, AttachedFile } from "@/components/reports/FileUploadDropzone";

interface SubmitReportAttachmentsSectionProps {
  register: UseFormRegister<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  attachedFiles: AttachedFile[];
  onAddFiles: (newFiles: AttachedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
}

export function SubmitReportAttachmentsSection({
  register,
  errors,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
}: SubmitReportAttachmentsSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
      <FileUploadDropzone
        files={attachedFiles}
        onAddFiles={onAddFiles}
        onRemoveFile={onRemoveFile}
      />

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            {...register("checklistAgreeTerms")}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-normal">
            I declare that this security report is submitted in good faith following the target program policy, without destructive testing, unauthorized data retention, or public disclosure prior to resolution.
          </span>
        </label>
        {errors.checklistAgreeTerms && (
          <p className="text-xs text-red-500 font-medium pl-7">{errors.checklistAgreeTerms.message}</p>
        )}
      </div>
    </div>
  );
}
