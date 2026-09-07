"use client";

import React from "react";
import { motion } from "motion/react";
import { ReportSeverityDistribution } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardReportSeverityProps {
  distribution: ReportSeverityDistribution;
}

export const DashboardReportSeverity: React.FC<DashboardReportSeverityProps> = ({
  distribution,
}) => {
  const t = useT();
  const { critical, high, medium, low, total } = distribution;

  const severities = [
    {
      level: t("dashboard.reportSeverity.critical"),
      rawLevel: "Critical",
      count: critical,
      barClass: "bg-gradient-to-r from-rose-500 to-red-600",
      badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      level: t("dashboard.reportSeverity.high"),
      rawLevel: "High",
      count: high,
      barClass: "bg-gradient-to-r from-orange-500 to-amber-500",
      badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      level: t("dashboard.reportSeverity.medium"),
      rawLevel: "Medium",
      count: medium,
      barClass: "bg-gradient-to-r from-amber-500 to-yellow-500",
      badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      level: t("dashboard.reportSeverity.low"),
      rawLevel: "Low",
      count: low,
      barClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 p-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t("dashboard.reportSeverity.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              CVSS impact tier distribution
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {total} Filings
          </Badge>
        </div>

        <div className="space-y-4 mt-5">
          {severities.map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.rawLevel} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-semibold px-2 py-0.5 shadow-none border", item.badgeClass)}
                    >
                      {item.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-bold text-foreground text-xs sm:text-sm">
                      {item.count}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.count > 0 ? `${Math.max(percentage, 5)}%` : "0%" }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                    className={cn("h-full rounded-full", item.barClass)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
