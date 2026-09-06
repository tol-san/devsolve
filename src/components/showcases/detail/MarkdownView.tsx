"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@uiw/react-markdown-preview/markdown.css";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { cn } from "@/lib/utils";

const MarkdownPreview = dynamic(
  async () => (await import("@uiw/react-md-editor")).default.Markdown,
  {
    ssr: false,
    loading: () => (
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
    ),
  },
);

interface MarkdownViewProps {
  source: string;
  className?: string;
  size?: "sm" | "base" | "lg";
}

export function MarkdownView({
  source,
  className,
  size = "base",
}: MarkdownViewProps) {
  const { resolvedTheme } = useTheme();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);

  if (!source) return null;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      if (img.src) {
        e.preventDefault();
        e.stopPropagation();
        setPreviewImage({
          src: img.src,
          alt: img.alt || "Markdown image",
        });
      }
    }
  };

  const sizeClasses =
    size === "sm"
      ? "[&.wmde-markdown]:!text-xs sm:[&.wmde-markdown]:!text-sm [&.wmde-markdown_p]:!mb-1.5 [&.wmde-markdown_p]:!leading-relaxed"
      : size === "lg"
        ? "[&.wmde-markdown]:!text-base sm:[&.wmde-markdown]:!text-[17px] [&.wmde-markdown_p]:!mb-3 [&.wmde-markdown_p]:!leading-relaxed"
        : "[&.wmde-markdown]:!text-sm sm:[&.wmde-markdown]:!text-base [&.wmde-markdown_p]:!mb-2 [&.wmde-markdown_p]:!leading-relaxed";

  return (
    <>
      <div
        data-color-mode={
          resolvedTheme === "dark"
            ? "dark"
            : resolvedTheme === "light"
              ? "light"
              : "auto"
        }
        onClick={handleContainerClick}
        className={cn("font-sans", className)}
      >
        <MarkdownPreview
          source={source}
          style={{
            background: "transparent",
          }}
          className={cn(
            "!bg-transparent !text-inherit [&.wmde-markdown]:!bg-transparent [&.wmde-markdown]:!text-inherit [&.wmde-markdown]:!font-sans [&.wmde-markdown_img]:cursor-pointer [&.wmde-markdown_img]:transition-transform hover:[&.wmde-markdown_img]:scale-[1.01] hover:[&.wmde-markdown_img]:opacity-95 [&.wmde-markdown_img]:rounded-xl",
            sizeClasses,
          )}
        />
      </div>

      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt}
        title={previewImage?.alt}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}
