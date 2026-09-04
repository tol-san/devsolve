"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Database,
  HelpCircle,
  PenTool,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VulnerabilityCategoryCombobox } from "@/components/reports/VulnerabilityCategoryCombobox";
import { cn } from "@/lib/utils";

export type WeaknessMode = "catalog" | "unsure" | "custom";

interface WeaknessPickerProps {
  mode?: WeaknessMode;
  onModeChange?: (mode: WeaknessMode) => void;
  weaknessId?: string | null;
  category?: string;
  cweIdentifier?: string;
  suggestedWeakness?: string | null;
  onWeaknessChange: (values: {
    weaknessId: string | null;
    category: string;
    cweIdentifier?: string;
    suggestedWeakness: string | null;
    mode: WeaknessMode;
  }) => void;
  error?: string;
}

export function WeaknessPicker({
  mode: controlledMode,
  onModeChange,
  weaknessId,
  category = "",
  cweIdentifier = "",
  suggestedWeakness = "",
  onWeaknessChange,
  error,
}: WeaknessPickerProps) {
  const activeMode: WeaknessMode =
    controlledMode ??
    (weaknessId
      ? "catalog"
      : suggestedWeakness && suggestedWeakness.trim()
      ? "custom"
      : "unsure");

  const [internalCustom, setInternalCustom] = React.useState(suggestedWeakness || "");

  React.useEffect(() => {
    setInternalCustom(suggestedWeakness || "");
  }, [suggestedWeakness]);

  const setMode = (nextMode: WeaknessMode) => {
    onModeChange?.(nextMode);

    if (nextMode === "catalog") {
      onWeaknessChange({
        weaknessId: weaknessId ?? null,
        category,
        cweIdentifier,
        suggestedWeakness: null,
        mode: "catalog",
      });
    } else if (nextMode === "unsure") {
      onWeaknessChange({
        weaknessId: null,
        category: "",
        cweIdentifier: "",
        suggestedWeakness: null,
        mode: "unsure",
      });
    } else if (nextMode === "custom") {
      onWeaknessChange({
        weaknessId: null,
        category: "",
        cweIdentifier: "",
        suggestedWeakness: internalCustom || "",
        mode: "custom",
      });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value.slice(0, 255);
    setInternalCustom(nextVal);
    onWeaknessChange({
      weaknessId: null,
      category: "",
      cweIdentifier: "",
      suggestedWeakness: nextVal,
      mode: "custom",
    });
  };

  const handleCatalogChange = (next: {
    category: string;
    weaknessId?: string;
    cweId?: string;
  }) => {
    onWeaknessChange({
      weaknessId: next.weaknessId ?? null,
      category: next.category,
      cweIdentifier: next.cweId ?? "",
      suggestedWeakness: null,
      mode: "catalog",
    });
  };

  const remainingChars = 255 - (internalCustom?.length || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => setMode("catalog")}
          className={cn(
            "group flex flex-col items-start p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative shadow-2xs",
            activeMode === "catalog"
              ? "border-primary bg-primary/5 ring-2 ring-primary/25 text-foreground dark:bg-primary/10"
              : "border-border/90 bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                activeMode === "catalog"
                  ? "bg-primary text-primary-foreground shadow-primary/20"
                  : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
              )}
            >
              <Database className="size-5" />
            </div>
            <div
              className={cn(
                "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                activeMode === "catalog"
                  ? "border-primary bg-primary text-primary-foreground scale-105"
                  : "border-muted-foreground/40 group-hover:border-muted-foreground"
              )}
            >
              {activeMode === "catalog" && (
                <Check className="size-3 stroke-[3]" />
              )}
            </div>
          </div>
          <h3 className="font-bold text-base text-foreground mt-3.5 mb-1 tracking-tight">
            Pick from catalog
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-normal">
            Choose a standardized CWE definition from the vulnerability catalog.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("unsure")}
          className={cn(
            "group flex flex-col items-start p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative shadow-2xs",
            activeMode === "unsure"
              ? "border-primary bg-primary/5 ring-2 ring-primary/25 text-foreground dark:bg-primary/10"
              : "border-border/90 bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                activeMode === "unsure"
                  ? "bg-primary text-primary-foreground shadow-primary/20"
                  : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
              )}
            >
              <HelpCircle className="size-5" />
            </div>
            <div
              className={cn(
                "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                activeMode === "unsure"
                  ? "border-primary bg-primary text-primary-foreground scale-105"
                  : "border-muted-foreground/40 group-hover:border-muted-foreground"
              )}
            >
              {activeMode === "unsure" && (
                <Check className="size-3 stroke-[3]" />
              )}
            </div>
          </div>
          <h3 className="font-bold text-base text-foreground mt-3.5 mb-1 tracking-tight">
            Not sure
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-normal">
            Not sure &mdash; the triage team will classify it.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("custom")}
          className={cn(
            "group flex flex-col items-start p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative shadow-2xs",
            activeMode === "custom"
              ? "border-primary bg-primary/5 ring-2 ring-primary/25 text-foreground dark:bg-primary/10"
              : "border-border/90 bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                activeMode === "custom"
                  ? "bg-primary text-primary-foreground shadow-primary/20"
                  : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
              )}
            >
              <PenTool className="size-5" />
            </div>
            <div
              className={cn(
                "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                activeMode === "custom"
                  ? "border-primary bg-primary text-primary-foreground scale-105"
                  : "border-muted-foreground/40 group-hover:border-muted-foreground"
              )}
            >
              {activeMode === "custom" && (
                <Check className="size-3 stroke-[3]" />
              )}
            </div>
          </div>
          <h3 className="font-bold text-base text-foreground mt-3.5 mb-1 tracking-tight">
            Something else
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-normal">
            Name it yourself if the list doesn&apos;t cover it. The team will review it.
          </p>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === "catalog" && (
          <motion.div
            key="catalog-picker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 rounded-2xl bg-card p-5 sm:p-6 border border-border/80 shadow-xs"
          >
            <div className="space-y-1">
              <Label className="text-base font-semibold text-foreground">
                Search CWE Vulnerability Catalog
              </Label>
              <p className="text-sm text-muted-foreground">
                Search the common weakness enumeration catalog by name or CWE identifier.
              </p>
            </div>
            <VulnerabilityCategoryCombobox
              value={category}
              weaknessId={weaknessId || undefined}
              onChange={handleCatalogChange}
              placeholder="Search by CWE ID or weakness name (e.g., CWE-89 or SQL Injection)…"
              invalid={Boolean(error)}
            />
            {cweIdentifier && (
              <p className="text-sm font-medium text-muted-foreground pt-1 flex items-center gap-1.5">
                <span>Selected:</span>
                <span className="text-foreground font-semibold font-mono bg-muted/80 px-2 py-0.5 rounded-lg border border-border">
                  {cweIdentifier}
                </span>
              </p>
            )}
          </motion.div>
        )}

        {activeMode === "unsure" && (
          <motion.div
            key="unsure-notice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border/80 bg-muted/30 p-5 sm:p-6 space-y-2 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Unclassified Submission
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Triage team will assign the appropriate classification
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-0 sm:pl-12">
              Not sure &mdash; the triage team will classify it. Your report will be evaluated based on the vulnerability details, impact analysis, and reproduction steps provided.
            </p>
          </motion.div>
        )}

        {activeMode === "custom" && (
          <motion.div
            key="custom-name-input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 rounded-2xl bg-card p-5 sm:p-6 border border-border/80 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="suggestedWeakness" className="text-base font-semibold text-foreground">
                Custom Vulnerability Name
              </Label>
              <span
                className={cn(
                  "text-xs sm:text-sm font-mono font-medium",
                  remainingChars < 20
                    ? "text-amber-500 font-bold"
                    : "text-muted-foreground"
                )}
              >
                {remainingChars} chars left
              </span>
            </div>
            <Input
              id="suggestedWeakness"
              value={internalCustom}
              onChange={handleCustomChange}
              placeholder="e.g., Prompt injection via tool output"
              maxLength={255}
              className="h-12 bg-background border-border text-foreground text-base px-4 rounded-xl placeholder:text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Something else &mdash; name it yourself if the list doesn&apos;t cover it. This doesn&apos;t add it to the shared list; the team will review it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 pt-1">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
