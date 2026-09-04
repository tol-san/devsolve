"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form";
import { Terminal, AlertTriangle, Plus, X } from "lucide-react";
import { SubmitReportFormValues } from "@/lib/validations/report";
import { FileUploadDropzone, AttachedFile } from "@/components/reports/FileUploadDropzone";
import { Input } from "@/components/ui/input";
import { PocCodeEditor } from "@/components/reports/PocCodeEditor";

interface SubmitReportPocStepProps {
  register: UseFormRegister<SubmitReportFormValues>;
  control: Control<SubmitReportFormValues>;
  errors: FieldErrors<SubmitReportFormValues>;
  attachedFiles: AttachedFile[];
  externalLinks: string[];
  onAddFiles: (files: AttachedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onAddExternalLink: () => void;
  onRemoveExternalLink: (index: number) => void;
  onUpdateExternalLink: (index: number, val: string) => void;
}

export function SubmitReportPocStep({
  register,
  control,
  errors,
  attachedFiles,
  externalLinks,
  onAddFiles,
  onRemoveFile,
  onAddExternalLink,
  onRemoveExternalLink,
  onUpdateExternalLink,
}: SubmitReportPocStepProps) {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Proof of Concept
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Minimum evidence to confirm the vulnerability is real and exploitable
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-sm font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Handle PoC responsibly.</span> Include only the minimum evidence needed. Do not attach real user PII, exfiltrated data, or destructive payloads.
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="pocPayload" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            PoC Payload / Code
          </label>
          <span className="text-xs text-slate-500 font-medium">payload, curl command, Burp request, or script</span>
        </div>
        <Controller
          name="pocPayload"
          control={control}
          render={({ field }) => (
            <PocCodeEditor
              value={field.value || ""}
              onChange={(val) => field.onChange(val || "")}
              error={!!errors.pocPayload}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="expectedResult" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Expected Result
          </label>
          <textarea
            id="expectedResult"
            rows={3}
            placeholder="Server returns 403 Forbidden for invoice IDs belonging to other users."
            {...register("expectedResult")}
            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="actualResult" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Actual Result
          </label>
          <textarea
            id="actualResult"
            rows={3}
            placeholder="Server returns 200 OK with full billing data of the victim user."
            {...register("actualResult")}
            className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Attachments
          </label>
          <span className="text-xs text-slate-500 font-medium">screenshots, Burp exports, video (max 50 MB each)</span>
        </div>

        <FileUploadDropzone
          attachedFiles={attachedFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            External Links
          </label>
          <span className="text-xs text-slate-500 font-medium">Loom, Google Drive, video demo</span>
        </div>

        <div className="space-y-2.5">
          {externalLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                type="url"
                value={link}
                onChange={(e) => onUpdateExternalLink(idx, e.target.value)}
                placeholder="https://loom.com/share/..."
                className="bg-white dark:bg-slate-900 h-11 text-sm border-slate-300 dark:border-slate-700 flex-1"
              />
              {externalLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveExternalLink(idx)}
                  className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-600 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddExternalLink}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add link</span>
        </button>
      </div>
    </div>
  );
}

