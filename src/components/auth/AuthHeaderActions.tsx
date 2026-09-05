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
        className="size-9 xl:size-10 rounded-full border-0 bg-transparent text-foreground shadow-none hover:bg-muted/70 transition-all cursor-pointer"
        iconClassName="size-4.5 text-muted-foreground hover:text-foreground transition-colors"
      />
    </div>
  );
}
