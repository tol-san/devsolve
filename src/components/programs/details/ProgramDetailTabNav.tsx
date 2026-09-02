"use client";

import React from "react";
import { motion } from "motion/react";

export const PROGRAM_DETAILS_TABS = [
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope" },
  { id: "bounty-matrix", label: "Bounty Matrix" },
  { id: "rules", label: "Rules & Exclusions" },
  { id: "thanks", label: "Hall of Thanks" },
] as const;

export type ProgramDetailTabId = (typeof PROGRAM_DETAILS_TABS)[number]["id"];

interface ProgramDetailTabNavProps {
  activeTab: ProgramDetailTabId;
  onTabChange: (tabId: ProgramDetailTabId) => void;
}

export const ProgramDetailTabNav: React.FC<ProgramDetailTabNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="border-b border-border bg-card rounded-2xl px-2 pt-1 shadow-2xs overflow-hidden">
      <ul className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {PROGRAM_DETAILS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeProgramTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
