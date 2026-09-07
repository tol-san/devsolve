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
import { ArrowRight, FileCheck, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PieSegment } from "@/hooks/useAdminOverview";

interface AdminReportStatusDonutProps {
  pieData: PieSegment[];
  total: number;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  Confirmed: CheckCircle2,
  Pending: Clock,
  Rejected: XCircle,
  "In Review": Search,
};

export function AdminReportStatusDonut({
  pieData,
  total,
}: AdminReportStatusDonutProps) {
  const confirmedCount = pieData.find((p) => p.name === "Confirmed")?.value || 0;
  const pendingCount = pieData.find((p) => p.name === "Pending")?.value || 0;
  const resolvedRate = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;

  const chartData = React.useMemo(() => {
    return pieData.map((item) => ({
      name: item.name,
      value: item.value,
      color: item.color,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [pieData, total]);

  return (
    <Card className="lg:col-span-4 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Report Status</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All-time triage & verification breakdown
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                {total} Total
              </span>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                {resolvedRate}% Validated
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1 space-y-4">
          {/* Modern Recharts Bar Chart */}
          <div className="h-[185px] w-full pt-1">
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
                  maxBarSize={40}
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
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            {chartData.map((item) => {
              const Icon = STATUS_ICONS[item.name] || FileCheck;

              return (
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
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-2 border-t border-border/60">
        <Link
          href="/dashboard/report-confirmation"
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all duration-200 group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileCheck className="size-4" />
            <span>Manage Report Triage</span>
            {pendingCount > 0 && (
              <span
                className="size-2 rounded-full bg-amber-500 animate-pulse"
                title={`${pendingCount} pending triage`}
              />
            )}
          </span>
          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
