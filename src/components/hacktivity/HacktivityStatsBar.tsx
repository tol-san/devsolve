"use client";

import {
  Building2,
  CircleDollarSign,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useGetHacktivityStatsQuery } from "@/lib/redux/services/hacktivityApi";
import {
  formatCompactMoney,
  formatCount,
  formatMoney,
} from "./presentation";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title?: string;
}

export function HacktivityStatsBar() {
  const { data, isLoading, isError } = useGetHacktivityStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-[62px] w-full sm:w-36 animate-pulse rounded-2xl border border-border/60 bg-card"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) return null;

  const stats: StatItem[] = [
    {
      label: "Disclosures",
      value: formatCount(data.disclosures),
      icon: ShieldCheck,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Researchers",
      value: formatCount(data.researchers),
      icon: Users,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Live programs",
      value: formatCount(data.programsActive),
      icon: Building2,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10",
    },
    {
      label: "Bounties paid",
      value: formatCompactMoney(data.totalPaid, data.currency),
      title: formatMoney(data.totalPaid, data.currency),
      icon: CircleDollarSign,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            title={stat.title}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-3.5 py-2.5 shadow-2xs transition-all hover:border-border hover:shadow-xs backdrop-blur-xs sm:min-w-[140px]"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
            >
              <Icon aria-hidden className="size-4.5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <dd className="text-base sm:text-lg font-extrabold tabular-nums leading-tight tracking-tight text-foreground">
                {stat.value}
              </dd>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {stat.label}
              </dt>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

