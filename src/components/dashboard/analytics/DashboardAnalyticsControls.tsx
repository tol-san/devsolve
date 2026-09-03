"use client";

import React, { useState } from "react";
import { Download, RefreshCw, Calendar, Building2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TIME_RANGE_OPTIONS,
  type TimeRangeOption,
} from "@/lib/types/analytics/types";
import { useGetMyCompanyProgramsQuery } from "@/lib/redux/services/program/programsApi";
import { useRelativeTime } from "@/lib/i18n/relative-time";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { getAccessToken } from "@/lib/auth/access-token";

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
  generatedAt,
  onRefresh,
  isRefreshing = false,
}: DashboardAnalyticsControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const relativeTime = useRelativeTime();
  const locale = useLocale();
  const isKm = locale === "km";

  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetMyCompanyProgramsQuery({ page: 0, size: 100 });

  const programs = programsData?.content ?? [];

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const token = await getAccessToken();
      const params = new URLSearchParams();
      params.set("format", "csv");
      params.set("timeRange", timeRange);
      if (programId) params.set("programId", programId);

      const response = await fetch(
        `/api/organizations/me/analytics/export?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = `organization-analytics-${timeRange}.csv`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      toast.success(
        isKm
          ? "បានទាញយកទិន្នន័យ CSV ដោយជោគជ័យ"
          : "Analytics CSV exported successfully",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isKm
            ? "ការនាំចេញទិន្នន័យបានបរាជ័យ"
            : "Failed to export analytics CSV. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const updatedPrefix = isKm ? "បានធ្វើបច្ចុប្បន្នភាព" : "Updated";
  const cachedLabel = isKm ? "ឃ្លាំងសម្ងាត់ ~៦០វិនាទី" : "Cached ~60s";
  const refreshLabel = isKm ? "ផ្ទុកឡើងវិញ" : "Refresh";
  const allProgramsLabel = isKm ? "កម្មវិធីទាំងអស់" : "All programs";
  const timeWindowPlaceholder = isKm ? "ចន្លោះពេល" : "Time window";
  const exportLabel = isKm ? "នាំចេញ CSV" : "Export CSV";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      {/* Left side: Cache status & freshness */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-xl bg-muted/70 px-3 py-1.5 border border-border/70 text-xs sm:text-sm font-medium text-muted-foreground">
          <Clock className="size-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground">
            {generatedAt
              ? `${updatedPrefix} ${relativeTime(generatedAt)}`
              : "Live insights"}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">{cachedLabel}</span>
        </span>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-border bg-card text-xs sm:text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors shadow-2xs"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`size-3.5 mr-1.5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>{refreshLabel}</span>
          </Button>
        )}
      </div>

      {/* Right side: Time range, program selector, Export button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time range picker */}
        <div className="w-full sm:w-52">
          <Select
            value={timeRange}
            onValueChange={(val) => onTimeRangeChange(val as TimeRangeOption)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-card px-3.5 text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors">
              <Calendar className="size-4 mr-2 text-primary shrink-0" />
              {/* Render label explicitly so Base UI doesn't fall back to raw token '6m' */}
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

        {/* Program picker */}
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
              {/* Render label explicitly so Base UI doesn't fall back to raw token 'ALL' */}
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

        {/* Export CSV button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => void handleExportCsv()}
          disabled={isExporting}
          className="h-11 px-5 rounded-xl border-border/80 bg-card text-sm font-semibold shadow-2xs hover:bg-muted cursor-pointer transition-colors"
        >
          {isExporting ? (
            <Loader2 className="size-4 mr-2 animate-spin text-primary" />
          ) : (
            <Download className="size-4 mr-2 text-primary" />
          )}
          <span>{exportLabel}</span>
        </Button>
      </div>
    </div>
  );
}
