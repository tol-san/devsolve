"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink, ArrowRight, Globe, Shield } from "lucide-react";
import { DashboardProgram } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardMyProgramsProps {
  programs: DashboardProgram[];
  audience: "COMPANY" | "USER";
}

export const DashboardMyPrograms: React.FC<DashboardMyProgramsProps> = ({
  programs,
  audience,
}) => {
  const t = useT();
  const isCompany = audience === "COMPANY";
  const listHref = isCompany
    ? "/dashboard/program-management"
    : "/dashboard/programs";
  const programHref = (id: string) =>
    isCompany
      ? `/dashboard/program-management/${id}`
      : `/dashboard/programs/${id}`;

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {isCompany
                ? t("dashboard.myPrograms.companyTitle")
                : t("dashboard.myPrograms.userTitle")}
            </h2>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {programs.length} active
            </Badge>
          </div>
          <Link
            href={listHref}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span>{t("dashboard.myPrograms.viewAll")}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 border-b border-border/50 px-2.5 select-none">
          <div className="col-span-6">{t("dashboard.myPrograms.colProgram")}</div>
          <div className="col-span-3 text-center">{t("dashboard.myPrograms.colStatus")}</div>
          <div className="col-span-3 text-right">{t("dashboard.myPrograms.colReports")}</div>
        </div>

        <div className="divide-y divide-border/50">
          {programs.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
                <Globe className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isCompany
                    ? t("dashboard.myPrograms.emptyCompanyTitle")
                    : "No active programs yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {isCompany
                    ? t("dashboard.myPrograms.emptyCompanyDesc")
                    : "Explore public bounty programs to find targets, submit vulnerability reports, and earn payouts."}
                </p>
              </div>
              <Link
                href="/dashboard/programs"
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <span>Browse Bounty Programs</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {programs.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Link
                href={programHref(program.id)}
                className="grid grid-cols-12 gap-2 items-center py-3.5 px-2.5 hover:bg-muted/60 rounded-xl transition-colors group"
              >
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 shrink-0 rounded-xl border border-border/80 shadow-2xs">
                    {program.logoUrl && (
                      <AvatarImage
                        src={program.logoUrl}
                        alt={`${program.companyName} logo`}
                        className="rounded-xl object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-bold text-white">
                      {program.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {program.name}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {program.companyName}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 flex justify-center">
                  {program.status === "Open" ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-none"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t("dashboard.myPrograms.statusOpen")}</span>
                    </Badge>
                  ) : program.status === "Closed" ? (
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      {t("dashboard.myPrograms.statusClosed")}
                    </Badge>
                  ) : program.status === "Private" ? (
                    <Badge
                      variant="outline"
                      className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs"
                    >
                      {t("dashboard.myPrograms.statusPrivate")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-none"
                    >
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      <span>{t("dashboard.myPrograms.statusReviewing")}</span>
                    </Badge>
                  )}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2">
                  <span className="rounded-lg border border-border/80 bg-muted px-2 py-0.5 text-xs font-bold text-foreground tabular-nums">
                    {program.reportCount} {program.reportCount === 1 ? "report" : "reports"}
                  </span>
                  <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
