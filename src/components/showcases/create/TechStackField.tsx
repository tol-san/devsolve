"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, X } from "lucide-react";
import {
  MAX_TECH,
  TECH_SUGGESTIONS,
  canonicalizeTech,
} from "@/lib/validations/showcase";
import { cn } from "@/lib/utils";

interface TechStackFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export function TechStackField({ value, onChange }: TechStackFieldProps) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const full = value.length >= MAX_TECH;

  const matches = useMemo(() => {
    const query = draft.trim().toLowerCase();
    const unpicked = TECH_SUGGESTIONS.filter((tech) => !value.includes(tech));
    if (!query) return unpicked.slice(0, 8);
    return unpicked
      .filter((tech) => tech.toLowerCase().includes(query))
      .slice(0, 8);
  }, [draft, value]);

  const add = (raw: string) => {
    const tech = canonicalizeTech(raw);
    if (!tech || full || value.includes(tech)) {
      setDraft("");
      return;
    }
    onChange([...value, tech]);
    setDraft("");
    inputRef.current?.focus();
  };

  const remove = (tech: string) => onChange(value.filter((t) => t !== tech));

  const canonicalDraft = canonicalizeTech(draft);
  const showCustom =
    canonicalDraft.length > 0 &&
    !value.includes(canonicalDraft) &&
    !matches.some((tech) => tech === canonicalDraft);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor="tech-stack-input"
          className="text-base font-semibold text-foreground"
        >
          Tech stack
        </label>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {value.length}/{MAX_TECH}
        </span>
      </div>

      <div
        className={cn(
          "rounded-xl border border-border bg-background p-2.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        )}
      >
        {value.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {value.map((tech) => (
                <motion.span
                  key={tech}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => remove(tech)}
                    aria-label={`Remove ${tech}`}
                    className="text-primary transition-colors hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="relative flex items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            id="tech-stack-input"
            ref={inputRef}
            value={draft}
            disabled={full}
            onChange={(event) => {
              setDraft(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                if (draft.trim()) add(draft);
              }
              if (event.key === "Backspace" && !draft && value.length) {
                remove(value[value.length - 1]);
              }
              if (event.key === "Escape") setOpen(false);
            }}
            placeholder={
              full
                ? `Limit of ${MAX_TECH} reached`
                : "Search or add a technology…"
            }
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>

        {open && !full && (matches.length > 0 || showCustom) && (
          <div className="relative">
            <div className="absolute inset-x-0 top-2 z-20 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
              {matches.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => add(tech)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  {tech}
                  <Plus className="size-3.5" />
                </button>
              ))}

              {showCustom && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => add(draft)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-primary transition-colors hover:bg-muted"
                >
                  Add “{canonicalDraft}”
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
