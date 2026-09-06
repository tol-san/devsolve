"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Lock,
  Clock,
  CheckCircle2,
  Bug,
} from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";
import {
  useGetProgramByIdQuery,
  useGetMyCompanyProgramByIdQuery,
} from "@/lib/redux/services/program/programsApi";
import { useGetMyProgramInvitationsQuery } from "@/lib/redux/services/programInvitationsApi";
import { ProgramDetailHero } from "@/components/programs/ProgramDetailHero";
import { ProgramDetailSidebar } from "@/components/programs/ProgramDetailSidebar";
import {
  ProgramDetailTabNav,
  ProgramDetailTabId,
} from "@/components/programs/details/ProgramDetailTabNav";
import { ProgramOverviewTab } from "@/components/programs/details/ProgramOverviewTab";
import { ProgramScopeTab } from "@/components/programs/details/ProgramScopeTab";
import { ProgramBountyMatrixTab } from "@/components/programs/details/ProgramBountyMatrixTab";
import { ProgramRulesTab } from "@/components/programs/details/ProgramRulesTab";
import { ProgramThanksTab } from "@/components/programs/details/ProgramThanksTab";
import { isUnderReview } from "@/lib/programs/draft-status";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname, useSearchParams } from "next/navigation";

export default function ProgramDetailPage({
  params,
  programId: directProgramId,
  showBack = true,
}: {
  params?: Promise<{ id: string }>;
  programId?: string;
  showBack?: boolean;
}) {
  const resolvedParams = params ? use(params) : null;
  const programId = directProgramId || resolvedParams?.id || "";
  const [activeTab, setActiveTab] = useState<ProgramDetailTabId>("overview");
  const { memberships, membership, hasCompanyAccess } = useCompanyAccess();
  const lp = useLocalePath();

  const {
    data: publicProgram,
    isLoading: isPublicLoading,
  } = useGetProgramByIdQuery(programId, { skip: !programId });

  const {
    data: companyProgram,
    isLoading: isCompanyLoading,
  } = useGetMyCompanyProgramByIdQuery(programId, { skip: !programId });

  const {
    data: myInvitationsData,
    isLoading: isInvitationsLoading,
  } = useGetMyProgramInvitationsQuery(
    { page: 0, size: 100 },
    { skip: !programId }
  );

  const matchedInvitation =
    myInvitationsData?.content?.find((inv) => {
      const lowerId = programId.toLowerCase();
      return (
        inv.programId?.toLowerCase() === lowerId ||
        inv.programHandle?.toLowerCase() === lowerId
      );
    }) ?? null;

  const fetchedProgram = publicProgram || companyProgram;
  const isFetching = (isPublicLoading || isCompanyLoading) && !fetchedProgram;
  const program: ProgramDetail | null = fetchedProgram || null;

  const isLoading =
    isFetching ||
    (isInvitationsLoading && !program && !publicProgram && !companyProgram);
  const isError = !isLoading && !program;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromSavedDraft = searchParams.get("from") === "saved-draft";

  const isDashboard = pathname.startsWith("/dashboard/programs");
  const backHref = fromSavedDraft
    ? "/dashboard/saved-draft"
    : isDashboard
      ? "/dashboard/programs"
      : "/programs";

  const backLabel = fromSavedDraft
    ? "Back to Saved Drafts"
    : "Back to Marketplace";

  if (isLoading) {
    return (
      <div className="min-h-screen text-foreground font-sans">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6 w-full pb-12 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-muted rounded-2xl" />
              <div className="h-96 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !program) {
    if (matchedInvitation) {
      const isPendingInvite = matchedInvitation.status === "INVITED";
      const isAccepted = matchedInvitation.status === "ACCEPTED";

      return (
        <div className="min-h-screen text-foreground font-sans flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-8 sm:p-12 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 text-center space-y-6 my-8 max-w-lg mx-auto shadow-xs"
          >
            <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="rounded-lg text-xs font-semibold gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                >
                  <Lock className="size-3" />
                  Private Program
                </Badge>
                {isPendingInvite && (
                  <Badge
                    variant="outline"
                    className="rounded-lg text-xs font-semibold gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                  >
                    <Clock className="size-3" />
                    Invitation Pending
                  </Badge>
                )}
                {isAccepted && (
                  <Badge
                    variant="outline"
                    className="rounded-lg text-xs font-semibold gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-3" />
                    Active Member
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {matchedInvitation.programName || "Private Security Program"}
              </h2>

              {matchedInvitation.programHandle && (
                <p className="text-xs font-mono text-muted-foreground">
                  @{matchedInvitation.programHandle}
                </p>
              )}
            </div>

            {matchedInvitation.note && (
              <div className="w-full text-left p-3.5 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                  Invitation Note
                </p>
                <p className="text-xs text-foreground/90 italic leading-relaxed">
                  &ldquo;{matchedInvitation.note}&rdquo;
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground text-left space-y-1.5 leading-relaxed">
              {isPendingInvite && (
                <p>
                  You have been invited to participate in this private bug bounty program. To view scope rules and submit vulnerability findings, please review and accept your invitation on the Private Programs dashboard.
                </p>
              )}
              {isAccepted && (
                <p>
                  You are an authorized member of this private program. You may proceed directly to submit vulnerability reports according to the agreed private engagement terms.
                </p>
              )}
              {!isPendingInvite && !isAccepted && (
                <p>
                  Your current invitation status is{" "}
                  <span className="font-semibold text-foreground">
                    {matchedInvitation.status}
                  </span>
                  .
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
              {isAccepted && (
                <Link
                  href={lp(`/dashboard/submit-report?programId=${matchedInvitation.programId}`)}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full rounded-xl font-semibold text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                    <Bug className="size-3.5" />
                    Submit a Report
                  </Button>
                </Link>
              )}

              {isPendingInvite && (
                <Link
                  href={lp("/dashboard/program-invitations")}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full rounded-xl font-semibold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                    <CheckCircle2 className="size-3.5" />
                    Review Invitation
                  </Button>
                </Link>
              )}

              <Link
                href={lp("/dashboard/program-invitations")}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold text-xs gap-1.5 border-border"
                >
                  Private Programs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen text-foreground font-sans flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 text-center space-y-4 my-8 max-w-md mx-auto">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Program Not Found
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              The program you are looking for does not exist or has been
              removed.
            </p>
          </div>
          {showBack && (
            <Link href={backHref}>
              <Button
                variant="outline"
                className="rounded-xl font-semibold gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isPending =
    isUnderReview(program) || program?.submissionState === "PENDING_REVIEW";

  const programOrgId = program?.organizationId || program?.organization?.id;
  const isOwnProgram = Boolean(
    companyProgram ||
      (hasCompanyAccess &&
        ((programOrgId &&
          (memberships?.some(
            (m) =>
              m.organizationId.toLowerCase() === programOrgId.toLowerCase(),
          ) ||
            membership?.organizationId?.toLowerCase() ===
              programOrgId.toLowerCase())) ||
          (program?.organizationName &&
            (memberships?.some(
              (m) =>
                m.organizationName?.toLowerCase() ===
                program.organizationName?.toLowerCase(),
            ) ||
              membership?.organizationName?.toLowerCase() ===
                program.organizationName?.toLowerCase())))),
  );

  return (
    <div className="min-h-screen text-foreground font-sans">
      <main className="w-full py-8 ">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-8 w-full pb-16"
        >
          {showBack && (
            <div className="flex items-center justify-between">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                {backLabel}
              </Link>
            </div>
          )}

          <ProgramDetailHero program={program} />

          <ProgramDetailTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showThanksTab={!isPending}
          />

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <section className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <ProgramOverviewTab program={program} />
                )}
                {activeTab === "scope" && <ProgramScopeTab program={program} />}
                {activeTab === "bounty-matrix" && (
                  <ProgramBountyMatrixTab program={program} />
                )}
                {activeTab === "rules" && (
                  <ProgramRulesTab
                    rulesOfEngagement={program?.rulesOfEngagement}
                    exclusions={program?.exclusions}
                  />
                )}
                {activeTab === "thanks" && !isPending && (
                  <ProgramThanksTab
                    programId={program.id}
                    programName={program.name}
                  />
                )}
              </AnimatePresence>
            </section>

            <ProgramDetailSidebar program={program} isOwnProgram={isOwnProgram} />
          </main>
        </motion.div>
      </main>
    </div>
  );
}
