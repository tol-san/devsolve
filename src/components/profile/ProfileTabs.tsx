"use client";

import { motion } from "motion/react";
import { Activity, Flame, MessageSquare, Heart, LucideIcon } from "lucide-react";

export type ProfileTabId = "overview" | "hacktivity" | "community" | "hall-of-thanks";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

const TABS: { id: ProfileTabId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "hacktivity", label: "Hacktivity", icon: Flame },
  { id: "community", label: "Community", icon: MessageSquare },
  { id: "hall-of-thanks", label: "Hall of Thanks", icon: Heart },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 pt-2 shadow-2xs">
      <nav
        aria-label="Profile sections"
        className="flex gap-1 overflow-x-auto scrollbar-none"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg px-3.5 pb-3 pt-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon
                size={16}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span>{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="profile-tab-indicator"
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
