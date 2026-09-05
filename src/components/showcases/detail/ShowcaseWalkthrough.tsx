"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Code2,
  FileCode,
  Image as ImageIcon,
  Layers,
  Network,
  ZoomIn,
} from "lucide-react";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { ShowcaseCodeBlock } from "@/components/showcases/detail/ShowcaseCodeBlock";
import { ShowcaseDiagramViewer } from "@/components/showcases/diagram/ShowcaseDiagramViewer";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import type { ShowcaseStepResponse } from "@/lib/redux/services/showcasesApi";
import { cn } from "@/lib/utils";

interface ShowcaseWalkthroughProps {
  steps?: ShowcaseStepResponse[];
}

export function ShowcaseWalkthrough({ steps = [] }: ShowcaseWalkthroughProps) {
  const [activeModalImage, setActiveModalImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Layers className="size-4.5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Implementation Walkthrough
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Step-by-step breakdown and technical documentation
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
          {steps.length} {steps.length === 1 ? "step" : "steps"}
        </span>
      </div>

      {/* Numbered vertical timeline */}
      <div className="relative space-y-6 before:absolute before:left-4 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
        {steps.map((step) => {
          const stepNumStr = String(step.stepNumber).padStart(2, "0");
          const hasDesc = Boolean(step.description?.trim());
          const hasCode = Boolean(step.codeSnippet?.trim());
          const hasImage = Boolean(step.imageUrl?.trim());
          const hasDiagram = Boolean(step.diagramUrl?.trim());

          return (
            <article
              key={step.id || step.stepNumber}
              className="relative pl-11 sm:pl-14 group"
            >
              {/* Timeline marker icon */}
              <div className="absolute left-0 top-1.5 flex size-8 sm:size-10 items-center justify-center rounded-xl border border-border bg-card text-xs sm:text-sm font-black tabular-nums text-primary shadow-xs transition-transform group-hover:scale-105">
                {stepNumStr}
              </div>

              {/* Step Card Container */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-border transition-colors space-y-5">
                {/* Step Title */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step {step.stepNumber}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>

                {/* Step Description: only rendered if non-null */}
                {hasDesc && (
                  <div className="text-sm sm:text-base leading-relaxed text-foreground/90">
                    <MarkdownView source={step.description!} />
                  </div>
                )}

                {/* Step Code Snippet: only rendered if non-null */}
                {hasCode && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <FileCode className="size-3.5 text-primary" />
                      <span>Code Snippet</span>
                    </div>
                    {/* The code block handles syntax highlighting, line wrapping, copy button, and self-contained horizontal scroll */}
                    <div className="rounded-xl overflow-hidden border border-border/80 shadow-2xs">
                      <ShowcaseCodeBlock code={step.codeSnippet!} />
                    </div>
                  </div>
                )}

                {/* Step Image: only rendered if non-null */}
                {hasImage && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <ImageIcon className="size-3.5 text-primary" />
                      <span>Reference Figure</span>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setActiveModalImage({
                          src: step.imageUrl!,
                          alt: `${step.title} figure`,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveModalImage({
                            src: step.imageUrl!,
                            alt: `${step.title} figure`,
                          });
                        }
                      }}
                      className="group/img relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-border/80 bg-muted/40 cursor-zoom-in transition-all hover:border-primary/50 flex items-center justify-center"
                    >
                      {/* Ambient blurred backdrop so full figures look seamless */}
                      <Image
                        src={step.imageUrl!}
                        alt=""
                        fill
                        aria-hidden="true"
                        sizes="100px"
                        quality={20}
                        className="object-cover blur-2xl opacity-25 dark:opacity-20 scale-110 pointer-events-none select-none"
                      />
                      {/* Full uncropped photo/figure */}
                      <Image
                        src={step.imageUrl!}
                        alt={`${step.title} figure`}
                        fill
                        sizes="(max-width: 768px) 100vw, 800px"
                        quality={95}
                        className="object-contain p-2 transition-transform duration-300 group-hover/img:scale-[1.01]"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover/img:bg-black/10 flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/90 text-xs font-semibold text-foreground shadow-md backdrop-blur-xs">
                          <ZoomIn className="size-3.5" />
                          <span>Click to zoom</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Diagram: only rendered if non-null */}
                {hasDiagram && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Network className="size-3.5 text-primary" />
                      <span>Architecture Diagram</span>
                    </div>
                    <ShowcaseDiagramViewer
                      diagramUrl={step.diagramUrl!}
                      title={`${step.title} Architecture`}
                      stepId={step.id}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Click to zoom modal for images */}
      <ImagePreviewModal
        src={activeModalImage?.src ?? null}
        alt={activeModalImage?.alt}
        title={activeModalImage?.alt}
        isOpen={activeModalImage !== null}
        onClose={() => setActiveModalImage(null)}
      />
    </section>
  );
}
