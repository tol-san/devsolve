"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShieldAlert } from "lucide-react";
import type { SeverityDistribution } from "@/lib/types/analytics/types";

interface DashboardSeverityDonutProps {
  distribution: SeverityDistribution;
}

const SEVERITY_CONFIG: Array<{
  key: keyof SeverityDistribution;
  name: string;
  color: string;
}> = [
  { key: "critical", name: "Critical", color: "#EF4444" },
  { key: "high", name: "High", color: "#F97316" },
  { key: "medium", name: "Medium", color: "#FBBF24" },
  { key: "low", name: "Low", color: "#10B981" },
  { key: "none", name: "None", color: "#94A3B8" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      count: number;
      percentage: number;
      avgBounty: number;
      color: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-border bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-sm space-y-2 min-w-48">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <span
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span>{item.name} Severity</span>
      </div>
      <div className="space-y-1.5 text-muted-foreground pt-1.5 border-t border-border">
        <div className="flex justify-between">
          <span>Reports:</span>
          <span className="font-bold text-foreground tabular-nums">
            {item.count} ({item.percentage.toFixed(1)}%)
          </span>
        </div>
        {/* Rule 6: Tooltip wording: 'avg. paid bounty', not 'avg. bounty per report' */}
        <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
          <span>avg. paid bounty:</span>
          <span className="tabular-nums font-bold">
            ${item.avgBounty.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DashboardSeverityDonut({
  distribution,
}: DashboardSeverityDonutProps) {
  // Rule 2: All five severity bands are always present, with count: 0 when empty.
  // Never drop zero bands from the breakdown.
  const chartData = SEVERITY_CONFIG.map(({ key, name, color }) => {
    const item = distribution[key];
    return {
      name,
      count: item.count,
      percentage: item.percentage,
      avgBounty: item.avgBounty,
      color,
      // For Recharts Pie, use count directly, fallback to a tiny slice if all are 0
      chartValue: item.count > 0 ? item.count : 0,
    };
  });

  const totalCount = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="size-5 text-primary" />
          <span>Severity Distribution</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vulnerability breakdown by severity rating
        </p>
      </div>

      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="chartValue"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={totalCount > 0 ? 3 : 0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">
            {totalCount}
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
            Total
          </span>
        </div>
      </div>

      {/* Legend & Breakdown (Rule 2: Never drop zero bands) */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        {chartData.map((band) => (
          <div
            key={band.name}
            className="flex items-center justify-between text-sm py-0.5"
          >
            <span className="flex items-center gap-2.5 text-muted-foreground">
              <span
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: band.color }}
              />
              <span className="font-semibold text-foreground">{band.name}</span>
            </span>
            <span className="tabular-nums font-bold text-foreground">
              {band.count}{" "}
              <span className="text-muted-foreground font-normal text-xs ml-1">
                ({band.percentage.toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
