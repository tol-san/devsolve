"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Radio,
  SearchX,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HACKTIVITY_PAGE_SIZE,
  useGetHacktivityFeedQuery,
} from "@/lib/redux/services/hacktivityApi";
import type {
  HacktivityFeed,
  HacktivityStats,
} from "@/lib/types/hacktivity/types";
import { FeaturedDisclosures } from "./FeaturedDisclosures";
import { HacktivityCard, HacktivityCardSkeleton } from "./HacktivityCard";
import { HacktivityFilters } from "./HacktivityFilters";
import { HacktivityStatsBar } from "./HacktivityStatsBar";
import { TopResearchers } from "./TopResearchers";
import { formatCount } from "./presentation";
import { useHacktivityFilters } from "./useHacktivityFilters";

interface HacktivityFeatureProps {
  heading: string;
  description: string;
  initialFeed?: HacktivityFeed | null;
  initialStats?: HacktivityStats | null;
}

export default function HacktivityFeature({
  heading,
  description,
  initialFeed,
  initialStats,
}: HacktivityFeatureProps) {
  const reduceMotion = useReducedMotion();
  const { state, setFilters, clearAll, isFiltered } = useHacktivityFilters();
  const feedRef = useRef<HTMLDivElement>(null);
  const pagedRef = useRef(false);

  const {
    data: remoteData,
    isLoading,
    isFetching,
    isError: isRemoteError,
    refetch,
  } = useGetHacktivityFeedQuery({
    q: state.q,
    severity: state.severity,
    eventType: state.eventType,
    sort: state.sort,
    page: state.page - 1,
    size: HACKTIVITY_PAGE_SIZE,
  });

  const isDefaultView = !isFiltered && state.page === 1;
  const data =
    remoteData ?? (isDefaultView ? initialFeed ?? undefined : undefined);
  const isInitialLoading = isLoading && !data;
  const isError = isRemoteError && !data;

  const activities = data?.activities ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const firstOnPage = (state.page - 1) * HACKTIVITY_PAGE_SIZE + 1;
  const lastOnPage = firstOnPage + activities.length - 1;

  useEffect(() => {
    if (!pagedRef.current) return;
    pagedRef.current = false;
    feedRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [state.page, reduceMotion]);

  const goToPage = (page: number) => {
    pagedRef.current = true;
    setFilters({ page });
  };

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Hero Header */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-border/60 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <Radio aria-hidden className="size-3.5" />
              Real-time Feed
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
              {heading}
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <HacktivityStatsBar initialStats={initialStats} />
        </header>

        {/* Featured Highlights Strip */}
        <FeaturedDisclosures initialActivities={initialFeed?.activities} />

        {/* Main Feed + Sidebar */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Feed Column */}
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Activity aria-hidden className="size-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Public disclosure stream
                  </h2>
                </div>
              </div>

              {isFetching && !isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                  <Sparkles className="size-3.5" />
                  Updating stream…
                </span>
              ) : null}
            </div>

            {/* Filter Bar */}
            <HacktivityFilters
              state={state}
              setFilters={setFilters}
              clearAll={clearAll}
              isFiltered={isFiltered}
            />

            {/* Stream Count Status */}
            <div
              ref={feedRef}
              className="flex items-center justify-between gap-3 scroll-mt-24 pt-1"
            >
              <p
                aria-live="polite"
                className="text-xs sm:text-sm font-medium text-muted-foreground"
              >
                {isInitialLoading ? (
                  "Loading stream…"
                ) : total === 0 ? (
                  "No activity found"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {formatCount(firstOnPage)}–{formatCount(lastOnPage)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {formatCount(total)}
                    </span>{" "}
                    disclosures
                  </>
                )}
              </p>
            </div>

            {/* Stream List / States */}
            {isInitialLoading ? (
              <div className="flex flex-col gap-3.5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <HacktivityCardSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <FeedError onRetry={() => void refetch()} />
            ) : activities.length === 0 ? (
              <FeedEmpty isFiltered={isFiltered} onClear={clearAll} />
            ) : (
              <>
                <div
                  className={`flex flex-col gap-3.5 transition-opacity ${
                    isFetching ? "opacity-70" : "opacity-100"
                  }`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={{
                          duration: 0.22,
                          delay: Math.min(index, 6) * 0.025,
                          ease: "easeOut",
                        }}
                      >
                        <HacktivityCard activity={activity} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 ? (
                  <nav
                    aria-label="Stream pages"
                    className="flex items-center justify-between gap-3 pt-4 border-t border-border/70"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer rounded-xl border-border/80"
                      disabled={state.page <= 1}
                      onClick={() => goToPage(state.page - 1)}
                    >
                      <ChevronLeft aria-hidden className="size-4 mr-1" />
                      Newer
                    </Button>

                    <span className="text-xs sm:text-sm font-semibold tabular-nums text-muted-foreground">
                      Page{" "}
                      <strong className="text-foreground">
                        {formatCount(state.page)}
                      </strong>{" "}
                      of {formatCount(totalPages)}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer rounded-xl border-border/80"
                      disabled={state.page >= totalPages}
                      onClick={() => goToPage(state.page + 1)}
                    >
                      Older
                      <ChevronRight aria-hidden className="size-4 ml-1" />
                    </Button>
                  </nav>
                ) : null}
              </>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--navbar-height)+1.5rem)]">
            <TopResearchers />

            {/* Coordinated Disclosure Explainer Card */}
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <ShieldCheck aria-hidden className="size-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Coordinated disclosure
                </h2>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Every entry follows the disclosure policy agreed between the
                researcher and program team. Findings are named only once the
                security fix has been published.
              </p>

              <div className="pt-2 border-t border-border/70 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 text-muted-foreground/80 shrink-0" />
                  <span>Confidential until fix ships</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Verified bounty & reputation payouts</span>
                </div>
              </div>
            </section>

            {/* Organization CTA Mini-card */}
            <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Run a Bounty Program
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect with thousands of vetted researchers to proactively
                discover and fix vulnerabilities before they reach production.
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Browse live programs
                <ArrowRight className="size-3" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FeedEmpty({
  isFiltered,
  onClear,
}: {
  isFiltered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-border/70 bg-card px-6 py-16 text-center shadow-xs">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX aria-hidden className="size-6" />
      </div>
      <p className="text-base font-bold text-foreground">
        {isFiltered ? "No matching disclosures" : "The stream is quiet"}
      </p>
      <p className="max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {isFiltered
          ? "No disclosure on DevSolve matches your current search terms and selected filters."
          : "Bounties, recognitions and disclosed reports will appear here in real time as they are resolved."}
      </p>
      {isFiltered ? (
        <Button
          type="button"
          variant="outline"
          className="mt-2 cursor-pointer rounded-xl"
          onClick={onClear}
        >
          Clear all filters
        </Button>
      ) : null}
    </div>
  );
}

function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-14 text-center shadow-xs">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
        <AlertTriangle aria-hidden className="size-6" />
      </div>
      <p className="text-base font-bold text-red-800 dark:text-red-300">
        Stream could not be loaded
      </p>
      <p className="max-w-md text-xs sm:text-sm text-red-700/90 dark:text-red-300/80">
        Unable to retrieve disclosure feed data from the server. Please try again.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-2 cursor-pointer rounded-xl border-red-300 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

