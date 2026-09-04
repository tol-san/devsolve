"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PlatformActivityPoint } from "@/lib/types/admin/types";

interface AdminActivityChartProps {
  data: PlatformActivityPoint[];
  timeRange: string;
}

export function AdminActivityChart({ data, timeRange }: AdminActivityChartProps) {
  return (
    <Card className="lg:col-span-8 rounded-[20px] border border-slate-200/70 bg-white p-6 shadow-2xs flex flex-col justify-between dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight dark:text-neutral-100">
              Platform Activity
            </h3>
            <p className="text-sm text-slate-400 mt-0.5 dark:text-neutral-400">
              Reports, disputes &amp; community posts — last 7 months
            </p>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {timeRange}
              <ChevronDown className="size-3.5 text-slate-400" />
            </Button>
          </div>
        </div>

        <div className="mt-6 w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                domain={[0, 120]}
                ticks={[0, 30, 60, 90, 120]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="reports"
                name="Reports"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReports)"
              />
              <Area
                type="monotone"
                dataKey="communityPosts"
                name="Community Posts"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="disputes"
                name="Disputes"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500 font-medium dark:border-neutral-800 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-blue-500 rounded-full" />
          <span>Reports</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-emerald-500 rounded-full" />
          <span>Community Posts</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-500" />
          <span>Disputes</span>
        </div>
      </div>
    </Card>
  );
}
