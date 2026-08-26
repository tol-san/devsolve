"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { useGetDashboardOverviewQuery } from "@/lib/redux/services/dashboardApi";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { DashboardActionQueue } from "@/components/dashboard/DashboardActionQueue";
import { DashboardMyPrograms } from "@/components/dashboard/DashboardMyPrograms";
import { DashboardReportStatus } from "@/components/dashboard/DashboardReportStatus";
import { DashboardReportSeverity } from "@/components/dashboard/DashboardReportSeverity";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useT } from "@/lib/i18n/I18nProvider";

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 animate-pulse"
    >
      <div className="h-20 rounded-2xl bg-slate-200/60 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 rounded-2xl bg-slate-200/60 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-80 rounded-2xl bg-slate-200/60 lg:col-span-5 dark:bg-neutral-800" />
        <div className="h-80 rounded-2xl bg-slate-200/60 lg:col-span-7 dark:bg-neutral-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-72 rounded-2xl bg-slate-200/60 dark:bg-neutral-800"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const t = useT();
  const { user, areRolesResolved } = useSidebarAuth();
  const isAdminUser =
    user?.roles?.includes("ADMIN") || user?.role?.includes("ADMIN");
  const isCompanyUser = user?.roles?.includes("COMPANY") ?? false;
  const dashboardView = isCompanyUser ? "company" : "user";

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardOverviewQuery(
    { view: dashboardView },
    { skip: !areRolesResolved || Boolean(isAdminUser) },
  );

  if (!areRolesResolved) {
    return <DashboardSkeleton />;
  }

  if (isAdminUser) {
    return <AdminDashboardOverview />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !dashboardData) {
    const message =
      (error as { data?: { message?: string } } | undefined)?.data?.message ??
      t("dashboard.error.description");

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <Card className="mx-auto max-w-xl rounded-2xl text-center">
          <CardHeader className="justify-items-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <AlertTriangle className="size-7" aria-hidden="true" />
            </span>
            <CardTitle className="text-xl font-bold">
              {t("dashboard.error.title")}
            </CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.error.description")}
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              {t("dashboard.error.retry")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Page Header with option to switch back to Admin Platform View */}
      <DashboardHeader
        onRefresh={refetch}
        isRefreshing={isFetching}
        audience={dashboardData.audience}
        organizationName={dashboardData.organization?.name}
      />

      {/* Top 4 Stat Metric Cards */}
      <DashboardStatCards stats={dashboardData.stats} />

      {/* Middle Section: Action Queue + My Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DashboardActionQueue
            items={dashboardData.actionQueue.items}
            totalCount={dashboardData.actionQueue.totalCount}
          />
        </div>
        <div className="lg:col-span-7">
          <DashboardMyPrograms
            programs={dashboardData.myPrograms}
            audience={dashboardData.audience}
          />
        </div>
      </div>

      {/* Bottom Section: Status Breakdown + Severity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardReportStatus distribution={dashboardData.reportStatus} />
        <DashboardReportSeverity distribution={dashboardData.reportSeverity} />
      </div>
    </motion.div>
  );
}
