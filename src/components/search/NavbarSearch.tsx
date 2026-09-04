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
  placeholder = "Search all (programs, people, write-ups…)",
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
        aria-label="Search all (Ctrl+K)"
        className={cn(
          "group flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 hover:bg-muted/80 px-3.5 text-sm text-muted-foreground shadow-2xs transition-all duration-200 cursor-pointer ring-1 ring-foreground/5 dark:ring-foreground/10 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search
            className={cn(
              "size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors",
              iconClassName,
            )}
          />
          <span className="truncate">{placeholder}</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground select-none">
          <span className="text-xs">⌘</span>K
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
        "size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-all duration-200 hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <Search
        className={cn("size-4.5 text-muted-foreground group-hover:text-foreground", iconClassName)}
      />
    </Button>
  );
}
