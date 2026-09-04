"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { PieSegment } from "@/hooks/useAdminOverview";

interface AdminReportStatusDonutProps {
  pieData: PieSegment[];
  total: number;
}

export function AdminReportStatusDonut({
  pieData,
  total,
}: AdminReportStatusDonutProps) {
  return (
    <Card className="lg:col-span-4 rounded-[20px] border border-slate-200/70 bg-white p-6 shadow-2xs flex flex-col justify-between dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight dark:text-neutral-100">
          Report Status
        </h3>
        <p className="text-sm text-slate-400 mt-0.5 dark:text-neutral-400">All-time breakdown</p>

        <div className="my-4 relative h-[170px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-neutral-100">
              {total}
            </span>
            <span className="text-xs text-slate-400 font-medium dark:text-neutral-500">total</span>
          </div>
        </div>

        <div className="space-y-3">
          {pieData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 w-24 shrink-0">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-600 dark:text-neutral-300">{item.name}</span>
              </div>

              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full ${item.barBg}`}
                  style={{
                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                  }}
                />
              </div>

              <span className="font-bold text-slate-900 w-8 text-right shrink-0 dark:text-neutral-100">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
