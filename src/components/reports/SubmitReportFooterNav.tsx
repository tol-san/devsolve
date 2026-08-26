"use client";

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitReportFooterNavProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  nextButtonLabel?: string;
  isNextDisabled?: boolean;
}

export const SubmitReportFooterNav: React.FC<SubmitReportFooterNavProps> = ({
  currentStep,
  onPrevStep,
  onNextStep,
  nextButtonLabel,
  isNextDisabled = false,
}) => {
  const isFirstStep = currentStep === 1;
  const label = nextButtonLabel || (currentStep === 4 ? "Review Report" : "Continue");

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isFirstStep}
        onClick={onPrevStep}
        className="h-11 px-5 rounded-xl text-sm font-semibold gap-2 border-border text-foreground bg-card cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      {/* Progress Dots Indicator */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((step) => {
          if (step < currentStep) {
            return (
              <span key={step} className="w-5 h-2 rounded-full bg-emerald-500 transition-all" />
            );
          }
          if (step === currentStep) {
            return (
              <span key={step} className="w-8 h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all" />
            );
          }
          return (
            <span key={step} className="w-2.5 h-2 rounded-full bg-muted transition-all" />
          );
        })}
      </div>

      {/* Next/Continue Button */}
      <Button
        type="button"
        disabled={isNextDisabled}
        onClick={onNextStep}
        className="h-11 px-6 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-xs"
      >
        <span>{label}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};


