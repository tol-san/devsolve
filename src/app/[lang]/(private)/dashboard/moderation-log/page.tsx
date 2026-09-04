"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  ShieldAlert,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetModerationHistoryQuery } from "@/lib/redux/services/admin/moderationActionsApi";
import type {
  ModerationActionType,
  ModerationActionTargetType,
} from "@/lib/types/admin/types";

export default function ModerationLogPage() {
  const [targetType, setTargetType] = useState<ModerationActionTargetType | "ALL">("ALL");
  const [actionType, setActionType] = useState<ModerationActionType | "ALL">("ALL");
  const [searchTargetId, setSearchTargetId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useGetModerationHistoryQuery({
    targetType: targetType === "ALL" ? undefined : targetType,
    action: actionType === "ALL" ? undefined : actionType,
    targetId: searchTargetId.trim() ? searchTargetId.trim() : undefined,
    pageNumber: currentPage - 1,
    pageSize,
  });

  const historyItems = data?.content ?? [];
  const totalElements = data?.totalElements ?? historyItems.length;
  const totalPages = Math.max(1, data?.totalPages ?? Math.ceil(totalElements / pageSize));

  const handleReset = () => {
    setTargetType("ALL");
    setActionType("ALL");
    setSearchTargetId("");
    setCurrentPage(1);
  };

  const getActionBadge = (action: ModerationActionType) => {
    switch (action) {
      case "WARN":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold">
            WARN
          </Badge>
        );
      case "SUSPEND":
        return (
          <Badge className="bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 text-xs font-bold">
            SUSPEND
          </Badge>
        );
      case "REMOVE":
        return (
          <Badge className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold">
            REMOVE
          </Badge>
        );
      case "BAN":
        return (
          <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold">
            BAN
          </Badge>
        );
      case "REINSTATE":
        return (
          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
            REINSTATE
          </Badge>
        );
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
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
              Moderation Log
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Moderation Actions Log
            </h1>
            <Badge className="bg-purple-600 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
              <History className="size-3" />
              Audit Log
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Platform-wide immutable audit trail of administrative moderation actions, warnings, and bans.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer shrink-0"
        >
          <RotateCcw className="size-3.5 mr-1.5" /> Refresh Audit Trail
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Type
            </label>
            <div className="w-36">
              <Select
                value={targetType}
                onValueChange={(val: string | null) => {
                  if (val) {
                    setTargetType(val as ModerationActionTargetType | "ALL");
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <SelectValue placeholder="Target Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Targets</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="PROBLEM">Problem</SelectItem>
                  <SelectItem value="SOLUTION">Solution</SelectItem>
                  <SelectItem value="COMMENT">Comment</SelectItem>
                  <SelectItem value="SHOWCASE">Showcase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Action Type
            </label>
            <div className="w-36">
              <Select
                value={actionType}
                onValueChange={(val: string | null) => {
                  if (val) {
                    setActionType(val as ModerationActionType | "ALL");
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="SUSPEND">SUSPEND</SelectItem>
                  <SelectItem value="REMOVE">REMOVE</SelectItem>
                  <SelectItem value="BAN">BAN</SelectItem>
                  <SelectItem value="REINSTATE">REINSTATE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1 flex-1 sm:w-52">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
              <Input
                value={searchTargetId}
                onChange={(e) => {
                  setSearchTargetId(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by target UUID..."
                className="h-8 pl-8 pr-3 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {(targetType !== "ALL" || actionType !== "ALL" || searchTargetId.trim() !== "") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer self-end lg:self-center"
          >
            <RotateCcw className="size-3 mr-1" /> Reset Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-2xs">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="size-6 text-purple-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Moderation Logs Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No historical moderation records match your current filter parameters.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
            <Table className="text-foreground">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 px-4">Action</TableHead>
                  <TableHead className="py-3.5 px-4">
                    Target Type &amp; ID
                  </TableHead>
                  <TableHead className="py-3.5 px-4">Reason / Note</TableHead>
                  <TableHead className="py-3.5 px-4">Executed By</TableHead>
                  <TableHead className="py-3.5 px-4">Timestamp</TableHead>
                  <TableHead className="py-3.5 px-4">Expires At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-4 px-4">
                      {getActionBadge(item.action as ModerationActionType)}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="space-y-0.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase tracking-wider"
                        >
                          {item.targetType}
                        </Badge>
                        <p className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                          {item.targetId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 max-w-xs whitespace-normal">
                      <p className="text-xs text-foreground font-medium leading-relaxed line-clamp-2">
                        {item.reason || "No reason provided."}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <User className="size-3.5 text-muted-foreground" />
                        {item.adminName || item.adminId || "System Admin"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Recent"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-xs text-muted-foreground">
                      {item.expiresAt ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {new Date(item.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <div className="w-20">
                <Select
                  value={String(pageSize)}
                  onValueChange={(val: string | null) => {
                    if (val) {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="ml-2">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalElements)} of {totalElements} items
              </span>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <ChevronLeft className="size-4 mr-1" /> Previous
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
