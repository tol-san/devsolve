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
    <header className="flex flex-col gap-4 sm:gap-5 pb-5 border-b border-border/80 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {headerTitle}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-2xs",
              isCompany
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-primary/20 bg-primary/10 text-primary",
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

        <p className="text-sm font-normal text-muted-foreground max-w-2xl leading-relaxed">
          {isCompany
            ? t("dashboard.header.companyDesc")
            : "Monitor your vulnerability submissions, track active program scopes, and manage bounty payouts in real-time."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {onRefresh && (
            <Button
              variant="outline"
              size="default"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh dashboard data"
              className="h-10 px-3 text-sm font-medium border-border/80 bg-card text-foreground hover:bg-muted rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <RefreshCw
                data-icon="inline-start"
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
              <span className="hidden md:inline">{t("dashboard.header.refresh")}</span>
            </Button>
          )}

          <Link
            href={isCompany ? "/dashboard/program-management" : "/dashboard/programs"}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-10 px-3.5 rounded-xl border-border/80 bg-card text-foreground hover:bg-muted font-medium transition-all shadow-2xs flex-1 sm:flex-initial justify-center",
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
        </div>

        <Link
          href={isCompany ? "/dashboard/create-program" : "/dashboard/submit-report"}
          className={cn(
            buttonVariants({ size: "default" }),
            "h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-primary-foreground shadow-xs shadow-primary/20 transition-all cursor-pointer w-full sm:w-auto justify-center",
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
