"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Camera,
  Check,
  Code2,
  Eye,
  Globe,
  Link2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { parseApiError, type ParsedApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useGetEditProfileFormQuery,
  useUpdateProfileMutation,
} from "@/lib/redux/services/profileApi";
import {
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from "@/lib/redux/services/avatarApi";
import {
  AVATAR_ACCEPT_ATTR,
  validateAvatarFile,
} from "@/lib/validations/avatar";
import type { EditProfileFormData } from "@/lib/types/profile/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_BIO = 500;

/** Maps backend PATCH field names to form keys for inline server errors. */
const API_FIELD_TO_FORM: Record<string, string> = {
  firstName: "fullName",
  lastName: "fullName",
  biography: "bio",
  phone: "phone",
  avatarUrl: "avatarUrl",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  socialLinks: "socialLinks",
};

const GENDER_OPTIONS: {
  value: NonNullable<EditProfileFormData["gender"]>;
  label: string;
}[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

interface SocialEntry {
  id: string;
  url: string;
}

function urlToEntry(url: string, id: string): SocialEntry {
  return { id, url };
}

const inputClass =
  "h-11 rounded-xl border-slate-300 bg-white text-base text-slate-900 shadow-2xs transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-blue-500";

const errorInputClass =
  "border-rose-400 focus-visible:ring-rose-500/30 dark:border-rose-700";

function Field({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-base font-semibold text-slate-800 dark:text-neutral-200"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-base font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        hint && (
          <p className="text-sm text-slate-500 dark:text-neutral-400">{hint}</p>
        )
      )}
    </div>
  );
}

// ─── GitHub-Style Markdown Bio Editor ─────────────────────────────────────────

function BioEditor({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold text-slate-800 dark:text-neutral-200">
        Bio
      </label>

      {/* GitHub Tab Strip */}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-50/50 shadow-2xs dark:border-neutral-700 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/70 px-4 pt-2.5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer",
                activeTab === "write"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200",
              )}
            >
              <Code2 size={15} />
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer",
                activeTab === "preview"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200",
              )}
            >
              <Eye size={15} />
              Preview
            </button>
          </div>

          <span
            className={cn(
              "text-sm tabular-nums font-medium pb-1.5",
              value.length > MAX_BIO * 0.9
                ? "text-rose-500"
                : "text-slate-400 dark:text-neutral-500",
            )}
          >
            {value.length}/{MAX_BIO}
          </span>
        </div>

        {/* Content Box */}
        <div className="bg-white p-4 dark:bg-neutral-950">
          {activeTab === "write" ? (
            <textarea
              id="edit-bio"
              value={value}
              maxLength={MAX_BIO}
              rows={8}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Tell the community about yourself. Markdown is supported."
              className={cn(
                "min-h-[180px] w-full resize-y bg-transparent font-mono text-base text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-sans dark:text-neutral-100",
                error && errorInputClass,
              )}
            />
          ) : (
            <div className="min-h-[180px] w-full prose prose-base prose-slate max-w-none dark:prose-invert">
              {value.trim() ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-base italic text-slate-400 dark:text-neutral-500">
                  Nothing to preview
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-neutral-400">
        {error ? (
          <p className="font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          <p>
            Supports <span className="font-mono font-semibold">**bold**</span>,{" "}
            <span className="font-mono font-semibold">_italic_</span>,{" "}
            <span className="font-mono font-semibold">[links](url)</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Dynamic Social Links Editor ──────────────────────────────────────────────

function SocialLinksEditor({
  entries,
  onChange,
  error,
}: {
  entries: SocialEntry[];
  onChange: (entries: SocialEntry[]) => void;
  error?: string;
}) {
  const nextId = useRef(entries.length);

  const add = () => {
    onChange([...entries, { id: String(nextId.current++), url: "" }]);
  };

  const remove = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const update = (id: string, url: string) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, url } : e)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-slate-800 dark:text-neutral-200">
          Social links
        </label>
        <button
          type="button"
          onClick={add}
          id="social-add-btn"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
        >
          <Plus size={15} />
          Add link
        </button>
      </div>

      <AnimatePresence initial={false}>
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-neutral-500">
                  <Link2 size={16} />
                </span>
                <Input
                  id={`social-link-${entry.id}`}
                  inputMode="url"
                  value={entry.url}
                  onChange={(e) => update(entry.id, e.target.value)}
                  placeholder="https://github.com/username or website URL"
                  className={cn(
                    inputClass,
                    "pl-9 font-mono text-base",
                    error && errorInputClass,
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                aria-label="Remove link"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
          <p className="text-base text-slate-500 dark:text-neutral-400">
            No social links added yet.
          </p>
          <button
            type="button"
            onClick={add}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <Plus size={14} /> Add your first link
          </button>
        </div>
      )}

      {error && (
        <p className="text-base font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProfileEditPanelProps {
  onDone: () => void;
}

export default function ProfileEditPanel({ onDone }: ProfileEditPanelProps) {
  const { data: initialData, isLoading } = useGetEditProfileFormQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();

  const [form, setForm] = useState<EditProfileFormData | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<ParsedApiError | null>(null);

  const [socialEntries, setSocialEntries] = useState<SocialEntry[] | null>(null);

  const isAvatarBusy = isUploading || isRemoving;
  const values = form ?? initialData ?? null;

  const resolvedEntries: SocialEntry[] = (() => {
    if (socialEntries !== null) return socialEntries;
    if (!values) return [];
    const links = values.socialLinks;
    const out: SocialEntry[] = [];
    let id = 0;
    if (links.github) out.push(urlToEntry(links.github, String(id++)));
    if (links.twitter) out.push(urlToEntry(links.twitter, String(id++)));
    if (links.linkedin) out.push(urlToEntry(links.linkedin, String(id++)));
    if (links.website) out.push(urlToEntry(links.website, String(id++)));
    return out;
  })();

  const patch = (next: Partial<EditProfileFormData>) =>
    setForm((prev) => ({ ...(prev ?? initialData!), ...next }));

  const fieldError = (formKey: string): string | undefined => {
    if (!saveError) return undefined;
    for (const [apiField, message] of Object.entries(saveError.fieldErrors)) {
      if (API_FIELD_TO_FORM[apiField] === formKey) return message;
      if (apiField === formKey) return message;
    }
    return undefined;
  };

  if (isLoading || !values) {
    return (
      <div className="w-full space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-neutral-800" />
      </div>
    );
  }

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reason = validateAvatarFile(file);
    if (reason) { setAvatarError(reason); return; }
    setAvatarError(null);
    try {
      const profile = await uploadAvatar(file).unwrap();
      patch({ avatarUrl: profile.avatarUrl || undefined });
      toast.success("Photo updated.");
    } catch (err) {
      setAvatarError(parseApiError(err, "Upload failed.").message);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError(null);
    try {
      await removeAvatar().unwrap();
      patch({ avatarUrl: undefined });
      toast.success("Photo removed.");
    } catch (err) {
      setAvatarError(parseApiError(err, "Could not remove photo.").message);
    }
  };

  const socialLinksFromEntries = () => {
    const urls = resolvedEntries.map((e) => e.url.trim()).filter(Boolean);
    return {
      github: urls.find((u) => u.includes("github.com")) ?? "",
      twitter: urls.find((u) => u.includes("x.com") || u.includes("twitter.com")) ?? "",
      linkedin: urls.find((u) => u.includes("linkedin.com")) ?? "",
      website: urls.find((u) =>
        !u.includes("github.com") &&
        !u.includes("x.com") &&
        !u.includes("twitter.com") &&
        !u.includes("linkedin.com")
      ) ?? urls[0] ?? "",
    };
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await updateProfile({
        ...values,
        socialLinks: socialLinksFromEntries(),
      }).unwrap();
      toast.success("Profile updated.");
      onDone();
    } catch (err) {
      const parsed = parseApiError(err, "Failed to update profile.");
      setSaveError(parsed);
      toast.error(parsed.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full space-y-8"
    >
      {/* Save Error Banner */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="alert"
            className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/40"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold text-rose-800 dark:text-rose-200">
                {saveError.status
                  ? `Couldn't save (${saveError.status})`
                  : "Couldn't save"}
              </p>
              <p className="text-base text-rose-700 dark:text-rose-300">
                {saveError.message}
              </p>
              {Object.keys(saveError.fieldErrors).length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-base text-rose-700 dark:text-rose-300">
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

      {/* GitHub Two-Column Grid: Form Left, Profile Picture Right */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] md:items-start">
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          <h2 className="border-b border-slate-200/80 pb-3 text-2xl font-bold tracking-tight text-slate-900 dark:border-neutral-800 dark:text-neutral-100">
            Public profile
          </h2>

          <Field
            label="Full name"
            htmlFor="edit-full-name"
            error={fieldError("fullName")}
          >
            <Input
              id="edit-full-name"
              value={values.fullName}
              onChange={(e) => patch({ fullName: e.target.value })}
              placeholder="First & last name"
              className={cn(inputClass, fieldError("fullName") && errorInputClass)}
            />
          </Field>

          {/* GitHub-style Markdown Bio */}
          <BioEditor
            value={values.bio}
            onChange={(v) => patch({ bio: v })}
            error={fieldError("bio")}
          />

          {/* Dynamic Social Links */}
          <SocialLinksEditor
            entries={resolvedEntries}
            onChange={(entries) => setSocialEntries(entries)}
            error={fieldError("socialLinks")}
          />

          {/* Personal Details */}
          <div className="space-y-4 border-t border-slate-200/80 pt-5 dark:border-neutral-800">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Personal details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="edit-phone" error={fieldError("phone")}>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={values.phone ?? ""}
                  onChange={(e) => patch({ phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                  className={cn(inputClass, fieldError("phone") && errorInputClass)}
                />
              </Field>

              <Field
                label="Date of birth"
                htmlFor="edit-dob"
                error={fieldError("dateOfBirth")}
              >
                <DatePicker
                  id="edit-dob"
                  value={values.dateOfBirth ?? ""}
                  onChange={(val) => patch({ dateOfBirth: val })}
                  error={Boolean(fieldError("dateOfBirth"))}
                  placeholder="Select date of birth"
                />
              </Field>
            </div>

            <Field label="Gender" error={fieldError("gender")}>
              <div className="flex flex-wrap gap-2 pt-1">
                {GENDER_OPTIONS.map((opt) => {
                  const active = values.gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => patch({ gender: opt.value })}
                      className={cn(
                        "cursor-pointer rounded-xl px-4 py-2.5 text-base font-semibold transition-colors",
                        active
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                {values.gender && (
                  <button
                    type="button"
                    onClick={() => patch({ gender: undefined })}
                    className="cursor-pointer rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </Field>
          </div>

          {/* Sticky Bottom Action Bar (equal to width of form) */}
          <div className="sticky bottom-4 z-20 mt-8 flex flex-col gap-3.5 rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-base font-medium text-slate-600 dark:text-neutral-300">
              <span className="inline-block size-2.5 shrink-0 rounded-full bg-blue-600 animate-pulse" />
              <span>Careful — you have unsaved changes.</span>
            </div>

            <div className="flex items-center justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                id="edit-cancel-btn"
                onClick={onDone}
                className="h-11 rounded-xl border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <X size={15} />
                Cancel
              </Button>

              <Button
                type="button"
                id="edit-save-btn"
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 rounded-xl bg-blue-600 px-6 text-base font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Picture (GitHub Style) */}
        <div className="space-y-3 md:sticky md:top-6">
          <label className="block text-lg font-bold text-slate-800 dark:text-neutral-200">
            Profile picture
          </label>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-full border-2 border-slate-200/80 bg-slate-100 shadow-xs ring-4 ring-white dark:border-neutral-700 dark:bg-neutral-800 dark:ring-neutral-950">
              {values.avatarUrl ? (
                <Image
                  src={values.avatarUrl}
                  alt=""
                  fill
                  /* A fixed avatar well — never larger than this. */
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-4xl font-bold text-white">
                  {values.avatarInitials}
                </div>
              )}

              {isAvatarBusy && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
                  <Loader2 className="size-7 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-2 pt-2">
              <label
                htmlFor="profile-avatar-upload"
                className={cn(
                  "flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
                  isAvatarBusy && "pointer-events-none opacity-60",
                )}
              >
                <Camera size={18} />
                <span>Upload new photo</span>
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept={AVATAR_ACCEPT_ATTR}
                  disabled={isAvatarBusy}
                  className="hidden"
                  onChange={handleAvatarPick}
                />
              </label>

              {values.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={isAvatarBusy}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={16} />
                  Remove photo
                </button>
              )}
            </div>

            <p className="text-center text-sm font-medium text-slate-400 dark:text-neutral-500">
              PNG, JPG or WebP · max 2 MB
            </p>

            {avatarError && (
              <p className="text-center text-sm font-medium text-rose-600">{avatarError}</p>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
