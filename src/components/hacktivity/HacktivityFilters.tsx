"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  Award,
  CheckCircle2,
  Eye,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  type ActiveFilter,
} from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import {
  EVENT_TYPES,
  SEVERITIES,
  type EventType,
  type Severity,
  type Sort,
} from "@/lib/types/hacktivity/types";
import { cn } from "@/lib/utils";
import { EVENT_LABEL, SEVERITY_STYLE } from "./presentation";
import type { HacktivityFilterState } from "./useHacktivityFilters";

const DEBOUNCE_MS = 300;

const SORT_LABELS: Record<Sort, string> = {
  "createdAt,DESC": "Newest first",
  "createdAt,ASC": "Oldest first",
  "severity,DESC": "Most severe",
  "severity,ASC": "Least severe",
};

/** Multi-select toggle helper */
function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

const EVENT_ICON: Record<EventType, React.ReactNode> = {
  RECOGNITION_AWARDED: <Sparkles aria-hidden className="size-3.5 shrink-0" />,
  BOUNTY_AWARDED: <Award aria-hidden className="size-3.5 shrink-0" />,
  REPORT_RESOLVED: <CheckCircle2 aria-hidden className="size-3.5 shrink-0" />,
  REPORT_DISCLOSED: <Eye aria-hidden className="size-3.5 shrink-0" />,
};

interface FilterChipProps {
  pressed: boolean;
  onClick: () => void;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

function FilterChip({
  pressed,
  onClick,
  className,
  activeClassName,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs sm:text-sm font-medium transition-all duration-150 select-none",
        "border outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        pressed
          ? cn("border-transparent font-semibold shadow-xs", activeClassName)
          : cn(
              "border-border/70 bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border",
              className,
            ),
      )}
    >
      {children}
    </button>
  );
}

export function HacktivityFilters({
  state,
  setFilters,
  clearAll,
  isFiltered,
}: {
  state: HacktivityFilterState;
  setFilters: (patch: Partial<HacktivityFilterState>) => void;
  clearAll: () => void;
  isFiltered: boolean;
}) {
  const [text, setText] = useState(state.q);
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current) setText(state.q);
  }, [state.q]);

  useEffect(() => {
    if (!typed.current) return;
    const timer = setTimeout(() => {
      typed.current = false;
      if (text.trim() !== state.q) setFilters({ q: text.trim() });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [text, state.q, setFilters]);

  const active: ActiveFilter[] = [
    ...(state.q
      ? [
          {
            key: `q:${state.q}`,
            label: `“${state.q}”`,
            clear: () => {
              typed.current = false;
              setText("");
              setFilters({ q: "" });
            },
          },
        ]
      : []),
    ...state.severity.map((value: Severity) => ({
      key: `severity:${value}`,
      label: SEVERITY_STYLE[value].label,
      clear: () => setFilters({ severity: toggle(state.severity, value) }),
    })),
    ...state.eventType.map((value: EventType) => ({
      key: `event:${value}`,
      label: EVENT_LABEL[value],
      clear: () => setFilters({ eventType: toggle(state.eventType, value) }),
    })),
  ];

  return (
    <FilterBar className="space-y-4 border border-border/60 bg-card/95 p-4 sm:p-5 shadow-xs backdrop-blur-xs">
      {/* Top Search & Sort Row */}
      <FilterRow>
        <FilterSearch
          value={text}
          label="Search the disclosure stream"
          placeholder="Search researchers, programs, weaknesses or findings…"
          onChange={(value) => {
            typed.current = true;
            setText(value);
          }}
        />

        <FilterControls>
          <FilterSelect
            icon={ArrowUpDown}
            label="Sort"
            items={SORT_LABELS}
            value={state.sort}
            onValueChange={(value) => setFilters({ sort: value as Sort })}
          />

          {isFiltered ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                typed.current = false;
                setText("");
                clearAll();
              }}
              className="h-11 cursor-pointer rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3.5 mr-1.5 text-muted-foreground" />
              Reset
            </Button>
          ) : null}
        </FilterControls>
      </FilterRow>

      {/* Filter Categories: Clean & Structured with dedicated sections */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Severity filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[72px] shrink-0">
            <ShieldAlert className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Severity
            </span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            {SEVERITIES.map((value: Severity) => {
              const config = SEVERITY_STYLE[value];
              const isSelected = state.severity.includes(value);

              return (
                <FilterChip
                  key={value}
                  pressed={isSelected}
                  activeClassName={config.active}
                  onClick={() =>
                    setFilters({ severity: toggle(state.severity, value) })
                  }
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full shrink-0 transition-transform",
                      config.dot,
                      isSelected ? "scale-110 ring-1 ring-white/50" : "",
                    )}
                  />
                  <span>{config.label}</span>
                </FilterChip>
              );
            })}
          </div>
        </div>

        {/* Activity type filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[72px] shrink-0">
            <Award className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            {EVENT_TYPES.map((value: EventType) => {
              const isSelected = state.eventType.includes(value);

              return (
                <FilterChip
                  key={value}
                  pressed={isSelected}
                  activeClassName="bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-600"
                  onClick={() =>
                    setFilters({ eventType: toggle(state.eventType, value) })
                  }
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isSelected
                        ? "text-white"
                        : value === "BOUNTY_AWARDED"
                          ? "text-emerald-500"
                          : value === "RECOGNITION_AWARDED"
                            ? "text-amber-500"
                            : value === "REPORT_RESOLVED"
                              ? "text-blue-500"
                              : "text-indigo-500",
                    )}
                  >
                    {EVENT_ICON[value]}
                  </span>
                  <span>{EVENT_LABEL[value]}</span>
                </FilterChip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active filters bar */}
      {isFiltered ? (
        <ActiveFilters
          filters={active}
          onClearAll={() => {
            typed.current = false;
            setText("");
            clearAll();
          }}
        />
      ) : null}
    </FilterBar>
  );
}
