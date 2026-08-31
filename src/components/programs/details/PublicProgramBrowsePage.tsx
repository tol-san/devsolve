"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Globe } from "lucide-react";

import { ProgramActiveFilters } from "@/components/programs/ProgramActiveFilters";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramFiltersBar } from "@/components/programs/ProgramFiltersBar";
import {
  ProgramHeader,
  ProgramSearch,
} from "@/components/programs/ProgramHeader";
import { ProgramMobileFilters } from "@/components/programs/ProgramMobileFilters";
import { ProgramPagination } from "@/components/programs/ProgramPagination";
import { ProgramTypeTabs } from "@/components/programs/ProgramTypeTabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgramFilters } from "@/hooks/useProgramFilters";
import { useT } from "@/lib/i18n/I18nProvider";
import { useGetProgramsQuery } from "@/lib/redux/services/program/programsApi";
import type { GetProgramsParams, Program } from "@/lib/types/programs/types";
import { cn } from "@/lib/utils";

interface MarketplacePageProps {
  initialPrograms?: Program[] | null;
}

export default function MarketplacePage({
  initialPrograms,
}: MarketplacePageProps = {}) {
  const t = useT();
  const {
    searchTerm,
    selectedType,
    selectedAsset,
    selectedSeverity,
    selectedIndustry,
    minReward,
    setMinReward,
    maxReward,
    setMaxReward,
    sort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    handleSearchChange,
    handleClearSearch,
    handleTypeChange,
    handleAssetChange,
    handleSeverityChange,
    handleIndustryChange,
    handleSortChange,
    handleResetExploreFilters,
    handleResetFilters,
    activeExploreFilterCount,
  } = useProgramFilters();

  const deferredSearch = useDeferredValue(searchTerm.trim());
  const requestedMinimum = minReward === "" ? null : Number(minReward);
  const requestedMaximum = maxReward === "" ? null : Number(maxReward);
  const rangeInvalid =
    requestedMinimum !== null &&
    requestedMaximum !== null &&
    requestedMinimum > requestedMaximum;

  const queryProps = useMemo<GetProgramsParams>(
    () => ({
      page: 1,
      size: 100,
      q: deferredSearch.slice(0, 100) || undefined,
      sort:
        sort === "reward-high"
          ? "maximumBounty,DESC"
          : sort === "name"
            ? "name,ASC"
            : "publishedAt,DESC",
    }),
    [deferredSearch, sort],
  );

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError: isRemoteError,
    refetch,
  } = useGetProgramsQuery(queryProps, { skip: rangeInvalid });

  const rawPrograms = responseData?.content ?? initialPrograms ?? [];
  const isError = isRemoteError && rawPrograms.length === 0;
  const isInitialLoading = isLoading && !responseData && !initialPrograms;

  const filteredPrograms = useMemo(() => {
    let list = rawPrograms;

    // Filter by Type
    if (selectedType === "Bounty") {
      list = list.filter((p) =>
        p.engagementType ? p.engagementType === "BOUNTY" : p.offersBounties,
      );
    } else if (selectedType === "Response") {
      list = list.filter((p) =>
        p.engagementType ? p.engagementType === "RESPONSE" : !p.offersBounties,
      );
    }

    // Filter by Asset Type
    if (selectedAsset !== "All") {
      list = list.filter((p) =>
        p.inScopeAssets?.some((a) => a.assetType === selectedAsset),
      );
    }

    // Filter by Severity
    if (selectedSeverity !== "All") {
      list = list.filter(
        (p) =>
          p.inScopeAssets?.some((a) => a.maxSeverity === selectedSeverity) ||
          p.rewards?.some((r) => r.severity === selectedSeverity),
      );
    }

    // Filter by Industry
    if (selectedIndustry !== "All") {
      list = list.filter(
        (p) => p.organization?.industry === selectedIndustry,
      );
    }

    // Filter by Min/Max Reward
    if (requestedMinimum !== null) {
      list = list.filter((p) => (p.maximumBounty ?? 0) >= requestedMinimum);
    }
    if (requestedMaximum !== null) {
      list = list.filter((p) => (p.minimumBounty ?? 0) <= requestedMaximum);
    }

    // Sort
    if (sort === "reward-high") {
      list = [...list].sort(
        (a, b) => (b.maximumBounty ?? 0) - (a.maximumBounty ?? 0),
      );
    } else if (sort === "name") {
      list = [...list].sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
    }

    return list;
  }, [
    rawPrograms,
    selectedType,
    selectedAsset,
    selectedSeverity,
    selectedIndustry,
    requestedMinimum,
    requestedMaximum,
    sort,
  ]);

  const totalCount = filteredPrograms.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedPrograms = useMemo(() => {
    const start = (currentPageSafe - 1) * rowsPerPage;
    return filteredPrograms.slice(start, start + rowsPerPage);
  }, [filteredPrograms, currentPageSafe, rowsPerPage]);

  const isSearchPending =
    searchTerm.trim() !== deferredSearch ||
    (isFetching && !isInitialLoading);

  const feedRef = useRef<HTMLElement>(null);
  const previousPage = useRef(currentPage);

  useEffect(() => {
    if (previousPage.current === currentPage) return;
    previousPage.current = currentPage;
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const filterPanelProps = {
    selectedAsset,
    onAssetChange: handleAssetChange,
    selectedSeverity,
    onSeverityChange: handleSeverityChange,
    selectedIndustry,
    onIndustryChange: handleIndustryChange,
    minReward,
    maxReward,
    onMinRewardChange: (value: string) => {
      setMinReward(value);
      setCurrentPage(1);
    },
    onMaxRewardChange: (value: string) => {
      setMaxReward(value);
      setCurrentPage(1);
    },
    activeCount: activeExploreFilterCount,
    onResetFilters: handleResetExploreFilters,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-[100dvh] text-foreground"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ProgramHeader />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section
            aria-label={t("programs.searchRegion")}
            className="flex min-w-0 flex-col gap-3 lg:col-start-1"
          >
            <ProgramSearch
              searchTerm={searchTerm}
              onSearchTermChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              isSearching={isSearchPending}
            />
            <ProgramTypeTabs
              selected={selectedType}
              onSelect={handleTypeChange}
              sort={sort}
              onSortChange={handleSortChange}
              totalCount={totalCount}
              isLoading={isInitialLoading}
            />
            <ProgramMobileFilters
              {...filterPanelProps}
              totalCount={totalCount}
            />
            <ProgramActiveFilters
              searchTerm={searchTerm}
              type={selectedType}
              asset={selectedAsset}
              severity={selectedSeverity}
              industry={selectedIndustry}
              minReward={minReward}
              maxReward={maxReward}
              sort={sort}
              onClearSearch={handleClearSearch}
              onClearType={() => handleTypeChange("All")}
              onClearAsset={() => handleAssetChange("All")}
              onClearSeverity={() => handleSeverityChange("All")}
              onClearIndustry={() => handleIndustryChange("All")}
              onClearReward={() => {
                setMinReward("");
                setMaxReward("");
                setCurrentPage(1);
              }}
              onClearSort={() => handleSortChange("newest")}
              onResetAll={handleResetFilters}
            />
          </section>

          <ProgramFiltersBar
            {...filterPanelProps}
            className="hidden lg:block"
          />

          <section
            ref={feedRef}
            aria-label={t("programs.resultsRegion")}
            className="flex min-w-0 scroll-mt-6 flex-col gap-5 lg:col-start-1 lg:row-start-2"
          >
            {isInitialLoading ? (
              <ProgramSkeleton />
            ) : isError ? (
              <ProgramMessage
                title={t("programs.states.errorTitle")}
                body={t("programs.states.errorBody")}
                actionLabel={t("common.retry")}
                onAction={() => void refetch()}
                isAlert
              />
            ) : paginatedPrograms.length === 0 ? (
              <ProgramMessage
                title={t(
                  rangeInvalid
                    ? "programs.states.rangeTitle"
                    : "programs.states.emptyTitle",
                )}
                body={t(
                  rangeInvalid
                    ? "programs.states.rangeBody"
                    : "programs.states.emptyBody",
                )}
                actionLabel={t("programs.states.resetFilters")}
                onAction={handleResetFilters}
              />
            ) : (
              <div
                aria-busy={isFetching}
                className={cn(
                  "transition-opacity duration-150",
                  isFetching && "opacity-70",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${selectedType}-${selectedAsset}-${selectedSeverity}-${selectedIndustry}-${deferredSearch}-${minReward}-${maxReward}-${sort}-${currentPageSafe}-${rowsPerPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                  >
                    {paginatedPrograms.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {!isInitialLoading && !isError && paginatedPrograms.length > 0 ? (
              <ProgramPagination
                currentPage={currentPageSafe}
                totalPages={totalPages}
                totalCount={totalCount}
                displayedCount={paginatedPrograms.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setCurrentPage(1);
                }}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function ProgramSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-[300px] rounded-2xl" />
      ))}
    </div>
  );
}

function ProgramMessage({
  title,
  body,
  actionLabel,
  onAction,
  isAlert = false,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  isAlert?: boolean;
}) {
  return (
    <div
      role={isAlert ? "alert" : "status"}
      className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/5 dark:ring-foreground/10"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Globe className="size-7" />
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onAction}
        className="rounded-xl"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
