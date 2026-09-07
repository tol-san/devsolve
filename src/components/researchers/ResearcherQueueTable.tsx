"use client";

import React, { useState } from "react";
import { Eye, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MotivationPreviewDialog } from "@/components/researchers/MotivationPreviewDialog";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import { ReviewDecisionDialog } from "@/components/researchers/ReviewDecisionDialog";
import { formatDateTime } from "@/lib/format/datetime";
import { allowedDecisions, DECISION_LABEL } from "@/lib/researchers/access";
import type {
  ResearcherAccessRecord,
  ReviewDecision,
} from "@/lib/validations/researcher-access";

export function ResearcherQueueTable({
  organizationId,
  records,
  hasFilter,
}: {
  organizationId: string;
  records: ResearcherAccessRecord[];
  hasFilter: boolean;
}) {
  const [pending, setPending] = useState<{
    record: ResearcherAccessRecord;
    decision: ReviewDecision;
  } | null>(null);
  const [previewRecord, setPreviewRecord] =
    useState<ResearcherAccessRecord | null>(null);

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Users className="size-6" />
        </span>
        <p className="text-base font-semibold text-foreground">
          {hasFilter ? "Nothing in that state" : "No researchers yet"}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasFilter
            ? "Switch tabs to see the rest of the queue."
            : "Researchers who want to report to your programs ask here first. You can also approve someone outright if you already know them."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table className="min-w-4xl">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 sm:px-6">Researcher</TableHead>
              <TableHead className="px-4 py-3 sm:px-6">
                Why they want in
              </TableHead>
              <TableHead className="px-4 py-3 sm:px-6">Requested</TableHead>
              <TableHead className="px-4 py-3 sm:px-6">Status</TableHead>
              <TableHead className="px-4 py-3 text-right sm:px-6">
                Decision
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const decisions = allowedDecisions(record.status);
              const reviewed =
                record.status !== "PENDING" ? record.reviewNote?.trim() : "";

              return (
                <TableRow key={record.id} className="align-top">
                  <TableCell className="px-4 py-4 whitespace-normal sm:px-6">
                    <p className="text-sm font-bold text-foreground">
                      {record.researcherName?.trim() || "Unnamed researcher"}
                    </p>
                    {record.researcherEmail && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {record.researcherEmail}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="max-w-xs sm:max-w-sm px-4 py-4 whitespace-normal sm:px-6">
                    {record.motivation?.trim() ? (
                      <div className="space-y-1.5">
                        <p
                          onClick={() => setPreviewRecord(record)}
                          className="text-sm leading-snug text-foreground/90 line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
                          title="Click to read full request"
                        >
                          {record.motivation.trim()}
                        </p>
                        {(record.motivation.trim().length > 80 ||
                          record.motivation.includes("\n")) && (
                          <button
                            type="button"
                            onClick={() => setPreviewRecord(record)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer group select-none"
                          >
                            <Eye className="size-3.5 transition-transform group-hover:scale-110" />
                            <span>View full request</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Approved without a request
                      </span>
                    )}
                    {reviewed && (
                      <p
                        className="mt-1.5 text-xs text-muted-foreground line-clamp-1"
                        title={reviewed}
                      >
                        <span className="font-semibold text-foreground/80">
                          Your note:
                        </span>{" "}
                        {reviewed}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-muted-foreground sm:px-6">
                    {formatDateTime(record.requestedAt ?? record.createdAt)}
                    {record.reviewedAt && (
                      <span className="mt-0.5 block text-xs">
                        Reviewed {formatDateTime(record.reviewedAt)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-4 sm:px-6">
                    <ResearcherAccessBadge status={record.status} />
                  </TableCell>

                  <TableCell className="px-4 py-4 sm:px-6">
                    <div className="flex justify-end gap-2">
                      {decisions.map((decision) => (
                        <Button
                          key={decision}
                          type="button"
                          size="sm"
                          variant={
                            decision === "APPROVE" ? "default" : "outline"
                          }
                          onClick={() => setPending({ record, decision })}
                          className="cursor-pointer rounded-xl"
                        >
                          {DECISION_LABEL[decision]}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ReviewDecisionDialog
        organizationId={organizationId}
        record={pending?.record ?? null}
        decision={pending?.decision ?? null}
        onClose={() => setPending(null)}
      />

      <MotivationPreviewDialog
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
        onDecision={(record, decision) => {
          setPreviewRecord(null);
          setPending({ record, decision });
        }}
      />
    </>
  );
}

export default ResearcherQueueTable;
