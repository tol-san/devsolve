"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Building2, ShieldCheck } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

function DashboardSkeletonContent() {
  return (
    <div className="space-y-6 w-full animate-pulse">
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
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <DashboardSkeletonContent />
    </motion.div>
  );
}

function DashboardPageContent() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, areRolesResolved, displayName } = useSidebarAuth();
  const isAdminUser =
    user?.roles?.includes("ADMIN") || user?.role?.includes("ADMIN");
  const { hasCompanyAccess, membership } = useCompanyAccess();

  const viewParam = searchParams.get("view");
  const [activeView, setActiveView] = useState<"company" | "user">(() => {
    if (
      viewParam === "user" ||
      viewParam === "personal" ||
      viewParam === "researcher"
    ) {
      return "user";
    }
    if (viewParam === "company" || viewParam === "organization") {
      return "company";
    }
    return "company";
  });

  useEffect(() => {
    if (
      viewParam === "user" ||
      viewParam === "personal" ||
      viewParam === "researcher"
    ) {
      setActiveView("user");
    } else if (viewParam === "company" || viewParam === "organization") {
      setActiveView("company");
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devsolve_active_dashboard_view");
      if (saved === "user" || saved === "company") {
        setActiveView(saved);
      }
    }
  }, [viewParam]);

  const handleViewChange = (newView: "company" | "user") => {
    setActiveView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem("devsolve_active_dashboard_view", newView);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isViewingCompany = hasCompanyAccess && activeView === "company";

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardOverviewQuery(
    { view: "user" },
    { skip: !areRolesResolved || Boolean(isAdminUser) || isViewingCompany },
  );

  if (!areRolesResolved) {
    return <DashboardSkeleton />;
  }

  if (isAdminUser) {
    return <AdminDashboardOverview />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* View Switcher Banner for dual-role members (Company Member + Platform Researcher) */}
      {hasCompanyAccess && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              {activeView === "company" ? (
                <Building2 className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                  {activeView === "company"
                    ? membership?.organizationName
                      ? `${membership.organizationName} Workspace`
                      : "Organization Workspace"
                    : "Personal Researcher Workspace"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold border-primary/30 bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                >
                  {activeView === "company" ? "Organization View" : "Researcher View"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {activeView === "company"
                  ? "Organization security metrics, program triage & bounty management"
                  : "Your vulnerability submissions, bounty payouts & personal action queue"}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Dashboard workspace switcher"
            className="inline-flex p-1 rounded-xl bg-muted/80 border border-border/60 self-stretch sm:self-auto shrink-0 shadow-inner"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "company"}
              onClick={() => handleViewChange("company")}
              className={cn(
                "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeView === "company"
                  ? "bg-background text-foreground shadow-xs border border-border/70 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              <Building2 className="size-4 text-primary" />
              <span>Organization Hub</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "user"}
              onClick={() => handleViewChange("user")}
              className={cn(
                "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeView === "user"
                  ? "bg-background text-foreground shadow-xs border border-border/70 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              <ShieldCheck className="size-4 text-primary" />
              <span>Personal Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Dashboard View Content */}
      <AnimatePresence mode="wait" initial={false}>
        {isViewingCompany ? (
          <motion.div
            key="company-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 w-full"
          >
            <CompanyDashboardView />
          </motion.div>
        ) : (
          <motion.div
            key="user-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 w-full"
          >
            {isLoading ? (
              <DashboardSkeletonContent />
            ) : isError || !dashboardData ? (
              <Card className="mx-auto max-w-xl rounded-2xl text-center border-border bg-card">
                <CardHeader className="justify-items-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <AlertTriangle className="size-7" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-xl font-bold">
                    {t("dashboard.error.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {(error as { data?: { message?: string } } | undefined)?.data
                      ?.message ?? t("dashboard.error.description")}
                  </CardDescription>
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
            ) : (
              <div className="space-y-6">
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
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}

