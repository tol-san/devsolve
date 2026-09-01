"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_FILES,
  validateAttachment,
  withAttachmentMime,
} from "@/lib/validations/attachment";

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  file: File;
}

interface FileUploadDropzoneProps {
  files?: AttachedFile[];
  attachedFiles?: AttachedFile[];
  onAddFiles: (newFiles: AttachedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  files,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
  disabled = false,
  maxFiles = ATTACHMENT_MAX_FILES,
}) => {
  const activeFiles = files || attachedFiles || [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const addFiles = (rawFiles: File[]) => {
    setValidationError(null);
    const remaining = maxFiles - activeFiles.length;
    if (remaining <= 0) {
      setValidationError(`You can attach up to ${maxFiles} files.`);
      return;
    }

    const accepted: AttachedFile[] = [];
    const known = new Set(
      activeFiles.map((item) => `${item.name}:${item.file.size}`),
    );
    for (const rawFile of rawFiles.slice(0, remaining)) {
      const file = withAttachmentMime(rawFile);
      const reason = validateAttachment(file);
      if (reason) {
        setValidationError(reason);
        continue;
      }
      const fingerprint = `${file.name}:${file.size}`;
      if (known.has(fingerprint)) {
        setValidationError(`${file.name} is already attached.`);
        continue;
      }
      known.add(fingerprint);
      accepted.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        file,
      });
    }
    if (rawFiles.length > remaining) {
      setValidationError(`Only ${maxFiles} attachments are allowed.`);
    }
    if (accepted.length) onAddFiles(accepted);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || !e.dataTransfer.files) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <label className="text-sm font-semibold text-foreground">
          Attachments & Evidence <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">PDF, Word, images, TXT, LOG · 10 MiB each</span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        onChange={handleFileChange}
        disabled={disabled || activeFiles.length >= maxFiles}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        aria-disabled={disabled || activeFiles.length >= maxFiles}
        className="border-2 border-dashed border-border hover:border-primary bg-muted/40 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group aria-disabled:pointer-events-none aria-disabled:opacity-60"
      >
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-2xs">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Click to upload or drag & drop evidence
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Attach screenshots, HTTP raw request logs, or PoC code files
          </p>
        </div>
      </div>

      {/* Uploaded File List */}
      {activeFiles.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-sm font-bold text-muted-foreground">
            Attached files ({activeFiles.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {file.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                    <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                  <span className="truncate font-semibold">{file.name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">({file.size})</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {validationError && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-destructive">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {validationError}
        </p>
      )}
    </div>
  );
};

