"use client";

import {
  FileText,
  FolderKanban,
  LayoutGrid,
  Shield,
  type LucideIcon,
} from "lucide-react";

import type { DraftCategory } from "@/components/saved-draft/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SavedDraftTabsProps = {
  activeTab: DraftCategory;
  counts: Record<DraftCategory, number>;
  onChange: (category: DraftCategory) => void;
  visibleTabs?: DraftCategory[];
};

type DraftTabConfig = {
  key: DraftCategory;
  label: string;
  icon: LucideIcon;
};

const TAB_CONFIG: DraftTabConfig[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "program", label: "Program", icon: FolderKanban },
  { key: "response", label: "Response", icon: Shield },
  { key: "report", label: "Report", icon: FileText },
];

export function SavedDraftTabs({
  activeTab,
  counts,
  onChange,
  visibleTabs,
}: SavedDraftTabsProps) {
  const tabs = visibleTabs
    ? TAB_CONFIG.filter((t) => visibleTabs.includes(t.key))
    : TAB_CONFIG;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <Button
            key={tab.key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(tab.key)}
            className={cn(
              "h-10 rounded-xl border border-transparent bg-card px-4 text-sm font-medium text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-blue-100 dark:hover:border-blue-500/20 hover:bg-blue-50/60 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
              isActive &&
                "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <Icon data-icon="inline-start" className="size-4" />
            {tab.label}
            <Badge
              className={cn(
                "rounded-full border-0 bg-muted px-1.5 py-0 text-[11px] font-semibold text-muted-foreground shadow-none",
                isActive && "bg-white/20 text-white"
              )}
            >
              {counts[tab.key]}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
