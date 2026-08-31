"use client";

import { useGetHacktivityStatsQuery } from "@/lib/redux/services/hacktivityApi";
import { formatCompactMoney, formatCount, formatMoney } from "./presentation";

/**
 * The four platform totals above the feed.
 *
 * They come from `/hacktivity/stats` rather than being counted from the loaded
 * page, so they stay still while the reader pages and filters — and so the
 * paid figure is the real one instead of the sum of twenty visible rows.
 */

interface Stat {
  label: string;
  value: string;
  /** The unrounded figure, for the compact ones. */
  title?: string;
}

export function HacktivityStatsBar() {
  const { data, isLoading, isError } = useGetHacktivityStatsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-wrap items-center gap-2.5" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-[58px] w-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10"
          />
        ))}
      </div>
    );
  }

  // The feed itself still loads; a missing total is not worth an error box.
  if (isError || !data) return null;

  const stats: Stat[] = [
    { label: "Disclosures", value: formatCount(data.disclosures) },
    { label: "Researchers", value: formatCount(data.researchers) },
    { label: "Programs live", value: formatCount(data.programsActive) },
    {
      label: "Paid out",
      value: formatCompactMoney(data.totalPaid, data.currency),
      title: formatMoney(data.totalPaid, data.currency),
    },
  ];

  return (
    <dl className="flex flex-wrap items-center gap-2.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          title={stat.title}
          className="flex flex-col-reverse rounded-xl bg-card px-4 py-2.5 ring-1 ring-foreground/5 dark:ring-foreground/10"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </dt>
          <dd className="text-lg font-bold tabular-nums leading-tight text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
