"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, Bug, ArrowRight, Zap } from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";
import { Button } from "@/components/ui/button";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

interface ProgramOverviewTabProps {
  program: ProgramDetail;
  submissionsCount?: number;
  onViewSubmissions?: () => void;
}

export const ProgramOverviewTab: React.FC<ProgramOverviewTabProps> = ({
  program,
  submissionsCount = 0,
  onViewSubmissions,
}) => {
  const lp = useLocalePath();

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-8"
    >
      {/* Active Submissions Banner if user has submitted reports */}
      {submissionsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bug className="size-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                You have {submissionsCount} submission{submissionsCount > 1 ? "s" : ""} on this program
              </h3>
              <p className="text-xs text-muted-foreground">
                Review your reports, check triage progression, and track potential rewards.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onViewSubmissions && (
              <Button
                onClick={onViewSubmissions}
                variant="outline"
                size="sm"
                className="rounded-xl font-semibold text-xs gap-1.5 cursor-pointer"
              >
                <span>View Submissions</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
            <Link href={lp(`/dashboard/submit-report?programId=${program.id}`)}>
              <Button
                size="sm"
                className="rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap className="size-3.5" />
                <span>Submit Report</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          About the Program
        </h2>
        <p className="text-base font-bold text-foreground leading-relaxed">
          Test our cloud infrastructure, API gateways, and core web services for vulnerabilities.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed font-normal">
          {program.description}
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
