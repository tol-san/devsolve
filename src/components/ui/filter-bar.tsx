"use client";

import * as React from "react";
import { Search, X, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The dashboard's one way of narrowing a list.
 *
 * Every screen with a search box had grown its own bar — different heights,
 * different borders, filters that said `updatedAt,DESC` at the reader, search
 * fields squeezed until the placeholder truncated. These are the parts they
 * all share, so the next screen inherits the decisions instead of re-making
 * them.
 *
 * The shape is always the same: search leads and takes the room, filters
 * follow as labelled capsules, and anything currently hiding rows is named
 * underneath with a way to undo it.
 */
export function FilterBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl bg-card p-4 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Search on the left, filters on the right, stacked on small screens. */
export function FilterRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center", className)}>
      {children}
    </div>
  );
}

/** The filters themselves, wrapping rather than shrinking their labels. */
export function FilterControls({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * The search field.
 *
 * Takes the remaining width because it is the control people reach for first,
 * and clears itself from inside rather than from a button somewhere else.
 */
export function FilterSearch({
  value,
  onChange,
  placeholder = "Search…",
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Announced to screen readers, since the placeholder is not a label. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-transparent bg-muted/50 pl-9 pr-10 text-sm text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
      />
      {value ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

/**
 * One filter, as a labelled capsule.
 *
 * The label is not decoration: a control reading "Any state" on its own leaves
 * the reader to guess what it governs.
 *
 * `items` is also what makes the trigger readable — Base UI's `Select.Value`
 * renders the raw value unless the root is handed this map, which is how
 * screens ended up showing `updatedAt,DESC` and `PENDING_REVIEW`.
 */
export function FilterSelect({
  icon: Icon,
  label,
  items,
  value,
  onValueChange,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  items: Record<string, string>;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span className="shrink-0 font-medium">{label}</span>
      <Select items={items} value={value} onValueChange={(next) => next && onValueChange(next)}>
        <SelectTrigger
          aria-label={label}
          className="h-8 cursor-pointer border-none bg-transparent font-medium text-foreground shadow-none focus:ring-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border bg-card">
          {Object.entries(items).map(([itemValue, itemLabel]) => (
            <SelectItem
              key={itemValue}
              value={itemValue}
              className="cursor-pointer rounded-lg text-sm"
            >
              {itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export type ActiveFilter = {
  key: string;
  label: string;
  clear: () => void;
};

/**
 * What is currently hiding rows, and one press to stop it.
 *
 * Renders nothing when nothing is narrowing the list, so the bar keeps its
 * height until it has something to say. A view the reader deliberately chose —
 * a tab, a queue — does not belong here; only the filters layered inside it.
 */
export function ActiveFilters({
  filters,
  onClearAll,
  className,
}: {
  filters: ActiveFilter[];
  onClearAll: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-border pt-3",
        className,
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">
        Filtered by
      </span>

      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.clear}
          className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-muted px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
        >
          {filter.label}
          <X aria-hidden className="size-3.5 text-muted-foreground" />
          <span className="sr-only">Remove this filter</span>
        </button>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={onClearAll}
        className="h-7 cursor-pointer rounded-full px-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}

export type FilterTab<T extends string> = {
  value: T;
  label: string;
  /** Shown as a pill after the label when the screen knows the number. */
  count?: number;
};

/**
 * The queue a list is being read through.
 *
 * A segmented control rather than another dropdown: these are the few states
 * worth switching between constantly, and a tab row shows all of them at once
 * with their sizes. It sits on its own line above the filters, since it is the
 * view rather than a narrowing of it.
 */
export function FilterTabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: FilterTab<T>[];
  label: string;
  className?: string;
}) {
  return (
    <ToggleGroup
      multiple={false}
      value={[value]}
      onValueChange={(values) => {
        const next = values[values.length - 1] as T | undefined;
        if (next) onChange(next);
      }}
      spacing={1}
      aria-label={label}
      className={cn(
        "w-full min-w-0 overflow-x-auto rounded-xl bg-muted p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <ToggleGroupItem
          key={tab.value}
          value={tab.value}
          className="h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-semibold text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-2xs"
        >
          <span>{tab.label}</span>
          {typeof tab.count === "number" ? (
            <Badge
              variant={value === tab.value ? "default" : "secondary"}
              className="rounded-full tabular-nums"
            >
              {tab.count}
            </Badge>
          ) : null}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
