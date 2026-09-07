"use client";

import React from "react";
import { FileText, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import { formatDateTime } from "@/lib/format/datetime";
import { allowedDecisions, DECISION_LABEL } from "@/lib/researchers/access";
import type {
  ResearcherAccessRecord,
  ReviewDecision,
} from "@/lib/validations/researcher-access";

interface MotivationPreviewDialogProps {
  record: ResearcherAccessRecord | null;
  onClose: () => void;
  onDecision?: (record: ResearcherAccessRecord, decision: ReviewDecision) => void;
}

export function MotivationPreviewDialog({
  record,
  onClose,
  onDecision,
}: MotivationPreviewDialogProps) {
  if (!record) return null;

  const decisions = allowedDecisions(record.status);
  const reviewed =
    record.status !== "PENDING" ? record.reviewNote?.trim() : "";
  const who =
    record.researcherName?.trim() ||
    record.researcherEmail?.trim() ||
    "Researcher";

  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shrink-0 shadow-2xs">
                <FileText className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  Why they want access
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Requested on {formatDateTime(record.requestedAt ?? record.createdAt)}
                </DialogDescription>
              </div>
            </div>
            <ResearcherAccessBadge status={record.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Researcher details card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
              <User className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {who}
              </p>
              {record.researcherEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  {record.researcherEmail}
                </p>
              )}
            </div>
          </div>

          {/* Full motivation statement */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Motivation Statement
            </span>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground shadow-2xs">
              {record.motivation?.trim() || (
                <span className="italic text-muted-foreground">
                  Approved without a request statement.
                </span>
              )}
            </div>
          </div>

          {/* Optional review note if already reviewed */}
          {reviewed && (
            <div className="space-y-1 rounded-xl border border-border/80 bg-muted/30 p-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Review Note
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                {reviewed}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer rounded-xl h-10 text-xs font-semibold"
          >
            Close
          </Button>

          {onDecision && decisions.length > 0 && (
            <div className="flex items-center gap-2">
              {decisions.map((decision) => (
                <Button
                  key={decision}
                  type="button"
                  size="sm"
                  variant={
                    decision === "APPROVE"
                      ? "default"
                      : decision === "REVOKE"
                      ? "destructive"
                      : "outline"
                  }
                  onClick={() => onDecision(record, decision)}
                  className="cursor-pointer rounded-xl h-10 text-xs font-semibold"
                >
                  {DECISION_LABEL[decision]}
                </Button>
              ))}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MotivationPreviewDialog;
