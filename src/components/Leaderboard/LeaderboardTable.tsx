"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import { ChevronLeft, ChevronRight, Crown, Medal, Users, ShieldAlert, Award, CheckCircle2 } from "lucide-react";
import {
  LeaderboardEntry,
  LeaderboardPeriod,
  RANKED_COUNT_LABEL,
} from "@/lib/types/leaderboard/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ResearcherAvatar from "./ResearcherAvatar";
import RankMovement from "./RankMovement";
import {
  MEDALS,
  SEVERITY_STYLES,
  formatNumber,
  isUuid,
  profileHref,
} from "./leaderboard-ui";

const PAGE_SIZES = [10, 25, 50];

type Props = {
  entries: LeaderboardEntry[];
  /** Decides what `recognitionCount` means, and so what the badge says. */
  period: LeaderboardPeriod;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function RankBadge({ rank }: { rank: number }) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;

  if (!medal) {
    return (
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold tabular-nums text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
        #{rank}
      </span>
    );
  }

  const Icon = rank === 1 ? Crown : Medal;

  return (
    <span
      className="inline-flex size-9 shrink-0 items-center justify-center gap-0.5 rounded-xl text-xs font-bold tabular-nums shadow-2xs"
      style={{ backgroundColor: medal.soft, color: medal.ink }}
    >
      <Icon className="size-3.5" aria-hidden />
      {rank}
    </span>
  );
}

function ReputationPill({ value, isCurrentUser }: { value: number; isCurrentUser?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums tracking-tight shadow-2xs ${
        isCurrentUser
          ? "bg-blue-600 text-white shadow-blue-500/20 dark:bg-blue-600"
          : "bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
      }`}
    >
      <span>{formatNumber(value)}</span>
      <span className="text-xs font-semibold opacity-80">pts</span>
    </span>
  );
}

function ResearcherCard({
  entry,
  index,
  period,
}: {
  entry: LeaderboardEntry;
  index: number;
  period: LeaderboardPeriod;
}) {
  const medal = entry.rank <= 3 ? MEDALS[entry.rank - 1] : null;
  const hasValidReports = entry.validReports != null && entry.totalReports != null;
  const validRate =
    hasValidReports && entry.totalReports! > 0
      ? Math.round((entry.validReports! / entry.totalReports!) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index, 12) * 0.02, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={`group relative flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:shadow-md ${
        entry.isCurrentUser
          ? "border-blue-500/50 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10"
          : "border-slate-200/80 bg-white hover:border-blue-500/40 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
      }`}
      style={medal ? { borderLeftWidth: "4px", borderLeftColor: medal.ring } : undefined}
    >
      {/* Left: Rank, Avatar & Researcher Profile */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <RankBadge rank={entry.rank} />
          <RankMovement rank={entry.rank} previousRank={entry.previousRank} />
        </div>

        <Link
          href={profileHref(entry.username)}
          className="flex items-center gap-3 min-w-0 flex-1 group/link"
        >
          <ResearcherAvatar
            username={entry.username}
            displayName={entry.displayName}
            avatarUrl={entry.avatarUrl}
            initials={entry.avatarInitials}
            size={44}
          />

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-base font-bold tracking-tight text-slate-900 group-hover/link:text-blue-600 dark:text-neutral-100 dark:group-hover/link:text-blue-400">
                {entry.displayName}
              </span>
              {entry.isCurrentUser && (
                <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  You
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-neutral-400">
              {!isUuid(entry.username) && (
                <span className="font-medium text-slate-600 dark:text-neutral-400">
                  @{entry.username}
                </span>
              )}

              {entry.country && (
                <span className="inline-flex min-w-0 items-center gap-1 font-medium text-slate-600 dark:text-neutral-400">
                  {!isUuid(entry.username) && <span>·</span>}
                  <CountryDisplay value={entry.country} size={12} />
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Middle & Right: Metrics, Severity Tag & Reputation */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-neutral-800">
        {/* Performance Tags */}
        <div className="flex items-center gap-2">
          {/* Top Severity Chip */}
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
              SEVERITY_STYLES[entry.topSeverity].chip
            }`}
          >
            <ShieldAlert size={12} />
            <span>{entry.topSeverity}</span>
          </span>

          {/* Valid Rate Pill - Show only when totalReports & validReports are non-null (Lifetime) */}
          {hasValidReports && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>
                {entry.validReports} / {entry.totalReports} valid
                {validRate !== null ? ` (${validRate}%)` : ""}
              </span>
            </span>
          )}

          {/* Critical Count */}
          {entry.criticalReports > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              <span>{entry.criticalReports} Crit</span>
            </span>
          )}

          {/* Recognitions all-time; findings resolved on a windowed board */}
          {entry.recognitionCount > 0 && (
            <span
              title={`${entry.recognitionCount} ${
                entry.recognitionCount === 1
                  ? RANKED_COUNT_LABEL[period].singular
                  : RANKED_COUNT_LABEL[period].plural
              }`}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              <Award size={12} />
              <span>{entry.recognitionCount}</span>
            </span>
          )}
        </div>

        {/* Reputation Score & Profile Link */}
        <div className="flex items-center gap-2.5">
          <ReputationPill value={entry.reputation} isCurrentUser={entry.isCurrentUser} />

          <Link
            href={profileHref(entry.username)}
            aria-label={`Open ${entry.displayName}'s profile`}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          >
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardTable({
  entries,
  period,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = entries.slice(start, start + pageSize);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500">
          <Users className="size-6" aria-hidden />
        </span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
          No researchers match
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-neutral-400">
          Nobody on this board fits the current country, severity and search combination. Try widening one of them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Card List ── */}
      <div className="space-y-3">
        {visible.map((entry, index) => (
          <ResearcherCard
            key={entry.id}
            entry={entry}
            index={index}
            period={period}
          />
        ))}
      </div>

      {/* ── Pagination Bar ── */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-neutral-400">
          <span>Researchers per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(next) => onPageSizeChange(Number(next))}
          >
            <SelectTrigger
              aria-label="Researchers per page"
              className="h-9 w-20 rounded-xl bg-slate-50 border-slate-200 text-sm font-semibold text-slate-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <SelectValue>{(selected: string) => selected}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm font-semibold tabular-nums text-slate-600 dark:text-neutral-400">
            Showing <span className="text-slate-900 dark:text-neutral-100">{start + 1}–{Math.min(start + pageSize, entries.length)}</span> of{" "}
            <span className="text-slate-900 dark:text-neutral-100">{entries.length}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

