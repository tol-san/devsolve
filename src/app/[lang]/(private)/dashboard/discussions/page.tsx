"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { DiscussionActiveFilters } from "@/components/discussions/DiscussionActiveFilters";
import { DiscussionCard } from "@/components/discussions/DiscussionCard";
import { DiscussionCategoryTabs } from "@/components/discussions/DiscussionCategoryTabs";
import { DiscussionEmptyState } from "@/components/discussions/DiscussionEmptyState";
import {
  DiscussionHeader,
  DiscussionSearch,
} from "@/components/discussions/DiscussionHeader";
import { DiscussionPagination } from "@/components/discussions/DiscussionPagination";
import { DiscussionSidebar } from "@/components/discussions/DiscussionSidebar";
import { DiscussionSkeleton } from "@/components/discussions/DiscussionSkeleton";
import { useDiscussionFilters } from "@/hooks/useDiscussionFilters";
import type { TopicFilter } from "@/lib/types/dicussion/types";
import { cn } from "@/lib/utils";

export default function DiscussionsPage() {
  const {
    category,
    topic,
    tag,
    sort,
    searchInput,
    searchQuery,
    page,
    limit,
    viewMode,
    setViewMode,
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
  } = useDiscussionFilters();

  const {
    data: discussions,
    isLoading: isLoadingFeed,
    isFetching,
  } = discussionsResult;
  const { data: topics = [], isLoading: isLoadingTopics } = topicsResult;
  const { data: tags = [], isLoading: isLoadingTags } = tagsResult;
  const { data: stats, isLoading: isLoadingStats } = statsResult;

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
      className="space-y-6 w-full pb-12"
    >
      <DiscussionHeader
        breadcrumbLabel="Community"
        title="Community"
        createHref="/dashboard/discussions/create"
        createLabel="Start a discussion"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-label="Search and sort discussions"
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
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <DiscussionActiveFilters
            category={category}
            defaultCategory="All"
            topic={topic}
            tag={tag}
            searchQuery={searchQuery}
            onClearCategory={() => setCategory("All")}
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
          selectedTopic={topic as TopicFilter | null}
          selectedTag={tag}
          onSelectTopic={(selectedTopic) =>
            setTopic(selectedTopic as TopicFilter | null)
          }
          onSelectTag={setTag}
          isLoadingTopics={isLoadingTopics}
          isLoadingTags={isLoadingTags}
          isLoadingStats={isLoadingStats}
          createHref="/dashboard/discussions/create"
          createLabel="Start New Discussion"
        />

        <section
          ref={feedRef}
          aria-label="Discussion feed"
          className="flex min-w-0 scroll-mt-6 flex-col gap-5 lg:col-start-1 lg:row-start-2"
        >
          {isInitialLoading ? (
            <DiscussionSkeleton viewMode={viewMode} />
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
                    viewMode === "card" ? (
                      <motion.div
                        key={`feed-${category}-${topic}-${tag}-${searchQuery}-${sort}-${page}-${limit}-card`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 gap-5 md:grid-cols-2"
                      >
                        {discussions.data.map((post, index) => (
                          <DiscussionCard
                            key={post.id}
                            post={post}
                            index={index}
                            variant="card"
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`feed-${category}-${topic}-${tag}-${searchQuery}-${sort}-${page}-${limit}-list`}
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
                            variant="feed"
                          />
                        ))}
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                      key="empty"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <DiscussionEmptyState
                        onReset={resetFilters}
                        hasFilters={hasActiveFilters}
                        createHref="/dashboard/discussions/create"
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
    </motion.div>
  );
}
