"use client";

import React from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import type { StepItem } from "./types";

interface CreateProgramChecklistProps {
  steps: StepItem[];
  activeTab: number;
  setActiveTab: (step: number) => void;
  /** What still stands between this program and a submission. */
  missingForSubmit: { step: number; label: string }[];
}

export function CreateProgramChecklist({
  steps,
  activeTab,
  setActiveTab,
  missingForSubmit,
}: CreateProgramChecklistProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 shadow-xs space-y-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-3">
        Setup Progress
      </h3>

      <div className="space-y-3">
        {steps.map((s) => {
          /* Completeness, not history. Ticking a step because the author had
             walked past it called a program ready that the upstream would
             refuse, and told someone resuming a draft on step 1 that finished
             steps were still pending. */
          const gaps = missingForSubmit.filter((item) => item.step === s.id);
          const isDone = gaps.length === 0;
          const isCurrent = activeTab === s.id;

          return (
            <div
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                isCurrent
                  ? "bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {s.id}
                  </div>
                ) : (
                  <CircleAlert className="w-5 h-5 shrink-0 text-amber-500" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${
                  isDone ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
                title={gaps.map((gap) => gap.label).join(", ")}
              >
                {isDone
                  ? "Done"
                  : gaps.length === 1
                    ? gaps[0].label
                    : `${gaps.length} to add`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
