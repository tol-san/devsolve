"use client";

import React from "react";
import { motion } from "motion/react";
import { RuleSection, ProgramDetail } from "@/lib/types/programs/types";

interface ProgramRulesTabProps {
  rulesOfEngagement?: RuleSection | null;
  exclusions?: RuleSection | null;
  program?: ProgramDetail; 
}

export const ProgramRulesTab: React.FC<ProgramRulesTabProps> = (props) => {

  const rawRulesData = props.rulesOfEngagement ?? props.program?.rulesOfEngagement;
  const rawExclusionsData = props.exclusions ?? props.program?.exclusions;

  const parseSection = (data: unknown, defaultDescription: string) => {
    if (!data) return { description: defaultDescription, rules: [] };

    if (typeof data === "object" && data !== null) {
      const obj = data as { description?: string; rules?: unknown };
      const description = obj.description || defaultDescription;
      let rules: string[] = [];
      if (Array.isArray(obj.rules)) {
        rules = obj.rules.map((r) => String(r));
      } else if (typeof obj.rules === "string") {
        rules = obj.rules
          .split(/\r?\n/)
          .map((r) => r.replace(/^[•\-\s]+/, "").trim())
          .filter(Boolean);
      }
      return { description, rules };
    }

    if (Array.isArray(data)) {
      return {
        description: defaultDescription,
        rules: data.map((r) => String(r)),
      };
    }

    if (typeof data === "string") {
      const rules = data
        .split(/\r?\n/)
        .map((r) => r.replace(/^[•\-\s]+/, "").trim())
        .filter(Boolean);
      return { description: defaultDescription, rules };
    }

    return { description: defaultDescription, rules: [] };
  };

  const { description: rulesDescription, rules: rulesList } = parseSection(
    rawRulesData,
    "You must follow these rules during your testing. Violations may result in report rejection and account suspension."
  );

  const { description: exclusionsDescription, rules: exclusionsList } = parseSection(
    rawExclusionsData,
    "Reports covering the following vulnerability types will not be accepted. Save your time and focus on what matters."
  );

  return (
    <motion.div
      key="rules"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl p-6 sm:p-8 ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-8 text-foreground"
    >
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Rules of Engagement
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed font-normal">
          {rulesDescription}
        </p>

        {rulesList.length > 0 ? (
          <ul className="space-y-3 pt-1">
            {rulesList.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-base text-foreground font-medium leading-relaxed"
              >
                <span className="text-muted-foreground font-bold text-base select-none">
                  •
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No specific rules specified.</p>
        )}
      </div>

      <hr className="border-border" />

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Exclusions
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed font-normal">
          {exclusionsDescription}
        </p>

        {exclusionsList.length > 0 ? (
          <ul className="space-y-3 pt-1">
            {exclusionsList.map((exclusion, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-base text-foreground font-medium leading-relaxed"
              >
                <span className="text-muted-foreground font-bold text-base select-none">
                  •
                </span>
                <span>{exclusion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No specific exclusions specified.</p>
        )}
      </div>
    </motion.div>
  );
};