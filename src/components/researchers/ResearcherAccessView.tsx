"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

import { InviteResearcherDialog } from "@/components/researchers/InviteResearcherDialog";
import { ResearcherQueueTable } from "@/components/researchers/ResearcherQueueTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { STATUS_LABEL } from "@/lib/researchers/access";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useGetOrganizationResearchersQuery } from "@/lib/redux/services/researcherAccessApi";
import {
  RESEARCHER_ACCESS_STATUSES,
  type ResearcherAccessStatus,
} from "@/lib/validations/researcher-access";

type Tab = ResearcherAccessStatus | "ALL";

const TABS: Tab[] = [
  "PENDING",
  ...RESEARCHER_ACCESS_STATUSES.filter((status) => status !== "PENDING"),
  "ALL",
];

const TAB_LABEL: Record<Tab, string> = { ...STATUS_LABEL, ALL: "All" };

export function ResearcherAccessView() {
  const lp = useLocalePath();

  const [tab, setTab] = useState<Tab>("PENDING");
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [session, setSession] = useState(0);

  const { membership, isLoading: isOrgLoading } = useCompanyAccess();
  const organizationId = membership?.organizationId ?? "";

  const { data, isLoading, isFetching, isError } =
    useGetOrganizationResearchersQuery(
      { organizationId, status: tab, page },
      { skip: !organizationId },
    );

  const { data: pendingPage } = useGetOrganizationResearchersQuery(
    { organizationId, status: "PENDING", size: 1 },
    { skip: !organizationId },
  );
  const pendingCount = pendingPage?.total ?? 0;

  const rows = data?.rows ?? [];
  const totalPages = data?.totalPages ?? 1;

  const body = isError ? (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      <AlertCircle className="mt-0.5 size-5 shrink-0" />
      <span>
        The researcher queue could not be loaded. Check that your organization
        is active, then try again.
      </span>
    </div>
  ) : isLoading || isOrgLoading ? (
    <div className="animate-pulse space-y-3">
      <div className="h-72 rounded-2xl border border-border bg-muted/60" />
    </div>
  ) : (
    <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
      <ResearcherQueueTable
        organizationId={organizationId}
        records={rows}
        hasFilter={tab !== "ALL"}
      />
    </div>
  );

  const pagination =
    !isError && !isLoading && totalPages > 1 ? (
      <nav
        aria-label="Researcher pages"
        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0 || isFetching}
            onClick={() => setPage((n) => Math.max(0, n - 1))}
            className="cursor-pointer rounded-xl"
          >
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || isFetching}
            onClick={() => setPage((n) => Math.min(totalPages - 1, n + 1))}
            className="cursor-pointer rounded-xl"
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </nav>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Link
              href={lp("/dashboard")}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">
              Researcher access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Researcher access
          </h1>
          <p className="text-sm text-muted-foreground">
            Researchers need your approval before they can file reports. One
            decision covers every program you run.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="h-9 gap-2 rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground"
            >
              <span className="size-2 rounded-full bg-amber-500" />
              <span>{pendingCount} waiting</span>
            </Badge>
          )}
          <Button
            type="button"
            disabled={!organizationId}
            onClick={() => {
              setSession((n) => n + 1);
              setInviteOpen(true);
            }}
            className="h-9 cursor-pointer rounded-xl px-4 text-sm font-semibold shadow-2xs"
          >
            <UserPlus data-icon="inline-start" />
            Approve a researcher
          </Button>
        </div>
      </header>

      {!isOrgLoading && !organizationId ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <span>
            Register an organization before you can approve researchers.
          </span>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as Tab);
            setPage(0);
          }}
          className="w-full gap-4"
        >
          <TabsList className="h-10 w-full max-w-2xl rounded-xl bg-muted p-1">
            {TABS.map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="cursor-pointer rounded-lg text-sm font-semibold"
              >
                {TAB_LABEL[value]}
                {value === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((value) => (
            <TabsContent key={value} value={value} className="space-y-3">
              {body}
              {pagination}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <InviteResearcherDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organizationId={organizationId}
        session={session}
      />
    </motion.div>
  );
}

export default ResearcherAccessView;
