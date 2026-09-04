"use client";

export const dynamic = "force-dynamic";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
  BellOff,
  BellRing,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Gift,
  Inbox,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Square,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/redux/services/notificationsApi";
import { NotificationItemCard } from "@/components/notifications/NotificationItemCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { cn } from "@/lib/utils";

type CategoryFilter =
  | "ALL"
  | "SECURITY"
  | "REWARDS"
  | "COMMUNITY"
  | "TEAM"
  | "SYSTEM";

type SortOrder = "NEWEST" | "OLDEST";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("NEWEST");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const { user } = useSidebarAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const shouldFetch = Boolean(user);

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !shouldFetch,
  });

  const { data, isLoading, isFetching, isError, refetch } =
    useGetNotificationsQuery(
      {
        pageNumber,
        pageSize,
        unreadOnly,
      },
      {
        skip: !shouldFetch,
      },
    );

  const [markSingleRead] = useMarkAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
      setSelectedIds([]);
      refetch();
    } catch {
      toast.error("Failed to mark all as read. Please try again.");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markSingleRead(id).unwrap();
    } catch {
      // Handled by RTK Query
    }
  };

  const allNotifications = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const isFirstPage = data?.first ?? true;
  const isLastPage = data?.last ?? true;
  const unreadCount = unreadData?.unreadCount ?? 0;

  const filteredNotifications = useMemo(() => {
    const list = allNotifications.filter((item) => {
      if (activeCategory === "SECURITY") {
        if (
          item.notifiableType !== "REPORT" &&
          item.notifiableType !== "SECURITY" &&
          item.notifiableType !== "DISPUTE"
        ) {
          return false;
        }
      } else if (activeCategory === "REWARDS") {
        if (
          item.notifiableType !== "REWARD" &&
          item.notifiableType !== "RECOGNITION"
        ) {
          return false;
        }
      } else if (activeCategory === "COMMUNITY") {
        if (
          item.notifiableType !== "COMMENT" &&
          item.notifiableType !== "PROBLEM" &&
          item.notifiableType !== "SOLUTION" &&
          item.notifiableType !== "SHOWCASE" &&
          item.notifiableType !== "USER"
        ) {
          return false;
        }
      } else if (activeCategory === "TEAM") {
        if (
          item.notifiableType !== "ORGANIZATION" &&
          item.notifiableType !== "PROGRAM" &&
          item.notifiableType !== "INVITATION"
        ) {
          return false;
        }
      } else if (activeCategory === "SYSTEM") {
        if (item.notifiableType !== "KYC") {
          return false;
        }
      }

      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesContent = item.content?.toLowerCase().includes(query);
        const matchesAuthor =
          item.authorName?.toLowerCase().includes(query) ||
          item.authorUsername?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });

    if (sortOrder === "OLDEST") {
      return [...list].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return list;
  }, [allNotifications, activeCategory, searchTerm, sortOrder]);

  const securityCount = allNotifications.filter(
    (n) =>
      n.notifiableType === "REPORT" ||
      n.notifiableType === "SECURITY" ||
      n.notifiableType === "DISPUTE",
  ).length;

  const rewardsCount = allNotifications.filter(
    (n) =>
      n.notifiableType === "REWARD" || n.notifiableType === "RECOGNITION",
  ).length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredNotifications
      .map((n) => n.id)
      .filter(Boolean) as string[];

    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => markSingleRead(id).unwrap()));
      toast.success(`${selectedIds.length} notification(s) marked as read`);
      setSelectedIds([]);
      refetch();
    } catch {
      toast.error("Failed to mark selected as read.");
    }
  };

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    unreadOnly ||
    activeCategory !== "ALL" ||
    sortOrder !== "NEWEST";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 min-w-0"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground min-w-0">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <span className="text-muted-foreground/60">&gt;</span>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground/60">&gt;</span>
            <span className="font-semibold text-foreground">Notifications</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shrink-0">
              <Bell className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Notifications Center
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            Manage your vulnerability updates, bounty payout alerts, team
            invitations, and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 rounded-xl border-border bg-card hover:bg-muted font-semibold text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || totalElements === 0}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCheck className="size-4" />
            <span>Mark All as Read</span>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 min-w-0">
        <Card
          onClick={() => {
            setActiveCategory("ALL");
            setUnreadOnly(false);
          }}
          className={cn(
            "rounded-2xl border bg-card p-4 sm:p-5 text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
            activeCategory === "ALL" && !unreadOnly && "ring-2 ring-blue-500 bg-blue-500/5",
          )}
        >
          <CardContent className="p-0 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate block">
                Total Inbound
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                {totalElements}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                All inbox messages
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shrink-0">
              <Inbox className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setUnreadOnly(true);
            setPageNumber(0);
          }}
          className={cn(
            "rounded-2xl border bg-card p-4 sm:p-5 text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
            unreadOnly && "ring-2 ring-rose-500 bg-rose-500/5",
          )}
        >
          <CardContent className="p-0 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate block">
                Unread Alerts
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                {unreadCount}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Requires your review
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 shrink-0">
              <BellRing className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveCategory("REWARDS");
            setUnreadOnly(false);
          }}
          className={cn(
            "rounded-2xl border bg-card p-4 sm:p-5 text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
            activeCategory === "REWARDS" && "ring-2 ring-emerald-500 bg-emerald-500/5",
          )}
        >
          <CardContent className="p-0 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate block">
                Bounties & Rewards
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {rewardsCount}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Dispatched payouts
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shrink-0">
              <Gift className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveCategory("SECURITY");
            setUnreadOnly(false);
          }}
          className={cn(
            "rounded-2xl border bg-card p-4 sm:p-5 text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
            activeCategory === "SECURITY" && "ring-2 ring-amber-500 bg-amber-500/5",
          )}
        >
          <CardContent className="p-0 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate block">
                Security & Reports
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                {securityCount}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Disclosures & triage
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shrink-0">
              <ShieldAlert className="size-6" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notifications by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 bg-card text-foreground font-medium text-sm h-10 rounded-xl"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setUnreadOnly(false);
                  setPageNumber(0);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer",
                  !unreadOnly
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnreadOnly(true);
                  setPageNumber(0);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                  unreadOnly
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="size-2 rounded-full bg-rose-500 inline-block" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Select
                value={sortOrder}
                onValueChange={(val) => setSortOrder(val as SortOrder)}
              >
                <SelectTrigger className="w-[124px] h-9 text-xs rounded-xl bg-card">
                  <SelectValue placeholder="Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWEST">Newest First</SelectItem>
                  <SelectItem value="OLDEST">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPageNumber(0);
                }}
              >
                <SelectTrigger className="w-[84px] h-9 text-xs rounded-xl bg-card">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant={isBatchMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setIsBatchMode((prev) => !prev);
                setSelectedIds([]);
              }}
              className="h-9 px-3 text-xs rounded-xl gap-1.5 cursor-pointer"
            >
              {isBatchMode ? (
                <CheckSquare className="size-3.5 text-primary" />
              ) : (
                <Square className="size-3.5 text-muted-foreground" />
              )}
              <span>{isBatchMode ? "Exit Select" : "Select"}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-border/60">
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: "All Categories", icon: Sparkles },
              { id: "SECURITY", label: "Security & Reports", icon: ShieldAlert },
              { id: "REWARDS", label: "Bounties & Rewards", icon: Gift },
              { id: "COMMUNITY", label: "Discussions & Comments", icon: MessageSquare },
              { id: "TEAM", label: "Teams & Organizations", icon: Users },
              { id: "SYSTEM", label: "Verification & KYC", icon: AlertTriangle },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as CategoryFilter)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setUnreadOnly(false);
                setActiveCategory("ALL");
                setSortOrder("NEWEST");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline whitespace-nowrap px-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {isBatchMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-4 p-3.5 sm:px-5 rounded-2xl bg-card border border-primary/30 ring-1 ring-primary/20 shadow-md text-xs sm:text-sm font-medium"
          >
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllVisible}
                className="h-8 px-3 rounded-lg text-xs font-semibold"
              >
                {selectedIds.length === filteredNotifications.length &&
                filteredNotifications.length > 0
                  ? "Deselect All"
                  : "Select All Visible"}
              </Button>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{selectedIds.length}</strong> selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleMarkSelectedAsRead}
                disabled={selectedIds.length === 0}
                className="h-8 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs gap-1.5"
              >
                <Check className="size-3.5" />
                <span>Mark Selected Read</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-3">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs"
              >
                <div className="size-11 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-muted rounded-md w-1/4" />
                  <div className="h-5 bg-muted rounded-md w-3/4" />
                  <div className="h-4 bg-muted rounded-md w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
            <h3 className="text-xl font-bold text-foreground">
              Failed to load notifications
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              We couldn&apos;t fetch your inbox. Please verify your connection and
              try again.
            </p>
            <Button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-10 px-5 cursor-pointer shadow-xs"
            >
              Retry
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs space-y-3">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground ring-1 ring-border shadow-inner">
              <BellOff className="size-7 opacity-70" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-foreground">
                No notifications found
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {searchTerm
                  ? `No notifications matched "${searchTerm}". Try adjusting your search query.`
                  : unreadOnly
                  ? "You have caught up with all your unread notifications!"
                  : activeCategory !== "ALL"
                  ? "No notifications found in this category."
                  : "Your notifications inbox is completely clear."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setUnreadOnly(false);
                  setActiveCategory("ALL");
                  setSortOrder("NEWEST");
                }}
                className="rounded-xl border-border bg-card hover:bg-muted text-xs font-semibold cursor-pointer"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item, index) => (
              <NotificationItemCard
                key={item.id ?? `notification-full-${index}`}
                item={item}
                isAdmin={isAdmin}
                onMarkRead={handleMarkSingleRead}
                isSelected={Boolean(item.id && selectedIds.includes(item.id))}
                onToggleSelect={handleToggleSelect}
                showCheckbox={isBatchMode}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-card border border-border p-4 shadow-xs">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Showing page <strong className="text-foreground">{pageNumber + 1}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong> ({totalElements} total items)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFirstPage}
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
                className="rounded-xl border-border bg-card hover:bg-muted text-xs font-semibold h-9 px-3 gap-1 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>Previous</span>
              </Button>

              <span className="px-3 py-1 text-xs font-bold bg-muted rounded-lg border border-border text-foreground">
                {pageNumber + 1}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLastPage}
                onClick={() => setPageNumber((prev) => prev + 1)}
                className="rounded-xl border-border bg-card hover:bg-muted text-xs font-semibold h-9 px-3 gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </motion.section>
  );
}
