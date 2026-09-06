"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock3, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RequestAccessDialog } from "@/components/researchers/RequestAccessDialog";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import {
  canRequestAccess,
  requestActionLabel,
} from "@/lib/researchers/access";
import { useGetMyOrganizationAccessQuery } from "@/lib/redux/services/researcherAccessApi";
import type { ProgramReportingAccess } from "@/lib/validations/researcher-access";

export function ReportingAccessNotice({
  access,
  isLoading,
  blockedMessage,
  className,
  isPrivate,
}: {
  access?: ProgramReportingAccess;
  isLoading?: boolean;
  blockedMessage?: string | null;
  className?: string;
  isPrivate?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);
  const panel = useRef<HTMLElement | null>(null);

  const decided = access?.status === "REJECTED" || access?.status === "REVOKED";
  const { data: record } = useGetMyOrganizationAccessQuery(
    access?.organizationId ?? "",
    { skip: !decided || !access?.organizationId },
  );

  useEffect(() => {
    if (blockedMessage) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [blockedMessage]);

  if (isLoading) return null;

  if (!access && !blockedMessage) return null;

  const status = access?.status ?? null;
  if (access?.canSubmitReports && !blockedMessage) return null;

  const explanation = blockedMessage?.trim() || access?.reason?.trim() || null;
  const reviewNote = decided ? record?.reviewNote?.trim() || null : null;

  const organizationId = access?.organizationId;
  const actionLabel = organizationId ? requestActionLabel(status) : null;

  return (
    <>
      <section
        ref={panel}
        aria-live="polite"
        className={`space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10 ${className ?? ""}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            {isPrivate ? <Lock className="size-5" /> : <ShieldCheck className="size-5" />}
          </span>
          <p className="text-base font-bold tracking-tight text-amber-900 dark:text-amber-200">
            {isPrivate
              ? "Private Program Reporting Authorization"
              : `${access?.organizationName?.trim() || "This organization"} reviews who can report to it`}
          </p>
          {!isPrivate && <ResearcherAccessBadge status={status} className="ml-auto" />}
        </div>

        {explanation && (
          <p className="text-sm leading-relaxed font-medium text-amber-900 dark:text-amber-200">
            {explanation}
          </p>
        )}

        {reviewNote && (
          <div className="rounded-xl border border-amber-200 bg-card p-3.5 dark:border-amber-500/30">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Their note
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {reviewNote}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {isPrivate ? (
            blockedMessage?.includes("Accept your invitation") ? (
              <Link href="/dashboard/program-invitations">
                <Button
                  type="button"
                  className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
                >
                  Review Invitations
                </Button>
              </Link>
            ) : null
          ) : actionLabel && canRequestAccess(status) ? (
            <Button
              type="button"
              onClick={() => {
                setSession((n) => n + 1);
                setDialogOpen(true);
              }}
              className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
            >
              {actionLabel}
            </Button>
          ) : (
            status === "PENDING" && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <Clock3 aria-hidden className="size-4" />
                Waiting on their review
              </span>
            )
          )}
          <span className="text-sm font-medium text-amber-800/90 dark:text-amber-200/80">
            Your draft keeps saving either way.
          </span>
        </div>
      </section>

      {organizationId && (
        <RequestAccessDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          organizationId={organizationId}
          organizationName={access?.organizationName}
          session={session}
        />
      )}
    </>
  );
}

export default ReportingAccessNotice;
