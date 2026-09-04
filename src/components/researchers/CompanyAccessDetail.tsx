"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  Send,
} from "lucide-react";

import SeverityBadge from "@/components/reports/SeverityBadge";
import StatusBadge from "@/components/reports/StatusBadge";
import { RequestAccessDialog } from "@/components/researchers/RequestAccessDialog";
import { ResearcherAccessBadge } from "@/components/researchers/ResearcherAccessBadge";
import { CompanyLogo } from "@/components/researchers/CompanyLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/datetime";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  canRequestAccess,
  requestActionLabel,
  wasInvited,
} from "@/lib/researchers/access";
import {
  useGetOrganizationByIdQuery,
  useGetOrganizationProgramsByIdQuery,
} from "@/lib/redux/services/organizationsApi";
import { useGetReportsQuery } from "@/lib/redux/services/reportsApi";
import { useGetMyOrganizationAccessQuery } from "@/lib/redux/services/researcherAccessApi";
import type { Program } from "@/lib/types/programs/types";
import { cn } from "@/lib/utils";
import { CountryDisplay } from "@/components/shared/CountryDisplay";

/**
 * One company, from the researcher side.
 *
 * The list this opens from answers "may I file here?"; the question straight
 * after is "what have I already filed, and what else can I file against?".
 * Both are about the organization rather than any one program, because that is
 * the level approval is granted at.
 */
export function CompanyAccessDetail({
  organizationId,
}: {
  organizationId: string;
}) {
  const lp = useLocalePath();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);

  const { data: organization, isLoading: isOrgLoading } =
    useGetOrganizationByIdQuery(organizationId, { skip: !organizationId });

  /* The record rather than the list: this is the screen that finally uses
     `GET /organizations/{id}/researchers/me`, which answers for one company
     and returns null when the researcher has never approached it. */
  const { data: access, isLoading: isAccessLoading } =
    useGetMyOrganizationAccessQuery(organizationId, { skip: !organizationId });

  const { data: reports, isLoading: isReportsLoading } = useGetReportsQuery();

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetOrganizationProgramsByIdQuery(
      { id: organizationId, size: 50 },
      { skip: !organizationId },
    );

  /* Reports carry the id of the company that received them, so this is a
     filter rather than another round trip — and the list is usually already
     in the cache from the reports screen. */
  const filed = useMemo(
    () => (reports ?? []).filter((report) => report.organizationId === organizationId),
    [reports, organizationId],
  );

  const programs = useMemo<Program[]>(() => {
    if (!programsData) return [];
    return Array.isArray(programsData)
      ? programsData
      : (programsData.content ?? []);
  }, [programsData]);

  const status = access?.status ?? null;
  const approved = access?.canSubmitReports === true;
  /* Cleared without ever applying — the company came to them. */
  const invited = access ? wasInvited(access) && status === "APPROVED" : false;
  const actionLabel = requestActionLabel(status);
  const name = organization?.name?.trim() || access?.organizationName?.trim() || "";
  const reviewNote =
    status === "REJECTED" || status === "REVOKED"
      ? access?.reviewNote?.trim()
      : "";

  if (isOrgLoading || isAccessLoading) {
    return (
      <div className="w-full space-y-4 pb-12 animate-pulse">
        <div className="h-32 rounded-2xl border border-border bg-muted/60" />
        <div className="h-48 rounded-2xl border border-border bg-muted/60" />
        <div className="h-64 rounded-2xl border border-border bg-muted/60" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
    >
      <header className="space-y-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Link
            href={lp("/dashboard/my-access")}
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            My access
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {name || "Organization"}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <CompanyLogo
              organizationId={organizationId}
              name={name}
              className="size-14 rounded-2xl text-base"
            />
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {name || "Organization"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {organization?.industry && (
                  <span className="font-medium">{organization.industry}</span>
                )}
                {organization?.country && (
                  <CountryDisplay value={organization.country} size={12} />
                )}
                {organization?.websiteUrl && (
                  <a
                    href={organization.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
                  >
                    <Globe className="size-3.5" />
                    {organization.websiteUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <ResearcherAccessBadge status={status} className="shrink-0" />
        </div>

        {organization?.description?.trim() && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {organization.description.trim()}
          </p>
        )}
      </header>

      {/* Where the researcher stands, and the one move available from here. */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Your access
            </h2>
            <p className="text-sm text-muted-foreground">
              {invited
                ? "This company approved you without a request. You can file reports against every program below."
                : approved
                ? "You can file reports against every program below."
                : status === "PENDING"
                  ? "Waiting on their review. You can keep writing and saving drafts."
                  : "Approval is per company and covers every program they run."}
            </p>
          </div>
          {actionLabel && canRequestAccess(status) && (
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
          )}
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {invited ? "Invited" : "Requested"}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {formatDateTime(access?.requestedAt ?? access?.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Reviewed
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {formatDateTime(access?.reviewedAt)}
            </dd>
          </div>
        </dl>

        {access?.motivation?.trim() && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              What you wrote
            </p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {access.motivation.trim()}
            </p>
          </div>
        )}

        {reviewNote && (
          <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Their note
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {reviewNote}
            </p>
          </div>
        )}
      </section>

      {/* What has already gone to them. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Reports you filed here
            {filed.length > 0 && (
              <span className="ml-2 font-semibold text-muted-foreground">
                {filed.length}
              </span>
            )}
          </h2>
        </div>

        {isReportsLoading ? (
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/60" />
        ) : filed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileText className="size-6" />
            </span>
            <p className="text-base font-semibold text-foreground">
              Nothing filed here yet
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {approved
                ? "You are cleared to report. Pick one of their programs below to start."
                : "Reports you send this company will be listed here."}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {filed.map((report) => (
              <li key={report.id}>
                <Link
                  href={lp(`/dashboard/my-reports/${report.id}`)}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-blue-200 hover:bg-muted/40 dark:hover:border-blue-500/30"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {report.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report.reportId} · {report.program} ·{" "}
                      {report.lastActivityDate}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge severity={report.severity} />
                    <StatusBadge status={report.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* What can still be filed. */}
      <section className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Their programs
          {programs.length > 0 && (
            <span className="ml-2 font-semibold text-muted-foreground">
              {programs.length}
            </span>
          )}
        </h2>

        {isProgramsLoading ? (
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted/60" />
        ) : programs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            This company is not running any programs you can see right now.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {programs.map((program) => (
              <li
                key={program.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 overflow-hidden"
              >
                <div className="min-w-0 space-y-1">
                  <Link
                    href={lp(`/dashboard/programs/${program.id}`)}
                    className="block truncate text-sm font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                    title={program.name}
                  >
                    {program.name}
                  </Link>
                  <p className="line-clamp-2 text-sm text-muted-foreground break-words">
                    {program.description || "No description provided."}
                  </p>
                </div>

                {/* Offered only once the company has cleared them — a submit
                    link that ends in a 403 is worse than no link. */}
                {approved && (
                  <Link
                    href={lp(`/dashboard/submit-report?programId=${program.id}`)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-fit cursor-pointer rounded-xl",
                    )}
                  >
                    <Send data-icon="inline-start" />
                    Submit a report
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <RequestAccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organizationId={organizationId}
        organizationName={name}
        session={session}
      />
    </motion.div>
  );
}

export default CompanyAccessDetail;
