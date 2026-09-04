"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  const maxAllowed = Math.max(0, 10 - existingCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
    >
      <Card className={CARD_CLASS} aria-labelledby="problem-attachments-heading">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>
            <h2
              id="problem-attachments-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Logs and evidence
            </h2>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Optional files are checked against known threats before they are stored. Anything new to our scanner finishes checking shortly after upload.
          </CardDescription>
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
