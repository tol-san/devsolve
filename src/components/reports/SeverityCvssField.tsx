"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Calculator, Check, ClipboardPaste, Gauge, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CVSS_METRICS,
  evaluate,
  isComplete,
  parseVector,
  type CvssSelection,
  type CvssVersion,
} from "@/lib/cvss/v3";
import { cn } from "@/lib/utils";

const SEVERITIES = [
  { value: "LOW", label: "Low", blurb: "Minor or theoretical impact" },
  { value: "MEDIUM", label: "Medium", blurb: "Real impact, limited reach" },
  { value: "HIGH", label: "High", blurb: "Serious impact on real data" },
  { value: "CRITICAL", label: "Critical", blurb: "Full compromise, trivial to exploit" },
] as const;

export type Severity = (typeof SEVERITIES)[number]["value"];

const TONE: Record<Severity, string> = {
  LOW: "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  MEDIUM: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HIGH: "border-orange-600 bg-orange-600/10 text-orange-700 dark:text-orange-300",
  CRITICAL: "border-rose-600 bg-rose-600/10 text-rose-700 dark:text-rose-300",
};

export interface SeverityCvssValue {
  severity: Severity | "";
  cvssVector: string;
  cvssScore: string;
}

interface Props {
  value: SeverityCvssValue;
  onChange: (next: SeverityCvssValue) => void;
  error?: string;
}

export function SeverityCvssField({ value, onChange, error }: Props) {
  const [mode, setMode] = useState<"quick" | "cvss">(
    value.cvssVector ? "cvss" : "quick",
  );
  const [selection, setSelection] = useState<CvssSelection>(
    () => parseVector(value.cvssVector)?.selection ?? {},
  );
  const [version, setVersion] = useState<CvssVersion>(
    () => parseVector(value.cvssVector)?.version ?? "CVSS:3.1",
  );
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  const result = useMemo(
    () => (isComplete(selection) ? evaluate(selection, version) : null),
    [selection, version],
  );

  useEffect(() => {
    if (mode !== "cvss") return;
    if (!result) return;
    if (
      value.cvssVector === result.vector &&
      value.cvssScore === result.score.toFixed(1) &&
      value.severity === (result.rating === "NONE" ? "" : result.rating)
    ) {
      return;
    }
    onChange({
      severity: result.rating === "NONE" ? "" : (result.rating as Severity),
      cvssVector: result.vector,
      cvssScore: result.score.toFixed(1),
    });
  }, [mode, result, onChange, value]);

  function pickQuick(severity: Severity) {
    onChange({ severity, cvssVector: "", cvssScore: "" });
  }

  function switchMode(next: "quick" | "cvss") {
    setMode(next);
    if (next === "quick") {
      setSelection({});
      onChange({ severity: value.severity, cvssVector: "", cvssScore: "" });
    }
  }

  function applyPasted() {
    const parsed = parseVector(pasted);
    if (!parsed) {
      setPasteError(
        "That is not a complete CVSS v3.0 or v3.1 base vector. It should look like CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      );
      return;
    }
    setSelection(parsed.selection);
    setVersion(parsed.version);
    setPasteError(null);
    setPasting(false);
    setPasted("");
  }

  const answered = CVSS_METRICS.filter((m) => selection[m.key]).length;

  return (
    <section className="space-y-3" aria-labelledby="severity-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3
            id="severity-heading"
            className="text-sm font-semibold text-foreground"
          >
            Severity <span className="text-rose-500">*</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Your own assessment. Triage will confirm or adjust it.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="How to set severity"
          className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 w-full sm:w-auto"
        >
          {(
            [
              { id: "quick", label: "Pick a level", icon: Gauge },
              { id: "cvss", label: "Score with CVSS", icon: Calculator },
            ] as const
          ).map((tab) => {
            const active = mode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchMode(tab.id)}
                className={cn(
                  "flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors",
                  active
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === "quick" ? (
          <motion.div
            key="quick"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
          >
            {SEVERITIES.map((option) => {
              const active = value.severity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickQuick(option.value)}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 text-left transition-colors",
                    active
                      ? TONE[option.value]
                      : "border-border bg-card hover:bg-muted/60",
                  )}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  <span
                    className={cn(
                      "text-xs leading-snug",
                      active ? "opacity-80" : "text-muted-foreground",
                    )}
                  >
                    {option.blurb}
                  </span>
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="cvss"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="space-y-3"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 tabular-nums",
                      result && result.rating !== "NONE"
                        ? TONE[result.rating as Severity]
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    <span className="text-lg font-bold leading-none">
                      {result ? result.score.toFixed(1) : "—"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase">
                      base
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {result
                        ? result.rating === "NONE"
                          ? "No impact"
                          : SEVERITIES.find((s) => s.value === result.rating)?.label
                        : `${answered} of ${CVSS_METRICS.length} answered`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result
                        ? "Severity, score and vector are set from these metrics."
                        : "Answer every metric to produce a score."}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasting((open) => !open)}
                  className="cursor-pointer rounded-xl"
                >
                  <ClipboardPaste data-icon="inline-start" />
                  Paste a vector
                </Button>
              </div>

              {pasting ? (
                <div className="space-y-2 border-b border-border bg-background px-4 py-3">
                  <label
                    htmlFor="cvss-paste"
                    className="text-sm font-semibold text-foreground"
                  >
                    Paste a CVSS v3.0 or v3.1 base vector
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="cvss-paste"
                      value={pasted}
                      onChange={(event) => {
                        setPasted(event.target.value);
                        setPasteError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          applyPasted();
                        }
                      }}
                      placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
                      className="h-10 flex-1 rounded-xl border-border bg-background font-mono text-sm"
                    />
                    <Button
                      type="button"
                      onClick={applyPasted}
                      className="h-10 cursor-pointer rounded-xl"
                    >
                      Apply
                    </Button>
                  </div>
                  {pasteError ? (
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      {pasteError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="divide-y divide-border">
                {CVSS_METRICS.map((metric) => (
                  <fieldset key={metric.key} className="px-4 py-3">
                    <legend className="sr-only">{metric.label}</legend>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 sm:max-w-xs">
                        <p className="text-sm font-semibold text-foreground">
                          {metric.label}
                          <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                            {metric.key}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {metric.question}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {metric.options.map((option) => {
                          const active = selection[metric.key] === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={active}
                              title={option.hint}
                              onClick={() =>
                                setSelection((prev) => ({
                                  ...prev,
                                  [metric.key]: option.value,
                                }))
                              }
                              className={cn(
                                "cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </fieldset>
                ))}
              </div>

              {result ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 px-4 py-3">
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs text-foreground">
                    {result.vector}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelection({})}
                    className="cursor-pointer rounded-lg"
                  >
                    <X data-icon="inline-start" />
                    Reset
                  </Button>
                </div>
              ) : null}
            </div>

            {result?.rating === "NONE" ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25"
              >
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                These metrics score 0.0, which means no impact — the platform
                cannot accept that as a severity. Revisit the impact metrics, or
                switch to “Pick a level”.
              </p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export default SeverityCvssField;
