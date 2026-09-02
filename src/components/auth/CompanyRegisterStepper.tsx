"use client";

import React from "react";
import { Check, ShieldCheck, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";

interface CompanyRegisterStepperProps {
  currentStep: 1 | 2 | 3;
}

export function CompanyRegisterStepper({
  currentStep,
}: CompanyRegisterStepperProps) {
  const t = useT();

  const STEPS = [
    {
      step: 1,
      label: t("auth.companyRegister.step1Tab"),
      icon: User,
    },
    {
      step: 2,
      label: t("auth.companyRegister.step2Tab"),
      icon: Building2,
    },
    {
      step: 3,
      label: t("auth.companyRegister.step3Tab"),
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mb-8 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Connector line behind steps */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-blue-600 dark:bg-blue-500 transition-all duration-500 -z-0"
          style={{
            width:
              currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
          }}
        />

        {STEPS.map(({ step, label, icon: Icon }) => {
          const isActive = currentStep === step;
          const isCompleted = currentStep > step;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "size-8 sm:size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20 scale-105"
                    : isCompleted
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs"
                      : "bg-card text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-[3]" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold mt-2 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : isCompleted
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
