"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RequestAccessDialog } from "@/components/researchers/RequestAccessDialog";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import {
  canRequestAccess,
  requestActionLabel,
} from "@/lib/researchers/access";
import { useGetMyOrganizationAccessQuery } from "@/lib/redux/services/researcherAccessApi";
import type { ProgramReportingAccess } from "@/lib/validations/researcher-access";

/**
 * Why the submit button is off, and the one thing that can turn it on.
 *
 * The wording is the backend's, not this component's — from the pre-check
 * before a word is written, or verbatim from the 403 if the reporter got as
 * far as pressing Submit. Either names the company and says what happens
 * next, which is more than anything invented here could say.
 */
export function ReportingAccessNotice({
  access,
  isLoading,
  /** The verbatim `message` from a 403 the reporter has already hit. */
  blockedMessage,
  className,
}: {
  access?: ProgramReportingAccess;
  isLoading?: boolean;
  blockedMessage?: string | null;
  className?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);
  const panel = useRef<HTMLElement | null>(null);

  /* The eligibility answer says whether and why, but carries no review note —
     that lives on the access record. Read only when there is a decision to
     explain, so an approved reporter never pays for the request. */
  const decided = access?.status === "REJECTED" || access?.status === "REVOKED";
  const { data: record } = useGetMyOrganizationAccessQuery(
    access?.organizationId ?? "",
    { skip: !decided || !access?.organizationId },
  );

  /* A 403 arrives from a button at the bottom of a long form, and this panel
     sits at the top of it — so the refusal would land off screen with nothing
     to show for the click. Announced by `aria-live` either way; this is for
     the readers who are looking. */
  useEffect(() => {
    if (blockedMessage) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [blockedMessage]);

  /* No placeholder while the check is in flight. Most reporters are cleared
     and this renders nothing for them, so a skeleton would be a banner that
     appears on every load and then admits it had nothing to say. */
  if (isLoading) return null;

  /* Nothing to say when the pre-check is unavailable and nothing has been
     refused — the form behaves as it always did, and a 403 at submit is still
     relayed in full. Claiming "we could not check" would stop a reporter who
     is in fact approved. */
  if (!access && !blockedMessage) return null;

  const status = access?.status ?? null;
  if (access?.canSubmitReports && !blockedMessage) return null;

  const explanation = blockedMessage?.trim() || access?.reason?.trim() || null;
  const reviewNote = decided ? record?.reviewNote?.trim() || null : null;

  /* Without the pre-check there is no organization to address a request to,
     so the refusal is shown on its own rather than under a button that has
     nowhere to send anything. */
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
            <ShieldCheck className="size-5" />
          </span>
          <p className="text-base font-bold tracking-tight text-amber-900 dark:text-amber-200">
            {access?.organizationName?.trim() || "This organization"} reviews
            who can report to it
          </p>
          <ResearcherAccessBadge status={status} className="ml-auto" />
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
          {actionLabel && canRequestAccess(status) ? (
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
            /* PENDING: the request is already in their queue, and sending a
               second one is a 409 rather than a reminder. */
            status === "PENDING" && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                {/* A wait, not a load — nothing is in flight, someone
                    has to read it. */}
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
