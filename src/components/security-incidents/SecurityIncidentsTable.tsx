"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Shield,
  FileWarning,
  Building,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  ArrowUpRight,
  UserX,
  Ban,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useGetAdminSecurityIncidentsQuery,
  useGetOrgSecurityIncidentsQuery,
} from "@/lib/redux/services/securityIncidentsApi";
import { useGetAdminUsersQuery } from "@/lib/redux/services/admin/adminUsersApi";
import { SecurityIncidentDetailModal } from "@/components/security-incidents/SecurityIncidentDetailModal";
import { ModerationActionDialog } from "@/components/admin/ModerationActionDialog";
import { UserStatusBadge } from "@/components/admin/users/UserStatusBadge";
import type {
  SecurityIncident,
  MalwareUploader,
  MalwareVerdict,
  IncidentSortColumn,
  SortDirection,
} from "@/lib/types/security-incidents/types";
import type { ModerationActionType } from "@/lib/types/admin/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface SecurityIncidentsTableProps {
  scope?: "admin" | "org";
  orgId?: string;
  className?: string;
}

export function SecurityIncidentsTable({
  scope = "admin",
  orgId = "",
  className,
}: SecurityIncidentsTableProps) {
  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<"ALL" | MalwareVerdict>("ALL");
  const [sortColumn, setSortColumn] = useState<IncidentSortColumn>("blockedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC");
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(20);

  // Selected incident for modal inspection
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Moderate target user for Admin actions
  const [moderateTarget, setModerateTarget] = useState<{
    user: MalwareUploader;
    filename?: string;
    actionType?: ModerationActionType;
  } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const sortParam = `${sortColumn},${sortDirection}` as const;

  // RTK Query: conditionally call admin vs org endpoint
  const adminQuery = useGetAdminSecurityIncidentsQuery(
    {
      search: debouncedSearch || undefined,
      verdict: verdictFilter !== "ALL" ? verdictFilter : undefined,
      page: currentPage,
      size: pageSize,
      sort: sortParam,
    },
    { skip: scope !== "admin" }
  );

  const orgQuery = useGetOrgSecurityIncidentsQuery(
    {
      orgId,
      search: debouncedSearch || undefined,
      verdict: verdictFilter !== "ALL" ? verdictFilter : undefined,
      page: currentPage,
      size: pageSize,
      sort: sortParam,
    },
    { skip: scope !== "org" || !orgId }
  );

  const activeQuery = scope === "admin" ? adminQuery : orgQuery;
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery;

  // Fetch admin users to cross-reference real-time live account statuses (Active, Suspended, Removed, etc.)
  const { data: adminUsersData, refetch: refetchAdminUsers } = useGetAdminUsersQuery(
    { pageSize: 100 },
    { skip: scope !== "admin" }
  );

  const userStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    if (adminUsersData?.content) {
      for (const u of adminUsersData.content) {
        if (u.id) map.set(u.id, u.status);
        if (u.email) map.set(u.email.toLowerCase(), u.status);
        if (u.fullName) map.set(u.fullName.toLowerCase(), u.status);
        if (u.username) map.set(u.username.toLowerCase(), u.status);
      }
    }
    return map;
  }, [adminUsersData]);

  const incidents = useMemo(() => data?.content ?? [], [data]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Handle Sort Click (Strict allow-list)
  const handleSort = (column: IncidentSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    } else {
      setSortColumn(column);
      setSortDirection("DESC");
    }
    setCurrentPage(0);
  };

  const handleCopyHash = async (e: React.MouseEvent, hash: string, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHashId(id);
      toast.success("SHA-256 Hash copied to clipboard");
      setTimeout(() => setCopiedHashId(null), 2000);
    } catch {
      toast.error("Failed to copy hash");
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setVerdictFilter("ALL");
    setSortColumn("blockedAt");
    setSortDirection("DESC");
    setCurrentPage(0);
  };

  // Check for 403 permission error
  const isForbidden =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 403;

  const errorMessage =
    isError && typeof error === "object" && error !== null && "data" in error
      ? ((error as { data?: { message?: string } }).data?.message ??
        "You do not have permission to view security incidents.")
      : "Unable to load security incidents.";

  return (
    <div className={cn("space-y-5 w-full", className)}>
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-card/80 backdrop-blur-sm p-4 rounded-2xl border border-border ring-1 ring-foreground/5 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by researcher, email, filename, or SHA-256..."
            className="pl-9 pr-4 h-10 rounded-xl bg-background border-border text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Verdict Tabs & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Verdict Filter Pill Selector */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => {
                setVerdictFilter("ALL");
                setCurrentPage(0);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                verdictFilter === "ALL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Incidents
            </button>
            <button
              type="button"
              onClick={() => {
                setVerdictFilter("MALICIOUS");
                setCurrentPage(0);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                verdictFilter === "MALICIOUS"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 shadow-xs"
                  : "text-muted-foreground hover:text-red-500"
              )}
            >
              <ShieldAlert className="size-3.5 text-red-500" />
              <span>Malicious</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVerdictFilter("SUSPICIOUS");
                setCurrentPage(0);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                verdictFilter === "SUSPICIOUS"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs"
                  : "text-muted-foreground hover:text-amber-500"
              )}
            >
              <AlertTriangle className="size-3.5 text-amber-500" />
              <span>Suspicious</span>
            </button>
          </div>

          {/* Rows Per Page Selector */}
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="h-9 w-[110px] rounded-xl text-xs bg-background">
              <SelectValue placeholder="20 / page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-9 rounded-xl px-3 cursor-pointer"
            title="Refresh incidents"
          >
            <RotateCcw className={cn("size-3.5", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* 403 Forbidden State */}
      {isForbidden && (
        <Card className="p-8 rounded-2xl border-amber-500/30 bg-amber-500/5 text-center space-y-3">
          <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lock className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Security Incident Access Restricted
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {errorMessage}
          </p>
        </Card>
      )}

      {/* Table Container */}
      {!isForbidden && (
        <div className="rounded-2xl border border-border bg-card ring-1 ring-foreground/5 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("verdict")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span>Verdict</span>
                      {sortColumn === "verdict" ? (
                        sortDirection === "DESC" ? (
                          <ArrowDown className="size-3.5 text-primary" />
                        ) : (
                          <ArrowUp className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  </th>

                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("filename")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span>Blocked File & Hash</span>
                      {sortColumn === "filename" ? (
                        sortDirection === "DESC" ? (
                          <ArrowDown className="size-3.5 text-primary" />
                        ) : (
                          <ArrowUp className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  </th>

                  <th className="py-3.5 px-4 font-semibold">VirusTotal Engines</th>

                  <th className="py-3.5 px-4 font-semibold">Uploader / Researcher</th>

                  {scope === "admin" && (
                    <th className="py-3.5 px-4 font-semibold">Target Company</th>
                  )}

                  <th className="py-3.5 px-4 font-semibold">Report</th>

                  <th className="py-3.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("blockedAt")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span>Blocked Date</span>
                      {sortColumn === "blockedAt" ? (
                        sortDirection === "DESC" ? (
                          <ArrowDown className="size-3.5 text-primary" />
                        ) : (
                          <ArrowUp className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  </th>

                  <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Loading Skeletons */}
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-6 w-24 rounded-lg bg-muted" />
                      </td>
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="h-4 w-36 rounded bg-muted" />
                        <div className="h-3 w-28 rounded bg-muted/60" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 rounded bg-muted" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 rounded bg-muted" />
                      </td>
                      {scope === "admin" && (
                        <td className="py-4 px-4">
                          <div className="h-4 w-24 rounded bg-muted" />
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 rounded bg-muted" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 rounded bg-muted" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-8 w-20 rounded-xl bg-muted ml-auto" />
                      </td>
                    </tr>
                  ))}

                {/* Empty State */}
                {!isLoading && incidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={scope === "admin" ? 8 : 7}
                      className="py-12 px-4 text-center space-y-3"
                    >
                      <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Shield className="size-6" />
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        No security incidents recorded
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {debouncedSearch || verdictFilter !== "ALL"
                          ? "No incidents matched your current search and verdict filters."
                          : "No uploads have been refused by the VirusTotal security guard."}
                      </p>
                      {(debouncedSearch || verdictFilter !== "ALL") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="rounded-xl text-xs font-semibold mt-2 cursor-pointer"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </td>
                  </tr>
                )}

                {/* Incident Rows */}
                {!isLoading &&
                  incidents.map((item) => {
                    const isMalicious = item.verdict === "MALICIOUS";
                    const truncatedHash = `${item.sha256Hash.slice(0, 12)}...`;
                    const isCopied = copiedHashId === item.id;
                    const vtLookupUrl = `https://www.virustotal.com/gui/file/${item.sha256Hash}`;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedIncident(item)}
                        className="group hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        {/* Verdict Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 inline-flex items-center gap-1",
                              isMalicious
                                ? "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            )}
                          >
                            {isMalicious ? (
                              <ShieldAlert className="size-3 text-red-500" />
                            ) : (
                              <AlertTriangle className="size-3 text-amber-500" />
                            )}
                            <span>{item.verdict}</span>
                          </Badge>
                        </td>

                        {/* File Name, Size & Hash */}
                        <td className="py-3.5 px-4 min-w-[200px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <FileWarning
                                className={cn(
                                  "size-4 shrink-0",
                                  isMalicious
                                    ? "text-red-500"
                                    : "text-amber-500"
                                )}
                              />
                              <span className="font-semibold text-foreground text-sm truncate max-w-[220px]">
                                {item.filename}
                              </span>
                              <span className="text-xs text-muted-foreground font-normal shrink-0">
                                ({formatBytes(item.fileSizeBytes)})
                              </span>
                            </div>

                            {/* Truncated SHA-256 & Copy */}
                            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                              <span>SHA-256: {truncatedHash}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyHash(e, item.sha256Hash, item.id)}
                                title="Copy full SHA-256 hash"
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              >
                                {isCopied ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                              <a
                                href={vtLookupUrl}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                onClick={(e) => e.stopPropagation()}
                                title="Look up on VirusTotal"
                                className="p-1 rounded hover:bg-muted text-primary hover:text-primary/80 cursor-pointer transition-colors"
                              >
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Engines Count */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                              <span
                                className={
                                  isMalicious
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-amber-600 dark:text-amber-400"
                                }
                              >
                                {item.stats.malicious + item.stats.suspicious}
                              </span>
                              <span className="text-muted-foreground font-normal">
                                / {item.stats.total} engines
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {item.stats.malicious} malicious
                              {item.stats.suspicious > 0 && `, ${item.stats.suspicious} susp`}
                            </div>
                          </div>
                        </td>

                        {/* Uploader / Researcher */}
                        {(() => {
                          const uploaderStatus =
                            item.uploader.status ||
                            userStatusMap.get(item.uploader.id) ||
                            (item.uploader.email
                              ? userStatusMap.get(item.uploader.email.toLowerCase())
                              : undefined) ||
                            (item.uploader.username
                              ? userStatusMap.get(item.uploader.username.toLowerCase())
                              : undefined) ||
                            "ACTIVE";
                          const isSuspended = uploaderStatus.toUpperCase() === "SUSPENDED";

                          return (
                            <td className="py-3.5 px-4 min-w-[180px]">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.uploader.username ? (
                                    <Link
                                      href={`/profile/${item.uploader.username}`}
                                      onClick={(e) => e.stopPropagation()}
                                      target="_blank"
                                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                      <span>@{item.uploader.username}</span>
                                      <ArrowUpRight className="size-3" />
                                    </Link>
                                  ) : (
                                    <span className="font-mono text-muted-foreground">
                                      {item.uploader.id.slice(0, 8)}... (Deleted)
                                    </span>
                                  )}

                                  {/* Status badge */}
                                  {item.uploader.id && (
                                    <UserStatusBadge status={uploaderStatus} size="xs" />
                                  )}

                                  {scope === "admin" && item.uploader.id && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModerateTarget({
                                          user: { ...item.uploader, status: uploaderStatus },
                                          filename: item.filename,
                                          actionType: isSuspended ? "REINSTATE" : "SUSPEND",
                                        });
                                      }}
                                      title={
                                        isSuspended
                                          ? "Reinstate user account"
                                          : "Suspend user account"
                                      }
                                      className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                    >
                                      {isSuspended ? (
                                        <RotateCcw className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                      ) : (
                                        <UserX className="size-3.5 text-orange-600 dark:text-orange-400" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                {item.uploader.email && (
                                  <p className="text-muted-foreground truncate max-w-[170px]">
                                    {item.uploader.email}
                                  </p>
                                )}
                              </div>
                            </td>
                          );
                        })()}

                        {/* Target Organization (Admin only) */}
                        {scope === "admin" && (
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {item.organization ? (
                              <span className="font-medium text-foreground text-xs">
                                {item.organization.name || item.organization.id.slice(0, 8)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Platform
                              </span>
                            )}
                          </td>
                        )}

                        {/* Associated Report */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.reportId ? (
                            <Link
                              href={`/dashboard/report-management/${item.reportId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-primary hover:underline text-xs inline-flex items-center gap-1"
                            >
                              <span>#{item.reportId.slice(0, 8)}</span>
                              <ArrowUpRight className="size-3" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>

                        {/* Blocked Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(item.blockedAt)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIncident(item);
                              }}
                              className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                              title="Inspect Incident Details"
                            >
                              <Eye className="size-3.5" />
                              <span>Inspect</span>
                            </Button>

                            {scope === "admin" && item.uploader.id && (() => {
                              const uploaderStatus =
                                item.uploader.status ||
                                userStatusMap.get(item.uploader.id) ||
                                (item.uploader.email
                                  ? userStatusMap.get(item.uploader.email.toLowerCase())
                                  : undefined) ||
                                (item.uploader.username
                                  ? userStatusMap.get(item.uploader.username.toLowerCase())
                                  : undefined) ||
                                "ACTIVE";
                              const isSuspended = uploaderStatus.toUpperCase() === "SUSPENDED";

                              return (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center justify-center size-8 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs transition-colors"
                                    title="Moderate User"
                                  >
                                    <MoreVertical className="size-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-56 rounded-2xl shadow-xl border border-border bg-popover text-popover-foreground"
                                  >
                                    <div className="px-3 py-2 space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-foreground truncate">
                                          {item.uploader.username ? `@${item.uploader.username}` : item.uploader.id.slice(0, 8)}
                                        </span>
                                        <UserStatusBadge status={uploaderStatus} size="xs" />
                                      </div>
                                      {item.uploader.email && (
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {item.uploader.email}
                                        </p>
                                      )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    {isSuspended ? (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setModerateTarget({
                                            user: { ...item.uploader, status: uploaderStatus },
                                            filename: item.filename,
                                            actionType: "REINSTATE",
                                          });
                                        }}
                                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                      >
                                        <RotateCcw className="size-4 mr-2" />
                                        Reinstate Account
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setModerateTarget({
                                            user: { ...item.uploader, status: uploaderStatus },
                                            filename: item.filename,
                                            actionType: "SUSPEND",
                                          });
                                        }}
                                        className="text-xs font-semibold text-orange-600 dark:text-orange-400 cursor-pointer"
                                      >
                                        <UserX className="size-4 mr-2" />
                                        Suspend User
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModerateTarget({
                                          user: { ...item.uploader, status: uploaderStatus },
                                          filename: item.filename,
                                          actionType: "BAN",
                                        });
                                      }}
                                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 cursor-pointer"
                                    >
                                      <Ban className="size-4 mr-2" />
                                      Permanently Ban User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModerateTarget({
                                          user: { ...item.uploader, status: uploaderStatus },
                                          filename: item.filename,
                                          actionType: "WARN",
                                        });
                                      }}
                                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer"
                                    >
                                      <ShieldAlert className="size-4 mr-2" />
                                      Issue Security Warning
                                    </DropdownMenuItem>
                                    {item.uploader.username && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/profile/${item.uploader.username}`, "_blank");
                                          }}
                                          className="text-xs font-medium text-foreground cursor-pointer"
                                        >
                                          <User className="size-4 mr-2 text-muted-foreground" />
                                          View Profile
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              <div>
                Showing page <span className="font-semibold text-foreground">{currentPage + 1}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({totalElements} total incidents)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || isFetching}
                  className="h-8 px-3 rounded-xl text-xs cursor-pointer"
                >
                  <ChevronLeft className="size-3.5 mr-1" />
                  <span>Previous</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1 || isFetching}
                  className="h-8 px-3 rounded-xl text-xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incident Detail Inspection Modal */}
      <SecurityIncidentDetailModal
        incident={selectedIncident}
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
        scope={scope}
        uploaderStatus={
          selectedIncident
            ? selectedIncident.uploader.status ||
              userStatusMap.get(selectedIncident.uploader.id) ||
              (selectedIncident.uploader.email
                ? userStatusMap.get(selectedIncident.uploader.email.toLowerCase())
                : undefined) ||
              (selectedIncident.uploader.username
                ? userStatusMap.get(selectedIncident.uploader.username.toLowerCase())
                : undefined) ||
              "ACTIVE"
            : undefined
        }
        onModerateUser={(user, actionType) => {
          setModerateTarget({
            user,
            filename: selectedIncident?.filename,
            actionType,
          });
        }}
      />

      {/* Admin Moderation Action Dialog for Uploader / Researcher */}
      {scope === "admin" && (
        <ModerationActionDialog
          target={
            moderateTarget
              ? {
                  id: moderateTarget.user.id,
                  name: moderateTarget.user.username
                    ? `@${moderateTarget.user.username}`
                    : `User (${moderateTarget.user.id.slice(0, 8)})`,
                  subtitle:
                    moderateTarget.user.email ||
                    (moderateTarget.filename
                      ? `Blocked upload: ${moderateTarget.filename}`
                      : undefined),
                  type: "USER",
                  status: moderateTarget.user.status || undefined,
                }
              : null
          }
          actionType={moderateTarget?.actionType ?? "SUSPEND"}
          isOpen={!!moderateTarget}
          onClose={() => setModerateTarget(null)}
          onSuccess={() => {
            void refetch();
            void refetchAdminUsers();
          }}
        />
      )}
    </div>
  );
}
