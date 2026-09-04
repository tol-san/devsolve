"use client";

import { AnimatePresence, motion } from "motion/react";
import { Globe2, Search, X } from "lucide-react";
import {
  LeaderboardCountryOption,
  LeaderboardPeriod,
  SEVERITY_ORDER,
  SeverityLabel,
} from "@/lib/types/leaderboard/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_OPTIONS } from "./leaderboard-ui";

export type LeaderboardFilterState = {
  period: LeaderboardPeriod;
  country: string;
  severity: SeverityLabel | "all";
  search: string;
};

type Props = {
  value: LeaderboardFilterState;
  countries: LeaderboardCountryOption[];
  onChange: (patch: Partial<LeaderboardFilterState>) => void;
  onReset: () => void;
};

export default function LeaderboardFilters({
  value,
  countries,
  onChange,
  onReset,
}: Props) {
  const hasFilters =
    value.country !== "all" ||
    value.severity !== "all" ||
    value.search.trim() !== "";

  return (
    <section
      aria-label="Leaderboard filters"
      className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Ranking period"
          className="grid grid-cols-3 w-full sm:w-auto sm:flex h-11 shrink-0 rounded-xl bg-muted/60 p-1"
        >
          {PERIOD_OPTIONS.map((option) => {
            const active = value.period === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ period: option.value })}
                className={`relative rounded-lg px-2 sm:px-4 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center text-center ${
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="leaderboard-period-pill"
                    className="absolute inset-0 rounded-lg bg-blue-600"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="search"
              aria-label="Search researchers"
              placeholder="Search researcher or handle…"
              value={value.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="h-11 w-full rounded-xl border border-transparent bg-muted/50 pl-10 pr-4 text-base font-medium text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <Select
            value={value.country}
            onValueChange={(next) => onChange({ country: next || "all" })}
          >
            <SelectTrigger
              aria-label="Filter by country"
              className="h-11 w-full rounded-xl bg-muted/50 text-base font-medium text-foreground shadow-xs sm:w-48"
            >
              <Globe2 className="mr-1 h-4 w-4 text-muted-foreground" aria-hidden />
              <SelectValue placeholder="All countries">
                {(selected: string) =>
                  selected === "all"
                    ? "All countries"
                    : (countries.find((c) => c.code === selected)?.name ??
                      selected)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name} ({country.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={value.severity}
            onValueChange={(next) =>
              onChange({ severity: (next as SeverityLabel | "all") || "all" })
            }
          >
            <SelectTrigger
              aria-label="Filter by top severity"
              className="h-11 w-full rounded-xl bg-muted/50 text-base font-medium text-foreground shadow-xs sm:w-44"
            >
              <SelectValue placeholder="Any top severity">
                {(selected: string) =>
                  selected === "all"
                    ? "Any top severity"
                    : `${selected} finders`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any top severity</SelectItem>
              {SEVERITY_ORDER.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity} finders
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AnimatePresence initial={false}>
            {hasFilters && (
              <motion.button
                type="button"
                onClick={onReset}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={{ y: -1 }}
                className="inline-flex h-11 shrink-0 items-center gap-1 overflow-hidden rounded-xl px-2.5 text-sm font-semibold whitespace-nowrap text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
