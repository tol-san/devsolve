"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import {
  useGetAdminProgramsQuery,
  ProgramManagementSummaryItem,
  ProgramSubmissionState,
  ProgramState,
} from "@/lib/redux/services/admin/programAdminApi";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import { useGetMyCompanyProgramsQuery } from "@/lib/redux/services/program/programsApi";
import { ProgramStatCards } from "@/components/admin/programs/ProgramStatCards";
import { ProgramFiltersBar } from "@/components/admin/programs/ProgramFiltersBar";
import { ProgramDataTable } from "@/components/admin/programs/ProgramDataTable";
import { getProgramColumns } from "@/components/admin/programs/programColumns";

function ProgramManagementPageContent() {
  const searchParams = useSearchParams();
  const { user } = useSidebarAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const { hasCompanyAccess: isCompanyUser, can, hasMultiple } =
    useCompanyAccess();
  const isAdminScope =
    (searchParams.get("scope") === "admin" || (isAdmin && !isCompanyUser)) &&
    isAdmin;

  const [submissionStateFilter, setSubmissionStateFilter] = useState<
    ProgramSubmissionState | "ALL"
  >("ALL");
  const [stateFilter, setStateFilter] = useState<ProgramState | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("updatedAt,DESC");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const { data: adminPendingResponse, isLoading: isAdminPendingLoading } =
    useGetAdminProgramsQuery(
      { submissionState: "PENDING_REVIEW", size: 100 },
      { skip: !isAdminScope }
    );
  const { data: adminApprovedResponse, isLoading: isAdminApprovedLoading } =
    useGetAdminProgramsQuery(
      { submissionState: "APPROVED", size: 100 },
      { skip: !isAdminScope }
    );
  const { data: adminRejectedResponse, isLoading: isAdminRejectedLoading } =
    useGetAdminProgramsQuery(
      { submissionState: "REJECTED", size: 100 },
      { skip: !isAdminScope }
    );

  const {
    data: companyOverallResponse,
    isLoading: isCompanyLoading,
    error: companyError,
  } = useGetMyCompanyProgramsQuery({ size: 100 }, { skip: isAdminScope });

  const isAmbiguousOrganization =
    apiErrorStatus(companyError) === 409 || (hasMultiple && Boolean(companyError));

  const isLoading = isAdminScope
    ? isAdminPendingLoading || isAdminApprovedLoading || isAdminRejectedLoading
    : isCompanyLoading;

  const rawPrograms: ProgramManagementSummaryItem[] = useMemo(() => {
    if (isAdminScope) {
      const pending = adminPendingResponse?.content ?? [];
      const approved = adminApprovedResponse?.content ?? [];
      const rejected = adminRejectedResponse?.content ?? [];
      const map = new Map<string, ProgramManagementSummaryItem>();
      [...pending, ...approved, ...rejected].forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    }
    return companyOverallResponse?.content ?? [];
  }, [
    isAdminScope,
    adminPendingResponse,
    adminApprovedResponse,
    adminRejectedResponse,
    companyOverallResponse,
  ]);

  const counts = useMemo(() => {
    if (isAdminScope) {
      const pendingCount = adminPendingResponse?.totalElements ?? 0;
      const approvedCount = adminApprovedResponse?.totalElements ?? 0;
      const rejectedCount = adminRejectedResponse?.totalElements ?? 0;
      return {
        all: pendingCount + approvedCount + rejectedCount,
        pendingReview: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      };
    }
    return {
      all: rawPrograms.length,
      pendingReview: rawPrograms.filter((p) => p.submissionState === "PENDING_REVIEW").length,
      approved: rawPrograms.filter((p) => p.submissionState === "APPROVED").length,
      rejected: rawPrograms.filter((p) => p.submissionState === "REJECTED").length,
    };
  }, [
    isAdminScope,
    adminPendingResponse,
    adminApprovedResponse,
    adminRejectedResponse,
    rawPrograms,
  ]);

  const filteredPrograms = useMemo(() => {
    let list = rawPrograms;

    if (submissionStateFilter !== "ALL") {
      list = list.filter((p) => p.submissionState === submissionStateFilter);
    }

    if (stateFilter !== "ALL") {
      list = list.filter((p) => p.state === stateFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.handle?.toLowerCase().includes(q) ||
          p.organizationName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [rawPrograms, submissionStateFilter, stateFilter, searchQuery]);

  const sortedAndFilteredPrograms = useMemo(() => {
    if (!sort) return filteredPrograms;
    const list = [...filteredPrograms];
    const [field, direction] = sort.split(",");
    const isDesc = direction?.toUpperCase() === "DESC";

    list.sort((a, b) => {
      let valA: any = a[field as keyof ProgramManagementSummaryItem] ?? "";
      let valB: any = b[field as keyof ProgramManagementSummaryItem] ?? "";

      if (field === "createdAt" || field === "updatedAt") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    return list;
  }, [filteredPrograms, sort]);

  const totalElements = sortedAndFilteredPrograms.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const displayedPrograms = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedAndFilteredPrograms.slice(start, start + pageSize);
  }, [sortedAndFilteredPrograms, pageIndex, pageSize]);

  const handleSubmissionStateChange = useCallback(
    (state: ProgramSubmissionState | "ALL") => {
      setSubmissionStateFilter(state);
      setPageIndex(0);
    },
    []
  );

  const handleStateChange = useCallback((state: ProgramState | "ALL") => {
    setStateFilter(state);
    setPageIndex(0);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPageIndex(0);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    setPageIndex(0);
  }, []);

  const columns = useMemo(
    () => getProgramColumns({ scope: isAdminScope ? "admin" : "owner" }),
    [isAdminScope]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">
              Program Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Program Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdminScope
              ? "Review, audit, approve, and oversee corporate security bug bounty programs."
              : "Manage and monitor security programs for your organization."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdminScope && counts.pendingReview > 0 && (
            <Badge
              variant="outline"
              className="h-9 shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground"
            >
              <span className="size-2 rounded-full bg-amber-500" />
              <span>
                {counts.pendingReview} program
                {counts.pendingReview > 1 ? "s" : ""} pending review
              </span>
            </Badge>
          )}

          {!isAdminScope && can("CREATE_PROGRAM") && (
            <Link href="/dashboard/create-program">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-10 px-4 gap-2  shadow-xs cursor-pointer">
                <Plus className="w-4 h-4" />
                Create Program
              </Button>
            </Link>
          )}
        </div>
      </header>

      {isAmbiguousOrganization && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              Programs cannot be listed for this account yet
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {apiErrorMessage(
                companyError,
                "This account belongs to more than one organization, and the programs endpoint reads them one organization at a time without a way to say which.",
              )}{" "}
              Everything else follows the workspace you pick in the sidebar.
            </p>
          </div>
        </div>
      )}

      {!isLoading && (
        <ProgramStatCards
          total={counts.all}
          pending={counts.pendingReview}
          approved={counts.approved}
          rejected={counts.rejected}
        />
      )}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-muted rounded-2xl border border-border"
            />
          ))}
        </div>
      )}

      <ProgramFiltersBar
        submissionStateFilter={submissionStateFilter}
        onSubmissionStateChange={handleSubmissionStateChange}
        stateFilter={stateFilter}
        onStateChange={handleStateChange}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        sort={sort}
        onSortChange={handleSortChange}
        counts={counts}
      />

      <main className="flex flex-col gap-3">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-64 bg-muted rounded-2xl border border-border" />
          </div>
        ) : (
          <ProgramDataTable
            columns={columns}
            data={displayedPrograms}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={totalPages}
            totalElements={totalElements}
            onPageChange={setPageIndex}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPageIndex(0);
            }}
          />
        )}
      </main>
    </motion.div>
  );
}

function ProgramManagementPageFallback() {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      <div className="h-24 rounded-2xl border border-border bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 rounded-2xl border border-border bg-muted"
          />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-border bg-muted" />
    </div>
  );
}

export default function ProgramManagementPage() {
  return (
    <Suspense fallback={<ProgramManagementPageFallback />}>
      <ProgramManagementPageContent />
    </Suspense>
  );
}
