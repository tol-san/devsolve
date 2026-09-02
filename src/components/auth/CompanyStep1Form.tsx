"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { UseFormReturn } from "react-hook-form";
import { User, Mail, Key, Eye, EyeOff, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { JOB_TITLES } from "@/lib/constants/auth";
import { cn } from "@/lib/utils";
import type { CompanyRegisterFormValues } from "@/lib/validations/auth";

interface CompanyStep1FormProps {
  form: UseFormReturn<CompanyRegisterFormValues>;
  onNext: () => void;
}

export function CompanyStep1Form({ form, onNext }: CompanyStep1FormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const fullName = watch("fullName");
  const jobTitle = watch("jobTitle");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const agreeTermsStep1 = watch("agreeTermsStep1");

  const isStep1Complete =
    Boolean(fullName?.trim()) &&
    Boolean(jobTitle) &&
    Boolean(email?.trim()) &&
    Boolean(password && password.length >= 8) &&
    Boolean(confirmPassword && confirmPassword.length >= 8) &&
    Boolean(agreeTermsStep1);

  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">
          Welcome to the technical elite. Begin your journey today.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <Label
          htmlFor="fullName"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          FULL NAME <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="fullName"
            type="text"
            placeholder="Tada Battambang"
            {...register("fullName")}
            className={cn(
              "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.fullName ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <User className="size-4" />
          </div>
        </div>
        {errors.fullName && (
          <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
        )}
      </div>

      {/* Job Title Custom Select */}
      <div>
        <Label
          htmlFor="jobTitle"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          JOB TITLE <span className="text-destructive">*</span>
        </Label>
        <CustomSelect
          value={jobTitle}
          options={JOB_TITLES}
          placeholder="Select job title (e.g. IT Company)"
          icon={<Briefcase className="size-4" />}
          error={Boolean(errors.jobTitle)}
          onSelect={(selectedVal) => {
            setValue("jobTitle", selectedVal, { shouldValidate: true });
          }}
        />
        {errors.jobTitle && (
          <p className="text-xs text-destructive mt-1">{errors.jobTitle.message}</p>
        )}
      </div>

      {/* Work Email */}
      <div>
        <Label
          htmlFor="email"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          WORK EMAIL <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="tada@battambang.org"
            {...register("email")}
            className={cn(
              "w-full h-11 pl-10 pr-4 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.email ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="size-4" />
          </div>
        </div>
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label
          htmlFor="password"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          PASSWORD <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            {...register("password")}
            className={cn(
              "w-full h-11 pl-10 pr-10 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.password ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Key className="size-4" />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label
          htmlFor="confirmPassword"
          className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          CONFIRM PASSWORD <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
            className={cn(
              "w-full h-11 pl-10 pr-10 bg-card border rounded-xl text-foreground text-sm placeholder:text-muted-foreground transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              errors.confirmPassword ? "border-destructive focus:ring-destructive/30" : "border-border hover:border-muted-foreground/40"
            )}
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Checkbox Terms Step 1 */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            {...register("agreeTermsStep1")}
            className="mt-0.5 w-4 h-4 rounded border-border bg-card text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground leading-snug">
            I agree to DevSolve&apos;s{" "}
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeTermsStep1 && (
          <p className="text-xs text-destructive mt-1 pl-6.5">
            {errors.agreeTermsStep1.message}
          </p>
        )}
      </div>

      {/* Continue to Step 2 Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={!isStep1Complete}
          className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border dark:border-blue-400/30 active:scale-[0.99] text-white font-semibold rounded-xl text-sm sm:text-base shadow-md shadow-blue-600/20 dark:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span>Continue to Company details</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account-type" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
          Log in
        </Link>
      </div>
    </motion.form>
  );
}

