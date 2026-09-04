"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useGetProgramThanksQuery,
  useGetOrganizationThanksQuery,
} from "@/lib/redux/services/thanksApi";
import type { ThanksEntry } from "@/lib/types/thanks/types";
import { ThanksRankBadge } from "./ThanksRankBadge";
import { ThanksSeverityChips } from "./ThanksSeverityChips";
import { ThanksSkeleton } from "./ThanksSkeleton";
import { ThanksEmptyState } from "./ThanksEmptyState";
import { ThanksNotFoundState } from "./ThanksNotFoundState";
import {
  formatFullDateTime,
  formatRelativeTime,
} from "./thanks-utils";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isNotFoundError } from "@/lib/api/query-error";
import { cn } from "@/lib/utils";

interface HallOfThanksBoardProps {
  programId?: string;
  organizationId?: string;
  title?: string;
  subtitle?: string;
  entityName?: string;
  pageSize?: number;
  className?: string;
}

export function HallOfThanksBoard({
  programId,
  organizationId,
  title = "Hall of Thanks",
  subtitle,
  entityName,
  pageSize = 20,
  className,
}: HallOfThanksBoardProps) {
  const [page, setPage] = useState(0);

  const isProgram = Boolean(programId);
  const isOrg = !isProgram && Boolean(organizationId);

  const programQuery = useGetProgramThanksQuery(
    { programId: programId!, page, size: pageSize },
    { skip: !programId }
  );

  const orgQuery = useGetOrganizationThanksQuery(
    { organizationId: organizationId!, page, size: pageSize },
    { skip: !organizationId || Boolean(programId) }
  );

  const activeQuery = isProgram ? programQuery : orgQuery;
  const { data, isLoading, isError, error, isFetching } = activeQuery;

  if (isLoading) {
    return <ThanksSkeleton />;
  }

  if (isError) {
    const notFound = isNotFoundError(error);
    if (notFound) {
      return (
        <ThanksNotFoundState
          message={
            (error as any)?.data?.message ||
            (isProgram
              ? "This security program could not be found."
              : "This organization could not be found.")
          }
        />
      );
    }

    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm text-destructive">
        {(error as any)?.data?.message || "Failed to load the Hall of Thanks. Please try again later."}
      </div>
    );
  }

  const entries: ThanksEntry[] = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.number ?? page;
  const isFirst = data?.first ?? (currentPage === 0);
  const isLast = data?.last ?? (currentPage >= totalPages - 1);
  const isEmpty = data?.empty ?? (entries.length === 0);

  if (isEmpty && currentPage === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <BoardHeader
          title={title}
          subtitle={
            subtitle ||
            (isProgram
              ? "Honoring security researchers who have reported valid security findings to this program."
              : "Honoring security researchers who have contributed to security across all organization programs.")
          }
          totalResearchers={0}
        />
        <ThanksEmptyState entityName={entityName} isOrganization={isOrg} />
      </div>
    );
  }

  const totalRecognitionsOnPage = entries.reduce((acc, curr) => acc + (curr.recognitions || 0), 0);

  return (
    <div className={cn("space-y-6 w-full", className)}>
      <BoardHeader
        title={title}
        subtitle={
          subtitle ||
          (isProgram
            ? "Honoring security researchers who have responsibly disclosed valid security findings to this program."
            : "Honoring security researchers who have contributed to security across all organization programs.")
        }
        totalResearchers={totalElements}
        totalRecognitions={totalRecognitionsOnPage}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shrink-0">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Credited Researchers
            </p>
            <p className="text-xl font-black text-foreground tabular-nums mt-0.5">
              {totalElements.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shrink-0">
            <Award className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recognitions Awarded
            </p>
            <p className="text-xl font-black text-foreground tabular-nums mt-0.5">
              {totalRecognitionsOnPage > 0 ? totalRecognitionsOnPage.toLocaleString() : totalElements}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Board Status
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Hall of Fame</span>
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden relative">
        {isFetching && (
          <div className="absolute inset-0 bg-card/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-opacity">
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          </div>
        )}

        <div className="hidden md:grid grid-cols-[80px_1fr_160px_220px_140px] items-center gap-4 px-6 py-3.5 border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Rank</span>
          <span>Researcher</span>
          <span className="text-center">Recognitions</span>
          <span>Severity Impact</span>
          <span className="text-right">Last Thanked</span>
        </div>

        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <ThanksRowItem key={entry.id || `${entry.rank}-${entry.username}`} entry={entry} />
          ))}
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{currentPage * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{totalElements}</span> credited researchers
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isFirst || isFetching}
              className="rounded-xl h-9 px-3 gap-1 cursor-pointer font-semibold text-xs"
            >
              <ChevronLeft className="size-4" />
              <span>Prev</span>
            </Button>

            <div className="flex items-center gap-1 px-2 text-xs font-semibold text-muted-foreground">
              Page <span className="text-foreground font-bold">{currentPage + 1}</span> of{" "}
              <span className="text-foreground font-bold">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (isLast ? p : p + 1))}
              disabled={isLast || isFetching}
              className="rounded-xl h-9 px-3 gap-1 cursor-pointer font-semibold text-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardHeader({
  title,
  subtitle,
  totalResearchers,
  totalRecognitions,
}: {
  title: string;
  subtitle: string;
  totalResearchers?: number;
  totalRecognitions?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <HeartHandshake className="size-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        {typeof totalResearchers === "number" && totalResearchers > 0 && (
          <Badge
            variant="outline"
            className="rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-3 py-1 text-xs gap-1.5 shadow-2xs"
          >
            <Sparkles className="size-3.5" />
            <span>{totalResearchers} Honored Researchers</span>
          </Badge>
        )}
      </div>

      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
        {subtitle}
      </p>
    </div>
  );
}

function ThanksRowItem({ entry }: { entry: ThanksEntry }) {
  const displayName = entry.fullName?.trim() || entry.username;
  const profileHref = `/profile/${encodeURIComponent(entry.username || entry.id)}`;
  const initials = (entry.fullName || entry.username || "??")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fullDateTime = formatFullDateTime(entry.lastThankedAt);
  const relativeDate = formatRelativeTime(entry.lastThankedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col md:grid md:grid-cols-[80px_1fr_160px_220px_140px] md:items-center gap-3 md:gap-4 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center justify-between md:justify-start">
        <ThanksRankBadge rank={entry.rank} />

        <div className="md:hidden flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
          <Award className="size-3.5" />
          <span>{entry.recognitions} {entry.recognitions === 1 ? "recognition" : "recognitions"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <Link href={profileHref} className="shrink-0 group">
          {entry.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.avatarUrl}
              alt={displayName}
              className="size-10 sm:size-11 rounded-full object-cover ring-2 ring-border group-hover:ring-blue-500/40 transition-all shadow-2xs"
            />
          ) : (
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs sm:text-sm ring-2 ring-border shadow-2xs group-hover:scale-105 transition-transform">
              {initials}
            </div>
          )}
        </Link>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={profileHref}
              className="text-sm sm:text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            >
              {displayName}
            </Link>

            <CountryDisplay value={entry.country} flagOnly className="shrink-0" />
          </div>

          <Link
            href={profileHref}
            className="text-xs text-muted-foreground hover:text-foreground font-mono truncate transition-colors"
          >
            @{entry.username}
          </Link>

          {Array.isArray(entry.programs) && entry.programs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {entry.programs.map((prog) => {
                if (!prog?.name) return null;
                const progHref = prog.handle
                  ? `/programs/${prog.handle}`
                  : prog.id
                    ? `/programs/${prog.id}`
                    : undefined;

                return progHref ? (
                  <Link
                    key={prog.id || prog.handle || prog.name}
                    href={progHref}
                    className="inline-flex items-center rounded-md border border-border bg-muted/50 hover:bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors max-w-[220px] truncate shadow-2xs"
                    title={`${prog.organizationName ? `${prog.organizationName} — ` : ""}${prog.name}`}
                  >
                    <span className="truncate">{prog.name}</span>
                  </Link>
                ) : (
                  <span
                    key={prog.id || prog.name}
                    className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground max-w-[220px] truncate"
                  >
                    {prog.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1 shadow-2xs">
          <Award className="size-4 text-amber-500 shrink-0" />
          <span className="text-sm font-black tabular-nums text-foreground">
            {entry.recognitions}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {entry.recognitions === 1 ? "time" : "times"}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <ThanksSeverityChips bySeverity={entry.bySeverity} />
      </div>

      <div className="flex items-center justify-between md:justify-end gap-1.5 text-xs text-muted-foreground pt-1 md:pt-0 border-t border-border/40 md:border-t-0">
        <span className="md:hidden text-[11px] uppercase tracking-wider font-semibold">
          Last Thanked
        </span>
        <span
          className="flex items-center gap-1 font-medium cursor-default"
          title={fullDateTime}
        >
          <Clock className="size-3.5 text-muted-foreground/70" />
          <span>{relativeDate}</span>
        </span>
      </div>
    </motion.div>
  );
}
