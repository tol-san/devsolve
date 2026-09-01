"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, MailCheck, ShieldQuestion } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/researchers/CompanyLogo";
import { RequestAccessDialog } from "@/components/researchers/RequestAccessDialog";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import { formatDateTime } from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  canRequestAccess,
  requestActionLabel,
  wasInvited,
} from "@/lib/researchers/access";
import type { ResearcherAccessRecord } from "@/lib/validations/researcher-access";

/**
 * Every company the researcher has approached, in whatever state it is in.
 *
 * A row is a company, not a program: one approval covers everything that
 * company runs, so listing programs here would repeat the same verdict as
 * many times as they have programs.
 */
export function MyAccessList({
  records,
  hasFilter,
}: {
  records: ResearcherAccessRecord[];
  hasFilter: boolean;
}) {
  const lp = useLocalePath();
  const [pending, setPending] = useState<ResearcherAccessRecord | null>(null);
  const [session, setSession] = useState(0);

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldQuestion className="size-6" />
        </span>
        <p className="text-base font-semibold text-foreground">
          {hasFilter ? "Nothing in that state" : "You have not asked anyone yet"}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasFilter
            ? "Clear the filter to see every company you have approached."
            : "Companies approve researchers before accepting reports. Open a program and ask its company for access — one approval covers all of their programs."}
        </p>
        {!hasFilter && (
          <Link
            href={lp("/programs")}
            className={cn(
              buttonVariants({ variant: "default" }),
              "mt-1 h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold",
            )}
          >
            Browse programs
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3">
        {records.map((record, index) => {
          const actionLabel = requestActionLabel(record.status);
          /* They came to you. Only worth saying while the approval stands —
             on a rejected or revoked record the state is the news. */
          const invited = wasInvited(record) && record.status === "APPROVED";
          const showNote =
            record.status === "REJECTED" || record.status === "REVOKED";
          const note = showNote ? record.reviewNote?.trim() : "";

          return (
            <motion.li
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.03 }}
              className="group relative rounded-2xl border border-border bg-card p-5 transition-colors hover:border-blue-200 focus-within:border-blue-200 dark:hover:border-blue-500/30 dark:focus-within:border-blue-500/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <CompanyLogo
                    organizationId={record.organizationId}
                    name={record.organizationName}
                  />
                  <div className="min-w-0 space-y-1">
                    {/* Stretched over the card, so the whole row opens the
                        company rather than one word of it. The action beside
                        it is lifted back above the overlay. */}
                    <Link
                      href={lp(`/dashboard/my-access/${record.organizationId}`)}
                      className="flex min-w-0 items-center gap-1 text-base font-bold tracking-tight text-foreground outline-none transition-colors group-hover:text-blue-600 after:absolute after:inset-0 after:rounded-2xl dark:group-hover:text-blue-400"
                    >
                      <span className="truncate">{record.organizationName?.trim() || "Unnamed organization"}</span>
                      <ChevronRight
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {invited
                        ? `Approved ${formatDateTime(record.reviewedAt ?? record.createdAt)}`
                        : `Requested ${formatDateTime(record.requestedAt)}${
                            record.reviewedAt
                              ? ` · Reviewed ${formatDateTime(record.reviewedAt)}`
                              : ""
                          }`}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex shrink-0 items-center gap-3">
                  <ResearcherAccessBadge status={record.status} />
                  {actionLabel && canRequestAccess(record.status) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPending(record);
                        setSession((n) => n + 1);
                      }}
                      className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
                    >
                      {actionLabel}
                    </Button>
                  )}
                </div>
              </div>

              {note && (
                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5">
                  <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Their note
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {note}
                  </p>
                </div>
              )}

              {invited && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <MailCheck aria-hidden className="size-4 shrink-0" />
                  They invited you — you never had to ask.
                </p>
              )}

              {record.canSubmitReports && (
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  You can file reports against every program this company runs.
                </p>
              )}
            </motion.li>
          );
        })}
      </ul>

      {pending && (
        <RequestAccessDialog
          open
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          organizationId={pending.organizationId}
          organizationName={pending.organizationName}
          session={session}
        />
      )}
    </>
  );
}

export default MyAccessList;
