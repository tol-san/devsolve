"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { DiscussionActiveFilters } from "@/components/discussions/DiscussionActiveFilters";
import { DiscussionCard } from "@/components/discussions/DiscussionCard";
import { DiscussionCategoryTabs } from "@/components/discussions/DiscussionCategoryTabs";
import { DiscussionEmptyState } from "@/components/discussions/DiscussionEmptyState";
import {
  DiscussionHeader,
  DiscussionSearch,
} from "@/components/discussions/DiscussionHeader";
import { DiscussionMobileFilters } from "@/components/discussions/DiscussionMobileFilters";
import { DiscussionPagination } from "@/components/discussions/DiscussionPagination";
import { DiscussionSidebar } from "@/components/discussions/DiscussionSidebar";
import { DiscussionSkeleton } from "@/components/discussions/DiscussionSkeleton";
import { useDiscussionFilters } from "@/hooks/useDiscussionFilters";
import { useMySolutionStatus } from "@/hooks/useMySolutionStatus";
import { useT } from "@/lib/i18n/I18nProvider";
import { useGetMyProfileQuery } from "@/lib/redux/services/solutionsApi";
import type {
  DiscussionCategory,
} from "@/lib/types/dicussion/types";
import type { DiscussionsResponse } from "@/lib/redux/services/discussionsApi";
import type { InitialDiscussionsData } from "@/lib/seo/content";
import { cn } from "@/lib/utils";

interface DiscussionsFeedProps {
  defaultCategory: DiscussionCategory;
  feed: "community" | "problems" | "showcases";
  createHref: string;
  initialData?: InitialDiscussionsData | DiscussionsResponse | null;
}

export function DiscussionsFeed({
  defaultCategory,
  feed,
  createHref,
  initialData,
}: DiscussionsFeedProps) {
  const t = useT();
  const copy = (field: string) => {
    const key = `community.pages.${feed}.${field}`;
    const value = t(key);
    return value === key ? undefined : value;
  };
  const {
    category,
    topic,
    tag,
    sort,
    searchInput,
    searchQuery,
    page,
    limit,
    hasActiveFilters,
    setCategory,
    setTopic,
    setTag,
    setSort,
    setSearchQuery,
    clearSearch,
    setPage,
    setLimit,
    resetFilters,
    discussionsResult,
    topicsResult,
    tagsResult,
    statsResult,
  } = useDiscussionFilters(defaultCategory);

  const {
    data: remoteDiscussions,
    isLoading: isLoadingFeed,
    isFetching,
  } = discussionsResult;
  const discussions = remoteDiscussions ?? initialData ?? undefined;
  const { data: topics = [], isLoading: isLoadingTopics } = topicsResult;
  const { data: tags = [], isLoading: isLoadingTags } = tagsResult;
  const { data: stats, isLoading: isLoadingStats } = statsResult;

  const { data: me } = useGetMyProfileQuery();
  const { unresolvedFor } = useMySolutionStatus({ skip: !me?.id });

  const isInitialLoading = isLoadingFeed && !discussions;
  const isSearchPending =
    searchInput.trim() !== searchQuery || (isFetching && !isInitialLoading);

  const feedRef = useRef<HTMLElement>(null);
  const previousPage = useRef(page);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-dvh text-foreground"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <DiscussionHeader
          breadcrumbLabel={copy("breadcrumb") ?? ""}
          title={copy("title") ?? ""}
          createHref={createHref}
          createLabel={copy("createLabel")}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section
            aria-label={t("community.searchRegion")}
            className="flex min-w-0 flex-col gap-3 lg:col-start-1"
          >
            <DiscussionSearch
              searchQuery={searchInput}
              onSearch={setSearchQuery}
              onClearSearch={clearSearch}
              isSearching={isSearchPending}
            />
            <DiscussionCategoryTabs
              selected={category}
              onSelect={setCategory}
              sort={sort}
              onSortChange={setSort}
              totalCount={discussions?.totalCount ?? 0}
              isLoading={isInitialLoading}
            />
            <DiscussionMobileFilters
              topics={topics}
              tags={tags}
              selectedTopic={topic}
              selectedTag={tag}
              totalCount={discussions?.totalCount ?? 0}
              onSelectTopic={setTopic}
              onSelectTag={setTag}
              isLoadingTopics={isLoadingTopics}
              isLoadingTags={isLoadingTags}
            />
            <DiscussionActiveFilters
              category={category}
              defaultCategory={defaultCategory}
              topic={topic}
              tag={tag}
              searchQuery={searchQuery}
              onClearCategory={() => setCategory(defaultCategory)}
              onClearTopic={() => setTopic(null)}
              onClearTag={() => setTag(null)}
              onClearSearch={clearSearch}
              onResetAll={resetFilters}
            />
          </section>

          <DiscussionSidebar
            topics={topics}
            tags={tags}
            stats={stats}
            selectedTopic={topic}
            selectedTag={tag}
            onSelectTopic={setTopic}
            onSelectTag={setTag}
            isLoadingTopics={isLoadingTopics}
            isLoadingTags={isLoadingTags}
            isLoadingStats={isLoadingStats}
            createHref={createHref}
            createLabel={copy("createLabel")}
            className="hidden lg:flex"
          />

          <section
            ref={feedRef}
            aria-label={t("community.feedRegion")}
            className="flex min-w-0 scroll-mt-6 flex-col gap-5 lg:col-start-1 lg:row-start-2"
          >
            {isInitialLoading ? (
              <DiscussionSkeleton />
            ) : (
              <>
                <div
                  aria-busy={isFetching}
                  className={cn(
                    "transition-opacity duration-150",
                    isFetching && "opacity-70",
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {discussions?.data && discussions.data.length > 0 ? (
                      <motion.div
                        key={`feed-${category}-${topic}-${tag}-${searchQuery}-${sort}-${page}-${limit}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden ring-1 ring-foreground/5"
                      >
                        {discussions.data.map((post, index) => (
                          <DiscussionCard
                            key={post.id}
                            post={post}
                            index={index}
                            myAnswer={
                              post.category === "Problems"
                                ? unresolvedFor(post.id)
                                : undefined
                            }
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <DiscussionEmptyState
                          onReset={resetFilters}
                          hasFilters={hasActiveFilters}
                          createHref={createHref}
                          emptyLabel={copy("empty")}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {discussions && discussions.totalCount > 0 && (
                  <DiscussionPagination
                    page={discussions.page}
                    totalPages={discussions.totalPages}
                    limit={limit}
                    totalCount={discussions.totalCount}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
}
