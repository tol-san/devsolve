"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Shield,
  FileText,
  CircleDollarSign,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { StatMetric } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardStatCardsProps {
  stats: StatMetric[];
}

const getStatConfig = (type: StatMetric["type"]) => {
  switch (type) {
    case "active_programs":
      return {
        icon: Shield,
        iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
        glow: "from-sky-500/10 via-transparent to-transparent",
        badgeColor: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
      };
    case "total_reports":
      return {
        icon: FileText,
        iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
        glow: "from-violet-500/10 via-transparent to-transparent",
        badgeColor: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
      };
    case "total_bounties":
      return {
        icon: CircleDollarSign,
        iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        glow: "from-amber-500/10 via-transparent to-transparent",
        badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    case "valid_reports":
      return {
        icon: CheckCircle2,
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        glow: "from-emerald-500/10 via-transparent to-transparent",
        badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    default:
      return {
        icon: Shield,
        iconBg: "bg-primary/10 text-primary border border-primary/20",
        glow: "from-primary/10 via-transparent to-transparent",
        badgeColor: "text-primary bg-primary/10 border-primary/20",
      };
  }
};

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ stats }) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const config = getStatConfig(stat.type);
        const Icon = config.icon;
        const translatedTitle = t(`dashboard.stats.${stat.type}`);
        const title =
          translatedTitle !== `dashboard.stats.${stat.type}` ? translatedTitle : stat.title;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-md ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 hover:shadow-md hover:border-border",
            )}
          >
            {/* Top-right subtle radial glow */}
            <div
              className={cn(
                "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-60 blur-xl transition-opacity group-hover:opacity-100",
                config.glow,
              )}
            />

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                {title}
              </span>
              <div className={cn("flex size-10 items-center justify-center rounded-xl p-2 shadow-2xs", config.iconBg)}>
                <Icon className="size-5" />
              </div>
            </div>

            <div className="relative z-10 mt-3 space-y-1.5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <p className="text-xs sm:text-sm font-normal text-muted-foreground truncate">
                  {stat.subtext}
                </p>

                {stat.changeText && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold border",
                      stat.trend === "up"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : stat.trend === "down"
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="size-3" />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className="size-3" />
                    ) : (
                      <Minus className="size-3" />
                    )}
                    <span>{stat.changeText}</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
