"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookmarkCategory } from "@/lib/types/bookmarks/types";
import { useGetBookmarksQuery, useRemoveBookmarkMutation } from "@/lib/redux/services/bookmarksApi";
import { BookmarkHeader } from "@/components/bookmarks/BookmarkHeader";
import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { Bookmark, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BookmarkCategory>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const { data: bookmarksResponse, isLoading, isFetching } =
    useGetBookmarksQuery();

  const [removeBookmark] = useRemoveBookmarkMutation();

  const allBookmarks = useMemo(
    () => bookmarksResponse?.data ?? [],
    [bookmarksResponse?.data],
  );
  const bookmarks = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    const filtered = allBookmarks.filter((bookmark) => {
      const matchesCategory =
        selectedCategory === "all" || bookmark.category === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        bookmark.title.toLocaleLowerCase().includes(query) ||
        bookmark.description.toLocaleLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "title") {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === "oldest") return [...filtered].reverse();
    return filtered;
  }, [allBookmarks, searchTerm, selectedCategory, sortBy]);

  const counts = bookmarksResponse?.counts ?? {
    all: 0,
    Program: 0,
    Problems: 0,
    Solutions: 0,
    Showcases: 0,
  };
  const totalSavedCount = bookmarksResponse?.totalCount || 0;

  const isFilterActive =
    searchTerm.trim() !== "" ||
    selectedCategory !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* HEADER WITH SEARCH & CATEGORY PILLS */}
      <BookmarkHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isFilterActive={isFilterActive}
        onResetFilters={handleResetFilters}
        counts={counts}
        totalSavedCount={totalSavedCount}
        visibleCount={bookmarks.length}
      />


      {/* MAIN CONTENT AREA */}
      <main className="pt-2">
        {isLoading || isFetching ? (
          /* SKELETON LOADING STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex h-64 animate-pulse flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded-lg w-20" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                  <div className="h-6 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
                <div className="h-9 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-12 text-center shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Bookmark className="size-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                No bookmarks found
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {isFilterActive
                  ? "No saved items match your current filter or search criteria. Try clearing filters or changing search keywords."
                  : "You haven't saved any items yet. Bookmark programs, problems, solutions, or showcases to quickly access them here."}
              </p>
            </div>
            {isFilterActive && (
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="rounded-xl font-semibold"
              >
                <RotateCcw data-icon="inline-start" />
                Reset Filters
              </Button>
            )}
          </motion.div>
        ) : (
          /* BOOKMARK CARDS GRID */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {bookmarks.map((item) => (
                <BookmarkCard
                  key={item.id}
                  item={item}
                  onRemove={async (bookmark) => {
                    await removeBookmark({
                      type: bookmark.bookmarkableType,
                      targetId: bookmark.bookmarkableId,
                    }).unwrap();
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
