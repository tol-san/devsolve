"use client";

import React from "react";
import { motion } from "motion/react";
import { Paperclip, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ExistingAttachments } from "@/components/discussions/create/ExistingAttachments";
import {
  FileUploadDropzone,
  type AttachedFile,
} from "@/components/reports/FileUploadDropzone";
import { ContentScanStatus } from "@/components/security/ContentScanStatus";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import { CARD_CLASS } from "./types-and-constants";

interface ProblemAttachmentsSectionProps {
  existingAttachments?: ProblemResponse["attachments"];
  onRemoveExistingAttachment: (attachmentId: string) => Promise<void>;
  attachedFiles: AttachedFile[];
  onAddFiles: (files: AttachedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  submitting: boolean;
  uploading: boolean;
  mutationLoading: boolean;
}

export function ProblemAttachmentsSection({
  existingAttachments,
  onRemoveExistingAttachment,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
  submitting,
  uploading,
  mutationLoading,
}: ProblemAttachmentsSectionProps) {
  const existingCount = existingAttachments?.length ?? 0;
  const totalCount = existingCount + attachedFiles.length;
  const maxAllowed = Math.max(0, 10 - existingCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
    >
      <Card
        id="section-attachments"
        className={CARD_CLASS}
        aria-labelledby="problem-attachments-heading"
      >
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Paperclip className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground font-bold">04.</span>
                  <h2
                    id="problem-attachments-heading"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    Logs & Evidence
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Attach screenshots, reproduction recordings, or error logs. Files are scanned for safety.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                Malware scanned
              </span>
              <Badge variant="outline" className="text-muted-foreground text-xs font-normal">
                {totalCount > 0 ? `${totalCount}/10 files` : "Optional"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {existingCount > 0 && (
            <ExistingAttachments
              attachments={existingAttachments!}
              onRemove={onRemoveExistingAttachment}
              disabled={mutationLoading}
            />
          )}

          <FileUploadDropzone
            files={attachedFiles}
            onAddFiles={onAddFiles}
            onRemoveFile={onRemoveFile}
            disabled={submitting}
            maxFiles={maxAllowed}
          />

          <ContentScanStatus
            active={uploading}
            fileCount={attachedFiles.length}
            compact
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
