"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@uiw/react-markdown-preview/markdown.css";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";

const MarkdownPreview = dynamic(
  async () => (await import("@uiw/react-md-editor")).default.Markdown,
  {
    ssr: false,
    loading: () => (
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted/50" />
    ),
  },
);

interface MarkdownViewProps {
  source: string;
  className?: string;
}

export function MarkdownView({ source, className }: MarkdownViewProps) {
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
        className={className}
      >
        <MarkdownPreview
          source={source}
          style={{ background: "transparent" }}
          className="!bg-transparent [&.wmde-markdown]:!text-sm sm:[&.wmde-markdown]:!text-base [&.wmde-markdown]:!leading-relaxed [&.wmde-markdown_img]:cursor-pointer [&.wmde-markdown_img]:transition-transform hover:[&.wmde-markdown_img]:scale-[1.01] hover:[&.wmde-markdown_img]:opacity-95 [&.wmde-markdown_img]:rounded-xl [&.wmde-markdown_h1]:!text-2xl [&.wmde-markdown_h1]:!font-bold [&.wmde-markdown_h1]:!tracking-tight [&.wmde-markdown_h1]:!mt-6 [&.wmde-markdown_h1]:!mb-3 [&.wmde-markdown_h1]:!pb-2 [&.wmde-markdown_h1]:!border-b [&.wmde-markdown_h1]:!border-border [&.wmde-markdown_h2]:!text-xl [&.wmde-markdown_h2]:!font-bold [&.wmde-markdown_h2]:!tracking-tight [&.wmde-markdown_h2]:!mt-5 [&.wmde-markdown_h2]:!mb-2.5 [&.wmde-markdown_h2]:!pb-1 [&.wmde-markdown_h2]:!border-b [&.wmde-markdown_h2]:!border-border/60 [&.wmde-markdown_h3]:!text-base sm:[&.wmde-markdown_h3]:!text-lg [&.wmde-markdown_h3]:!font-bold [&.wmde-markdown_h3]:!mt-5 [&.wmde-markdown_h3]:!mb-2 [&.wmde-markdown_h4]:!text-sm sm:[&.wmde-markdown_h4]:!text-base [&.wmde-markdown_h4]:!font-semibold [&.wmde-markdown_h4]:!mt-3 [&.wmde-markdown_h4]:!mb-1.5 [&.wmde-markdown_p]:!mb-3 [&.wmde-markdown_p]:!leading-relaxed [&.wmde-markdown_ul]:!list-disc [&.wmde-markdown_ul]:!pl-6 [&.wmde-markdown_ul]:!my-2 [&.wmde-markdown_ul]:!space-y-1.5 [&.wmde-markdown_ol]:!list-decimal [&.wmde-markdown_ol]:!pl-6 [&.wmde-markdown_ol]:!my-2 [&.wmde-markdown_ol]:!space-y-1.5 [&.wmde-markdown_li]:!pl-1 [&.wmde-markdown_strong]:!font-bold"
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
