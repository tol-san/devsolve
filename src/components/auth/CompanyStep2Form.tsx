"use client";

import React from "react";
import { motion } from "motion/react";
import { UseFormReturn } from "react-hook-form";
import {
  Building2,
  Globe,
  Briefcase,
  Users,
  ArrowLeft,
  Loader2,
  HelpCircle,
  AlertCircle,
  Send,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { useAutoDetectCountry } from "@/hooks/useAutoDetectCountry";
import { INDUSTRIES, COMPANY_SIZES, REASONS } from "@/lib/constants/auth";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { CompanyRegisterFormValues } from "@/lib/validations/auth";

interface CompanyStep2FormProps {
  form: UseFormReturn<CompanyRegisterFormValues>;
  onBack: () => void;
  onSubmit: (data: CompanyRegisterFormValues) => void;
  isApiLoading: boolean;
  apiError?: string | null;
}

export function CompanyStep2Form({
  form,
  onBack,
  onSubmit,
  isApiLoading,
  apiError,
}: CompanyStep2FormProps) {
  const t = useT();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const industry = watch("industry");
  const companySize = watch("companySize");
  const country = watch("country");
  const joiningReason = watch("joiningReason");

  const handleCountryDetect = React.useCallback(
    (code: string) => {
      setValue("country", code, { shouldValidate: true });
    },
    [setValue]
  );

  const { isDetecting } = useAutoDetectCountry(handleCountryDetect);

  return (
    <motion.form
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full"
    >
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
          {t("auth.companyRegister.step2Title")}
        </h2>
        <p className="text-slate-600 dark:text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          {t("auth.companyRegister.step2Subtitle")}
        </p>
      </div>

      <div>
        <Label
          htmlFor="companyName"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.companyName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="companyName"
            type="text"
            placeholder={t("auth.companyRegister.companyNamePlaceholder")}
            {...register("companyName")}
            className={cn(
              "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.companyName
                ? "border-destructive focus:ring-destructive/30"
                : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Building2 className="size-4" />
          </div>
        </div>
        {errors.companyName && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.companyName.message}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="companyWebsite"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.companyWebsite")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="companyWebsite"
            type="url"
            placeholder={t("auth.companyRegister.companyWebsitePlaceholder")}
            {...register("companyWebsite")}
            className={cn(
              "w-full h-11 sm:h-12 pl-10 pr-4 bg-white dark:bg-card border rounded-xl text-slate-900 dark:text-foreground text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.companyWebsite
                ? "border-destructive focus:ring-destructive/30"
                : "border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Globe className="size-4" />
          </div>
        </div>
        {errors.companyWebsite && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.companyWebsite.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="industry"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.companyRegister.industry")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <CustomSelect
            value={industry}
            options={INDUSTRIES}
            placeholder={t("auth.companyRegister.industryPlaceholder")}
            icon={<Briefcase className="size-4" />}
            error={Boolean(errors.industry)}
            onSelect={(selectedVal) => {
              setValue("industry", selectedVal, { shouldValidate: true });
            }}
          />
          {errors.industry && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.industry.message}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="companySize"
            className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
          >
            {t("auth.companyRegister.companySize")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <CustomSelect
            value={companySize}
            options={COMPANY_SIZES}
            placeholder={t("auth.companyRegister.companySizePlaceholder")}
            icon={<Users className="size-4" />}
            error={Boolean(errors.companySize)}
            onSelect={(selectedVal) => {
              setValue("companySize", selectedVal, { shouldValidate: true });
            }}
          />
          {errors.companySize && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.companySize.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label
          htmlFor="country"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.country")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <CountrySelect
          id="country"
          value={country}
          isDetecting={isDetecting}
          error={Boolean(errors.country)}
          onChange={(code) => setValue("country", code, { shouldValidate: true })}
        />
        {errors.country && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.country.message}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="joiningReason"
          className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground mb-1.5"
        >
          {t("auth.companyRegister.joiningReason")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <CustomSelect
          value={joiningReason}
          options={REASONS}
          placeholder={t("auth.companyRegister.joiningReasonPlaceholder")}
          icon={<HelpCircle className="size-4" />}
          error={Boolean(errors.joiningReason)}
          onSelect={(selectedVal) => {
            setValue("joiningReason", selectedVal, { shouldValidate: true });
          }}
        />
        {errors.joiningReason && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.joiningReason.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("agreeTermsStep2")}
            className="size-4 mt-0.5 cursor-pointer rounded border-input text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-snug">
            {t("auth.companyRegister.agreeTermsStep2")}.
          </span>
        </label>
        {errors.agreeTermsStep2 && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.agreeTermsStep2.message}
          </p>
        )}
      </div>

      {apiError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium shadow-xs">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || isApiLoading}
          className="h-11 sm:h-12 px-5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted text-slate-800 dark:text-foreground font-semibold text-sm gap-2 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-4" />
          <span>{t("auth.companyRegister.backButton")}</span>
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || isApiLoading}
          className="flex-1 h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 text-sm sm:text-base font-semibold text-white shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting || isApiLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("auth.companyRegister.submitting")}</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>{t("auth.companyRegister.submitButton")}</span>
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
