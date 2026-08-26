"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Award, Clock, Target } from "lucide-react";
import { motion } from "motion/react";

import { Program } from "@/lib/types/programs/types";

interface SubmitReportProgramCardProps {
  program?: Program | null;
  programName?: string;
  companyName?: string;
  maxBounty?: string;
  avgResponse?: string;
  scopeItemsCount?: number;
}

export const SubmitReportProgramCard: React.FC<SubmitReportProgramCardProps> = ({
  program,
  programName,
  companyName,
  maxBounty,
  avgResponse,
  scopeItemsCount,
}) => {
  const displayTitle = program?.name || programName || "CloudVault Security Program";
  const displayCompany = program?.organizationName || companyName || "CloudVault Inc.";
  const displayMaxBounty = program?.maximumBounty
    ? `$${program.maximumBounty.toLocaleString()}`
    : maxBounty || "$10,000";
  const displayAvgResponse = avgResponse || "2 days";
  const displayScopeCount = program?.inScopeAssets?.length ?? (scopeItemsCount || 3);
  const logoBgColor = "bg-blue-600";
  const initials = program?.organizationName
    ? program.organizationName.substring(0, 2).toUpperCase()
    : "CV";

  const programLink = program?.id ? `/dashboard/programs/${program.id}` : "/dashboard/programs";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 font-sans"
    >
      {/* Program Header */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${logoBgColor} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs`}>
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate tracking-tight">
            {displayTitle}
          </h3>
          <p className="text-xs font-medium text-muted-foreground truncate">{displayCompany}</p>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Max Bounty
          </span>
          <span className="font-bold text-foreground">{displayMaxBounty}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Avg Response
          </span>
          <span className="font-semibold text-foreground">{displayAvgResponse}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Scope Items
          </span>
          <span className="font-semibold text-foreground">
            {displayScopeCount} targets
          </span>
        </div>
      </div>

      <div className="pt-2 text-center border-t border-border">
        <Link
          href={programLink}
          className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>View program details & rules</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};

