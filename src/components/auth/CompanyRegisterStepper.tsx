"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyRegisterStepperProps {
  currentStep: 1 | 2 | 3;
}

export function CompanyRegisterStepper({ currentStep }: CompanyRegisterStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line behind steps */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-blue-600 dark:bg-blue-500 transition-all duration-500 -z-0"
          style={{
            width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
          }}
        />

        {/* Step 1 Badge */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              currentStep === 1
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20"
                : currentStep > 1
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground border border-border"
            )}
          >
            {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
          </div>
          <span
            className={cn(
              "text-xs font-semibold mt-2 transition-colors",
              currentStep === 1
                ? "text-blue-600 dark:text-blue-400 font-bold"
                : currentStep > 1
                  ? "text-foreground"
                  : "text-muted-foreground"
            )}
          >
            Your info
          </span>
        </div>

        {/* Step 2 Badge */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              currentStep === 2
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20"
                : currentStep > 2
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground border border-border"
            )}
          >
            {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : "2"}
          </div>
          <span
            className={cn(
              "text-xs font-semibold mt-2 transition-colors",
              currentStep === 2
                ? "text-blue-600 dark:text-blue-400 font-bold"
                : currentStep > 2
                  ? "text-foreground"
                  : "text-muted-foreground"
            )}
          >
            Company
          </span>
        </div>

        {/* Step 3 Badge */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              currentStep === 3
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20"
                : "bg-muted text-muted-foreground border border-border"
            )}
          >
            3
          </div>
          <span
            className={cn(
              "text-xs font-semibold mt-2 transition-colors",
              currentStep === 3 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-muted-foreground"
            )}
          >
            Verify
          </span>
        </div>
      </div>
    </div>
  );
}

