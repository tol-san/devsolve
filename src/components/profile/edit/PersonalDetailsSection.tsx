"use client";

import {
  User,
  Phone,
  Calendar,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CountrySelect } from "@/components/shared/CountrySelect";
import type { EditProfileFormData } from "@/lib/types/profile/types";

interface PersonalDetailsSectionProps {
  values: EditProfileFormData;
  onChange: (patch: Partial<EditProfileFormData>) => void;
  fieldError: (fieldKey: string) => string | undefined;
}

const GENDER_OPTIONS: {
  value: NonNullable<EditProfileFormData["gender"]>;
  label: string;
  description: string;
}[] = [
  { value: "MALE", label: "Male", description: "Identifies as Male" },
  { value: "FEMALE", label: "Female", description: "Identifies as Female" },
  { value: "OTHER", label: "Other / Non-binary", description: "Other gender identity" },
];

const inputClass =
  "h-11 rounded-xl border-border bg-background text-base text-foreground shadow-2xs transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const errorInputClass =
  "border-rose-400 focus-visible:ring-rose-500/30 dark:border-rose-700";

export default function PersonalDetailsSection({
  values,
  onChange,
  fieldError,
}: PersonalDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <section id="section-identity" className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="size-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Identity & Public Info
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your primary public identity details shown across DevSolve programs, reports, and leaderboards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="edit-full-name"
              className="block text-base font-semibold text-foreground"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="edit-full-name"
                value={values.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                placeholder="e.g. Satoshi Nakamoto"
                className={cn(inputClass, fieldError("fullName") && errorInputClass)}
              />
            </div>
            {fieldError("fullName") && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {fieldError("fullName")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-location"
              className="block text-base font-semibold text-foreground"
            >
              Country
            </label>
            <CountrySelect
              id="edit-location"
              value={values.location}
              error={Boolean(fieldError("location"))}
              onChange={(code) => onChange({ location: code })}
            />
            {fieldError("location") && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {fieldError("location")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-username"
                className="block text-base font-semibold text-foreground"
              >
                Username Handle
              </label>
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Lock className="size-3" /> Managed
              </span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-muted-foreground">
                @
              </span>
              <Input
                id="edit-username"
                value={values.username}
                disabled
                className={cn(inputClass, "pl-8 cursor-not-allowed bg-muted/50 text-muted-foreground font-mono")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your public handle is associated with your Keycloak authentication account.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-email"
                className="block text-base font-semibold text-foreground"
              >
                Account Email
              </label>
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Lock className="size-3" /> Verified
              </span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Mail className="size-4" />
              </span>
              <Input
                id="edit-email"
                value={values.email}
                disabled
                className={cn(inputClass, "pl-9 cursor-not-allowed bg-muted/50 text-muted-foreground")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Primary email used for security advisories and notifications.
            </p>
          </div>
        </div>
      </section>

      <section id="section-personal" className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Personal & Contact Details
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional private details for payouts, identity verification, and researcher coordination.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="edit-phone"
              className="block text-base font-semibold text-foreground"
            >
              Phone Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Phone className="size-4" />
              </span>
              <Input
                id="edit-phone"
                type="tel"
                value={values.phone ?? ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+1 555 123 4567"
                className={cn(inputClass, "pl-9", fieldError("phone") && errorInputClass)}
              />
            </div>
            {fieldError("phone") && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {fieldError("phone")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-dob"
              className="block text-base font-semibold text-foreground"
            >
              Date of Birth
            </label>
            <DatePicker
              id="edit-dob"
              value={values.dateOfBirth ?? ""}
              onChange={(val) => onChange({ dateOfBirth: val })}
              error={Boolean(fieldError("dateOfBirth"))}
              placeholder="Select date of birth"
            />
            {fieldError("dateOfBirth") && (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {fieldError("dateOfBirth")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-base font-semibold text-foreground">
            Gender
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {GENDER_OPTIONS.map((opt) => {
              const active = values.gender === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ gender: opt.value })}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer",
                    active
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <span className={cn("text-base font-bold", active ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
          {values.gender && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onChange({ gender: undefined })}
                className="cursor-pointer text-xs font-semibold text-muted-foreground transition hover:text-foreground hover:underline"
              >
                Clear gender selection
              </button>
            </div>
          )}
          {fieldError("gender") && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {fieldError("gender")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
