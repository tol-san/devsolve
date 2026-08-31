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
    <div className="border-b border-border">
      <nav className="flex gap-4 overflow-x-auto pr-1 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap pb-3.5 pt-1 text-sm font-semibold transition cursor-pointer ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                size={16}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
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
