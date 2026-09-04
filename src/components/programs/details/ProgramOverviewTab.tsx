"use client";

import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";

interface ProgramOverviewTabProps {
  program: ProgramDetail;
}

export const ProgramOverviewTab: React.FC<ProgramOverviewTabProps> = ({
  program,
}) => {

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-8"
    >
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          About the Program
        </h2>
        <p className="text-base font-bold text-foreground leading-relaxed">
          Test our cloud infrastructure, API gateways, and core web services for vulnerabilities.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed font-normal">
          { program.description}
        </p>
      </div>

      <hr className="border-border" />

      {(() => {
        const pocData = program?.proofOfConceptRequirements;
        let pocDescription = "Each report must include the following to be considered valid:";
        let pocRules: string[] = [];

        if (pocData) {
          if (typeof pocData === "object" && pocData !== null) {
            const obj = pocData as { description?: string; rules?: string[] };
            if (obj.description) pocDescription = obj.description;
            if (Array.isArray(obj.rules)) pocRules = obj.rules;
          } else if (typeof pocData === "string") {
            pocRules = pocData
              .split(/\r?\n/)
              .map((r) => r.replace(/^[•\-\s]+/, "").trim())
              .filter(Boolean);
          }
        }

        const defaultFallbackRules = [
          "Step-by-step reproduction guide",
          "Exact HTTP request/payload (use Burp Suite export)",
          "Screenshot or screen recording demonstrating impact",
          "Affected endpoint and parameter names",
        ];

        const displayRules = pocRules.length > 0 ? pocRules : defaultFallbackRules;

        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Proof of Concept Requirements
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              {pocDescription}
            </p>
            <ul className="space-y-3">
              {displayRules.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-base text-foreground font-medium leading-relaxed"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}
    </motion.div>
  );
};
