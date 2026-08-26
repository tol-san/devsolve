"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Globe, RefreshCw, Settings2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  audience: "COMPANY" | "USER";
  organizationName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  audience,
  organizationName,
}) => {
  const t = useT();
  const isCompany = audience === "COMPANY";

  const headerTitle = isCompany
    ? organizationName
      ? t("dashboard.header.companyTitle").replace("{name}", organizationName)
      : t("dashboard.header.companyDefault")
    : t("dashboard.header.userTitle");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-neutral-800">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
          {headerTitle}
        </h1>
        <p className="text-sm font-normal text-slate-500 dark:text-neutral-400">
          {isCompany
            ? t("dashboard.header.companyDesc")
            : t("dashboard.header.userDesc")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="lg"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg text-slate-700 dark:text-neutral-300 cursor-pointer"
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(isRefreshing && "animate-spin")}
            />
            <span>{t("dashboard.header.refresh")}</span>
          </Button>
        )}

        <Link
          href={isCompany ? "/dashboard/program-management" : "/dashboard/programs"}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-lg border-slate-200 text-slate-700 dark:border-neutral-800 dark:text-neutral-300",
          )}
        >
          {isCompany ? (
            <Settings2 data-icon="inline-start" />
          ) : (
            <Globe data-icon="inline-start" />
          )}
          {isCompany
            ? t("dashboard.header.managePrograms")
            : t("dashboard.header.explorePrograms")}
        </Link>

        <Link
          href={isCompany ? "/dashboard/create-program" : "/dashboard/submit-report"}
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-lg bg-blue-600 font-medium text-white shadow-xs hover:bg-blue-700",
          )}
        >
          <PlusCircle data-icon="inline-start" />
          {isCompany
            ? t("dashboard.header.createProgram")
            : t("dashboard.header.submitReport")}
        </Link>
      </div>
    </header>
  );
};
