"use client";

import React from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";

interface AuthHeaderActionsProps {
  className?: string;
}

export function AuthHeaderActions({ className }: AuthHeaderActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 z-20",
        className
      )}
    >
      <LanguageSwitcher />
      <ThemeToggle
        className="size-9 xl:size-10 rounded-full border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] hover:border-blue-200 dark:hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-neutral-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all cursor-pointer"
        iconClassName="size-4"
      />
    </div>
  );
}
