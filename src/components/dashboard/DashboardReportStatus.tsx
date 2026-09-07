"use client";

import React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowRight, CheckCircle2, Clock, ShieldAlert, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportStatusDistribution } from "@/lib/types/dashboard/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface DashboardReportStatusProps {
  distribution: ReportStatusDistribution;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  Resolved: CheckCircle2,
  Accepted: CheckCircle2,
  Pending: Clock,
  Other: HelpCircle,
};

export const DashboardReportStatus: React.FC<DashboardReportStatusProps> = ({ distribution }) => {
  const t = useT();
  const { resolved, accepted, pending, other, total } = distribution;

  const chartData = React.useMemo(() => {
    const rawItems = [
      {
        name: t("dashboard.reportStatus.resolved"),
        value: resolved,
        color: "#2563eb",
      },
      {
        name: t("dashboard.reportStatus.accepted"),
        value: accepted,
        color: "#3b82f6",
      },
      {
        name: t("dashboard.reportStatus.pending"),
        value: pending,
        color: "#60a5fa",
      },
      {
        name: t("dashboard.reportStatus.other"),
        value: other,
        color: "#94a3b8",
      },
    ];

    return rawItems.map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [resolved, accepted, pending, other, total, t]);

  const validatedCount = resolved + accepted;
  const validationRate = total > 0 ? Math.round((validatedCount / total) * 100) : 0;

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 p-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t("dashboard.reportStatus.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Triage & verification distribution
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
              {total} Total
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2 py-0.5 rounded-full">
              {validationRate}% Valid
            </Badge>
          </div>
        </div>

        {/* Modern Recharts Bar Chart */}
        <div className="h-[185px] w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 10, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.25 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-popover p-3 shadow-lg text-xs space-y-1.5 min-w-36">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-muted-foreground">
                        <span>Reports:</span>
                        <span className="font-mono font-bold text-foreground">
                          {item.value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-muted-foreground">
                        <span>Share:</span>
                        <span className="font-mono font-bold text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compact 2x2 Breakdown Metric Cards */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 mt-2">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2 transition-colors hover:bg-muted/70"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {item.percentage}%
                  </p>
                </div>
              </div>

              <span className="text-sm font-extrabold font-mono text-foreground shrink-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-3 border-t border-border/60">
        <Link
          href="/dashboard/my-reports"
          className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all duration-200 group cursor-pointer"
        >
          <span>View all report filings</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};
