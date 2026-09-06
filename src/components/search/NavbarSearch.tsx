"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchModal } from "@/components/search/useSearchModal";
import { cn } from "@/lib/utils";

export { SearchModal } from "@/components/search/SearchModal";
export { useSearchModal } from "@/components/search/useSearchModal";

export interface NavbarSearchProps {
  variant?: "icon" | "expanded";
  className?: string;
  placeholder?: string;
  iconClassName?: string;
  onOpen?: () => void;
}

export function NavbarSearch({
  variant = "icon",
  className,
  placeholder = "Search…",
  iconClassName,
  onOpen,
}: NavbarSearchProps) {
  const { open, isOpen } = useSearchModal();

  const handleOpen = () => {
    open();
    onOpen?.();
  };

  if (variant === "expanded") {
    return (
      <button
        type="button"
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-label={placeholder}
        title={placeholder}
        className={cn(
          "group flex h-8.5 w-full items-center justify-between gap-2 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/40 px-3 text-xs text-muted-foreground shadow-none transition-all duration-150 cursor-pointer hover:border-border/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <Search
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/70 group-hover:text-foreground transition-colors",
              iconClassName,
            )}
          />
          <span className="truncate text-left select-none font-normal">{placeholder}</span>
        </div>
        <kbd className="hidden sm:inline-flex shrink-0 items-center gap-0.5 rounded border border-border/50 bg-background/50 dark:bg-card/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/70 select-none">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleOpen}
      aria-expanded={isOpen}
      aria-label="Search (Ctrl+K)"
      title="Search (Ctrl+K)"
      className={cn(
        "size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-foreground shadow-none transition-all duration-200 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <Search
        className={cn("size-4.5 text-muted-foreground group-hover:text-foreground", iconClassName)}
      />
    </Button>
  );
}
