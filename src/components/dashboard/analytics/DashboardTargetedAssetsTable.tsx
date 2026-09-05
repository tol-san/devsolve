"use client";

import React from "react";
import { Server } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TARGETED_ASSET_TYPE_LABELS,
  type TopTargetedAsset,
} from "@/lib/types/analytics/types";

interface DashboardTargetedAssetsTableProps {
  assets: TopTargetedAsset[];
}

export function DashboardTargetedAssetsTable({
  assets,
}: DashboardTargetedAssetsTableProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Server className="size-5 text-primary shrink-0" />
            <span>Top Targeted Scope & Assets</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Systems and endpoints receiving the highest concentration of reports
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border shrink-0 whitespace-nowrap">
          {assets.length} assets
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Target Identifier
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Asset Type
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-center">
                Reports
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-center">
                Critical / High
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-right">
                Total Bounty
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No targeted assets recorded for this period.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.assetTarget}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-semibold text-foreground max-w-[240px] truncate py-3.5 px-4">
                    {asset.assetTarget}
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-muted border border-border text-muted-foreground">
                      {TARGETED_ASSET_TYPE_LABELS[asset.assetType] || asset.assetType}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold tabular-nums text-foreground text-sm py-3.5 px-4">
                    {asset.totalReports}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm py-3.5 px-4">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span className="text-rose-600 dark:text-rose-400">
                        {asset.criticalCount} crit
                      </span>
                      <span className="text-muted-foreground/40">/</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        {asset.highCount} high
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-amber-600 dark:text-amber-400 text-sm py-3.5 px-4">
                    ${asset.totalBounty.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
