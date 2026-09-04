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
import { DashboardSecurityFeed } from "@/components/dashboard/DashboardSecurityFeed";
import { CompanyDashboardView } from "@/components/dashboard/analytics/CompanyDashboardView";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
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
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-muted/70" />
          <div className="h-4 w-96 rounded-lg bg-muted/50" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-xl bg-muted/60" />
          <div className="h-10 w-36 rounded-xl bg-muted/60" />
          <div className="h-10 w-36 rounded-xl bg-muted/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl border border-border/60 bg-card/60 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-muted/60" />
              <div className="size-9 rounded-xl bg-muted/60" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-muted/70" />
            <div className="h-3 w-32 rounded bg-muted/50" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-84 rounded-2xl border border-border/60 bg-card/60 p-5 lg:col-span-5" />
        <div className="h-84 rounded-2xl border border-border/60 bg-card/60 p-5 lg:col-span-7" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 rounded-2xl border border-border/60 bg-card/60 p-5"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const t = useT();
  const { user, areRolesResolved, displayName } = useSidebarAuth();
  const isAdminUser =
    user?.roles?.includes("ADMIN") || user?.role?.includes("ADMIN");
  const { hasCompanyAccess } = useCompanyAccess();

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardOverviewQuery(
    { view: "user" },
    { skip: !areRolesResolved || Boolean(isAdminUser) || Boolean(hasCompanyAccess) },
  );

  if (!areRolesResolved) {
    return <DashboardSkeleton />;
  }

  if (isAdminUser) {
    return <AdminDashboardOverview />;
  }

  if (hasCompanyAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <CompanyDashboardView />
      </motion.div>
    );
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
        <Card className="mx-auto max-w-xl rounded-2xl text-center border-border bg-card">
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
      <DashboardHeader
        onRefresh={refetch}
        isRefreshing={isFetching}
        audience={dashboardData.audience}
        organizationName={dashboardData.organization?.name}
        userName={displayName}
      />

      <DashboardStatCards stats={dashboardData.stats} />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardReportStatus distribution={dashboardData.reportStatus} />
        <DashboardReportSeverity distribution={dashboardData.reportSeverity} />
        <DashboardSecurityFeed feed={dashboardData.securityFeed ?? []} />
      </div>
    </motion.div>
  );
}
