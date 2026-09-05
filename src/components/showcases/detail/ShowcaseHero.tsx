"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Flag,
  LayoutTemplate,
  Loader2,
  Pencil,
  Play,
  Sparkles,
  Tag,
  Trash2,
  ZoomIn,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import {
  useDeleteShowcaseMutation,
  type ShowcaseResponse,
  type ShowcaseViewer,
} from "@/lib/redux/services/showcasesApi";
import { formatDate, initialsOf } from "@/lib/discussions/format";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { cn } from "@/lib/utils";

interface ShowcaseHeroProps {
  showcase: ShowcaseResponse;
  viewer?: ShowcaseViewer;
  onOpenReport?: () => void;
  actionBar?: React.ReactNode;
}

export function ShowcaseHero({
  showcase,
  viewer,
  onOpenReport,
  actionBar,
}: ShowcaseHeroProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteShowcase, { isLoading: isDeleting }] = useDeleteShowcaseMutation();

  const v = viewer ?? showcase.viewer;
  const canEdit = Boolean(v?.canEdit);
  const canDelete = Boolean(v?.canDelete);
  const isEditUnderReview = Boolean(v?.editUnderReview);
  const isPending = showcase.reviewStatus === "PENDING";

  const hasLiveUrl = Boolean(showcase.liveUrl?.trim());
  const hasRepoUrl = Boolean(showcase.repoUrl?.trim());
  const hasVideoUrl = Boolean(showcase.videoUrl?.trim());
  const hasAnyLink = hasLiveUrl || hasRepoUrl || hasVideoUrl;

  const tags = showcase.tags ?? [];
  const authorName = showcase.author?.fullName || showcase.authorName || "Anonymous";
  const username = showcase.author?.username || "";

  const handleDelete = async () => {
    try {
      await deleteShowcase(showcase.id).unwrap();
      toast.success("Showcase deleted successfully.");
      setDeleteDialogOpen(false);
      router.push("/showcases");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to delete showcase";
      toast.error(msg || "Failed to delete showcase");
    }
  };

  return (
    <header
      id="overview"
      className="scroll-mt-24 rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xs relative overflow-hidden"
    >
      {/* Top accent rail */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40"
      />

      <div className="p-5 sm:p-7 space-y-6">
        {/* Top Meta Bar: Category, Tags, Review status + Contextual Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {showcase.categoryName && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-primary/30 bg-primary/10 text-primary shadow-2xs"
            >
              <LayoutTemplate className="size-3.5" />
              <span>{showcase.categoryName}</span>
            </Badge>
          )}

          {isPending && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 text-xs font-bold shadow-2xs">
              <Clock className="size-3.5" />
              <span>Pending Review</span>
            </span>
          )}

          {isEditUnderReview && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 text-xs font-bold shadow-2xs">
              <AlertCircle className="size-3.5" />
              <span>Revision Under Review</span>
            </span>
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

        {/* Top-Right Contextual Actions (Edit/Delete/Report) */}
        <div className="flex items-center gap-1.5">
          {canEdit && (
            <Link
              href={`/dashboard/showcases/${showcase.id}/edit`}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Pencil className="size-3.5 text-primary" />
              <span>Edit</span>
            </Link>
          )}

          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-8.5 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-background/80 hover:bg-rose-500/10 hover:border-rose-500/40 shadow-2xs cursor-pointer"
            >
              <Trash2 className="size-3.5 mr-1" />
              <span>Delete</span>
            </Button>
          )}

          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              aria-label="Report showcase"
              className="inline-flex size-8.5 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-rose-500 transition-colors shadow-2xs cursor-pointer"
              title="Report content"
            >
              <Flag className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-extrabold tracking-tight text-foreground leading-[1.15] break-words">
        {showcase.title}
      </h1>

      {/* Author & Published Info Line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link
          href={username ? `/profile/${username}` : "#"}
          className="group inline-flex items-center gap-2"
        >
          <Avatar className="size-7 rounded-full border border-border">
            {showcase.author?.avatarUrl && (
              <AvatarImage
                src={showcase.author.avatarUrl}
                alt={authorName}
              />
            )}
            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
              {initialsOf(authorName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {authorName}
          </span>
        </Link>
        {username && (
          <span className="text-muted-foreground/70">@{username}</span>
        )}
        <span aria-hidden="true" className="text-border">·</span>
        <span>Published {formatDate(showcase.createdAt)}</span>
        {showcase.updatedAt && showcase.createdAt && new Date(showcase.updatedAt) > new Date(showcase.createdAt) && (
          <>
            <span aria-hidden="true" className="text-border">·</span>
            <span>Edited {formatDate(showcase.updatedAt)}</span>
          </>
        )}
      </div>

      {/* 16:9 Cover Image Container - shows full uncropped photo with click to preview */}
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

            {/* Ambient blurred backdrop so any aspect ratio fills seamlessly */}
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
          /* Fallback Banner */
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

      {/* Overview */}
      {showcase.overview && (
        <div className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
          <MarkdownView source={showcase.overview} size="lg" />
        </div>
      )}

      {/* Action Link Row (only renders existing links) */}
      {hasAnyLink && (
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
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
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm border border-border/80 bg-background/80 text-foreground hover:bg-muted shadow-2xs transition-all active:scale-98"
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
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm border border-border/80 bg-background/80 text-foreground hover:bg-muted shadow-2xs transition-all active:scale-98"
            >
              <Play className="size-4 text-rose-500 fill-rose-500/20" />
              <span>Watch Video</span>
            </a>
          )}
        </div>
      )}
      </div>

      {/* Bottom Integrated Action & Engagement Bar */}
      {actionBar && (
        <div className="border-t border-border/80 bg-muted/20 px-4 sm:px-7 py-3 sm:py-3.5">
          {actionBar}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Showcase?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete this showcase? This action will
              permanently remove the post and its walkthrough steps.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Showcase</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

