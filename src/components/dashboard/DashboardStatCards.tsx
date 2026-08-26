"use client";

import React from "react";
import { motion } from "motion/react";
import { Shield, FileText, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { StatMetric } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardStatCardsProps {
  stats: StatMetric[];
}

const getStatConfig = (type: StatMetric["type"]) => {
  switch (type) {
    case "active_programs":
      return {
        icon: Shield,
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
        borderHover: "hover:border-blue-300 dark:hover:border-blue-800",
      };
    case "total_reports":
      return {
        icon: FileText,
        iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
        borderHover: "hover:border-purple-300 dark:hover:border-purple-800",
      };
    case "total_bounties":
      return {
        icon: CircleDollarSign,
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        borderHover: "hover:border-emerald-300 dark:hover:border-emerald-800",
      };
    case "valid_reports":
      return {
        icon: CheckCircle2,
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        borderHover: "hover:border-amber-300 dark:hover:border-amber-800",
      };
    default:
      return {
        icon: Shield,
        iconBg: "bg-slate-50 text-slate-600 dark:bg-neutral-950 dark:text-neutral-400",
        borderHover: "hover:border-slate-300",
      };
  }
};

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ stats }) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const config = getStatConfig(stat.type);
        const Icon = config.icon;
        const translatedTitle = t(`dashboard.stats.${stat.type}`);
        const title = translatedTitle !== `dashboard.stats.${stat.type}` ? translatedTitle : stat.title;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className={`bg-white dark:bg-neutral-900 rounded-xl p-5 border border-slate-200 dark:border-neutral-800 shadow-xs transition-all ${config.borderHover}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-neutral-400">
                {title}
              </span>
              <div className={`p-2 rounded-lg ${config.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                <span>{stat.subtext}</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
