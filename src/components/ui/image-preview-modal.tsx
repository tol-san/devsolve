"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Copy,
  Check,
  ExternalLink,
  Minimize2,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface ImagePreviewModalProps {
  src: string | null;
  alt?: string;
  title?: string;
  mimeType?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePreviewModal({
  src,
  alt = "Attachment preview",
  title,
  mimeType,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isPdf =
    mimeType === "application/pdf" ||
    /\.pdf$/i.test(title || alt || src || "");

  const isImage =
    !isPdf &&
    (mimeType?.startsWith("image/") ||
      /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(title || alt || src || "") ||
      (!title?.includes(".") && !mimeType));

  const isTextOrCode =
    !isPdf &&
    !isImage &&
    (mimeType?.startsWith("text/") ||
      /\.(txt|json|js|ts|tsx|jsx|py|java|c|cpp|cs|go|rs|rb|php|html|css|sql|sh|yaml|yml|xml|log|md)$/i.test(
        title || alt || src || ""
      ));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch text content if file is text/code
  useEffect(() => {
    if (isOpen && src && isTextOrCode) {
      setIsLoadingText(true);
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.text();
        })
        .then((txt) => {
          setTextContent(txt);
          setIsLoaded(true);
        })
        .catch(() => {
          setTextContent(null);
          setIsLoaded(true);
        })
        .finally(() => setIsLoadingText(false));
    }
  }, [isOpen, src, isTextOrCode]);

  // Reset zoom & rotation whenever image source changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsLoaded(false);
      setCopied(false);
      setIsDownloading(false);
      setTextContent(null);
      // Prevent background scrolling while modal is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, src]);

  // Keyboard navigation & shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.25, 4));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(1);
        setRotation(0);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        setRotation((prev) => (prev + 90) % 360);
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      toast.success("Image URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy image URL");
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src || isDownloading) return;

    setIsDownloading(true);
    try {
      // 1. Try fetching directly as a blob (works for same-origin or CORS-enabled servers)
      let blob: Blob | null = null;
      try {
        const response = await fetch(src, { mode: "cors" });
        if (response.ok) {
          blob = await response.blob();
        }
      } catch {
        // Direct fetch failed, try fallback
      }

      // 2. Canvas fallback for CORS-tainted images
      if (!blob) {
        blob = await new Promise<Blob | null>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return resolve(null);
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((b) => resolve(b), "image/png");
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });
      }

      // Determine appropriate filename
      let fileName = (title || alt || "image")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .trim();
      if (!fileName) fileName = "image";

      const hasValidExt = /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(fileName);
      if (!hasValidExt) {
        const urlMatch = src.match(/\.(png|jpe?g|webp|gif|svg|bmp)(?:\?|$)/i);
        if (urlMatch) {
          fileName += `.${urlMatch[1].toLowerCase()}`;
        } else if (blob?.type) {
          const ext = blob.type.split("/")[1] || "png";
          fileName += `.${ext === "jpeg" ? "jpg" : ext}`;
        } else {
          fileName += ".png";
        }
      }

      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        toast.success("Image downloaded successfully");
      } else {
        // 3. Fallback: Force anchor download / open
        const link = document.createElement("a");
        link.href = src;
        link.download = fileName;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
      }
    } catch (err) {
      console.error("Image download error:", err);
      toast.error("Unable to download image file");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!mounted || !src) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="image-preview-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 backdrop-blur-xl p-4 sm:p-6 select-none"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title || alt || "Image preview"}
        >
          {/* Top Bar: Title, Metadata, and Quick Actions */}
          <div
            className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4 z-20 rounded-2xl bg-slate-900/80 px-4 py-2.5 backdrop-blur-xl border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm sm:text-base font-bold text-white tracking-tight">
                {title || alt}
              </h3>
              {title && alt && alt !== title && (
                <p className="truncate text-xs text-slate-300 font-medium">{alt}</p>
              )}
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                title="Copy Image URL"
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span className="sr-only">Copy Image URL</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download Image"
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin text-blue-400" />
                ) : (
                  <Download className="size-4" />
                )}
                <span className="sr-only">Download Image</span>
              </Button>

              <a
                href={src}
                target="_blank"
                rel="noreferrer noopener"
                title="Open original in new tab"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/10 transition-colors"
              >
                <ExternalLink className="size-4" />
                <span className="sr-only">Open original in new tab</span>
              </a>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                title="Close (Esc)"
                className="h-9 w-9 rounded-xl bg-white/15 text-white hover:bg-rose-500 hover:text-white border border-white/20 transition-colors cursor-pointer ml-1"
              >
                <X className="size-4.5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Center Stage: Universal Attachment Viewer */}
          <div
            ref={imageContainerRef}
            className="relative flex flex-1 items-center justify-center overflow-hidden py-4 my-auto w-full max-h-[calc(100vh-160px)]"
            onClick={onClose}
          >
            {isPdf ? (
              <div
                className="w-full max-w-5xl h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-white/20 bg-neutral-950 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={`${src}#toolbar=1`}
                  title={title || "PDF Preview"}
                  className="w-full h-full border-0 bg-neutral-900"
                  onLoad={() => setIsLoaded(true)}
                />
              </div>
            ) : isTextOrCode ? (
              <div
                className="w-full max-w-4xl max-h-[calc(100vh-180px)] overflow-auto rounded-2xl border border-white/20 bg-neutral-950/95 p-6 text-neutral-100 font-mono text-xs sm:text-sm shadow-2xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoadingText ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-white/80" />
                  </div>
                ) : textContent !== null ? (
                  <pre className="whitespace-pre-wrap break-all leading-relaxed select-text font-mono">
                    {textContent}
                  </pre>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <FileText className="size-12 mx-auto text-white/40" />
                    <p className="text-white/80 font-medium">Unable to load text preview</p>
                    <a
                      href={src ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    >
                      <ExternalLink className="size-3.5" />
                      Open file in new tab
                    </a>
                  </div>
                )}
              </div>
            ) : isImage ? (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-3 border-white/20 border-t-white" />
                  </div>
                )}

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: zoom,
                    rotate: rotation,
                    opacity: isLoaded ? 1 : 0,
                  }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="relative max-h-full max-w-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src ?? ""}
                    alt={alt}
                    onLoad={() => setIsLoaded(true)}
                    className="max-h-[calc(100vh-180px)] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-64px)] object-contain rounded-xl shadow-2xl transition-all duration-200"
                    style={{
                      cursor: zoom > 1 ? "grab" : "default",
                    }}
                    draggable={false}
                  />
                </motion.div>
              </>
            ) : (
              /* Fallback for other file types */
              <div
                className="w-full max-w-md rounded-2xl border border-white/20 bg-neutral-900/90 p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="size-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-white">
                  <FileText className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white truncate max-w-xs mx-auto">
                    {title || "Attachment"}
                  </h3>
                  <p className="text-xs text-white/60">
                    Direct visual preview not available for this file type.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={src ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                    Open in New Tab
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-neutral-900 hover:bg-white/90 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating Control Pill (Zoom & Rotate for Images) */}
          {isImage && (
            <div
              className="flex items-center justify-center z-20 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-1.5 shadow-2xl backdrop-blur-xl">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Zoom Out (-)"
                  className="h-8 w-8 rounded-xl text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ZoomOut className="size-4" />
                  <span className="sr-only">Zoom Out</span>
                </Button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom (0)"
                  className="px-2 py-1 text-xs font-mono font-bold text-white/90 hover:text-white cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 4}
                  title="Zoom In (+)"
                  className="h-8 w-8 rounded-xl text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ZoomIn className="size-4" />
                  <span className="sr-only">Zoom In</span>
                </Button>

                <div className="mx-1.5 h-4 w-px bg-white/20" />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRotate}
                  title="Rotate 90° (R)"
                  className="h-8 w-8 rounded-xl text-white/80 hover:bg-white/15 hover:text-white cursor-pointer"
                >
                  <RotateCw className="size-4" />
                  <span className="sr-only">Rotate</span>
                </Button>

                {zoom !== 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleResetZoom}
                    title="Fit to Screen"
                    className="h-8 w-8 rounded-xl text-white/80 hover:bg-white/15 hover:text-white cursor-pointer"
                  >
                    <Minimize2 className="size-4" />
                    <span className="sr-only">Fit</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
