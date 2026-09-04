"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { AlertCircle, Check, ImageUp, Loader2, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect } from "@/components/shared/CountrySelect";
import {
  type Organization,
  type OrganizationIndustry,
  type UpdateOrganizationRequest,
  useRemoveOrganizationCoverMutation,
  useRemoveOrganizationLogoMutation,
  useUpdateMyOrganizationMutation,
  useUploadOrganizationCoverMutation,
  useUploadOrganizationLogoMutation,
} from "@/lib/redux/services/organizationsApi";
import {
  ORGANIZATION_LOGO_ACCEPT_ATTR,
  validateOrganizationLogoFile,
} from "@/lib/validations/organization-logo";
import {
  COVER_IMAGE_ACCEPT_ATTR,
  validateCoverImageFile,
} from "@/lib/validations/cover-image";
import { parseApiError, type ParsedApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const BACK_HREF = "/dashboard/organizations";

const INDUSTRIES: { value: OrganizationIndustry; label: string }[] = [
  { value: "TECHNOLOGY", label: "Technology & Software" },
  { value: "FINANCE", label: "Financial Services & Fintech" },
  { value: "HEALTHCARE", label: "Healthcare & Biotech" },
  { value: "ECOMMERCE", label: "E-Commerce & Retail" },
  { value: "GOVERNMENT", label: "Government & Public Sector" },
  { value: "EDUCATION", label: "Education & Academia" },
  { value: "OTHER", label: "Other Industry" },
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const inputClass =
  "h-11 rounded-xl border-border bg-background text-base text-foreground shadow-2xs transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const errorInputClass =
  "border-rose-400 focus-visible:ring-rose-500/30 dark:border-rose-700";

const selectTriggerClass =
  "h-11 w-full rounded-xl border-border bg-background text-base text-foreground shadow-2xs";

type FormState = Required<
  Pick<
    UpdateOrganizationRequest,
    | "name"
    | "domain"
    | "websiteUrl"
    | "logoUrl"
    | "coverUrl"
    | "description"
    | "industry"
    | "companySize"
    | "country"
  >
>;

function formStateFrom(organization: Organization): FormState {
  return {
    name: organization.name || "",
    domain: organization.domain || "",
    websiteUrl: organization.websiteUrl || "",
    logoUrl: organization.logoUrl || "",
    coverUrl: (organization.coverUrl || organization.coverImageUrl || "") as string,
    description: organization.description || "",
    industry: (organization.industry || "TECHNOLOGY") as OrganizationIndustry,
    companySize: organization.companySize || "11-50",
    country: organization.country || "",
  };
}

function Field({
  label,
  hint,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-base font-semibold text-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        hint && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )
      )}
    </div>
  );
}

export default function OrgEditPanel({
  organization,
}: {
  organization: Organization;
}) {
  const router = useRouter();
  const [updateOrg, { isLoading: isSaving }] = useUpdateMyOrganizationMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] =
    useUploadOrganizationLogoMutation();
  const [removeLogo, { isLoading: isRemovingLogo }] =
    useRemoveOrganizationLogoMutation();
  const [uploadCover, { isLoading: isUploadingCover }] =
    useUploadOrganizationCoverMutation();
  const [removeCover, { isLoading: isRemovingCover }] =
    useRemoveOrganizationCoverMutation();
  const isLogoBusy = isUploadingLogo || isRemovingLogo;
  const isCoverBusy = isUploadingCover || isRemovingCover;

  const initial = useMemo(() => formStateFrom(organization), [organization]);
  const [form, setForm] = useState<FormState>(initial);
  const [saveError, setSaveError] = useState<ParsedApiError | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => (Object.keys(initial) as (keyof FormState)[]).some(
      (key) => form[key] !== initial[key],
    ),
    [form, initial],
  );

  const patch = (next: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...next }));

  const fieldError = (key: keyof FormState) => saveError?.fieldErrors[key];

  const handleLogoPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reason = validateOrganizationLogoFile(file);
    if (reason) {
      setLogoError(reason);
      return;
    }

    setLogoError(null);
    try {
      const updated = await uploadLogo(file).unwrap();
      setForm((prev) => ({ ...prev, logoUrl: updated.logoUrl || "" }));
      toast.success("Logo updated.");
    } catch (error) {
      setLogoError(
        parseApiError(error, "The logo could not be uploaded.").message,
      );
    }
  };

  const handleLogoRemove = async () => {
    setLogoError(null);
    try {
      await removeLogo().unwrap();
      setForm((prev) => ({ ...prev, logoUrl: "" }));
      toast.success("Logo removed.");
    } catch (error) {
      setLogoError(
        parseApiError(error, "The logo could not be removed.").message,
      );
    }
  };

  const handleCoverPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reason = validateCoverImageFile(file);
    if (reason) {
      setCoverError(reason);
      return;
    }

    setCoverError(null);
    try {
      const updated = await uploadCover(file).unwrap();
      const newCover = updated.coverUrl || (updated as { coverImageUrl?: string }).coverImageUrl || "";
      setForm((prev) => ({ ...prev, coverUrl: newCover }));
      toast.success("Cover image updated.");
    } catch (error) {
      setCoverError(
        parseApiError(error, "The cover image could not be uploaded.").message,
      );
    }
  };

  const handleCoverRemove = async () => {
    setCoverError(null);
    try {
      await removeCover().unwrap();
      setForm((prev) => ({ ...prev, coverUrl: "" }));
      toast.success("Cover image removed.");
    } catch (error) {
      setCoverError(
        parseApiError(error, "The cover image could not be removed.").message,
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);

    try {
      await updateOrg(form).unwrap();
      toast.success("Organization updated.", {
        description: "Your changes have been saved.",
      });
      router.push(BACK_HREF);
    } catch (error) {
      const parsed = parseApiError(
        error,
        "Failed to update organization details.",
      );
      setSaveError(parsed);
      toast.error(parsed.message);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full space-y-6"
    >
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
          {form.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.coverUrl}
              alt={`${form.name || "Organization"} cover banner`}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center p-4 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <ImageUp className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Upload organization cover banner
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recommended 1200×400px · PNG, JPG or WebP up to 5 MB
              </p>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <label
              htmlFor="organization-cover-upload"
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border/80 bg-background/90 px-3.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:bg-background",
                isCoverBusy && "pointer-events-none opacity-60",
              )}
            >
              {isUploadingCover ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ImageUp className="size-3.5" />
              )}
              <span>{form.coverUrl ? "Change banner" : "Upload banner"}</span>
              <input
                id="organization-cover-upload"
                type="file"
                accept={COVER_IMAGE_ACCEPT_ATTR}
                disabled={isCoverBusy}
                className="sr-only"
                onChange={handleCoverPick}
              />
            </label>

            {form.coverUrl && (
              <button
                type="button"
                onClick={() => void handleCoverRemove()}
                disabled={isCoverBusy}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200/80 bg-background/90 px-3 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur-md transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">
                  {isRemovingCover ? "Removing…" : "Remove"}
                </span>
              </button>
            )}
          </div>

          {isCoverBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 backdrop-blur-xs">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {coverError && (
          <div className="border-t border-rose-200 bg-rose-50 p-3 dark:border-rose-900/60 dark:bg-rose-950/40">
            <p className="text-center text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400">
              {coverError}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px] md:items-start lg:grid-cols-[1fr_340px]">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="border-b border-border pb-3 text-xl font-bold tracking-tight text-foreground">
            Organization details
          </h2>

          <Field
            label="Organization name"
            htmlFor="org-name"
            error={fieldError("name")}
          >
            <Input
              id="org-name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Acme Corp"
              required
              className={cn(inputClass, fieldError("name") && errorInputClass)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Domain"
              htmlFor="org-domain"
              hint="The domain your team's email addresses use."
              error={fieldError("domain")}
            >
              <Input
                id="org-domain"
                value={form.domain}
                onChange={(e) => patch({ domain: e.target.value })}
                placeholder="acme.com"
                className={cn(inputClass, fieldError("domain") && errorInputClass)}
              />
            </Field>

            <Field
              label="Website URL"
              htmlFor="org-website"
              error={fieldError("websiteUrl")}
            >
              <Input
                id="org-website"
                type="url"
                value={form.websiteUrl}
                onChange={(e) => patch({ websiteUrl: e.target.value })}
                placeholder="https://acme.com"
                className={cn(
                  inputClass,
                  fieldError("websiteUrl") && errorInputClass,
                )}
              />
            </Field>

            <Field label="Industry" error={fieldError("industry")}>
              <Select
                value={form.industry}
                onValueChange={(value: string | null) => {
                  if (value) patch({ industry: value as OrganizationIndustry });
                }}
              >
                <SelectTrigger id="org-industry" className={selectTriggerClass}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Company size" error={fieldError("companySize")}>
              <Select
                value={form.companySize}
                onValueChange={(value: string | null) => {
                  if (value) patch({ companySize: value });
                }}
              >
                <SelectTrigger id="org-size" className={selectTriggerClass}>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Country / region"
              htmlFor="org-country"
              error={fieldError("country")}
            >
              <CountrySelect
                id="org-country"
                value={form.country}
                error={Boolean(fieldError("country"))}
                onChange={(code) => patch({ country: code })}
              />
            </Field>

          </div>

          <Field
            label="Description"
            htmlFor="org-description"
            hint="Shown to researchers browsing your programs."
            error={fieldError("description")}
          >
            <Textarea
              id="org-description"
              rows={5}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Brief summary of your company's core mission and services..."
              className={cn(
                "rounded-xl border-border bg-background text-base text-foreground shadow-2xs transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
                fieldError("description") && errorInputClass,
              )}
            />
          </Field>
        </div>

        <div className="space-y-3 md:sticky md:top-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="w-full text-base font-bold text-foreground">
              Organization logo
            </h2>

            <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl border border-border bg-muted shadow-xs">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-blue-500/10 text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {organization.name.substring(0, 2).toUpperCase()}
                </div>
              )}

              {isLogoBusy && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-xs">
                  <Loader2 className="size-7 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="organization-logo-upload"
                className={cn(
                  "flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 text-base font-semibold text-foreground shadow-2xs transition hover:bg-muted/70",
                  isLogoBusy && "pointer-events-none opacity-60",
                )}
              >
                <ImageUp size={18} />
                <span>{isUploadingLogo ? "Uploading…" : "Upload new logo"}</span>
                <input
                  id="organization-logo-upload"
                  type="file"
                  accept={ORGANIZATION_LOGO_ACCEPT_ATTR}
                  disabled={isLogoBusy}
                  className="sr-only"
                  onChange={handleLogoPick}
                />
              </label>

              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => void handleLogoRemove()}
                  disabled={isLogoBusy}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={16} />
                  {isRemovingLogo ? "Removing…" : "Remove logo"}
                </button>
              )}
            </div>

            <p className="text-center text-sm font-medium text-muted-foreground">
              PNG, JPG or WebP · max 2 MB
            </p>

            {logoError && (
              <p className="text-center text-sm font-medium text-rose-600 dark:text-rose-400">
                {logoError}
              </p>
            )}

            <div className="w-full border-t border-border pt-4">
              <Field
                label="Or link to one"
                htmlFor="org-logo"
                hint="Saved with the rest of the form."
                error={fieldError("logoUrl")}
              >
                <Input
                  id="org-logo"
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => patch({ logoUrl: e.target.value })}
                  placeholder="https://acme.com/logo.png"
                  className={cn(
                    inputClass,
                    "text-sm",
                    fieldError("logoUrl") && errorInputClass,
                  )}
                />
              </Field>

              <Field
                label="Cover banner URL"
                htmlFor="org-cover-url"
                hint="Direct link to banner image."
                error={fieldError("coverUrl")}
              >
                <Input
                  id="org-cover-url"
                  type="url"
                  value={form.coverUrl}
                  onChange={(e) => patch({ coverUrl: e.target.value })}
                  placeholder="https://acme.com/cover.jpg"
                  className={cn(
                    inputClass,
                    "text-sm",
                    fieldError("coverUrl") && errorInputClass,
                  )}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3.5 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-base font-medium text-muted-foreground">
          {isDirty ? (
            <>
              <span className="inline-block size-2.5 shrink-0 animate-pulse rounded-full bg-blue-600" />
              <span>Careful — you have unsaved changes.</span>
            </>
          ) : (
            <span className="text-muted-foreground">
              No changes yet.
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <Link
            href={BACK_HREF}
            className={cn(
              buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-border bg-card px-5 text-base font-semibold text-foreground shadow-2xs transition hover:bg-muted",
            )}
          >
            <X size={15} />
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={isSaving || !isDirty}
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
    </motion.form>
  );
}
