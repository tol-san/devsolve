"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, FileText, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const profileIdentifier =
    record.researcherUsername ||
    record.username ||
    record.researcherId;
  const profileHref = profileIdentifier
    ? `/profile/${encodeURIComponent(profileIdentifier)}`
    : null;

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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary transition-colors max-w-full"
                    title={`View ${who}'s public profile`}
                  >
                    <span className="truncate group-hover:underline">{who}</span>
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors opacity-70 group-hover:opacity-100 shrink-0" />
                  </Link>
                ) : (
                  <p className="text-sm font-bold text-foreground truncate">
                    {who}
                  </p>
                )}
                {record.researcherEmail && (
                  <p className="text-xs text-muted-foreground truncate">
                    {record.researcherEmail}
                  </p>
                )}
              </div>
            </div>

            {profileHref && (
              <Link
                href={profileHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 gap-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer hover:text-primary",
                )}
                title="Open researcher profile in a new tab"
              >
                <span>View profile</span>
                <ExternalLink className="size-3" />
              </Link>
            )}
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
