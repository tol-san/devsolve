"use client";

import React from "react";
import { Calendar, Building2 } from "lucide-react";
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

interface DashboardAnalyticsControlsProps {
  timeRange: TimeRangeOption;
  onTimeRangeChange: (value: TimeRangeOption) => void;
  programId?: string;
  onProgramIdChange: (value: string | undefined) => void;
  generatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardAnalyticsControls({
  timeRange,
  onTimeRangeChange,
  programId,
  onProgramIdChange,
}: DashboardAnalyticsControlsProps) {
  const locale = useLocale();
  const isKm = locale === "km";

  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetMyCompanyProgramsQuery({ page: 0, size: 100 });

  const programs = programsData?.content ?? [];

  const allProgramsLabel = isKm ? "កម្មវិធីទាំងអស់" : "All programs";
  const timeWindowPlaceholder = isKm ? "ចន្លោះពេល" : "Time window";

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div className="w-full sm:w-52">
        <Select
          value={timeRange}
          onValueChange={(val) => onTimeRangeChange(val as TimeRangeOption)}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-card px-3.5 text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors">
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
              <SelectItem key={opt.value} value={opt.value} className="text-sm font-medium py-2.5">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-64">
        <Select
          value={programId ?? "ALL"}
          onValueChange={(val) =>
            onProgramIdChange(val === "ALL" || !val ? undefined : val)
          }
          disabled={isLoadingPrograms}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-card px-3.5 text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors">
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
              <SelectItem key={prog.id} value={prog.id} className="text-sm font-medium py-2.5">
                {prog.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

