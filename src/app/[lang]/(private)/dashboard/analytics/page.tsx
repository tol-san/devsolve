"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Award,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const topAssets = [
  { name: "api.tiktok.com", reports: 42, critical: 4, type: "API" },
  { name: "moderation.tiktok.com", reports: 28, critical: 1, type: "Web" },
  { name: "commerce-api.tiktok.com", reports: 19, critical: 2, type: "API" },
  { name: "Android App", reports: 15, critical: 0, type: "Mobile" },
];

export default function OrganizationAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m");
  const {
    adminData: adminOverview,
    isLoading,
    isFetching,
    refetch,
  } = useAdminOverview();

  const reportTrendData = adminOverview?.activityChart?.map((item) => ({
    month: item.month,
    total: item.reports,
    accepted: Math.round(item.reports * 0.7),
    rejected: Math.round(item.reports * 0.15),
  })) || [
    { month: "Jan", total: 35, accepted: 22, rejected: 8 },
    { month: "Feb", total: 42, accepted: 28, rejected: 6 },
    { month: "Mar", total: 58, accepted: 40, rejected: 10 },
    { month: "Apr", total: 50, accepted: 36, rejected: 7 },
    { month: "May", total: 65, accepted: 48, rejected: 9 },
    { month: "Jun", total: 78, accepted: 56, rejected: 12 },
  ];

  const severityData = adminOverview
    ? [
        {
          name: "Critical",
          value: Math.max(1, Math.round(adminOverview.reportStatusBreakdown.confirmed * 0.1)),
          color: "#F87171",
        },
        {
          name: "High",
          value: Math.max(1, Math.round(adminOverview.reportStatusBreakdown.confirmed * 0.25)),
          color: "#FBBF24",
        },
        {
          name: "Medium",
          value: Math.max(1, Math.round(adminOverview.reportStatusBreakdown.confirmed * 0.45)),
          color: "#FACC15",
        },
        {
          name: "Low",
          value: Math.max(1, Math.round(adminOverview.reportStatusBreakdown.confirmed * 0.2)),
          color: "#4ADE80",
        },
      ]
    : [
        { name: "Critical", value: 14, color: "#F87171" },
        { name: "High", value: 32, color: "#FBBF24" },
        { name: "Medium", value: 68, color: "#FACC15" },
        { name: "Low", value: 86, color: "#4ADE80" },
      ];

  const totalReports = adminOverview?.reportStatusBreakdown.total ?? 200;
  const acceptedReports = adminOverview?.reportStatusBreakdown.confirmed ?? 142;
  const rejectedReports = adminOverview?.reportStatusBreakdown.rejected ?? 38;
  const totalUsers = adminOverview?.stats.find((s) => s.type === "users")?.value ?? "64";

  if (isLoading) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-14 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-80 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Analytics Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time security insights, submission trends, and researcher contributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3.5 rounded-xl border-border bg-card hover:bg-muted text-foreground text-sm font-medium shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Select value={timeRange} onValueChange={(val) => { if (val) setTimeRange(val); }}>
            <SelectTrigger className="w-[160px] bg-card border-border rounded-xl px-3.5 py-2 shadow-xs text-sm font-medium text-foreground h-10">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold h-10 px-4 rounded-xl transition-all shadow-xs cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Reports
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">{totalReports}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14%
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            All submitted vulnerability reports
          </p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Accepted
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">{acceptedReports}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" /> +11%
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            Valid reports ready for reward & closure
          </p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">{rejectedReports}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
              <ArrowDownRight className="w-3.5 h-3.5" /> -5%
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            Invalid, duplicate, or out-of-scope
          </p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Submitters
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">{totalUsers}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8%
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            Unique researchers submitting findings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Report Submission & Acceptance Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparing total incoming reports against accepted vulnerabilities.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportTrendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--card-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Reports"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  name="Accepted Reports"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAccepted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Vulnerability Severity Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribution of reports based on CVSS severity rating.
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--card-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs font-semibold text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground ml-auto font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-foreground">
            Payouts & Rewards Summary
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Total Bounty Paid</h4>
                  <p className="text-xs text-muted-foreground">128 Bounty program reports</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">$42,500</span>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Points Awarded</h4>
                  <p className="text-xs text-muted-foreground">72 Response program reports</p>
                </div>
              </div>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">3,400 pts</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs space-y-5 overflow-hidden">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Most Vulnerable Scope Targets
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assets receiving the highest volume of security findings.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableHead className="px-3 pb-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Asset Target
                  </TableHead>
                  <TableHead className="px-3 pb-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="px-3 pb-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Total Reports
                  </TableHead>
                  <TableHead className="px-3 pb-3 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Critical Findings
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAssets.map((asset) => (
                  <TableRow key={asset.name} className="border-border/60 hover:bg-muted/30">
                    <TableCell className="px-3 py-3.5 font-mono font-medium text-foreground">
                      <span className="inline-block px-2.5 py-1 bg-muted rounded-lg text-xs truncate max-w-[200px] sm:max-w-none" title={asset.name}>
                        {asset.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-muted-foreground font-medium text-xs whitespace-nowrap">
                      {asset.type}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 font-bold text-foreground whitespace-nowrap">
                      {asset.reports}
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-right whitespace-nowrap">
                      {asset.critical > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20">
                          {asset.critical} Critical
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          0
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
