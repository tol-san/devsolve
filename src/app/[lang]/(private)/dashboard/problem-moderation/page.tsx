"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import {
  useGetAdminProblemsQuery,
  useModerateProblemMutation,
  ProblemResponse,
  ProblemStatus,
} from "@/lib/redux/services/admin/problemAdminApi";
import { ProblemStatCards } from "@/components/admin/problems/ProblemStatCards";
import { ProblemFiltersBar } from "@/components/admin/problems/ProblemFiltersBar";
import { ProblemDataTable } from "@/components/admin/problems/ProblemDataTable";
import { getProblemColumns } from "@/components/admin/problems/problemColumns";
import { ProblemModerationModal } from "@/components/admin/problems/ProblemModerationModal";
import { authorNameOf } from "@/lib/discussions/format";

export default function ProblemModerationPage() {
  const [statusFilter, setStatusFilter] = useState<ProblemStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedProblem, setSelectedProblem] = useState<ProblemResponse | null>(null);

  const { data: apiData, isLoading, isFetching } = useGetAdminProblemsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    size: 20,
  });

  const [moderateProblem] = useModerateProblemMutation();

  const problems: ProblemResponse[] = apiData?.content ?? [];
  const totalElements = apiData?.totalElements ?? problems.length;
  const totalPages = apiData?.totalPages ?? 1;

  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return problems;
    return problems.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        authorNameOf(p.author, "").toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [problems, searchQuery]);

  const counts = useMemo(
    () => ({
      all: totalElements,
      pendingApproval: problems.filter((p) => p.status === "PENDING_APPROVAL").length,
      published: problems.filter((p) => p.status === "PUBLISHED").length,
      rejected: problems.filter((p) => p.status === "REJECTED").length,
    }),
    [problems, totalElements]
  );

  const handleModerate = useCallback(
    async (id: string, status: ProblemStatus) => {
      await moderateProblem({ id, status }).unwrap();
    },
    [moderateProblem]
  );

  const columns = useMemo(
    () =>
      getProblemColumns({
        onModerate: (problem) => setSelectedProblem(problem),
      }),
    []
  );

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
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400">Problem Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Problem Moderation</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit, approve, and moderate community-submitted technical problems across SDLC phases.
          </p>
        </div>

        {counts.pendingApproval > 0 && (
          <div className="shrink-0 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {counts.pendingApproval} problem{counts.pendingApproval !== 1 ? "s" : ""} pending approval
            </span>
          </div>
        )}
      </header>

      {!isLoading && (
        <ProblemStatCards
          total={counts.all}
          pendingApproval={counts.pendingApproval}
          published={counts.published}
          rejected={counts.rejected}
        />
      )}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      )}

      <ProblemFiltersBar
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setPage(0);
        }}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        counts={counts}
      />

      <main className="space-y-3">
        {isLoading || isFetching ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
          </div>
        ) : (
          <ProblemDataTable
            columns={columns}
            data={filteredProblems}
            pageCount={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </main>

      <ProblemModerationModal
        selectedProblem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
        onModerate={handleModerate}
      />
    </motion.div>
  );
}
