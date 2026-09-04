"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  User,
  Calendar,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { useGetFlagDetailQuery } from "@/lib/redux/services/admin/moderationApi";

interface FlagDetailSheetProps {
  flagId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (id: string, action: "DISMISS" | "WARN" | "REMOVE") => void;
}

export function FlagDetailSheet({
  flagId,
  isOpen,
  onClose,
  onAction,
}: FlagDetailSheetProps) {
  const { data: detail, isLoading, isError } = useGetFlagDetailQuery(
    flagId ?? "",
    { skip: !flagId || !isOpen }
  );

  if (!isOpen || !flagId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-card border border-border text-card-foreground p-6 shadow-xl space-y-4">
        <DialogHeader className="space-y-2 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs flex items-center gap-1">
              <Flag className="size-3" />
              Content Flag Detail
            </Badge>
            {detail?.status && (
              <Badge variant="outline" className="text-xs font-semibold border-border">
                {detail.status}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Flag ID: #{flagId.slice(0, 8)}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Detailed inspection of community content report.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse py-4">
            <div className="h-16 bg-muted/60 rounded-xl" />
            <div className="h-24 bg-muted/60 rounded-xl" />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            Unable to load flag details from the server.
          </div>
        ) : detail ? (
          <div className="space-y-4 text-xs text-foreground">
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Reason
                </span>
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs">
                  {detail.reason}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Flaggable Type
                </span>
                <span className="font-semibold text-foreground">
                  {detail.flaggableType}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Flaggable ID
                </span>
                <span className="font-mono text-muted-foreground">
                  {detail.flaggableId}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <User className="size-3.5 text-muted-foreground" />
                  Reporter
                </span>
                <span className="font-medium text-muted-foreground">
                  {detail.reporterName || detail.reporterId || "Anonymous"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Reported At
                </span>
                <span className="text-muted-foreground">
                  {detail.createdAt
                    ? new Date(detail.createdAt).toLocaleString()
                    : "Recent"}
                </span>
              </div>
            </div>

            {detail.description && (
              <div className="space-y-1.5 p-4 rounded-xl bg-card border border-border">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <FileText className="size-3" /> Description / Note
                </span>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {detail.description}
                </p>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="pt-2 border-t border-border flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onAction(flagId, "DISMISS");
              onClose();
            }}
            className="flex-1 rounded-xl text-xs font-bold border-border bg-card text-foreground cursor-pointer hover:bg-muted"
          >
            <XCircle className="size-3.5 mr-1 text-muted-foreground" />
            Dismiss
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onAction(flagId, "WARN");
              onClose();
            }}
            className="flex-1 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
          >
            <AlertTriangle className="size-3.5 mr-1" />
            Warn Author
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onAction(flagId, "REMOVE");
              onClose();
            }}
            className="flex-1 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            <ShieldAlert className="size-3.5 mr-1" />
            Remove Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

