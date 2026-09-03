"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { UseFormReturn } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
  Briefcase,
  ArrowRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { JOB_TITLES } from "@/lib/constants/auth";
import { useT, useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { CompanyRegisterFormValues } from "@/lib/validations/auth";

interface CompanyStep1FormProps {
  form: UseFormReturn<CompanyRegisterFormValues>;
  onNext: () => void;
}

export function CompanyStep1Form({ form, onNext }: CompanyStep1FormProps) {
  const t = useT();
  const localePath = useLocalePath();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const jobTitle = watch("jobTitle");
  const password = watch("password");

  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="space-y-4 w-full"
    >
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
          {t("auth.companyRegister.step1Title")}
        </h1>
        <p className="text-slate-600 dark:text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          {t("auth.companyRegister.step1Subtitle")}
        </p>
      </div>

      {/* Full Name */}
      <div>
        <Label
          htmlFor="fullName"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.fullName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder={t("auth.companyRegister.fullNamePlaceholder")}
            {...register("fullName")}
            className={cn(
              "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.fullName
                ? "border-destructive focus:ring-destructive/30"
                : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <User className="size-4" />
          </div>
        </div>
        {errors.fullName && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Job Title & Phone Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Title Custom Select */}
        <div>
          <Label
            htmlFor="jobTitle"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.companyRegister.jobTitle")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <CustomSelect
            value={jobTitle}
            options={JOB_TITLES}
            placeholder={t("auth.companyRegister.jobTitlePlaceholder")}
            icon={<Briefcase className="size-4" />}
            error={Boolean(errors.jobTitle)}
            onSelect={(selectedVal) => {
              setValue("jobTitle", selectedVal, { shouldValidate: true });
            }}
          />
          {errors.jobTitle && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.jobTitle.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <Label
            htmlFor="phone"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.companyRegister.phone")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder={t("auth.companyRegister.phonePlaceholder")}
              {...register("phone")}
              className={cn(
                "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                errors.phone
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Phone className="size-4" />
            </div>
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Work Email */}
      <div>
        <Label
          htmlFor="email"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.workEmail")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.companyRegister.workEmailPlaceholder")}
            {...register("email")}
            className={cn(
              "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.email
                ? "border-destructive focus:ring-destructive/30"
                : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="size-4" />
          </div>
        </div>
        {errors.email && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password */}
        <div>
          <Label
            htmlFor="password"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.common.password")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
              className={cn(
                "w-full h-11 sm:h-12 pl-10 pr-11 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                errors.password
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Key className="size-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={
                showPassword
                  ? t("auth.common.hidePassword")
                  : t("auth.common.showPassword")
              }
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.password.message}
            </p>
          )}
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <Label
            htmlFor="confirmPassword"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.common.confirmPassword")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={cn(
                "w-full h-11 sm:h-12 pl-10 pr-11 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                errors.confirmPassword
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Key className="size-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              aria-label={
                showConfirmPassword
                  ? t("auth.common.hidePassword")
                  : t("auth.common.showPassword")
              }
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("agreeTermsStep1")}
            className="size-4 mt-0.5 cursor-pointer rounded border-input text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-snug">
            {t("auth.common.agreeToTerms")}{" "}
            <Link
              href={localePath("/about")}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("auth.common.termsOfService")}
            </Link>{" "}
            {t("auth.common.and")}{" "}
            <Link
              href={localePath("/about")}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("auth.common.privacyPolicy")}
            </Link>
            .
          </span>
        </label>
        {errors.agreeTermsStep1 && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.agreeTermsStep1.message}
          </p>
        )}
      </div>

      {/* Continue CTA Button */}
      <Button
        type="submit"
        className="mt-4 flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 text-sm sm:text-base font-semibold text-white shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 transition-all active:scale-[0.99]"
      >
        <span>{t("auth.companyRegister.nextButton")}</span>
        <ArrowRight className="size-4" />
      </Button>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm font-medium text-slate-600 dark:text-muted-foreground">
        {t("auth.common.alreadyHaveAccount")}{" "}
        <Link
          href={localePath("/login")}
          className="font-bold text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("auth.common.logIn")}
        </Link>
      </p>
    </motion.form>
  );
}
