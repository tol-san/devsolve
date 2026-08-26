"use client";

import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

import { DiscussionSidebar } from "@/components/discussions/DiscussionSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TopicCount, TopicName } from "@/lib/types/dicussion/types";
import { useT } from "@/lib/i18n/I18nProvider";

interface DiscussionMobileFiltersProps {
  topics: TopicCount[];
  tags: string[];
  selectedTopic: TopicName | null;
  selectedTag: string | null;
  totalCount: number;
  onSelectTopic: (topic: TopicName | null) => void;
  onSelectTag: (tag: string | null) => void;
  isLoadingTopics?: boolean;
  isLoadingTags?: boolean;
}

export function DiscussionMobileFilters({
  topics,
  tags,
  selectedTopic,
  selectedTag,
  totalCount,
  onSelectTopic,
  onSelectTag,
  isLoadingTopics,
  isLoadingTags,
}: DiscussionMobileFiltersProps) {
  const t = useT();
  const activeCount =
    Number(Boolean(selectedTopic)) + Number(Boolean(selectedTag));

  const clearExploreFilters = () => {
    onSelectTopic(null);
    onSelectTag(null);
  };

  return (
    <div className="lg:hidden">
      <Dialog>
        <motion.div whileTap={{ scale: 0.98 }}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between rounded-xl bg-card"
              />
            }
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
              {t("community.mobileFilters.trigger")}
            </span>
            {activeCount > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {activeCount} {t("community.mobileFilters.active")}
              </Badge>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {t("community.mobileFilters.optional")}
              </span>
            )}
          </DialogTrigger>
        </motion.div>

        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-b border-border px-5 pt-5 pr-14 pb-4">
            <DialogTitle className="text-lg font-bold">
              {t("community.mobileFilters.title")}
            </DialogTitle>
            <DialogDescription>
              {t("community.mobileFilters.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 rounded-xl"
              />
            }
          >
            <X aria-hidden="true" />
            <span className="sr-only">{t("community.mobileFilters.close")}</span>
          </DialogClose>

          <div className="overflow-y-auto p-4">
            <DiscussionSidebar
              topics={topics}
              tags={tags}
              selectedTopic={selectedTopic}
              selectedTag={selectedTag}
              onSelectTopic={onSelectTopic}
              onSelectTag={onSelectTag}
              isLoadingTopics={isLoadingTopics}
              isLoadingTags={isLoadingTags}
              showExploreHeader={false}
              showStats={false}
              className="gap-0"
            />
          </div>

          <DialogFooter className="flex-col border-t border-border bg-card px-4 py-4">
            {activeCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearExploreFilters}
                className="rounded-xl"
              >
                {t("community.mobileFilters.clear")}
              </Button>
            )}
            <DialogClose
              render={<Button type="button" className="rounded-xl" />}
            >
              {t("community.mobileFilters.show")} {totalCount.toLocaleString()}{" "}
              {totalCount === 1
                ? t("community.result")
                : t("community.results")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
