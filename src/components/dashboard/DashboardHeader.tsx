"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Globe, RefreshCw, Settings2, ShieldCheck, Building2, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  audience: "COMPANY" | "USER";
  organizationName?: string;
  userName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  audience,
  organizationName,
  userName,
}) => {
  const t = useT();
  const isCompany = audience === "COMPANY";

  // Time of day greeting for user
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const headerTitle = isCompany
    ? organizationName
      ? t("dashboard.header.companyTitle").replace("{name}", organizationName)
      : t("dashboard.header.companyDefault")
    : userName
    ? `${timeGreeting}, ${userName}`
    : t("dashboard.header.userTitle");

  return (
    <header className="flex flex-col gap-4 pb-4 border-b border-border/80 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {headerTitle}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-2xs",
              isCompany
                ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            )}
          >
            {isCompany ? (
              <>
                <Building2 className="size-3.5" />
                <span>Organization Hub</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5" />
                <span>Researcher Workspace</span>
              </>
            )}
          </Badge>
        </div>

        <p className="text-sm font-normal text-muted-foreground max-w-2xl">
          {isCompany
            ? t("dashboard.header.companyDesc")
            : "Monitor your vulnerability submissions, track active program scopes, and manage bounty payouts in real-time."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
        {onRefresh && (
          <Button
            variant="outline"
            size="default"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard data"
            className="h-10 px-3 text-sm font-medium border-border/80 bg-card text-foreground hover:bg-muted rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">{t("dashboard.header.refresh")}</span>
          </Button>
        )}

        <Link
          href={isCompany ? "/dashboard/program-management" : "/dashboard/programs"}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "h-10 px-3.5 rounded-xl border-border/80 bg-card text-foreground hover:bg-muted font-medium transition-all shadow-2xs",
          )}
        >
          {isCompany ? (
            <Settings2 className="size-4" data-icon="inline-start" />
          ) : (
            <Globe className="size-4" data-icon="inline-start" />
          )}
          <span>
            {isCompany
              ? t("dashboard.header.managePrograms")
              : t("dashboard.header.explorePrograms")}
          </span>
        </Link>

        <Link
          href={isCompany ? "/dashboard/create-program" : "/dashboard/submit-report"}
          className={cn(
            buttonVariants({ size: "default" }),
            "h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer",
          )}
        >
          <PlusCircle className="size-4" data-icon="inline-start" />
          <span>
            {isCompany
              ? t("dashboard.header.createProgram")
              : t("dashboard.header.submitReport")}
          </span>
        </Link>
      </div>
    </header>
  );
};
