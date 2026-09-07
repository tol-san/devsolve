"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from "@/lib/redux/services/admin/adminUsersApi";
import { AdminUserItem, AdminUserSummaryItem } from "@/lib/types/admin/types";
import { UserStatCards } from "@/components/admin/users/UserStatCards";
import {
  UserFiltersBar,
  type StatusFilter,
  type RoleFilter,
  type UserSortOption,
} from "@/components/admin/users/UserFiltersBar";
import { UserDataTable } from "@/components/admin/users/UserDataTable";
import { getUserColumns } from "@/components/admin/users/userColumns";
import { authClient } from "@/lib/auth/auth-client";
import { ModerationActionDialog } from "@/components/admin/ModerationActionDialog";

import type { ModerationActionType } from "@/lib/types/admin/types";

function AdminUsersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const urlStatus = searchParams.get("status")?.toUpperCase();
  const initialStatus: StatusFilter = useMemo(() => {
    if (urlStatus === "ACTIVE") return "ACTIVE";
    if (urlStatus === "SUSPENDED") return "SUSPENDED";
    if (urlStatus === "PENDING") return "PENDING";
    if (urlStatus === "REMOVED") return "REMOVED";
    return "ALL";
  }, [urlStatus]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [sortOption, setSortOption] = useState<UserSortOption>("NEWEST");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [moderateTarget, setModerateTarget] = useState<{
    user: AdminUserItem;
    actionType: ModerationActionType;
  } | null>(null);

  // Sync state if URL search param changes
  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: overallResponse, refetch: refetchOverall } = useGetAdminUsersQuery({
    pageSize: 100,
  });

  const {
    data: response,
    isLoading,
    isFetching,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    query: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    pageNumber: pageIndex,
    pageSize: pageSize,
  });

  const [updateUser] = useUpdateAdminUserStatusMutation();

  function extractUserRole(item: AdminUserSummaryItem): "USER" | "COMPANY" | "ADMIN" {
    const rolesList: string[] = [
      ...(item.roles || []),
      ...(item.realm_access?.roles || []),
      ...(item.realmAccess?.roles || []),
      ...(item.role ? [item.role] : []),
    ].map((r) => String(r).toUpperCase());

    if (rolesList.includes("ADMIN")) return "ADMIN";
    if (
      rolesList.includes("COMPANY") ||
      rolesList.includes("ORGANIZATION") ||
      rolesList.includes("ORG")
    ) {
      return "COMPANY";
    }
    return "USER";
  }

  const overallUsers: AdminUserItem[] = useMemo(() => {
    if (!overallResponse?.content) return [];
    return overallResponse.content.map((item) => ({
      id: item.id,
      name: item.fullName || item.email || "Unknown User",
      email: item.email || "",
      role: extractUserRole(item),
      status: (item.status as "ACTIVE" | "SUSPENDED" | "PENDING" | "REMOVED") || "ACTIVE",
      joinedDate: item.createdAt || new Date().toISOString(),
      reportsSubmitted: item.totalReports ?? 0,
      validReports: item.validReports ?? 0,
      criticalReports: item.criticalReports ?? 0,
      reputation: item.reputation ?? 0,
      country: item.country,
      avatarUrl: item.avatarUrl,
    }));
  }, [overallResponse]);

  const users: AdminUserItem[] = useMemo(() => {
    if (!response?.content) return [];
    let list: AdminUserItem[] = response.content.map((item) => ({
      id: item.id,
      name: item.fullName || item.email || "Unknown User",
      email: item.email || "",
      role: extractUserRole(item),
      status: (item.status as "ACTIVE" | "SUSPENDED" | "PENDING" | "REMOVED") || "ACTIVE",
      joinedDate: item.createdAt || new Date().toISOString(),
      reportsSubmitted: item.totalReports ?? 0,
      validReports: item.validReports ?? 0,
      criticalReports: item.criticalReports ?? 0,
      reputation: item.reputation ?? 0,
      country: item.country,
      avatarUrl: item.avatarUrl,
    }));

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.country && u.country.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortOption) {
        case "OLDEST":
          return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
        case "REPUTATION_DESC":
          return (b.reputation || 0) - (a.reputation || 0);
        case "REPORTS_DESC":
          return (b.reportsSubmitted || 0) - (a.reportsSubmitted || 0);
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "NAME_DESC":
          return b.name.localeCompare(a.name);
        case "NEWEST":
        default:
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      }
    });

    return list;
  }, [response, roleFilter, debouncedSearch, sortOption]);

  const statusCounts = useMemo(() => {
    const items = overallResponse?.content || response?.content || [];
    const total = overallResponse?.totalElements ?? response?.totalElements ?? 0;
    return {
      all: total,
      active: items.filter((u) => u.status === "ACTIVE").length,
      suspended: items.filter((u) => u.status === "SUSPENDED").length,
      pending: items.filter((u) => u.status === "PENDING").length,
      removed: items.filter((u) => u.status === "REMOVED").length,
    };
  }, [overallResponse, response]);

  const handleStatusFilterChange = useCallback(
    (status: StatusFilter) => {
      setStatusFilter(status);
      setPageIndex(0);
      const params = new URLSearchParams(searchParams.toString());
      if (status === "ALL") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      const newQuery = params.toString();
      router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleRoleFilterChange = useCallback((role: RoleFilter) => {
    setRoleFilter(role);
    setPageIndex(0);
  }, []);

  const handleSortOptionChange = useCallback((sort: UserSortOption) => {
    setSortOption(sort);
    setPageIndex(0);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleResetAll = useCallback(() => {
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setSortOption("NEWEST");
    setSearchQuery("");
    setDebouncedSearch("");
    setPageIndex(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  /**
   * Reinstating needs nothing but a reason, so it goes straight through.
   * A suspension needs an `expiresAt` the table cannot ask for — without one
   * the API returns 400 — so it opens the moderation dialog instead.
   */
  const handleUpdateStatus = useCallback(
    async (id: string, status: "ACTIVE" | "SUSPENDED") => {
      if (status === "SUSPENDED") {
        const user = users.find((candidate) => candidate.id === id);
        if (user) setModerateTarget({ user, actionType: "SUSPEND" });
        return;
      }

      try {
        await updateUser({
          id,
          status: "ACTIVE",
          reason: "Account reinstated via the admin console.",
        }).unwrap();
        toast.success("Account activated.", {
          description: "User status updated successfully.",
        });
        void refetchUsers();
        void refetchOverall();
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to update user status.";
        toast.error(message);
      }
    },
    [updateUser, users, refetchUsers, refetchOverall]
  );

  const handleModerateUser = useCallback(
    (user: AdminUserItem, actionType?: ModerationActionType) => {
      setModerateTarget({ user, actionType: actionType || "WARN" });
    },
    []
  );

  const columns = useMemo(
    () =>
      getUserColumns({
        onUpdateStatus: handleUpdateStatus,
        onModerateUser: handleModerateUser,
        currentUserId: session?.user?.id,
      }),
    [handleUpdateStatus, handleModerateUser, session?.user?.id]
  );

  const suspendedCount = statusCounts.suspended;
  const totalPages = response?.totalPages ?? 1;
  const totalElements = response?.totalElements ?? users.length;

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
              Users
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage researchers, company representatives, admins, and moderators across the platform.
          </p>
        </div>

        {suspendedCount > 0 && (
          <Badge
            variant="outline"
            className="h-9 shrink-0 gap-2 rounded-xl border-rose-500/25 bg-rose-500/10 px-3 text-sm font-semibold text-rose-600 dark:text-rose-400"
          >
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            <span>
              {suspendedCount} suspended account{suspendedCount > 1 ? "s" : ""}
            </span>
          </Badge>
        )}
      </header>

      {!isLoading && (
        <UserStatCards
          users={overallUsers.length > 0 ? overallUsers : users}
          totalCount={overallResponse?.totalElements ?? response?.totalElements}
          onSelectStatus={handleStatusFilterChange}
          activeStatusFilter={statusFilter}
        />
      )}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-muted/40 rounded-2xl border border-border"
            />
          ))}
        </div>
      )}

      <UserFiltersBar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        sortOption={sortOption}
        onSortOptionChange={handleSortOptionChange}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        statusCounts={statusCounts}
        onResetAll={handleResetAll}
      />

      <main className="flex flex-col gap-3">
        {isLoading || isFetching ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-64 bg-muted/40 rounded-2xl border border-border" />
          </div>
        ) : (
          <UserDataTable
            columns={columns}
            data={users}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={totalPages}
            totalElements={totalElements}
            onPageChange={setPageIndex}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPageIndex(0);
            }}
            onResetFilters={handleResetAll}
          />
        )}
      </main>

      <ModerationActionDialog
        target={
          moderateTarget
            ? {
                id: moderateTarget.user.id,
                name: moderateTarget.user.name,
                subtitle: moderateTarget.user.email,
                type: "USER",
                status: moderateTarget.user.status,
              }
            : null
        }
        actionType={moderateTarget?.actionType}
        isOpen={!!moderateTarget}
        onClose={() => setModerateTarget(null)}
        onSuccess={() => {
          void refetchUsers();
          void refetchOverall();
        }}
      />
    </motion.div>
  );
}

function AdminUsersFallback() {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      <div className="h-16 rounded-2xl border border-border bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
      <div className="h-28 rounded-2xl border border-border bg-muted/40" />
      <div className="h-96 rounded-2xl border border-border bg-muted/40" />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersFallback />}>
      <AdminUsersContent />
    </Suspense>
  );
}
