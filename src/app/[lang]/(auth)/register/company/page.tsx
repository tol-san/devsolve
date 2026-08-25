"use client";

import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";

import { useRegisterCompanyMutation } from "@/lib/redux/services/authApi";
import type { IndustryEnum, CompanySizeEnum } from "@/lib/redux/services/authApi";

import { AuthHeroPanel, type HeroBadge } from "@/components/auth/AuthHeroPanel";
import { CompanyRegisterStepper } from "@/components/auth/CompanyRegisterStepper";
import { CompanyStep1Form } from "@/components/auth/CompanyStep1Form";
import { CompanyStep2Form } from "@/components/auth/CompanyStep2Form";
import {
  companyRegisterSchema,
  type CompanyRegisterFormValues,
} from "@/lib/validations/auth";
import { CompanyStep3Success } from "@/components/auth/CompanyStep3Success";

const COMPANY_HERO_BADGES: HeroBadge[] = [
  {
    icon: Building2,
    label: "Verified Organizations",
    borderColorClass: "border-blue-200/80 dark:border-blue-400/30",
    iconColorClass: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    label: "Enterprise Bug Bounty",
    borderColorClass: "border-indigo-200/80 dark:border-indigo-400/30",
    iconColorClass: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Sparkles,
    label: "Compliance Ready",
    borderColorClass: "border-emerald-200/80 dark:border-emerald-400/30",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function CompanyRegisterPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registerCompany, { isLoading: isApiLoading }] = useRegisterCompanyMutation();


  const form = useForm<CompanyRegisterFormValues>({
    resolver: zodResolver(companyRegisterSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      jobTitle: "",
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
      const err = error as { data?: { message?: string }; status?: number };
      const message =
        err?.data?.message ??
        "Registration failed. Please check your details and try again.";
      setApiError(message);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-2 font-sans antialiased overflow-x-hidden">
      {/* LEFT PANEL - Hero Section */}
      <AuthHeroPanel
        lottieSrc="/lottie/company.lottie"
        badges={COMPANY_HERO_BADGES}
        headline="Protect your organization"
        description="Connect with elite security researchers, receive verified vulnerability reports, and secure your digital assets."
        glowColor1="bg-blue-400/20"
        glowColor2="bg-indigo-400/20"
      />

      {/* RIGHT PANEL - Multi-Step Form Container */}
      <div className="p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center items-center overflow-y-auto">
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
      </div>
    </div>
  );
}