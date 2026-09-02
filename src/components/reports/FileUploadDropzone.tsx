"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  FileText,
  FileCode,
  File as FileIcon,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_FILES,
  validateAttachment,
  withAttachmentMime,
} from "@/lib/validations/attachment";
import { AttachmentPreviewModal } from "@/components/reports/AttachmentPreviewModal";

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  file: File;
  previewUrl?: string;
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
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  // Maintain object URLs for local image preview thumbnails
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  // Clean up object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

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

      let previewUrl: string | undefined;
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.set(file.name, previewUrl);
      }

      accepted.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        file,
        previewUrl,
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

  const handleRemove = (file: AttachedFile) => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
      objectUrlsRef.current.delete(file.name);
    }
    onRemoveFile(file.id);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (/^(png|jpg|jpeg|webp|gif|svg)$/i.test(ext)) {
      return <ImageIcon className="size-4.5 text-purple-500" />;
    }
    if (/^(txt|log|json|xml|js|ts|py|sh)$/i.test(ext)) {
      return <FileCode className="size-4.5 text-blue-500" />;
    }
    if (ext === "pdf") {
      return <FileText className="size-4.5 text-rose-500" />;
    }
    return <FileIcon className="size-4.5 text-amber-500" />;
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground">
              Attached files ({activeFiles.length}/{maxFiles})
            </p>
            <span className="text-xs text-muted-foreground">Click a file to preview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeFiles.map((file) => {
              const isImg = file.type.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file.name);
              const previewSrc = file.previewUrl || (isImg ? URL.createObjectURL(file.file) : undefined);

              return (
                <div
                  key={file.id}
                  onClick={() => setPreviewFile(file)}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/50 hover:bg-accent/40 transition-all cursor-pointer shadow-2xs"
                >
                  {/* Left: Thumbnail / Icon + Name & Size */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Visual Preview Thumbnail or Icon Block */}
                    <div className="relative size-10 rounded-lg overflow-hidden bg-muted/60 border border-border/80 flex items-center justify-center shrink-0">
                      {isImg && previewSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewSrc}
                          alt={file.name}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        getFileIcon(file.name)
                      )}
                    </div>

                    {/* File Details */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-foreground text-xs sm:text-sm">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="uppercase">{file.name.split(".").pop() || "FILE"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                      }}
                      className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Preview file"
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(file);
                      }}
                      disabled={disabled}
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {validationError && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-destructive">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {validationError}
        </p>
      )}

      {/* Full Preview Modal */}
      <AttachmentPreviewModal
        attachedFile={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
