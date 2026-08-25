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
import { useGetCountriesQuery } from "@/lib/redux/services/geoApi";
import {
  useGetProgramCountryValuesQuery,
  useGetProgramsQuery,
} from "@/lib/redux/services/program/programsApi";
import type { GetProgramsParams } from "@/lib/types/programs/types";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const {
    searchTerm,
    selectedType,
    selectedAsset,
    selectedSeverity,
    selectedIndustry,
    country,
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
    handleCountryChange,
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
      page: currentPage,
      size: rowsPerPage,
      q: deferredSearch.slice(0, 100) || undefined,
      engagementType:
        selectedType === "Bounty"
          ? "BOUNTY"
          : selectedType === "Response"
            ? "RESPONSE"
            : undefined,
      minimumBounty: requestedMinimum ?? undefined,
      maximumBounty: requestedMaximum ?? undefined,
      assetType: selectedAsset === "All" ? undefined : selectedAsset,
      maxSeverity:
        selectedSeverity === "All" ? undefined : selectedSeverity,
      industry: selectedIndustry === "All" ? undefined : selectedIndustry,
      country: country.slice(0, 100) || undefined,
      sort:
        sort === "reward-high"
          ? "maximumBounty,DESC"
          : sort === "name"
            ? "name,ASC"
            : "publishedAt,DESC",
    }),
    [
      currentPage,
      country,
      deferredSearch,
      requestedMaximum,
      requestedMinimum,
      rowsPerPage,
      selectedAsset,
      selectedIndustry,
      selectedSeverity,
      selectedType,
      sort,
    ],
  );

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProgramsQuery(queryProps, { skip: rangeInvalid });
  const { data: allCountries = [], isLoading: isLoadingCountryList } =
    useGetCountriesQuery();
  const {
    data: programCountryValues = [],
    isLoading: isLoadingProgramCountries,
  } = useGetProgramCountryValuesQuery();

  const countryOptions = useMemo(
    () =>
      programCountryValues
        .map((storedValue) => {
          const normalized = storedValue.toLowerCase();
          const countryMatch = allCountries.find(
            (option) =>
              option.name.toLowerCase() === normalized ||
              option.code.toLowerCase() === normalized,
          );
          if (!countryMatch) return null;

          return {
            value: storedValue,
            label: countryMatch.name,
            code: countryMatch.code,
          };
        })
        .filter((option): option is NonNullable<typeof option> => Boolean(option))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allCountries, programCountryValues],
  );
  const selectedCountryLabel =
    countryOptions.find((option) => option.value === country)?.label ?? country;

  const programs = responseData?.content ?? [];
  const totalPages = Math.max(1, responseData?.totalPages ?? 1);
  const totalCount = responseData?.totalElements ?? 0;
  const isInitialLoading = !responseData && (isLoading || isFetching);
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
    country,
    onCountryChange: handleCountryChange,
    countryOptions,
    isLoadingCountries:
      isLoadingCountryList || isLoadingProgramCountries,
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
            aria-label="Search and sort programs"
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
              country={selectedCountryLabel}
              minReward={minReward}
              maxReward={maxReward}
              sort={sort}
              onClearSearch={handleClearSearch}
              onClearType={() => handleTypeChange("All")}
              onClearAsset={() => handleAssetChange("All")}
              onClearSeverity={() => handleSeverityChange("All")}
              onClearIndustry={() => handleIndustryChange("All")}
              onClearCountry={() => handleCountryChange("")}
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
            aria-label="Program marketplace results"
            className="flex min-w-0 scroll-mt-6 flex-col gap-5 lg:col-start-1 lg:row-start-2"
          >
            {isInitialLoading ? (
              <ProgramSkeleton />
            ) : isError ? (
              <ProgramMessage
                title="Programs could not load"
                body="The marketplace is temporarily unavailable. Please try again."
                actionLabel="Try again"
                onAction={() => void refetch()}
                isAlert
              />
            ) : programs.length === 0 ? (
              <ProgramMessage
                title={rangeInvalid ? "Reward range is invalid" : "No programs found"}
                body={
                  rangeInvalid
                    ? "The maximum reward must be greater than or equal to the minimum."
                    : "Try a broader search or adjust the explore filters."
                }
                actionLabel="Reset filters"
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
                    key={`${selectedType}-${selectedAsset}-${selectedSeverity}-${selectedIndustry}-${country}-${deferredSearch}-${minReward}-${maxReward}-${sort}-${currentPage}-${rowsPerPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                  >
                    {programs.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {!isInitialLoading && !isError && programs.length > 0 ? (
              <ProgramPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                displayedCount={programs.length}
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
