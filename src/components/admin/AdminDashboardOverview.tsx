"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import { AdminStatGrid } from "./AdminStatGrid";
import { AdminReportStatusDonut } from "./AdminReportStatusDonut";
import { AdminActionQueueCard } from "./AdminActionQueueCard";
import { AdminQuickModules } from "./AdminQuickModules";
import { AdminOverviewSnapshot } from "./AdminOverviewSnapshot";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useT } from "@/lib/i18n/I18nProvider";

export function AdminDashboardOverview() {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const {
    overview,
    adminData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    pieData,
  } = useAdminOverview();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show skeleton until hydrated — prevents SSR/client mismatch
  // where server sees isLoading=true but client already has RTK Query cache
  if (!mounted || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12 animate-pulse"
      >
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-muted rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-muted rounded-2xl" />
        </div>
      </motion.div>
    );
  }

  if (isError || !overview || !adminData) {
    const message =
      (error as { data?: { message?: string } } | undefined)?.data?.message ??
      "The platform overview could not be loaded.";

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
              {t("dashboard.admin.errorTitle")}
            </CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </CardHeader>
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("dashboard.admin.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.admin.subtitle")}
            {overview.generatedAt
              ? ` · ${t("dashboard.admin.updated")} ${new Date(overview.generatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3.5 rounded-xl border-border bg-card hover:bg-muted text-foreground text-sm font-semibold cursor-pointer shadow-2xs"
          >
            <RefreshCw
              data-icon="inline-start"
              className={isFetching ? "animate-spin" : undefined}
            />
            {t("dashboard.header.refresh")}
          </Button>
        </div>
      </header>

      <AdminStatGrid stats={adminData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AdminOverviewSnapshot overview={overview} />
        <AdminReportStatusDonut
          pieData={pieData}
          total={adminData.reportStatusBreakdown.total}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AdminActionQueueCard
          items={adminData.actionQueue.items}
          totalCount={adminData.actionQueue.totalCount}
        />
        <AdminQuickModules />
      </div>
    </motion.div>
  );
}
