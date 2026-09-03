"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Building2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOrganizationAnalyticsQuery } from "@/lib/redux/services/analyticsApi";
import type { TimeRangeOption } from "@/lib/types/analytics/types";
import { DashboardAnalyticsControls } from "./DashboardAnalyticsControls";
import { DashboardKpiRow } from "./DashboardKpiRow";
import { DashboardSlaStrip } from "./DashboardSlaStrip";
import { DashboardSubmissionTrendChart } from "./DashboardSubmissionTrendChart";
import { DashboardSeverityDonut } from "./DashboardSeverityDonut";
import { DashboardTopCweBars } from "./DashboardTopCweBars";
import { DashboardTargetedAssetsTable } from "./DashboardTargetedAssetsTable";
import { DashboardResearcherLeaderboard } from "./DashboardResearcherLeaderboard";
import { DashboardRecentReportsTable } from "./DashboardRecentReportsTable";
import { DashboardCompanyProgramsTable } from "./DashboardCompanyProgramsTable";

function CompanyDashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-border/60">
        <div className="h-5 w-48 rounded-lg bg-muted/60" />
        <div className="flex gap-2">
          <div className="h-9 w-36 rounded-xl bg-muted/60" />
          <div className="h-9 w-44 rounded-xl bg-muted/60" />
          <div className="h-9 w-28 rounded-xl bg-muted/60" />
        </div>
      </div>

      {/* 5 KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-3.5 w-20 rounded bg-muted/60" />
              <div className="size-8 rounded-xl bg-muted/60" />
            </div>
            <div className="h-6 w-24 rounded bg-muted/70" />
            <div className="h-3 w-32 rounded bg-muted/50" />
          </div>
        ))}
      </div>

      {/* SLA Strip skeleton */}
      <div className="h-20 rounded-2xl border border-border/60 bg-card/60" />

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="h-88 rounded-2xl border border-border/60 bg-card/60 lg:col-span-7" />
        <div className="h-88 rounded-2xl border border-border/60 bg-card/60 lg:col-span-5" />
      </div>

      {/* CWE + Assets skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="h-72 rounded-2xl border border-border/60 bg-card/60 lg:col-span-6" />
        <div className="h-72 rounded-2xl border border-border/60 bg-card/60 lg:col-span-6" />
      </div>

      {/* Leaderboard skeleton */}
      <div className="h-64 rounded-2xl border border-border/60 bg-card/60" />

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="h-80 rounded-2xl border border-border/60 bg-card/60 lg:col-span-6" />
        <div className="h-80 rounded-2xl border border-border/60 bg-card/60 lg:col-span-6" />
      </div>
    </div>
  );
}

interface ApiErrorPayload {
  status?: number;
  data?: {
    message?: string;
    errorDetails?: {
      organizationIds?: string[];
    };
  };
}

export function CompanyDashboardView() {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("6m");
  const [programId, setProgramId] = useState<string | undefined>(undefined);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);

  const {
    data: analytics,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetOrganizationAnalyticsQuery({
    timeRange,
    programId,
    organizationId: selectedOrgId,
  });

  // First load skeleton
  if (isLoading && !analytics) {
    return <CompanyDashboardSkeleton />;
  }

  // Error handling per backend contract
  if (isError && !analytics) {
    const err = error as ApiErrorPayload;
    const status = err?.status;
    const errorDetails = err?.data?.errorDetails;

    // 403: Lacks VIEW_PROGRAMS / not a member
    if (status === 403) {
      return (
        <Card className="mx-auto max-w-lg rounded-2xl text-center border-border bg-card my-12 p-6 space-y-4">
          <CardHeader className="justify-items-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldAlert className="size-7" />
            </span>
            <CardTitle className="text-xl font-bold mt-2">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              You don&apos;t have access to this organization&apos;s analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              You must be an active member of this organization with the{" "}
              <code className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                VIEW_PROGRAMS
              </code>{" "}
              permission to inspect metrics.
            </p>
          </CardContent>
        </Card>
      );
    }

    // 409: Belongs to >1 org and sent no organizationId
    if (status === 409 && errorDetails?.organizationIds?.length) {
      return (
        <Card className="mx-auto max-w-lg rounded-2xl text-center border-border bg-card my-12 p-6 space-y-4">
          <CardHeader className="justify-items-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="size-7" />
            </span>
            <CardTitle className="text-xl font-bold mt-2">
              Select an Organization
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              Your account belongs to multiple organizations. Please select one
              to view its analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedOrgId ?? ""}
              onValueChange={(val) => setSelectedOrgId(val || undefined)}
            >
              <SelectTrigger className="h-10 rounded-xl border-border bg-card text-sm font-semibold">
                <SelectValue placeholder="Choose organization" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover">
                {errorDetails.organizationIds.map((id) => (
                  <SelectItem key={id} value={id} className="font-mono text-xs">
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              type="button"
              onClick={() => void refetch()}
              disabled={!selectedOrgId}
              className="rounded-xl"
            >
              Load Analytics
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // 404: programId isn't a live program of this org -> reset filter
    if (status === 404 && programId) {
      return (
        <Card className="mx-auto max-w-md rounded-2xl text-center border-border bg-card my-12 p-6 space-y-3">
          <CardHeader className="justify-items-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <AlertTriangle className="size-6" />
            </span>
            <CardTitle className="text-lg font-bold">Program Filter Not Found</CardTitle>
            <CardDescription className="text-sm">
              The selected program does not belong to this organization or has been archived.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProgramId(undefined);
                void refetch();
              }}
              className="rounded-xl"
            >
              Reset to All Programs
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Generic error fallback
    return (
      <Card className="mx-auto max-w-lg rounded-2xl text-center border-border bg-card my-12 p-6 space-y-3">
        <CardHeader className="justify-items-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </span>
          <CardTitle className="text-lg font-bold">Failed to Load Dashboard</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {err?.data?.message || "An unexpected error occurred while fetching company analytics."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            className="rounded-xl"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!analytics) {
    return <CompanyDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Enterprise Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div className="flex flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <span>Dashboard</span>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-semibold">Security Analytics</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {analytics.organizationName
              ? `${analytics.organizationName} Security Overview`
              : "Security Analytics & Programs"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time vulnerability metrics, response velocity, researcher leaderboard, and bug bounty programs.
          </p>
        </div>
      </header>

      {/* 1. Header controls: Time range, program selector, Export CSV button */}
      <DashboardAnalyticsControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        programId={programId}
        onProgramIdChange={setProgramId}
        generatedAt={analytics.generatedAt}
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
      />

      {/* Grid container with smooth dimming on filter change */}
      <div
        className={`space-y-6 transition-opacity duration-200 ${
          isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* 2. Top 5 KPI Cards Row */}
        <DashboardKpiRow kpi={analytics.kpiSummary} />

        {/* 3. SLA Performance Strip */}
        <DashboardSlaStrip sla={analytics.kpiSummary.slaMetrics} />

        {/* 4. Submission Trend & Severity Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <DashboardSubmissionTrendChart data={analytics.submissionTrend} />
          </div>
          <div className="lg:col-span-5">
            <DashboardSeverityDonut
              distribution={analytics.severityDistribution}
            />
          </div>
        </div>

        {/* 5. Top CWE Classes & Targeted Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DashboardTopCweBars
              categories={analytics.topVulnerabilityCategories}
            />
          </div>
          <div className="lg:col-span-6">
            <DashboardTargetedAssetsTable assets={analytics.topTargetedAssets} />
          </div>
        </div>

        {/* 6. Researcher Leaderboard */}
        <DashboardResearcherLeaderboard
          researchers={analytics.topResearchers}
        />

        {/* 7. Bottom Supporting Tables: Your Programs + Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DashboardCompanyProgramsTable />
          </div>
          <div className="lg:col-span-6">
            <DashboardRecentReportsTable programId={programId} />
          </div>
        </div>
      </div>
    </div>
  );
}
