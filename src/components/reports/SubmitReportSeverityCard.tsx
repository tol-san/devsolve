"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Program, ProgramReward } from "@/lib/types/programs/types";

interface SubmitReportSeverityCardProps {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  program?: Program | null;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: "Critical Severity",
    scoreRange: "CVSS 9.0–10.0",
    description: "Full system compromise, data breach, or catastrophic impact",
    typicalBounty: "Typically $2,500 - $10,000+",
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
  },
  HIGH: {
    label: "High Severity",
    scoreRange: "CVSS 7.0–8.9",
    description: "Significant access privilege escalation, data exposure, or server flaw",
    typicalBounty: "Typically $1,000 - $2,500",
    colorClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50",
  },
  MEDIUM: {
    label: "Medium Severity",
    scoreRange: "CVSS 4.0–6.9",
    description: "Partial vulnerability with limited impact or conditional exploit scenario",
    typicalBounty: "Typically $300 - $1,000",
    colorClass: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
  },
  LOW: {
    label: "Low Severity",
    scoreRange: "CVSS 0.1–3.9",
    description: "Minor security weakness, non-sensitive data leak, or strict preconditions",
    typicalBounty: "Typically $100 - $300",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
  },
  INFO: {
    label: "Informational",
    scoreRange: "CVSS 0.0",
    description: "Informational submission or best practice recommendation without direct risk",
    typicalBounty: "Swag / Reputation Only",
    colorClass: "text-foreground",
    bgClass: "bg-muted/40 border-border",
  },
};

export const SubmitReportSeverityCard: React.FC<SubmitReportSeverityCardProps> = ({
  severity,
  program,
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.CRITICAL;

  const rewardMatch = program?.rewards?.find(
    (r: ProgramReward) => r.severity?.toUpperCase() === severity.toUpperCase()
  );
  const displayBounty = rewardMatch
    ? `Typically $${rewardMatch.minAmount} - $${rewardMatch.maxAmount}`
    : config.typicalBounty;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${severity}-${program?.id || "default"}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`rounded-2xl p-5 border transition-all ${config.bgClass}`}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${config.colorClass}`} />
            <span className={`text-base font-bold tracking-tight ${config.colorClass}`}>
              {config.label}
            </span>
          </div>
          <span className={`text-xs font-bold tracking-tight px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30 border border-current/20 ${config.colorClass}`}>
            {config.scoreRange}
          </span>
        </div>

        <p className="text-sm text-foreground leading-relaxed font-medium">
          {config.description}
        </p>

        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Estimated Reward</span>
          <span className="text-foreground font-bold">
            {displayBounty}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
