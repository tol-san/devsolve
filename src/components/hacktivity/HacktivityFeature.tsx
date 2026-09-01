"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Radio,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HACKTIVITY_PAGE_SIZE,
  useGetHacktivityFeedQuery,
} from "@/lib/redux/services/hacktivityApi";
import { FeaturedDisclosures } from "./FeaturedDisclosures";
import { HacktivityCard, HacktivityCardSkeleton } from "./HacktivityCard";
import { HacktivityFilters } from "./HacktivityFilters";
import { HacktivityStatsBar } from "./HacktivityStatsBar";
import { TopResearchers } from "./TopResearchers";
import { formatCount } from "./presentation";
import { useHacktivityFilters } from "./useHacktivityFilters";

/**
 * `/hacktivity` — every bounty, recognition and disclosure on the platform,
 * newest first.
 *
 * The filters live in the URL and drive the request, so what is on screen is
 * always the whole matching stream rather than a narrowed copy of one page.
 */

export default function HacktivityFeature({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  const reduceMotion = useReducedMotion();
  const { state, setFilters, clearAll, isFiltered } = useHacktivityFilters();
  const feedRef = useRef<HTMLDivElement>(null);
  const pagedRef = useRef(false);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetHacktivityFeedQuery({
      q: state.q,
      severity: state.severity,
      eventType: state.eventType,
      sort: state.sort,
      // The URL counts from one, the API from zero.
      page: state.page - 1,
      size: HACKTIVITY_PAGE_SIZE,
    });

  const activities = data?.activities ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const firstOnPage = (state.page - 1) * HACKTIVITY_PAGE_SIZE + 1;
  const lastOnPage = firstOnPage + activities.length - 1;

  /* Paging keeps the reader's place: without this, page 3 arrives scrolled to
     wherever page 2 was being read. Only a page change moves the view. */
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
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25">
              <Radio aria-hidden className="size-3.5" />
              Live
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
              {heading}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              {description}
            </p>
          </div>

          <HacktivityStatsBar />
        </header>

        <FeaturedDisclosures />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center gap-2">
              <Activity
                aria-hidden
                className="size-[18px] text-blue-600 dark:text-blue-400"
              />
              <h2 className="text-lg font-bold text-foreground">
                Public disclosure stream
              </h2>
            </div>

            <HacktivityFilters
              state={state}
              setFilters={setFilters}
              clearAll={clearAll}
              isFiltered={isFiltered}
            />

            <div
              ref={feedRef}
              className="flex items-center justify-between gap-3 scroll-mt-24"
            >
              <p
                aria-live="polite"
                className="text-sm font-medium text-muted-foreground"
              >
                {isLoading
                  ? "Loading the stream…"
                  : total === 0
                    ? "No activity"
                    : `${formatCount(firstOnPage)}–${formatCount(lastOnPage)} of ${formatCount(total)}`}
              </p>

              {isFetching && !isLoading ? (
                <span className="text-sm text-muted-foreground">Updating…</span>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((index) => (
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
                  className={`flex flex-col gap-3 transition-opacity ${
                    isFetching ? "opacity-60" : "opacity-100"
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
                          duration: 0.24,
                          delay: Math.min(index, 6) * 0.03,
                          ease: "easeOut",
                        }}
                      >
                        <HacktivityCard activity={activity} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {totalPages > 1 ? (
                  <nav
                    aria-label="Stream pages"
                    className="flex items-center justify-between gap-3 pt-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer rounded-xl"
                      disabled={state.page <= 1}
                      onClick={() => goToPage(state.page - 1)}
                    >
                      <ChevronLeft aria-hidden />
                      Newer
                    </Button>

                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                      Page {formatCount(state.page)} of {formatCount(totalPages)}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer rounded-xl"
                      disabled={state.page >= totalPages}
                      onClick={() => goToPage(state.page + 1)}
                    >
                      Older
                      <ChevronRight aria-hidden />
                    </Button>
                  </nav>
                ) : null}
              </>
            )}
          </div>

          {/* Clears the sticky navbar, otherwise the widgets pin underneath it */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--navbar-height)+1.5rem)]">
            <TopResearchers />

            <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <ShieldCheck
                  aria-hidden
                  className="size-4 text-blue-600 dark:text-blue-400"
                />
                Coordinated disclosure
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every entry here follows the disclosure policy agreed between the
                researcher and the program. A finding is named only once its
                program has published it — until then the work is credited but
                the report stays sealed.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** An empty result is a dead end unless it comes with the way back out. */
function FeedEmpty({
  isFiltered,
  onClear,
}: {
  isFiltered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-16 text-center ring-1 ring-foreground/5 dark:ring-foreground/10">
      <SearchX aria-hidden className="size-8 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">
        {isFiltered ? "Nothing matches these filters" : "The stream is quiet"}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {isFiltered
          ? "No disclosure on the platform matches your search and filters yet."
          : "Bounties, recognitions and disclosures appear here the moment programs award them."}
      </p>
      {isFiltered ? (
        <Button
          type="button"
          variant="outline"
          className="mt-1 cursor-pointer rounded-xl"
          onClick={onClear}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

/** Distinct from empty: something broke, and retrying is worth offering. */
function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-red-50/60 px-6 py-14 text-center ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/25">
      <AlertTriangle
        aria-hidden
        className="size-8 text-red-600 dark:text-red-400"
      />
      <p className="text-base font-semibold text-red-800 dark:text-red-300">
        The stream could not be loaded
      </p>
      <p className="max-w-md text-sm text-red-700/90 dark:text-red-300/80">
        This is on our side, not yours. Nothing has been lost — try again in a
        moment.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-1 cursor-pointer rounded-xl"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
