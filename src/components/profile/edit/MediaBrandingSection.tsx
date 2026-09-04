"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AVATAR_ACCEPT_ATTR } from "@/lib/validations/avatar";

interface MediaBrandingSectionProps {
  avatarUrl?: string;
  avatarInitials: string;
  coverUrl?: string;
  isAvatarBusy: boolean;
  isCoverBusy: boolean;
  avatarError?: string | null;
  coverError?: string | null;
  onAvatarPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove: () => void;
  onCoverPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverRemove: () => void;
  onCoverDrop?: (file: File) => void;
}

export default function MediaBrandingSection({
  avatarUrl,
  avatarInitials,
  coverUrl,
  isAvatarBusy,
  isCoverBusy,
  avatarError,
  coverError,
  onAvatarPick,
  onAvatarRemove,
  onCoverPick,
  onCoverRemove,
  onCoverDrop,
}: MediaBrandingSectionProps) {
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onCoverDrop) {
      onCoverDrop(file);
    }
  };

  return (
    <section id="section-media" className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="size-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Branding & Media
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your cover banner and profile avatar to showcase your researcher identity.
          </p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 transition-all",
          isCoverDragOver
            ? "border-dashed border-primary bg-primary/5 ring-4 ring-primary/20"
            : "border-border bg-muted/30"
        )}
      >
        <div className="relative h-36 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt="Profile Cover Banner"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center p-4 sm:p-6 text-center">
              <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-1.5 sm:mb-2">
                <Upload className="size-4 sm:size-5" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                <span className="hidden sm:inline">Drag & drop a banner image here, or click to upload</span>
                <span className="sm:hidden">Tap to upload cover banner</span>
              </p>
              <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                Recommended 1200×400px (3:1) · PNG, JPG or WebP up to 2MB
              </p>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <input
              ref={coverInputRef}
              id="profile-cover-upload-input"
              type="file"
              accept={AVATAR_ACCEPT_ATTR}
              disabled={isCoverBusy}
              className="hidden"
              onChange={onCoverPick}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isCoverBusy}
              onClick={() => coverInputRef.current?.click()}
              className="h-8 sm:h-9 gap-1.5 rounded-xl border border-border/80 bg-background/90 px-3 sm:px-3.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:bg-background"
            >
              {isCoverBusy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <span>{coverUrl ? "Change Banner" : "Upload Banner"}</span>
            </Button>

            {coverUrl && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isCoverBusy}
                onClick={onCoverRemove}
                className="h-8 sm:h-9 rounded-xl px-2.5 sm:px-3 text-xs font-semibold shadow-sm transition"
                title="Remove cover banner"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>

          {isCoverBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 shadow-lg border border-border">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Processing cover image...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="relative px-4 sm:px-6 pb-5 sm:pb-6 pt-2 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            
            <div className="flex items-end gap-3 sm:gap-5">
              <div className="group/avatar relative size-20 sm:size-28 shrink-0 rounded-full border-4 border-card bg-muted shadow-xl overflow-hidden ring-2 ring-primary/20 -mt-10 sm:-mt-16 z-10">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-xl sm:text-3xl font-extrabold text-white">
                    {avatarInitials || "DS"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isAvatarBusy}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover/avatar:opacity-100 cursor-pointer disabled:pointer-events-none"
                  title="Click to change photo"
                >
                  <Camera className="size-5 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider hidden sm:inline">
                    Change
                  </span>
                </button>

                {isAvatarBusy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-1 pb-0.5">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Profile Avatar
                </h3>
                <p className="hidden sm:block text-xs text-muted-foreground">
                  Square photo recommended (min 200×200px) · Max 2MB
                </p>
                <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                  <input
                    ref={avatarInputRef}
                    id="profile-avatar-upload-input"
                    type="file"
                    accept={AVATAR_ACCEPT_ATTR}
                    disabled={isAvatarBusy}
                    className="hidden"
                    onChange={onAvatarPick}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isAvatarBusy}
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-8 gap-1.5 rounded-lg border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Camera className="size-3" />
                    <span>Upload Photo</span>
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isAvatarBusy}
                      onClick={onAvatarRemove}
                      className="h-8 size-8 p-0 rounded-lg text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                      title="Remove photo"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove photo</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {(avatarError || coverError) && (
        <div className="space-y-2">
          {avatarError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>Avatar Error: {avatarError}</span>
            </div>
          )}
          {coverError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>Cover Banner Error: {coverError}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
