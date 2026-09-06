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
        "space-y-3 rounded-2xl bg-card p-3 sm:p-4 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 min-w-0 max-w-full overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

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
        "inline-flex h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-0",
        className,
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span className="shrink-0 font-medium">{label}</span>
      <Select items={items} value={value} onValueChange={(next) => next && onValueChange(next)}>
        <SelectTrigger
          aria-label={label}
          className="h-8 flex-1 min-w-0 cursor-pointer border-none bg-transparent font-medium text-foreground shadow-none focus:ring-0 [&>span]:truncate"
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
  count?: number;
};

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
    <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl bg-muted p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full items-center gap-1">
        <ToggleGroup
          multiple={false}
          value={[value]}
          onValueChange={(values) => {
            const next = values[values.length - 1] as T | undefined;
            if (next) onChange(next);
          }}
          spacing={1}
          aria-label={label}
          className={cn("w-full flex items-center gap-1", className)}
        >
          {tabs.map((tab) => (
            <ToggleGroupItem
              key={tab.value}
              value={tab.value}
              className="h-8.5 sm:h-9 shrink-0 cursor-pointer rounded-lg px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-2xs gap-1.5"
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <Badge
                  variant={value === tab.value ? "default" : "secondary"}
                  className="rounded-full tabular-nums text-[10px] sm:text-xs h-5 px-1.5"
                >
                  {tab.count}
                </Badge>
              ) : null}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
