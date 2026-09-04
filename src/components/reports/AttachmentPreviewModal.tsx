"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FileCode,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AttachmentItem {
  id?: string;
  name: string;
  size?: string;
  type?: string;
  url?: string;
  file?: File;
  previewUrl?: string;
}

interface AttachmentPreviewModalProps {
  attachment?: AttachmentItem | null;
  attachedFile?: AttachmentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentPreviewModal({
  attachment,
  attachedFile,
  isOpen,
  onClose,
}: AttachmentPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = attachment || attachedFile || null;
  const file = active?.file;
  const fileName = active?.name || "Attachment";
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
  const isImage =
    /^(png|jpg|jpeg|webp|gif|svg)$/i.test(fileExt) ||
    Boolean(active?.type?.startsWith("image/"));
  const isText =
    /^(txt|log|json|xml|csv|md|js|ts|py|sh)$/i.test(fileExt) ||
    Boolean(active?.type?.includes("text") || active?.type?.includes("json"));
  const isPdf =
    fileExt === "pdf" || Boolean(active?.type?.includes("pdf"));

  useEffect(() => {
    if (!isOpen || !active) {
      setObjectUrl(null);
      setTextContent(null);
      return;
    }

    let urlToUse: string | null = null;
    let shouldRevoke = false;

    if (file) {
      urlToUse = URL.createObjectURL(file);
      shouldRevoke = true;
    } else if (active.previewUrl || active.url) {
      urlToUse = active.previewUrl || active.url || null;
    }

    setObjectUrl(urlToUse);
    setZoom(1);
    setRotation(0);
    setCopied(false);

    if (isText) {
      setIsLoadingText(true);
      if (file) {
        file
          .text()
          .then((text) => {
            setTextContent(text);
            setIsLoadingText(false);
          })
          .catch(() => {
            setTextContent("Could not load text content.");
            setIsLoadingText(false);
          });
      } else if (urlToUse) {
        fetch(urlToUse)
          .then((res) => res.text())
          .then((text) => {
            setTextContent(text);
            setIsLoadingText(false);
          })
          .catch(() => {
            setTextContent("Could not load remote text content.");
            setIsLoadingText(false);
          });
      } else {
        setTextContent("Preview not available for this text file.");
        setIsLoadingText(false);
      }
    } else {
      setTextContent(null);
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (shouldRevoke && urlToUse) {
        URL.revokeObjectURL(urlToUse);
      }
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, file, active, isText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyText = async () => {
    if (!textContent) return;
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy content");
    }
  };

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!mounted || !isOpen || !active) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {isImage ? (
                  <ImageIcon className="size-4.5" />
                ) : isText ? (
                  <FileCode className="size-4.5" />
                ) : isPdf ? (
                  <FileText className="size-4.5" />
                ) : (
                  <FileIcon className="size-4.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-md">
                    {fileName}
                  </h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 shrink-0">
                    {fileExt || "FILE"}
                  </Badge>
                </div>
                {active.size && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {active.size}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isText && textContent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </Button>
              )}

              {objectUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
                  title="Download file"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="size-8 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close (Esc)"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-background/50 flex flex-col items-center justify-center min-h-[300px]">
            {isImage && objectUrl && (
              <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
                <div className="relative flex items-center justify-center overflow-hidden max-h-[60vh] max-w-full rounded-xl bg-muted/20 border border-border/60 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={objectUrl}
                    alt={fileName}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease-out",
                    }}
                    className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm select-none"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1 shadow-sm backdrop-blur-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    disabled={zoom <= 0.5}
                    className="size-7 rounded-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="size-3.5" />
                  </Button>
                  <span className="px-2 text-xs font-mono font-medium text-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    disabled={zoom >= 3}
                    className="size-7 rounded-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="size-3.5" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="size-7 rounded-lg"
                    title="Rotate"
                  >
                    <RotateCw className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="size-7 rounded-lg text-xs"
                    title="Reset Zoom"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {isText && (
              <div className="w-full h-full flex flex-col">
                {isLoadingText ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-2">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading file content…</p>
                  </div>
                ) : (
                  <div className="w-full rounded-xl border border-border bg-muted/40 font-mono text-xs overflow-auto max-h-[60vh] p-4 text-foreground leading-relaxed select-text shadow-inner">
                    <pre className="whitespace-pre-wrap break-words">{textContent || "No text content found in file."}</pre>
                  </div>
                )}
              </div>
            )}

            {isPdf && objectUrl && (
              <div className="w-full h-[65vh] flex flex-col rounded-xl overflow-hidden border border-border">
                <iframe
                  src={objectUrl}
                  title={fileName}
                  className="w-full h-full rounded-xl bg-white"
                />
              </div>
            )}

            {(!isImage || !objectUrl) && (!isText || (!textContent && !isLoadingText)) && (!isPdf || !objectUrl) && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                  <FileIcon className="size-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-base">{fileName}</h4>
                  <p className="text-xs text-muted-foreground">
                    This file format can be downloaded and opened with external tools.
                  </p>
                </div>
                {objectUrl && (
                  <Button
                    type="button"
                    onClick={handleDownload}
                    className="rounded-xl h-10 px-5 gap-2 font-semibold cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>Download {fileName}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
