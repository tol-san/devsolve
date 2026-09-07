"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Users,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminOverviewResponse } from "@/lib/types/admin/types";

interface SnapshotItem {
  label: string;
  value: number;
  color: string;
  dotColor: string;
  barColor: string;
  hexColor: string;
  pulse?: boolean;
  href?: string;
}

interface SnapshotGroup {
  id: string;
  title: string;
  subtitle: string;
  total: number;
  icon: LucideIcon;
  href: string;
  theme: {
    iconBg: string;
    border: string;
    glow: string;
    badgeBg: string;
  };
  items: SnapshotItem[];
}

export function AdminOverviewSnapshot({
  overview,
}: {
  overview: AdminOverviewResponse;
}) {
  const groups: SnapshotGroup[] = [
    {
      id: "users",
      title: "Users",
      subtitle: "Registered hunter & staff accounts",
      total: overview.users.total,
      icon: Users,
      href: "/dashboard/users",
      theme: {
        iconBg: "bg-primary text-primary-foreground shadow-2xs border border-primary/40",
        border: "hover:border-primary/50 shadow-primary/5",
        glow: "from-primary/20 via-primary/5 to-transparent",
        badgeBg: "bg-primary/10 text-primary border-primary/25",
      },
      items: [
        {
          label: "Active",
          value: overview.users.active,
          color: "text-primary dark:text-primary-foreground font-bold",
          dotColor: "bg-primary",
          barColor: "bg-primary",
          hexColor: "#2563eb",
          href: "/dashboard/users?status=ACTIVE",
        },
        {
          label: "Suspended",
          value: overview.users.suspended,
          color: "text-accent-foreground font-semibold",
          dotColor: "bg-blue-400",
          barColor: "bg-blue-400",
          hexColor: "#60a5fa",
          pulse: overview.users.suspended > 0,
          href: "/dashboard/users?status=SUSPENDED",
        },
        {
          label: "Removed",
          value: overview.users.removed,
          color: "text-muted-foreground",
          dotColor: "bg-slate-400",
          barColor: "bg-slate-400",
          hexColor: "#94a3b8",
          href: "/dashboard/users?status=REMOVED",
        },
      ],
    },
    {
      id: "organizations",
      title: "Organizations",
      subtitle: "Verified company workspaces",
      total: overview.organizations.total,
      icon: Building2,
      href: "/dashboard/company-verification",
      theme: {
        iconBg: "bg-accent text-accent-foreground border-border/60",
        border: "hover:border-primary/40 shadow-primary/5",
        glow: "from-accent/25 via-transparent to-transparent",
        badgeBg: "bg-secondary text-secondary-foreground border-border/70",
      },
      items: [
        {
          label: "Active",
          value: overview.organizations.active,
          color: "text-foreground font-semibold",
          dotColor: "bg-primary",
          barColor: "bg-primary",
          hexColor: "#2563eb",
          href: "/dashboard/company-verification?status=ACTIVE",
        },
        {
          label: "Pending review",
          value: overview.organizations.pendingReview,
          color: "text-primary font-bold",
          dotColor: "bg-blue-400",
          barColor: "bg-blue-400",
          hexColor: "#60a5fa",
          pulse: overview.organizations.pendingReview > 0,
          href: "/dashboard/company-verification?status=PENDING",
        },
        {
          label: "Rejected",
          value: overview.organizations.rejected,
          color: "text-muted-foreground",
          dotColor: "bg-slate-400",
          barColor: "bg-slate-400",
          hexColor: "#94a3b8",
          href: "/dashboard/company-verification?status=REJECTED",
        },
      ],
    },
    {
      id: "programs",
      title: "Programs",
      subtitle: "Security bounty & VDP programs",
      total: overview.programs.total,
      icon: ShieldCheck,
      href: "/dashboard/program-management?scope=admin",
      theme: {
        iconBg: "bg-accent text-accent-foreground border-border/60",
        border: "hover:border-primary/40 shadow-primary/5",
        glow: "from-accent/25 via-transparent to-transparent",
        badgeBg: "bg-secondary text-secondary-foreground border-border/70",
      },
      items: [
        {
          label: "Active",
          value: overview.programs.active,
          color: "text-foreground font-semibold",
          dotColor: "bg-primary",
          barColor: "bg-primary",
          hexColor: "#2563eb",
          href: "/dashboard/program-management?scope=admin",
        },
        {
          label: "Draft",
          value: overview.programs.draft,
          color: "text-accent-foreground font-semibold",
          dotColor: "bg-blue-400",
          barColor: "bg-blue-400",
          hexColor: "#60a5fa",
          href: "/dashboard/program-management?scope=admin",
        },
        {
          label: "Paused",
          value: overview.programs.paused,
          color: "text-muted-foreground",
          dotColor: "bg-blue-300",
          barColor: "bg-blue-300",
          hexColor: "#93c5fd",
          href: "/dashboard/program-management?scope=admin",
        },
        {
          label: "Closed",
          value: overview.programs.closed,
          color: "text-muted-foreground",
          dotColor: "bg-slate-400",
          barColor: "bg-slate-400",
          hexColor: "#94a3b8",
          href: "/dashboard/program-management?scope=admin",
        },
      ],
    },
  ];

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-2xs lg:col-span-8 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Operational snapshot</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Live State
              </span>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Current account, organization, and security program distribution across the platform.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 flex-1">
          {groups.map((group) => {
            const Icon = group.icon;
            const total = group.total || 1;

            const chartData = group.items
              .filter((item) => item.value > 0)
              .map((item) => ({
                name: item.label,
                value: item.value,
                color: item.hexColor,
              }));

            const displayChartData =
              chartData.length > 0
                ? chartData
                : [{ name: "None", value: 1, color: "var(--muted)" }];

            return (
              <div
                key={group.id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/50 backdrop-blur-sm p-4 sm:p-4.5 transition-all duration-200 hover:shadow-xs",
                  group.theme.border,
                )}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-xl border shrink-0 shadow-2xs",
                          group.theme.iconBg,
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-foreground leading-snug">
                          {group.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={group.href}
                      className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted shrink-0"
                      title={`View ${group.title}`}
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>

                {/* Donut Chart Graphic with Centered Total */}
                <div className="relative h-[125px] w-full flex items-center justify-center my-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={50}
                        paddingAngle={chartData.length > 1 ? 3 : 0}
                        cornerRadius={3}
                        dataKey="value"
                      >
                        {displayChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="var(--card)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const item = payload[0].payload;
                          if (item.name === "None") return null;
                          const pct =
                            group.total > 0
                              ? ((item.value / group.total) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-foreground">
                                <span
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-muted-foreground">
                                <span>Count:</span>
                                <span className="font-mono font-bold text-foreground">
                                  {item.value}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-muted-foreground">
                                <span>Share:</span>
                                <span className="font-mono font-bold text-foreground">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                    <span className="text-xl font-extrabold text-foreground font-mono leading-none">
                      {group.total.toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                      Total
                    </span>
                  </div>
                </div>

                {/* State Rows */}
                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  {group.items.map((item) => {
                    const pct =
                      total > 0
                        ? ((item.value / total) * 100).toFixed(0)
                        : "0";
                    const rowContent = (
                      <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-muted/50 transition-colors group/row cursor-pointer">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "size-1.5 rounded-full shrink-0",
                              item.dotColor,
                              item.pulse &&
                                "animate-pulse ring-2 ring-amber-500/20",
                            )}
                          />
                          <span className="text-muted-foreground group-hover/row:text-foreground transition-colors truncate text-xs font-medium">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[10px] text-muted-foreground/70">
                            {pct}%
                          </span>
                          <span
                            className={cn(
                              "font-mono font-bold text-xs px-2 py-0.5 rounded-md border",
                              item.pulse
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-card text-foreground border-border/70",
                            )}
                          >
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );

                    return item.href ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block"
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div key={item.label}>{rowContent}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
