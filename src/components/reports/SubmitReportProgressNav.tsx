"use client";

import React from "react";
import { Check, Target, Shield, FileText, Terminal, Send, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export interface StepItem {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STEPS: StepItem[] = [
  { id: 1, label: "Target & Classification", icon: Target },
  { id: 2, label: "PoC Write-up & Submit", icon: FileText },
];

interface SubmitReportProgressNavProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
}

export const SubmitReportProgressNav: React.FC<SubmitReportProgressNavProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
}) => {
  const progressPercentage = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3.5 font-sans shadow-xs">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Express Submission Progress</span>
          <span className="font-mono text-foreground font-bold">
            Step {currentStep} of {STEPS.length} ({progressPercentage}%)
          </span>
        </div>

        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {STEPS.map((step) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isClickable = completedSteps.includes(step.id) || step.id <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep(step.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : isCompleted
                  ? "text-foreground hover:bg-muted cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : isCompleted
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <IconComponent className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="truncate tracking-tight">{step.label}</span>
              </div>

              {isActive && <ChevronRight className="w-4 h-4 opacity-70 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
