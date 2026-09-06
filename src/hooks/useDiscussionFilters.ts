"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useGetDiscussionsQuery,
  useGetDiscussionTopicsQuery,
  useGetTrendingTagsQuery,
  useGetDiscussionStatsQuery,
} from "@/lib/redux/services/discussionsApi";
import type {
  DiscussionCategory,
  DiscussionSort,
  TopicName,
} from "@/lib/types/dicussion/types";

const DEFAULT_LIMIT = 10;
const DEFAULT_SORT: DiscussionSort = "newest";
const SEARCH_DEBOUNCE_MS = 300;

export function useDiscussionFilters(defaultCategory: DiscussionCategory = "All") {
  const [category, setCategory] = useState<DiscussionCategory>(defaultCategory);
  const [topic, setTopic] = useState<TopicName | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<DiscussionSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) return;
    const timeout = setTimeout(() => {
      setSearchQuery(trimmed);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput, searchQuery]);

  const handleSetCategory = useCallback((value: DiscussionCategory) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleSetTopic = useCallback((value: TopicName | null) => {
    setTopic(value);
    setPage(1);
  }, []);

  const handleSetTag = useCallback((value: string | null) => {
    setTag(value);
    setPage(1);
  }, []);

  const handleSetSort = useCallback((value: DiscussionSort) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleSetSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }, []);

  const handleSetLimit = useCallback((value: number) => {
    setLimit(value);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setCategory(defaultCategory);
    setTopic(null);
    setTag(null);
    setSearchInput("");
    setSearchQuery("");
    setSort(DEFAULT_SORT);
    setPage(1);
  }, [defaultCategory]);

  const topicsResult = useGetDiscussionTopicsQuery();
  const selectedTopic = topicsResult.data?.find((item) => item.name === topic);
  const discussionsResult = useGetDiscussionsQuery(
    {
      category,
      topic,
      problemCategoryId: selectedTopic?.problemCategoryId,
      showcaseCategoryId: selectedTopic?.showcaseCategoryId,
      tag,
      searchQuery,
      sort,
      page,
      limit,
    },
    { skip: topic !== null && topicsResult.isLoading },
  );
  const tagsResult = useGetTrendingTagsQuery();
  const statsResult = useGetDiscussionStatsQuery();

  const hasActiveFilters =
    category !== defaultCategory ||
    topic !== null ||
    tag !== null ||
    searchQuery !== "";

  return {
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
    setCategory: handleSetCategory,
    setTopic: handleSetTopic,
    setTag: handleSetTag,
    setSort: handleSetSort,
    setSearchQuery: handleSetSearch,
    clearSearch: handleClearSearch,
    setPage,
    setLimit: handleSetLimit,
    resetFilters: handleResetFilters,
    discussionsResult,
    topicsResult,
    tagsResult,
    statsResult,
  };
}
