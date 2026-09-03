"use client";

import {
  Building2,
  CircleDollarSign,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useGetHacktivityStatsQuery } from "@/lib/redux/services/hacktivityApi";
import type { HacktivityStats } from "@/lib/types/hacktivity/types";
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

interface HacktivityStatsBarProps {
  initialStats?: HacktivityStats | null;
}

export function HacktivityStatsBar({ initialStats }: HacktivityStatsBarProps = {}) {
  const { data: remoteData, isLoading, isError } = useGetHacktivityStatsQuery();
  const data = remoteData ?? initialStats ?? undefined;

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-[66px] w-full min-w-[140px] sm:min-w-[155px] animate-pulse rounded-2xl border border-border/60 bg-card"
          />
        ))}
      </div>
    );
  }

  if ((isError && !data) || !data) return null;

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
    <dl className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            title={stat.title}
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-2xs transition-all duration-200 hover:border-border/90 hover:shadow-xs hover:-translate-y-0.5 backdrop-blur-xs min-w-[140px] sm:min-w-[160px]"
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor} transition-transform group-hover:scale-105 shadow-2xs`}
            >
              <Icon aria-hidden className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <dd className="text-base sm:text-lg font-black tabular-nums leading-tight tracking-tight text-foreground">
                {stat.value}
              </dd>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate mt-0.5">
                {stat.label}
              </dt>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

