"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Shield,
  FileText,
  CircleDollarSign,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { StatMetric } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DashboardStatCardsProps {
  stats: StatMetric[];
}

interface StatMeta {
  icon: LucideIcon;
  href: string;
}

const STAT_META: Record<string, StatMeta> = {
  total_reports: {
    icon: FileText,
    href: "/dashboard/my-reports",
  },
  valid_reports: {
    icon: CheckCircle2,
    href: "/dashboard/my-reports?status=VALID_CONFIRMED",
  },
  active_programs: {
    icon: Shield,
    href: "/dashboard/programs",
  },
  total_bounties: {
    icon: CircleDollarSign,
    href: "/dashboard/analytics",
  },
};

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ stats }) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat, idx) => {
        const meta = STAT_META[stat.type] ?? {
          icon: Shield,
          href: "/dashboard/programs",
        };
        const Icon = meta.icon;
        const translatedTitle = t(`dashboard.stats.${stat.type}`);
        const title =
          translatedTitle !== `dashboard.stats.${stat.type}` ? translatedTitle : stat.title;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="h-full"
          >
            <Link
              href={meta.href}
              className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 select-none"
              title={`View ${title}`}
            >
              {/* Ambient radial color glow in corner combining primary blue + emerald accent */}
              <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

              {/* Top Row: Icon + Arrow */}
              <div className="relative z-10 flex items-center justify-between mb-3.5">
                <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xs">
                  <Icon className="size-5" />
                </div>

                <div className="flex items-center text-muted-foreground/40 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="size-4" />
                </div>
              </div>

              {/* Middle: Big Metric Value & Title */}
              <div className="relative z-10 space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans leading-none text-foreground transition-colors group-hover:text-primary">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/80 transition-colors group-hover:text-foreground truncate">
                  {title}
                </div>
              </div>

              {/* Bottom: Accent Emerald Status Pill Badge */}
              <div className="relative z-10 mt-3.5 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 max-w-full truncate shadow-2xs">
                  <span className="size-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
                  <span className="truncate">{stat.subtext}</span>
                </span>

                {stat.changeText && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0",
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
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
