"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShowcaseStatCards } from "@/components/admin/showcases/ShowcaseStatCards";
import { ShowcaseFiltersBar } from "@/components/admin/showcases/ShowcaseFiltersBar";
import { ShowcaseDataTable } from "@/components/admin/showcases/ShowcaseDataTable";
import { ShowcaseReviewModal } from "@/components/admin/showcases/ShowcaseReviewModal";
import { useGetShowcaseReviewQueueQuery } from "@/lib/redux/services/admin/showcaseReviewApi";
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

export default function ShowcaseReviewPage() {
  const [statusFilter, setStatusFilter] = useState<ShowcaseReviewStatus | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShowcaseId, setSelectedShowcaseId] = useState<string | null>(null);

  const { data: pageData, isLoading } = useGetShowcaseReviewQueueQuery({
    reviewStatus: statusFilter === "ALL" ? undefined : statusFilter,
    pageSize: 100,
  });

  const rawItems = pageData?.content ?? [];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return rawItems;
    const query = searchQuery.toLowerCase();
    return rawItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.overview.toLowerCase().includes(query) ||
        (item.authorName && item.authorName.toLowerCase().includes(query)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(query))
    );
  }, [rawItems, searchQuery]);

  const handleReset = () => {
    setStatusFilter("PENDING");
    setSearchQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link
              href="/dashboard"
              className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              Showcase Review
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Showcase Submissions Review
            </h1>
            <Badge className="bg-blue-600 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold hover:bg-blue-600 flex items-center gap-1">
              <Sparkles className="size-3" />
              Admin Moderation
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inspect, approve, or reject user community project showcase submissions and revisions.
          </p>
        </div>
      </header>

      <ShowcaseStatCards items={rawItems} isLoading={isLoading} />

      <ShowcaseFiltersBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleReset}
      />

      <ShowcaseDataTable
        items={filteredItems}
        isLoading={isLoading}
        onReview={(id) => setSelectedShowcaseId(id)}
      />

      <ShowcaseReviewModal
        showcaseId={selectedShowcaseId}
        isOpen={Boolean(selectedShowcaseId)}
        onClose={() => setSelectedShowcaseId(null)}
      />
    </motion.div>
  );
}
