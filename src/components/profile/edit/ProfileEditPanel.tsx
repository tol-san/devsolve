"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Loader2,
  X,
  Undo2,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
} from "lucide-react";
import { parseApiError, type ParsedApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import {
  useGetEditProfileFormQuery,
  useUpdateProfileMutation,
  useUploadCoverImageMutation,
  useRemoveCoverImageMutation,
} from "@/lib/redux/services/profileApi";
import {
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from "@/lib/redux/services/avatarApi";
import { validateAvatarFile } from "@/lib/validations/avatar";
import type { EditProfileFormData, SocialLinksForm } from "@/lib/types/profile/types";

import ProfileCompletionMeter from "./ProfileCompletionMeter";
import LiveProfilePreviewCard from "./LiveProfilePreviewCard";
import MediaBrandingSection from "./MediaBrandingSection";
import BioMarkdownEditor from "./BioMarkdownEditor";
import SocialLinksSection from "./SocialLinksSection";
import PersonalDetailsSection from "./PersonalDetailsSection";

// ─── Constants ───────────────────────────────────────────────────────────────

const API_FIELD_TO_FORM: Record<string, string> = {
  firstName: "fullName",
  lastName: "fullName",
  biography: "bio",
  phone: "phone",
  avatarUrl: "avatarUrl",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  socialLinks: "socialLinks",
  country: "location",
};

interface ProfileEditPanelProps {
  onDone: () => void;
}

export default function ProfileEditPanel({ onDone }: ProfileEditPanelProps) {
  const { data: initialData, isLoading } = useGetEditProfileFormQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();
  const [uploadCover, { isLoading: isUploadingCover }] = useUploadCoverImageMutation();
  const [removeCover, { isLoading: isRemovingCover }] = useRemoveCoverImageMutation();

  const [form, setForm] = useState<EditProfileFormData | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<ParsedApiError | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const isAvatarBusy = isUploading || isRemoving;
  const isCoverBusy = isUploadingCover || isRemovingCover;
  const values = form ?? initialData ?? null;

  const patch = useCallback((next: Partial<EditProfileFormData>) => {
    setForm((prev) => ({ ...(prev ?? initialData!), ...next }));
  }, [initialData]);

  // Check if form has unsaved modifications
  const isDirty = Boolean(
    initialData &&
    values &&
    JSON.stringify({
      fullName: values.fullName,
      bio: values.bio,
      location: values.location,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      socialLinks: values.socialLinks,
    }) !==
    JSON.stringify({
      fullName: initialData.fullName,
      bio: initialData.bio,
      location: initialData.location,
      phone: initialData.phone,
      dateOfBirth: initialData.dateOfBirth,
      gender: initialData.gender,
      socialLinks: initialData.socialLinks,
    })
  );

  const handleReset = () => {
    if (initialData) {
      setForm(initialData);
      setSaveError(null);
      toast.info("Changes discarded.");
    }
  };

  const fieldError = (formKey: string): string | undefined => {
    if (!saveError) return undefined;
    for (const [apiField, message] of Object.entries(saveError.fieldErrors)) {
      if (API_FIELD_TO_FORM[apiField] === formKey) return message;
      if (apiField === formKey) return message;
    }
    return undefined;
  };

  // Avatar Upload Handlers
  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reason = validateAvatarFile(file);
    if (reason) {
      setAvatarError(reason);
      return;
    }
    setAvatarError(null);
    try {
      const profile = await uploadAvatar(file).unwrap();
      patch({ avatarUrl: profile.avatarUrl || undefined });
      toast.success("Avatar photo updated.");
    } catch (err) {
      setAvatarError(parseApiError(err, "Avatar upload failed.").message);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError(null);
    try {
      await removeAvatar().unwrap();
      patch({ avatarUrl: undefined });
      toast.success("Avatar photo removed.");
    } catch (err) {
      setAvatarError(parseApiError(err, "Could not remove photo.").message);
    }
  };

  // Cover Image Upload Handlers
  const handleCoverUploadFile = async (file: File) => {
    const reason = validateAvatarFile(file);
    if (reason) {
      setCoverError(reason);
      return;
    }
    setCoverError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const profile = await uploadCover(body).unwrap();
      patch({ coverUrl: profile.coverImageUrl || undefined });
      toast.success("Cover banner updated.");
    } catch (err) {
      setCoverError(parseApiError(err, "Banner upload failed.").message);
    }
  };

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await handleCoverUploadFile(file);
  };

  const handleCoverRemove = async () => {
    setCoverError(null);
    try {
      await removeCover().unwrap();
      patch({ coverUrl: undefined });
      toast.success("Cover banner removed.");
    } catch (err) {
      setCoverError(parseApiError(err, "Could not remove banner.").message);
    }
  };

  // Save Profile Handler
  const handleSave = useCallback(async () => {
    if (!values) return;
    setSaveError(null);
    try {
      await updateProfile(values).unwrap();
      toast.success("Profile saved successfully.");
      onDone();
    } catch (err) {
      const parsed = parseApiError(err, "Failed to update profile.");
      setSaveError(parsed);
      toast.error(parsed.message);
    }
  }, [values, updateProfile, onDone]);

  // Global Keyboard Shortcuts (Ctrl+S / Cmd+S to save, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      } else if (e.key === "Escape") {
        onDone();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, onDone]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading || !values) {
    return (
      <div className="w-full space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative w-full space-y-8"
    >
      {/* Save Error Alert Banner */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="alert"
            className="flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold">
                {saveError.status ? `Unable to save changes (${saveError.status})` : "Unable to save changes"}
              </p>
              <p className="text-sm">{saveError.message}</p>
              {Object.keys(saveError.fieldErrors).length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                  {Object.entries(saveError.fieldErrors).map(([f, msg]) => (
                    <li key={f}>
                      <span className="font-semibold">{f}</span>: {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:items-start">
        {/* Left Column: Structured Form Sections */}
        <div className="space-y-8 min-w-0">
          {/* Profile Strength & Completion Progress Meter */}
          <ProfileCompletionMeter
            values={values}
            onFocusSection={scrollToSection}
          />

          {/* Media & Branding Studio (Cover + Avatar) */}
          <MediaBrandingSection
            avatarUrl={values.avatarUrl}
            avatarInitials={values.avatarInitials}
            coverUrl={values.coverUrl}
            isAvatarBusy={isAvatarBusy}
            isCoverBusy={isCoverBusy}
            avatarError={avatarError}
            coverError={coverError}
            onAvatarPick={handleAvatarPick}
            onAvatarRemove={handleAvatarRemove}
            onCoverPick={handleCoverPick}
            onCoverRemove={handleCoverRemove}
            onCoverDrop={handleCoverUploadFile}
          />

          {/* Identity & Personal Details */}
          <PersonalDetailsSection
            values={values}
            onChange={patch}
            fieldError={fieldError}
          />

          {/* Markdown Biography Editor */}
          <BioMarkdownEditor
            value={values.bio}
            onChange={(bio) => patch({ bio })}
            error={fieldError("bio")}
          />

          {/* Social Profiles & Web */}
          <SocialLinksSection
            socialLinks={values.socialLinks}
            onChange={(socialLinks: SocialLinksForm) => patch({ socialLinks })}
            error={fieldError("socialLinks")}
          />
        </div>

        {/* Right Column: Sticky Live Preview Card & Helper Panel */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Live Preview Card */}
          <LiveProfilePreviewCard values={values} />

          {/* Quick Shortcuts & Navigation Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                Quick Jump
              </h3>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => scrollToSection("section-media")}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span>Branding & Media</span>
                <span className="text-xs font-mono">{values.coverUrl && values.avatarUrl ? "✓ Done" : "2 items"}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("section-identity")}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span>Identity & Public Info</span>
                <span className="text-xs font-mono">{values.fullName ? "✓ Done" : "Required"}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("section-personal")}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span>Personal & Contact</span>
                <span className="text-xs font-mono">{values.phone ? "✓ Done" : "Optional"}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("section-bio")}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span>Research Biography</span>
                <span className="text-xs font-mono">{values.bio?.length ? `${values.bio.length} chars` : "Empty"}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("section-social")}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span>Social Profiles & Web</span>
                <span className="text-xs font-mono">
                  {[values.socialLinks?.github, values.socialLinks?.twitter, values.socialLinks?.linkedin, values.socialLinks?.website].filter(Boolean).length} linked
                </span>
              </button>
            </div>

            <div className="border-t border-border/70 pt-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Save shortcut:</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
                  ⌘S / Ctrl+S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Exit shortcut:</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Smart Action Bar (Sticky at screen bottom) */}
      <AnimatePresence>
        {(isDirty || isSaving) && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/90 bg-card/95 px-6 py-4 shadow-2xl backdrop-blur-xl ring-1 ring-foreground/5">
              <div className="flex items-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-blue-600" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Unsaved changes detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Don&apos;t forget to save before leaving.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="h-10 gap-1.5 rounded-xl border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Undo2 className="size-3.5" />
                  <span>Discard</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-10 gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  <span>Save Changes</span>
                  <kbd className="ml-1 hidden rounded bg-blue-700/80 px-1.5 py-0.5 text-[10px] font-mono text-white sm:inline-block">
                    ⌘S
                  </kbd>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
