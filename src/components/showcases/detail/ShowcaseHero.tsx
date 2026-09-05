"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Play,
  Sparkles,
  Tag,
  LayoutTemplate,
  ZoomIn,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import { cn } from "@/lib/utils";

interface ShowcaseHeroProps {
  showcase: ShowcaseResponse;
}

export function ShowcaseHero({ showcase }: ShowcaseHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const hasLiveUrl = Boolean(showcase.liveUrl?.trim());
  const hasRepoUrl = Boolean(showcase.repoUrl?.trim());
  const hasVideoUrl = Boolean(showcase.videoUrl?.trim());
  const hasAnyLink = hasLiveUrl || hasRepoUrl || hasVideoUrl;

  const tags = showcase.tags ?? [];

  return (
    <header className="w-full space-y-6">
      {/* 16:9 Cover Image Container - shows full photo with click to preview */}
      <div
        onClick={() => {
          if (showcase.coverImageUrl) {
            setIsPreviewOpen(true);
          }
        }}
        role={showcase.coverImageUrl ? "button" : undefined}
        tabIndex={showcase.coverImageUrl ? 0 : undefined}
        onKeyDown={(e) => {
          if (showcase.coverImageUrl && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsPreviewOpen(true);
          }
        }}
        aria-label={showcase.coverImageUrl ? "Preview full cover photo" : undefined}
        className={cn(
          "relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-muted/30 shadow-xs flex items-center justify-center",
          showcase.coverImageUrl && "cursor-zoom-in group/hero transition-all hover:border-primary/50",
        )}
      >
        {showcase.coverImageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted/60" />
            )}

            {/* Ambient blurred backdrop so any aspect ratio fills seamlessly without harsh letterboxes */}
            <Image
              src={showcase.coverImageUrl}
              alt=""
              fill
              aria-hidden="true"
              sizes="100px"
              quality={20}
              className="object-cover blur-2xl opacity-25 dark:opacity-20 scale-110 pointer-events-none select-none"
            />

            {/* Full uncropped cover photo */}
            <Image
              src={showcase.coverImageUrl}
              alt={showcase.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              priority
              quality={95}
              className={cn(
                "object-contain p-1.5 sm:p-3 transition-all duration-500 group-hover/hero:scale-[1.01]",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Click to preview floating badge */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 pointer-events-none">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/90 text-xs font-semibold text-foreground shadow-sm border border-border/80 backdrop-blur-xs group-hover/hero:bg-primary group-hover/hero:text-primary-foreground group-hover/hero:border-primary transition-all">
                <ZoomIn className="size-3.5" />
                <span>Click to preview</span>
              </span>
            </div>
          </>
        ) : (
          /* Graceful Fallback Banner */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 text-center select-none">
            <div className="size-16 sm:size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mb-3">
              <Sparkles className="size-8 sm:size-10" />
            </div>
            <span className="text-sm sm:text-base font-semibold text-muted-foreground max-w-md line-clamp-1">
              {showcase.categoryName || "DevSolve Community Showcase"}
            </span>
          </div>
        )}
      </div>

      {/* Metadata & Title Block */}
      <div className="space-y-4">
        {/* Category & Tags Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showcase.categoryName && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-primary/30 bg-primary/10 text-primary shadow-2xs"
            >
              <LayoutTemplate className="size-3.5" />
              <span>{showcase.categoryName}</span>
            </Badge>
          )}

          {tags.map((tag) => {
            const slug = tag.slug || tag.name || "";
            return (
              <Link
                key={tag.id || slug}
                href={`/showcases?tag=${encodeURIComponent(slug)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted/60 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <Tag className="size-3 text-muted-foreground/70" />
                <span>{tag.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] break-words">
          {showcase.title}
        </h1>

        {/* Overview paragraph */}
        {showcase.overview && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl pt-1">
            {showcase.overview}
          </p>
        )}

        {/* Action Link Row (only renders existing links) */}
        {hasAnyLink && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            {hasLiveUrl && (
              <a
                href={showcase.liveUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-all active:scale-98"
              >
                <ExternalLink className="size-4" />
                <span>Live Demo</span>
              </a>
            )}

            {hasRepoUrl && (
              <a
                href={showcase.repoUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm border border-border/80 bg-card text-foreground hover:bg-muted shadow-2xs transition-all active:scale-98"
              >
                <SiGithub className="size-4" />
                <span>Source Code</span>
              </a>
            )}

            {hasVideoUrl && (
              <a
                href={showcase.videoUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm border border-border/80 bg-card text-foreground hover:bg-muted shadow-2xs transition-all active:scale-98"
              >
                <Play className="size-4 text-rose-500 fill-rose-500/20" />
                <span>Watch Video</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Full Photo Lightbox Preview */}
      {showcase.coverImageUrl && (
        <ImagePreviewModal
          src={showcase.coverImageUrl}
          alt={showcase.title}
          title={showcase.title}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </header>
  );
}
