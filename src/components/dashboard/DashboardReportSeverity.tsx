"use client";

import React from "react";
import { ReportSeverityDistribution } from "@/lib/types/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/I18nProvider";

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
      barClass: "bg-red-500",
      badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800/60",
    },
    {
      level: t("dashboard.reportSeverity.high"),
      rawLevel: "High",
      count: high,
      barClass: "bg-orange-500",
      badgeClass: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-800/60",
    },
    {
      level: t("dashboard.reportSeverity.medium"),
      rawLevel: "Medium",
      count: medium,
      barClass: "bg-amber-500",
      badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    },
    {
      level: t("dashboard.reportSeverity.low"),
      rawLevel: "Low",
      count: low,
      barClass: "bg-emerald-500",
      badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100 pb-4 border-b border-slate-100 dark:border-neutral-800">
          {t("dashboard.reportSeverity.title")}
        </h2>

        <div className="space-y-4 mt-4">
          {severities.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.rawLevel} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 shadow-none ${item.badgeClass}`}>
                      {item.level}
                    </Badge>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-neutral-100">
                    {item.count}
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.barClass}`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
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
