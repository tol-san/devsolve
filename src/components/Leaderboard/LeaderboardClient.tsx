"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetLeaderboardQuery } from "@/lib/redux/services/leaderboardApi";
import { SeverityLabel } from "@/lib/types/leaderboard/types";
import LeaderboardFilters, {
  LeaderboardFilterState,
} from "./LeaderboardFilters";
import LeaderboardPodium from "./LeaderboardPodium";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import LeaderboardTable from "./LeaderboardTable";
import YourRankBar from "./YourRankBar";
import { PERIOD_CAPTION } from "./leaderboard-ui";

const DEFAULT_FILTERS: LeaderboardFilterState = {
  period: "all",
  country: "all",
  severity: "all",
  search: "",
};

export default function LeaderboardClient() {
  const [filters, setFilters] =
    useState<LeaderboardFilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

  // Debounce search so typing updates the input field instantly while avoiding rapid API re-queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const { data, isLoading } = useGetLeaderboardQuery({
    period: filters.period,
    country: filters.country,
    severity: filters.severity as SeverityLabel | "all",
    search: debouncedSearch,
  });

  // Any change to what is being ranked or filtered invalidates the page cursor.
  const updateFilters = useCallback(
    (patch: Partial<LeaderboardFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters((current) => ({ ...DEFAULT_FILTERS, period: current.period }));
    setPage(1);
  }, []);

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const myRankEntry = useMemo(
    () => entries.find((entry) => entry.isCurrentUser) ?? null,
    [entries],
  );
  const myTopPercent =
    myRankEntry && data?.totalRanked
      ? Math.max(1, Math.round((myRankEntry.rank / data.totalRanked) * 100))
      : null;

  // The pinned bar can only jump to a row the filters actually leave visible.
  const myIndex = entries.findIndex((entry) => entry.isCurrentUser);
  const jumpToMe = useCallback(() => {
    if (myIndex < 0) return;
    setPage(Math.floor(myIndex / pageSize) + 1);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [myIndex, pageSize]);

  if (isLoading || !data) return <LeaderboardSkeleton />;

  return (
    <div className="space-y-8 pb-12 sm:pb-16">
      <LeaderboardPodium podium={data.podium} period={filters.period} />

      {/* Filter & Search Bar */}
      <LeaderboardFilters
        value={filters}
        countries={data.countries}
        onChange={updateFilters}
        onReset={resetFilters}
      />
      <div ref={tableRef} className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Full ranking
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {entries.length}
            </span>{" "}
            of {data.totalRanked} researchers · {PERIOD_CAPTION[filters.period]}
          </p>
        </div>

        <LeaderboardTable
          entries={entries}
          period={filters.period}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <YourRankBar
        entry={myRankEntry}
        totalRanked={data.totalRanked}
        topPercent={myTopPercent}
        period={filters.period}
        onJumpToMe={myIndex >= 0 ? jumpToMe : undefined}
      />
    </div>
  );
}
