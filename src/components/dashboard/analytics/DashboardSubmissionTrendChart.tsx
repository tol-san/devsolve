"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";
import type { SubmissionTrendPoint } from "@/lib/types/analytics/types";

interface DashboardSubmissionTrendChartProps {
  data: SubmissionTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: SubmissionTrendPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-border bg-popover/95 p-4 shadow-xl backdrop-blur-md text-sm space-y-2.5 min-w-48">
      <p className="font-bold text-foreground border-b border-border pb-1.5 text-sm">
        {label || point?.label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span>Submitted:</span>
          </span>
          <span className="font-bold tabular-nums text-foreground">
            {point?.submitted ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>Accepted:</span>
          </span>
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {point?.accepted ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-purple-500" />
            <span>Resolved:</span>
          </span>
          <span className="font-bold tabular-nums text-purple-600 dark:text-purple-400">
            {point?.resolved ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>Rejected:</span>
          </span>
          <span className="font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {point?.rejected ?? 0}
          </span>
        </div>
      </div>
      {point?.bountyPaid !== undefined && (
        <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-foreground font-semibold">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DollarSign className="size-3.5 text-amber-500" />
            <span>Bounty Paid:</span>
          </span>
          <span className="tabular-nums font-bold text-amber-600 dark:text-amber-400 text-sm">
            ${point.bountyPaid.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export function DashboardSubmissionTrendChart({
  data,
}: DashboardSubmissionTrendChartProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <span>Submission & Resolution Velocity</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Report volume trends over the selected time window
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded-full bg-blue-500" />
            <span>Submitted</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded-full bg-emerald-500" />
            <span>Accepted</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-3 rounded-full bg-purple-500" />
            <span>Resolved</span>
          </span>
        </div>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="submittedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="acceptedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border/60"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-muted-foreground"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="submitted"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#submittedGrad)"
            />
            <Area
              type="monotone"
              dataKey="accepted"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#acceptedGrad)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#A855F7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#resolvedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
