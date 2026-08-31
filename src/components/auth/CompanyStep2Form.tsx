"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { UseFormReturn } from "react-hook-form";
import {
  Building2,
  Globe,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { CustomCountrySelect } from "@/components/auth/CustomCountrySelect";
import { useAutoDetectCountry } from "@/hooks/useAutoDetectCountry";
import { INDUSTRIES, COMPANY_SIZES, REASONS } from "@/lib/constants/auth";
import { cn } from "@/lib/utils";

import {
  type CompanyRegisterFormValues,
} from "@/lib/validations/auth";

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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const companyName = watch("companyName");
  const companyWebsite = watch("companyWebsite");
  const industry = watch("industry");
  const companySize = watch("companySize");
  const country = watch("country");
  const joiningReason = watch("joiningReason");
  const agreeTermsStep2 = watch("agreeTermsStep2");

  const handleCountryDetect = React.useCallback(
    (name: string) => {
      setValue("country", name, { shouldValidate: true });
    },
    [setValue]
  );

  const { countriesList, countryCode, isDetecting, handleSetCountry } =
    useAutoDetectCountry(handleCountryDetect);

  const isStep2Complete =
    Boolean(companyName?.trim()) &&
    Boolean(companyWebsite?.trim()) &&
    Boolean(industry) &&
    Boolean(companySize) &&
    Boolean(country) &&
    Boolean(joiningReason) &&
    Boolean(agreeTermsStep2);

  return (
    <motion.form
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Tell us about your company
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          Set up your organization profile to start creating bounty programs
        </p>
      </div>

      {/* Company Name */}
      <div>
        <Label
          htmlFor="companyName"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          COMPANY NAME <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="companyName"
            type="text"
            placeholder="Battambang Security Inc."
            {...register("companyName")}
            className={cn(
              "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.companyName ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Building2 className="size-4" />
          </div>
        </div>
        {errors.companyName && (
          <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>
        )}
      </div>

      {/* Company Website */}
      <div>
        <Label
          htmlFor="companyWebsite"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          COMPANY WEBSITE <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="companyWebsite"
            type="url"
            placeholder="https://readme.org"
            {...register("companyWebsite")}
            className={cn(
              "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.companyWebsite ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Globe className="size-4" />
          </div>
        </div>
        {errors.companyWebsite && (
          <p className="text-xs text-destructive mt-1">{errors.companyWebsite.message}</p>
        )}
      </div>

      {/* Industry & Company Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="industry"
            className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
          >
            INDUSTRY <span className="text-destructive">*</span>
          </Label>
          <CustomSelect
            value={industry}
            options={INDUSTRIES}
            placeholder="Select industry"
            icon={<Briefcase className="w-4 h-4" />}
            error={Boolean(errors.industry)}
            onSelect={(val) => setValue("industry", val, { shouldValidate: true })}
          />
          {errors.industry && (
            <p className="text-xs text-destructive mt-1">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="companySize"
            className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
          >
            COMPANY SIZE <span className="text-destructive">*</span>
          </Label>
          <CustomSelect
            value={companySize}
            options={COMPANY_SIZES}
            placeholder="Select company size"
            icon={<Users className="w-4 h-4" />}
            error={Boolean(errors.companySize)}
            onSelect={(val) => setValue("companySize", val, { shouldValidate: true })}
          />
          {errors.companySize && (
            <p className="text-xs text-destructive mt-1">{errors.companySize.message}</p>
          )}
        </div>
      </div>

      {/* Country / Region */}
      <div>
        <Label
          htmlFor="country"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          COUNTRY / REGION <span className="text-destructive">*</span>
        </Label>
        <CustomCountrySelect
          value={country || ""}
          countryCode={countryCode}
          countries={countriesList}
          isDetecting={isDetecting}
          onSelect={(c) => handleSetCountry(c.name, c.code)}
        />
        {errors.country && (
          <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
        )}
      </div>

      {/* Primary Goal / Reason */}
      <div>
        <Label
          htmlFor="joiningReason"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          WHY ARE YOU JOINING DEVSOLVE? <span className="text-destructive">*</span>
        </Label>
        <CustomSelect
          value={joiningReason}
          options={REASONS}
          placeholder="Select primary goal"
          icon={<HelpCircle className="w-4 h-4" />}
          error={Boolean(errors.joiningReason)}
          onSelect={(val) => setValue("joiningReason", val, { shouldValidate: true })}
        />
        {errors.joiningReason && (
          <p className="text-xs text-destructive mt-1">{errors.joiningReason.message}</p>
        )}
      </div>

      {/* Checkbox Terms Step 2 */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            {...register("agreeTermsStep2")}
            className="mt-0.5 w-4 h-4 rounded border-border bg-card text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground leading-snug">
            I confirm that I am an authorized representative of this company and agree to DevSolve&apos;s{" "}
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeTermsStep2 && (
          <p className="text-xs text-destructive mt-1 pl-6.5">
            {errors.agreeTermsStep2.message}
          </p>
        )}
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
          <p>{apiError}</p>
        </div>
      )}

      {/* Action Buttons: Back + Complete Registration */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 sm:h-12 px-5 border border-border text-foreground font-semibold rounded-xl text-sm hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back</span>
        </Button>

        <Button
          type="submit"
          disabled={!isStep2Complete || isSubmitting || isApiLoading}
          className="flex-1 h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 active:scale-[0.99] text-white font-semibold rounded-xl text-sm sm:text-base shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting || isApiLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Complete Registration</span>
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}

