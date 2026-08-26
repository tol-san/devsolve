"use client";

import React from "react";
import { ReportStatusDistribution } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardReportStatusProps {
  distribution: ReportStatusDistribution;
}

export const DashboardReportStatus: React.FC<DashboardReportStatusProps> = ({ distribution }) => {
  const t = useT();
  const { resolved, accepted, pending, other, total } = distribution;

  const items = [
    { label: t("dashboard.reportStatus.resolved"), count: resolved, color: "#10B981", bgClass: "bg-emerald-500" },
    { label: t("dashboard.reportStatus.accepted"), count: accepted, color: "#2563EB", bgClass: "bg-blue-600" },
    { label: t("dashboard.reportStatus.pending"), count: pending, color: "#F59E0B", bgClass: "bg-amber-500" },
    { label: t("dashboard.reportStatus.other"), count: other, color: "#94A3B8", bgClass: "bg-slate-400" },
  ];

  // Calculate SVG Donut chart stroke dashes
  const strokeWidth = 14;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = items.map((item) => {
    const percent = total > 0 ? item.count / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100 pb-4 border-b border-slate-100 dark:border-neutral-800">
          {t("dashboard.reportStatus.title")}
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
          {/* Donut Chart SVG */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
                className="dark:stroke-neutral-800"
              />
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                {total.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">{t("dashboard.reportStatus.total")}</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="w-full space-y-2.5">
            {items.map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm py-1 border-b border-slate-50 dark:border-neutral-800/40 last:border-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.bgClass}`} />
                    <span className="font-medium text-slate-700 dark:text-neutral-300">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-neutral-100">
                      {item.count}
                    </span>
                    <span className="text-xs text-slate-400 font-normal w-8 text-right">
                      ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
