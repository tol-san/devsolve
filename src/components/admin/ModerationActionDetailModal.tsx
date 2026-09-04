"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetModerationActionByIdQuery } from "@/lib/redux/services/admin/moderationActionsApi";
import { ShieldAlert, User, Calendar, Clock, AlertTriangle, Loader2 } from "lucide-react";
import type { ModerationActionType } from "@/lib/types/admin/types";

interface ModerationActionDetailModalProps {
  actionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModerationActionDetailModal({
  actionId,
  isOpen,
  onClose,
}: ModerationActionDetailModalProps) {
  const { data: actionDetail, isLoading, isError } = useGetModerationActionByIdQuery(
    { actionId: actionId || "" },
    { skip: !actionId || !isOpen }
  );

  if (!isOpen || !actionId) return null;

  const getActionBadge = (actionType?: ModerationActionType) => {
    switch (actionType) {
      case "WARN":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">WARN</Badge>;
      case "SUSPEND":
        return <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30">SUSPEND</Badge>;
      case "REMOVE":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">REMOVE</Badge>;
      case "BAN":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30">BAN</Badge>;
      case "REINSTATE":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">REINSTATE</Badge>;
      default:
        return <Badge variant="outline">{actionType}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="size-5 text-blue-600 dark:text-blue-400" />
              Moderation Action Details
            </DialogTitle>
            {actionDetail && getActionBadge(actionDetail.action)}
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Action ID: <code className="font-mono text-slate-700 dark:text-slate-300">{actionId}</code>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="size-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading action details...</p>
          </div>
        ) : isError || !actionDetail ? (
          <div className="p-6 text-center space-y-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
            <AlertTriangle className="size-6 mx-auto" />
            <p className="text-sm font-semibold">Failed to load moderation action details.</p>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <User className="size-3.5" /> Admin Name
                </span>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {actionDetail.adminName || actionDetail.adminId || "System Admin"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Target Entity</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {actionDetail.targetType}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-xs font-semibold text-slate-400">Target ID</span>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                  {actionDetail.targetId}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Reason / Rationale
              </span>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                {actionDetail.reason || "No explicit reason documented."}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> Created:{" "}
                {new Date(actionDetail.createdAt).toLocaleString()}
              </span>
              {actionDetail.expiresAt && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Clock className="size-3.5" /> Expires:{" "}
                  {new Date(actionDetail.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-9 text-xs font-semibold border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
