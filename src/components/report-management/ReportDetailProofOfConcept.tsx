"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCode2,
  FileImage,
  FileText,
  Maximize2,
  RotateCcw,
  Terminal,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AttachmentItem = {
  name: string;
  kind: "image" | "file";
  size?: string;
  url?: string;
  content?: string;
};

type ReportDetailProofOfConceptProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailProofOfConcept({
  detail,
}: ReportDetailProofOfConceptProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentItem | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [copiedFileContent, setCopiedFileContent] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(detail.proofRequest);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyFileContent = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFileContent(true);
      setTimeout(() => setCopiedFileContent(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = (att: AttachmentItem) => {
    if (att.content) {
      const blob = new Blob([att.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (att.url) {
      const a = document.createElement("a");
      a.href = att.url;
      a.target = "_blank";
      a.download = att.name;
      a.click();
    }
  };

  return (
    <ReportDetailSectionCard
      title="Proof of Concept & Evidence"
      icon={<FileCode2 className="size-4.5" />}
      contentClassName="space-y-6"
    >
      {/* 1. HTTP Request / Exploit Code Snippet */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Terminal className="size-3.5 text-blue-600 dark:text-blue-400" />
            Exploit Request / Payloads
          </p>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {detail.proofRequestLanguage || "HTTP"}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-neutral-950 dark:bg-neutral-900/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 dark:border-neutral-700/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </span>
              <span className="ml-2 font-mono text-xs font-semibold text-neutral-300">
                {detail.proofRequestLanguage || "http"}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-7 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 dark:hover:bg-neutral-700 gap-1.5 px-2.5 rounded-lg cursor-pointer transition-all"
            >
              {copiedCode ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          <pre className="overflow-x-auto p-4 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap text-neutral-100 font-mono">
            <code>{detail.proofRequest}</code>
          </pre>
        </div>
      </div>

      {/* 2. Expected vs Actual Result Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard
          icon={<CheckCircle2 className="size-4" />}
          title="Expected Application Behavior"
          value={detail.expectedResult}
          tone="green"
        />
        <ResultCard
          icon={<XCircle className="size-4" />}
          title="Actual Observed Vulnerability"
          value={detail.actualResult}
          tone="red"
        />
      </div>

      {/* 3. Attached Proof & Evidence with Full Preview Support */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Attachments & Screenshots
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {detail.attachments.length} supporting evidence file
              {detail.attachments.length === 1 ? "" : "s"} submitted · Click any file to preview
            </p>
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {detail.attachments.length} files
          </Badge>
        </div>

        {detail.attachments.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
            {detail.attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/40"
              >
                <div
                  onClick={() => {
                    setPreviewAttachment(attachment);
                    setZoomScale(1);
                  }}
                  className="flex min-w-0 items-center gap-3 cursor-pointer flex-1"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                      attachment.kind === "image"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {attachment.kind === "image" ? (
                      <FileImage className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.size || (attachment.kind === "image" ? "1.2 MB" : "18.4 KB")} ·{" "}
                      {attachment.kind === "image" ? "Screenshot Evidence" : "Log / Payload Data"}
                    </p>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreviewAttachment(attachment);
                      setZoomScale(1);
                    }}
                    className="h-8 rounded-lg border-border bg-card text-foreground hover:bg-muted font-semibold text-xs gap-1.5 px-3 cursor-pointer shadow-2xs"
                  >
                    <Eye className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Preview</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    title="Download attachment"
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs sm:text-sm text-muted-foreground">
            No external attachment files were included with this submission.
          </div>
        )}
      </div>

      {/* 4. Interactive Attachment Preview Modal / Lightbox */}
      <AnimatePresence>
        {previewAttachment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewAttachment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      previewAttachment.kind === "image"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {previewAttachment.kind === "image" ? (
                      <FileImage className="size-4.5" />
                    ) : (
                      <FileText className="size-4.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                      {previewAttachment.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {previewAttachment.size || "1.2 MB"} ·{" "}
                      {previewAttachment.kind === "image" ? "Image Preview" : "Document & Payload Viewer"}
                    </p>
                  </div>
                </div>

                {/* Modal Controls */}
                <div className="flex items-center gap-1.5">
                  {previewAttachment.kind === "image" && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomScale((z) => Math.min(z + 0.25, 3))}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Zoom in"
                      >
                        <ZoomIn className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomScale((z) => Math.max(z - 0.25, 0.5))}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Zoom out"
                      >
                        <ZoomOut className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomScale(1)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Reset zoom"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </>
                  )}

                  {previewAttachment.kind === "file" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyFileContent(previewAttachment.content)}
                      className="h-8 rounded-lg border-border text-xs gap-1.5 px-2.5 font-semibold cursor-pointer"
                    >
                      {copiedFileContent ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewAttachment)}
                    className="h-8 rounded-lg border-border text-xs gap-1.5 px-2.5 font-semibold cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewAttachment(null)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer ml-1"
                    title="Close preview"
                  >
                    <X className="size-4.5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="flex-1 overflow-auto p-5 sm:p-6 bg-muted/20 flex items-center justify-center min-h-[300px] max-h-[75vh]">
                {previewAttachment.kind === "image" ? (
                  <div className="overflow-auto max-h-full max-w-full flex items-center justify-center p-2">
                    <img
                      src={
                        previewAttachment.url ||
                        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={previewAttachment.name}
                      style={{ transform: `scale(${zoomScale})` }}
                      className="max-h-[65vh] w-auto object-contain rounded-xl border border-border/80 shadow-lg transition-transform duration-150 origin-center"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full max-h-[65vh] overflow-auto rounded-xl border border-border bg-neutral-950 dark:bg-neutral-900/95 p-4 text-neutral-100 font-mono text-xs sm:text-sm leading-relaxed shadow-inner">
                    <pre className="whitespace-pre-wrap">
                      <code>
                        {previewAttachment.content ||
                          `// File: ${previewAttachment.name}\n// Size: ${previewAttachment.size || "Unknown"}\n\n[Raw capture log data attached by researcher]`}
                      </code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3 text-xs text-muted-foreground">
                <span>
                  {previewAttachment.kind === "image"
                    ? `Viewing image (${Math.round(zoomScale * 100)}% zoom)`
                    : "Payload & Log Inspection Mode"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewAttachment(null)}
                  className="rounded-xl h-8 text-xs font-semibold px-4 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ReportDetailSectionCard>
  );
}

function ResultCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "green" | "red";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-2",
        tone === "green"
          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
          : "border-red-500/20 bg-red-500/5 dark:bg-red-500/10"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            tone === "green"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {icon}
        </span>
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            tone === "green"
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-700 dark:text-red-300"
          )}
        >
          {title}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-foreground font-medium">
        {value}
      </p>
    </div>
  );
}
