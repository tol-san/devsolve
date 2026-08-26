"use client";

import React from "react";
import { motion } from "motion/react";
import { BarChart3, SlidersHorizontal, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const totalTopics = topics.reduce((sum, topic) => sum + topic.count, 0);
  /* Only what a list endpoint can answer. There is no platform-wide count of
     solutions or of researchers, so neither is shown rather than shown wrong. */
  const metrics = [
    { key: "problems", label: t("community.stats.problems"), value: stats?.problems ?? 0 },
    { key: "showcases", label: t("community.stats.showcases"), value: stats?.showcases ?? 0 },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: 0.08 }}
      aria-label={t(
        showStats ? "community.explore.regionWithStats" : "community.explore.region",
      )}
      className={cn(
        "flex flex-col gap-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start",
        className,
      )}
    >
      <Card className="gap-0 rounded-2xl py-0 shadow-xs ring-1 ring-foreground/5">
        {showExploreHeader && (
          <CardHeader className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <SlidersHorizontal aria-hidden="true" className="size-4" />
                </span>
                <CardTitle className="text-base font-bold">
                  {t("community.explore.title")}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="tabular-nums">
                {totalTopics.toLocaleString()}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-sm">
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

        <CardContent
          className={cn("px-3 pb-4", !showExploreHeader && "pt-3")}
        >
          <div className="flex flex-col gap-1" aria-label={t("community.explore.topics")}>
            {isLoadingTopics
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 animate-pulse rounded-xl bg-muted"
                  />
                ))
              : topics.map((topic) => {
                  const isActive = selectedTopic === topic.name;

                  return (
                    <button
                      key={topic.name}
                      type="button"
                      id={`topic-${topic.name.toLowerCase().replace(/\s+/g, "-")}`}
                      aria-pressed={isActive}
                      onClick={() => onSelectTopic(isActive ? null : topic.name)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span
                        className="min-w-0 flex-1 truncate"
                        title={topic.name}
                      >
                        {topic.name}
                      </span>
                      <span
                        className={cn(
                          "tabular-nums",
                          isActive
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {topic.count}
                      </span>
                    </button>
                  );
                })}
          </div>

          <Separator className="my-4 bg-border/60" />

          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
            <TrendingUp aria-hidden="true" className="size-4" />
            {t("community.explore.trendingTags")}
          </div>
          {isLoadingTags ? (
            <div className="flex flex-wrap gap-2 px-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-16 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 px-2">
              {tags.map((tag) => {
                const isActive = selectedTag === tag;

                return (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "secondary"}
                    aria-pressed={isActive}
                    onClick={() => onSelectTag(isActive ? null : tag)}
                    className="rounded-lg font-mono"
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showStats && (
        <div className="hidden lg:block">
          <Card className="gap-0 rounded-2xl py-0 shadow-xs ring-1 ring-foreground/5">
            <CardHeader className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <BarChart3 aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-base font-bold">
                    {t("community.stats.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("community.stats.subtitle")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 pb-5">
              <dl className="flex flex-col gap-3">
                {metrics.map(({ key, label, value }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd>
                      {isLoadingStats ? (
                        <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                      ) : (
                        <span className="text-base font-bold tabular-nums text-foreground">
                          {value.toLocaleString()}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.aside>
  );
}
