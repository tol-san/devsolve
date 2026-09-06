"use client";

import React from "react";
import { Calendar, Building2, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIME_RANGE_OPTIONS,
  type TimeRangeOption,
} from "@/lib/types/analytics/types";
import { useGetMyCompanyProgramsQuery } from "@/lib/redux/services/program/programsApi";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardAnalyticsControlsProps {
  timeRange: TimeRangeOption;
  onTimeRangeChange: (value: TimeRangeOption) => void;
  programId?: string;
  onProgramIdChange: (value: string | undefined) => void;
  generatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function DashboardAnalyticsControls({
  timeRange,
  onTimeRangeChange,
  programId,
  onProgramIdChange,
  generatedAt,
  onRefresh,
  isRefreshing,
}: DashboardAnalyticsControlsProps) {
  const locale = useLocale();
  const isKm = locale === "km";

  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetMyCompanyProgramsQuery({ page: 0, size: 100 });

  const programs = programsData?.content ?? [];

  const allProgramsLabel = isKm ? "កម្មវិធីទាំងអស់" : "All programs";
  const timeWindowPlaceholder = isKm ? "ចន្លោះពេល" : "Time window";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div className="flex items-center justify-between md:justify-start gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="size-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">
              {isKm ? "ទិដ្ឋភាពទូទៅនៃការវិភាគ" : "Analytics Scope"}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {generatedAt
                ? `${isKm ? "បានធ្វើបច្ចុប្បន្នភាព" : "Last updated"} ${formatRelativeTime(generatedAt)}`
                : isKm
                  ? "ទិន្នន័យពេលវេលាជាក់ស្តែង"
                  : "Real-time metrics & filters"}
            </p>
          </div>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg md:ml-1 shrink-0"
            title="Refresh metrics"
          >
            <RefreshCw
              className={cn(
                "size-3.5 mr-1.5",
                isRefreshing && "animate-spin text-primary",
              )}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        <div className="w-full sm:w-48">
          <Select
            value={timeRange}
            onValueChange={(val) => onTimeRangeChange(val as TimeRangeOption)}
          >
            <SelectTrigger className="h-10 sm:h-11 w-full rounded-xl border-border/80 bg-card px-3.5 text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors">
              <Calendar className="size-4 mr-2 text-primary shrink-0" />
              <SelectValue placeholder={timeWindowPlaceholder}>
                {(selected: string) =>
                  TIME_RANGE_OPTIONS.find((opt) => opt.value === selected)?.label ??
                  selected
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-popover text-sm min-w-52">
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm font-medium py-2.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-60">
          <Select
            value={programId ?? "ALL"}
            onValueChange={(val) =>
              onProgramIdChange(val === "ALL" || !val ? undefined : val)
            }
            disabled={isLoadingPrograms}
          >
            <SelectTrigger className="h-10 sm:h-11 w-full rounded-xl border-border/80 bg-card px-3.5 text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors">
              <Building2 className="size-4 mr-2 text-primary shrink-0" />
              <SelectValue placeholder={allProgramsLabel}>
                {(selected: string) =>
                  selected === "ALL" || !selected
                    ? allProgramsLabel
                    : (programs.find((p) => p.id === selected)?.name ?? selected)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-popover text-sm max-h-72 min-w-64">
              <SelectItem value="ALL" className="text-sm font-semibold py-2.5">
                {allProgramsLabel}
              </SelectItem>
              {programs.map((prog) => (
                <SelectItem
                  key={prog.id}
                  value={prog.id}
                  className="text-sm font-medium py-2.5"
                >
                  {prog.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

