"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  type ActiveFilter,
} from "@/components/ui/filter-bar";
import {
  EVENT_TYPES,
  SEVERITIES,
  type EventType,
  type Sort,
} from "@/lib/types/hacktivity/types";
import { cn } from "@/lib/utils";
import { EVENT_LABEL, SEVERITY_STYLE } from "./presentation";
import type { HacktivityFilterState } from "./useHacktivityFilters";

/**
 * Everything that narrows the stream.
 *
 * Each control drives a server parameter, so a search reaches the whole feed
 * rather than the page already on screen. Typing waits {@link DEBOUNCE_MS}
 * before it asks — a request per keystroke would race itself and flicker.
 */

const DEBOUNCE_MS = 300;

const SORT_LABELS: Record<Sort, string> = {
  "createdAt,DESC": "Newest first",
  "createdAt,ASC": "Oldest first",
  "severity,DESC": "Most severe",
  "severity,ASC": "Least severe",
};

/** Multi-select: severity and event type are both repeatable upstream. */
function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function Chip({
  pressed,
  onClick,
  className,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        pressed
          ? className
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
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

  /* The URL is the source of truth: a back navigation or a cleared filter has
     to move the box, but only when the reader is not mid-word. */
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
    ...state.severity.map((value) => ({
      key: `severity:${value}`,
      label: SEVERITY_STYLE[value].label,
      clear: () => setFilters({ severity: toggle(state.severity, value) }),
    })),
    ...state.eventType.map((value) => ({
      key: `event:${value}`,
      label: EVENT_LABEL[value],
      clear: () => setFilters({ eventType: toggle(state.eventType, value) }),
    })),
  ];

  return (
    <FilterBar>
      <FilterRow>
        <FilterSearch
          value={text}
          label="Search the disclosure stream"
          placeholder="Search researchers, programs or findings…"
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
        </FilterControls>
      </FilterRow>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
          <legend className="sr-only">Filter by severity</legend>
          <span className="text-sm font-medium text-muted-foreground">Severity</span>
          {SEVERITIES.map((value) => (
            <Chip
              key={value}
              pressed={state.severity.includes(value)}
              className={SEVERITY_STYLE[value].active}
              onClick={() => setFilters({ severity: toggle(state.severity, value) })}
            >
              {SEVERITY_STYLE[value].label}
            </Chip>
          ))}
        </fieldset>

        <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
          <legend className="sr-only">Filter by activity</legend>
          <span className="text-sm font-medium text-muted-foreground">Activity</span>
          {EVENT_TYPES.map((value: EventType) => (
            <Chip
              key={value}
              pressed={state.eventType.includes(value)}
              className="bg-blue-600 text-white hover:bg-blue-600/90"
              onClick={() => setFilters({ eventType: toggle(state.eventType, value) })}
            >
              {EVENT_LABEL[value]}
            </Chip>
          ))}
        </fieldset>
      </div>

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
