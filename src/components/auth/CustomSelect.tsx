"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  icon?: React.ReactNode;
  onSelect: (val: string) => void;
  error?: boolean;
}

export function CustomSelect({
  value,
  options,
  placeholder,
  icon,
  onSelect,
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-11 px-3.5 bg-card hover:bg-muted/70 border rounded-xl text-foreground text-sm flex items-center justify-between transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20",
          error
            ? "border-destructive focus:ring-destructive/30"
            : "border-border hover:border-muted-foreground/40 focus:border-blue-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20"
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
          <span className={cn("truncate font-medium", !value && "text-muted-foreground font-normal")}>
            {value || placeholder}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200",
            isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
          )}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 left-0 right-0 mt-1.5 bg-popover/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-1.5 max-h-60 overflow-y-auto space-y-0.5 text-popover-foreground"
        >
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                    : "hover:bg-muted text-foreground font-medium"
                )}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

