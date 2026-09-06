"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyCompanyProgramsQuery } from "@/lib/redux/services/program/programsApi";

const STATE_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  PAUSED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  CLOSED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function DashboardCompanyProgramsTable() {
  const { data, isLoading } = useGetMyCompanyProgramsQuery({
    page: 0,
    size: 8,
  });

  const programs = data?.content ?? [];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs space-y-5">
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-2 border-b border-border/70">
        <div className="w-full sm:w-auto min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="size-5 text-primary shrink-0" />
            <span>Active Bug Bounty Programs</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your organization programs, engagement tiers, and security scopes
          </p>
        </div>
        <Link
          href="/dashboard/program-management"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap"
        >
          <span>Manage programs</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table className="min-w-[540px]">
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Program
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-center">
                Bounty Tier
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Loading programs...
                </TableCell>
              </TableRow>
            ) : programs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No programs found.
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => {
                const state = (program.state || "DRAFT").toUpperCase();
                const type = program.engagementType || "BOUNTY";

                return (
                  <TableRow
                    key={program.id}
                    className="border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="max-w-[240px] py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl border border-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {program.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/program-management/${program.id}`}
                            className="text-sm font-bold text-foreground hover:underline truncate block"
                          >
                            {program.name}
                          </Link>
                          <span className="text-xs text-muted-foreground block truncate">
                            {program.handle ? `@${program.handle}` : "Bug Bounty"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-muted border border-border text-muted-foreground">
                        {type}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          STATE_COLORS[state] || STATE_COLORS.DRAFT
                        }`}
                      >
                        {state}
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-bold tabular-nums text-foreground text-sm py-3.5 px-4">
                      {program.offersBounties && (program.minimumBounty || program.maximumBounty) ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          ${program.minimumBounty ?? 0} - ${program.maximumBounty ?? "—"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs">Points (VDP)</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right py-3.5 px-4">
                      <Link
                        href={`/dashboard/program-management/${program.id}`}
                        className="inline-flex h-8 items-center rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
