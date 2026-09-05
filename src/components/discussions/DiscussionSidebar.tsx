"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Hash,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { DiscussionStats } from "@/lib/redux/services/discussionsApi";
import type { TopicCount, TopicName } from "@/lib/types/dicussion/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DiscussionSidebarProps {
  topics: TopicCount[];
  tags: string[];
  stats?: DiscussionStats;
  selectedTopic: TopicName | null;
  selectedTag: string | null;
  onSelectTopic: (topic: TopicName | null) => void;
  onSelectTag: (tag: string | null) => void;
  isLoadingTopics?: boolean;
  isLoadingTags?: boolean;
  isLoadingStats?: boolean;
  className?: string;
  showExploreHeader?: boolean;
  showStats?: boolean;
}

export function DiscussionSidebar({
  topics,
  tags,
  stats,
  selectedTopic,
  selectedTag,
  onSelectTopic,
  onSelectTag,
  isLoadingTopics,
  isLoadingTags,
  isLoadingStats,
  className,
  showExploreHeader = true,
  showStats = true,
}: DiscussionSidebarProps) {
  const t = useT();
  const [topicSearch, setTopicSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const totalDiscussionsCount = useMemo(
    () => topics.reduce((sum, topic) => sum + topic.count, 0),
    [topics],
  );

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => {
      if (a.name === selectedTopic) return -1;
      if (b.name === selectedTopic) return 1;
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
  }, [topics, selectedTopic]);

  const activeTopics = useMemo(() => {
    return sortedTopics.filter(
      (topic) => topic.count > 0 || topic.name === selectedTopic,
    );
  }, [sortedTopics, selectedTopic]);

  const filteredTopics = useMemo(() => {
    const query = topicSearch.trim().toLowerCase();
    if (query) {
      return sortedTopics.filter((topic) =>
        topic.name.toLowerCase().includes(query),
      );
    }
    if (isExpanded) {
      return sortedTopics;
    }
    const baseList = activeTopics.length > 0 ? activeTopics : sortedTopics;
    return baseList.slice(0, 3);
  }, [sortedTopics, activeTopics, topicSearch, isExpanded]);

  const hasHiddenTopics =
    !topicSearch && sortedTopics.length > 3;

  const visibleTags = useMemo(() => {
    if (isTagsExpanded || tags.length <= 10) return tags;
    return tags.slice(0, 10);
  }, [tags, isTagsExpanded]);

  const hasActiveFilters = Boolean(selectedTopic) || Boolean(selectedTag);

  const handleResetFilters = () => {
    onSelectTopic(null);
    onSelectTag(null);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: 0.08 }}
      aria-label={t("community.explore.region")}
      className={cn(
        "flex flex-col gap-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start",
        className,
      )}
    >
      <Card className="gap-0 rounded-2xl py-0 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 bg-card">
        {showExploreHeader && (
          <CardHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">
                    {t("community.explore.title")}
                  </CardTitle>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Reset
                  </Button>
                )}
                <Badge
                  variant="secondary"
                  className="h-6 px-2 text-xs font-semibold tabular-nums"
                  title={`${totalDiscussionsCount} total posts across topics`}
                >
                  {totalDiscussionsCount.toLocaleString()}
                </Badge>
              </div>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              {t("community.explore.description")}
            </CardDescription>
          </CardHeader>
        )}

        {!showExploreHeader && (
          <CardHeader className="sr-only">
            <CardTitle>{t("community.explore.title")}</CardTitle>
            <CardDescription>
              {t("community.explore.description")}
            </CardDescription>
          </CardHeader>
        )}

        <CardContent className={cn("px-4 pb-4", !showExploreHeader && "pt-3")}>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("community.explore.topics")}
              </span>
              {topics.length > 0 && (
                <span className="text-xs font-medium text-muted-foreground/70 tabular-nums">
                  {activeTopics.length > 0
                    ? `${activeTopics.length} active`
                    : `${topics.length} topics`}
                </span>
              )}
            </div>

            {topics.length > 6 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Filter topics..."
                  className="h-8 pl-8 pr-7 text-xs bg-muted/40 hover:bg-muted/60 focus:bg-background rounded-lg border-border/50 transition-colors"
                />
                {topicSearch && (
                  <button
                    type="button"
                    onClick={() => setTopicSearch("")}
                    aria-label="Clear topic filter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            )}

            <div
              className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-0.5 custom-scrollbar"
              aria-label={t("community.explore.topics")}
            >
              {isLoadingTopics ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-9 animate-pulse rounded-xl bg-muted/60"
                  />
                ))
              ) : filteredTopics.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No topics matching &ldquo;{topicSearch}&rdquo;
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const isActive = selectedTopic === topic.name;
                  const isPopulated = topic.count > 0;

                  return (
                    <button
                      key={topic.name}
                      type="button"
                      id={`topic-${topic.name.toLowerCase().replace(/\s+/g, "-")}`}
                      aria-pressed={isActive}
                      onClick={() =>
                        onSelectTopic(isActive ? null : topic.name)
                      }
                      title={topic.name}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : isPopulated
                            ? "font-medium text-foreground hover:bg-muted/70 hover:text-foreground"
                            : "font-normal text-muted-foreground/75 hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate pr-2">
                        {topic.name}
                      </span>
                      <span className="shrink-0">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
                            {topic.count}
                            <X className="size-2.5 opacity-80" />
                          </span>
                        ) : isPopulated ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-muted/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground group-hover:bg-background group-hover:shadow-2xs transition-colors">
                            {topic.count}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 tabular-nums">
                            0
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {hasHiddenTopics && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full justify-center text-xs font-semibold text-muted-foreground hover:text-foreground h-8 rounded-lg cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-3.5 mr-1.5" />
                    Show top 3 topics
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5 mr-1.5" />
                    Show all topics ({topics.length})
                  </>
                )}
              </Button>
            )}
          </div>

          <Separator className="my-4 bg-border/60" />

          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <TrendingUp aria-hidden="true" className="size-3.5 text-primary" />
                <span>{t("community.explore.trendingTags")}</span>
              </div>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => onSelectTag(null)}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  Clear tag
                </button>
              )}
            </div>

            {isLoadingTags ? (
              <div className="flex flex-wrap gap-1.5 px-0.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-7 w-16 animate-pulse rounded-lg bg-muted/60"
                  />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <p className="px-1 text-xs text-muted-foreground">
                No tags trending yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 px-0.5">
                {visibleTags.map((tag) => {
                  const isActive = selectedTag === tag;

                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => onSelectTag(isActive ? null : tag)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "bg-muted/50 text-muted-foreground border border-border/40 hover:border-border hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Hash className="size-3 opacity-60" />
                      <span>{tag}</span>
                      {isActive && <X className="size-2.5 ml-0.5 opacity-80" />}
                    </button>
                  );
                })}
              </div>
            )}

            {tags.length > 10 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsTagsExpanded((prev) => !prev)}
                className="w-full justify-center text-xs font-semibold text-muted-foreground hover:text-foreground h-7 rounded-lg cursor-pointer mt-1"
              >
                {isTagsExpanded ? (
                  <>
                    <ChevronUp className="size-3 mr-1" />
                    Show fewer tags
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3 mr-1" />
                    Show all tags ({tags.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.aside>
  );
}
