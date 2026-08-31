"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@uiw/react-markdown-preview/markdown.css";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";

/**
 * Read-only markdown, for the overview and the step bodies authors write in
 * `MarkdownEditor`. Same renderer as that editor's preview pane, so what was
 * written is what shows.
 *
 * Loaded on the client only: the underlying preview reaches for `window`.
 */
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
          /* The renderer paints its own surface; the page's card is the surface
             here, so it is made transparent and only the type is inherited. */
          style={{ background: "transparent" }}
          className="!bg-transparent [&.wmde-markdown]:!text-[17px] [&.wmde-markdown]:!leading-relaxed [&.wmde-markdown_img]:cursor-pointer [&.wmde-markdown_img]:transition-transform hover:[&.wmde-markdown_img]:scale-[1.01] hover:[&.wmde-markdown_img]:opacity-95 [&.wmde-markdown_img]:rounded-xl"
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
