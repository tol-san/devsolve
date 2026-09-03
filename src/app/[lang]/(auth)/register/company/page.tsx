"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ShieldCheck, Sparkles, ArrowLeft } from "lucide-react";

import { useRegisterCompanyMutation } from "@/lib/redux/services/authApi";
import type { IndustryEnum, CompanySizeEnum } from "@/lib/redux/services/authApi";

import { AuthHeroPanel, type HeroBadge } from "@/components/auth/AuthHeroPanel";
import { CompanyRegisterStepper } from "@/components/auth/CompanyRegisterStepper";
import { CompanyStep1Form } from "@/components/auth/CompanyStep1Form";
import { CompanyStep2Form } from "@/components/auth/CompanyStep2Form";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import {
  companyRegisterSchema,
  type CompanyRegisterFormValues,
} from "@/lib/validations/auth";
import { CompanyStep3Success } from "@/components/auth/CompanyStep3Success";
import { useT, useLocalePath } from "@/lib/i18n/I18nProvider";

export default function CompanyRegisterPage() {
  const t = useT();
  const localePath = useLocalePath();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registerCompany, { isLoading: isApiLoading }] = useRegisterCompanyMutation();

  const companyHeroBadges: HeroBadge[] = useMemo(
    () => [
      {
        icon: Building2,
        label: t("auth.companyRegister.badgeVerified"),
        borderColorClass: "border-blue-200/80 dark:border-blue-400/30",
        iconColorClass: "text-blue-600 dark:text-blue-400",
      },
      {
        icon: ShieldCheck,
        label: t("auth.companyRegister.badgeBounty"),
        borderColorClass: "border-indigo-200/80 dark:border-indigo-400/30",
        iconColorClass: "text-indigo-600 dark:text-indigo-400",
      },
      {
        icon: Sparkles,
        label: t("auth.companyRegister.badgeCompliance"),
        borderColorClass: "border-emerald-200/80 dark:border-emerald-400/30",
        iconColorClass: "text-emerald-600 dark:text-emerald-400",
      },
    ],
    [t]
  );

  const form = useForm<CompanyRegisterFormValues>({
    resolver: zodResolver(companyRegisterSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      jobTitle: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTermsStep1: false,

      companyName: "",
      companyWebsite: "",
      industry: "",
      companySize: "",
      country: "Cambodia",
      joiningReason: "",
      agreeTermsStep2: false,
    },
  });

  const handleNextStep = async () => {
    const isValidStep1 = await form.trigger([
      "fullName",
      "jobTitle",
      "phone",
      "email",
      "password",
      "confirmPassword",
      "agreeTermsStep1",
    ]);
    if (isValidStep1) {
      setCurrentStep(2);
    }
  };

  // Map UI display labels → backend enum values
  const INDUSTRY_MAP: Record<string, IndustryEnum> = {
    "Software & Technology": "TECHNOLOGY",
    "Financial Services": "FINANCE",
    "Healthcare & Biotech": "HEALTHCARE",
    "E-Commerce & Retail": "ECOMMERCE",
    "Government & Public Sector": "GOVERNMENT",
    "Education": "EDUCATION",
    Other: "OTHER",
  };

  const COMPANY_SIZE_MAP: Record<string, CompanySizeEnum> = {
    "1-10 employees": "1-10",
    "11-50 employees": "11-50",
    "51-200 employees": "51-200",
    "201-500 employees": "201-500",
    "500+ employees": "501-1000",
  };

  const onSubmit = async (data: CompanyRegisterFormValues) => {
    setApiError(null);
    try {
      const res = await registerCompany({
        fullName: data.fullName,
        jobTitle: data.jobTitle,
        phone: data.phone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        industry: INDUSTRY_MAP[data.industry] ?? "OTHER",
        companySize: COMPANY_SIZE_MAP[data.companySize] ?? (data.companySize as CompanySizeEnum),
        country: data.country,
        joiningReason: data.joiningReason,
      }).unwrap();

      if (res.success) {
        setCurrentStep(3);
      }
    } catch (error: unknown) {
      console.error("Failed to submit company registration:", error);
      interface ApiErrorData {
        message?: string;
        violations?: Array<{ propertyPath?: string; message?: string }>;
        fieldErrors?: Record<string, string[]>;
        details?: {
          message?: string;
          violations?: Array<{ propertyPath?: string; message?: string }>;
        };
      }
      const err = error as { data?: ApiErrorData; status?: number };
      const errData = err?.data;

      let phoneErrorMsg: string | null = null;

      // 1. Bean-validation failure: violations[] with propertyPath === "phone"
      const violations = errData?.violations ?? errData?.details?.violations;
      if (Array.isArray(violations)) {
        const phoneViolation = violations.find(
          (v) =>
            v.propertyPath === "phone" ||
            v.propertyPath?.toLowerCase().includes("phone"),
        );
        if (phoneViolation?.message) {
          phoneErrorMsg = phoneViolation.message;
        }
      }

      // 2. Digit-count failure: 400 with message only, no violations
      // "Phone number must contain between 8 and 15 digits"
      const serverMsg = errData?.message ?? errData?.details?.message;
      if (!phoneErrorMsg && serverMsg) {
        if (
          serverMsg.includes("8 and 15 digits") ||
          serverMsg.toLowerCase().includes("phone")
        ) {
          phoneErrorMsg = serverMsg;
        }
      }

      // 3. Fallback to fieldErrors if from proxy validation
      if (!phoneErrorMsg && errData?.fieldErrors?.phone?.[0]) {
        phoneErrorMsg = errData.fieldErrors.phone[0];
      }

      if (phoneErrorMsg) {
        form.setError("phone", {
          type: "server",
          message: phoneErrorMsg,
        });
        setCurrentStep(1);
      }

      const message =
        serverMsg ??
        "Registration failed. Please check your details and try again.";
      setApiError(message);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden font-sans antialiased">
      {/* LEFT PANEL - Full-Bleed 3D Hero Section (Hidden on Mobile/Responsive) */}
      <AuthHeroPanel
        imageSrcDark="/company-dark.jpg"
        imageSrcLight="/company-light.jpg"
        badges={companyHeroBadges}
        headline={t("auth.companyRegister.headline")}
        description={t("auth.companyRegister.description")}
        glowColor1="bg-blue-500/25"
        glowColor2="bg-emerald-500/25"
        backHref="/account-type"
        backLabel={t("auth.common.backToAccountType")}
      />

      {/* RIGHT PANEL - Multi-Step Form Container */}
      <div className="relative h-screen max-h-screen w-full p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between items-center overflow-y-auto">
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href={localePath("/account-type")}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4 text-blue-600 dark:text-blue-400" />
            <span>{t("auth.common.backToAccountType")}</span>
          </Link>
          <div className="ml-auto">
            <AuthHeaderActions />
          </div>
        </div>

        <div className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto flex flex-col justify-center">
          {/* Stepper Header (only visible on steps 1 & 2) */}
          {currentStep < 3 && <CompanyRegisterStepper currentStep={currentStep} />}

          {/* Animated Step Transitions */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <CompanyStep1Form form={form} onNext={handleNextStep} />
            )}

            {currentStep === 2 && (
              <CompanyStep2Form
                form={form}
                onBack={() => setCurrentStep(1)}
                onSubmit={onSubmit}
                isApiLoading={isApiLoading}
                apiError={apiError}
              />
            )}

            {currentStep === 3 && <CompanyStep3Success />}
          </AnimatePresence>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}