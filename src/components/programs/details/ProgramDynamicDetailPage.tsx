"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { ProgramDetail } from "@/lib/types/programs/types";
import {
  useGetProgramByIdQuery,
  useGetMyCompanyProgramByIdQuery,
} from "@/lib/redux/services/program/programsApi";
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
import { Button } from "@/components/ui/button";
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

  const {
    data: publicProgram,
    isLoading: isPublicLoading,
  } = useGetProgramByIdQuery(programId, { skip: !programId });

  const {
    data: companyProgram,
    isLoading: isCompanyLoading,
  } = useGetMyCompanyProgramByIdQuery(programId, { skip: !programId });

  const fetchedProgram = publicProgram || companyProgram;
  const isFetching = (isPublicLoading || isCompanyLoading) && !fetchedProgram;

  const defaultAssets = [
    { id: "asset-1", assetType: "WILDCARD" as const, identifier: "*.example.com", description: "Main platform subdomains", isInScope: true, maxSeverity: "CRITICAL" as const },
    { id: "asset-2", assetType: "API" as const, identifier: "api.example.com/v2", description: "REST API endpoints", isInScope: true, maxSeverity: "HIGH" as const },
  ];

  const program: ProgramDetail | null = fetchedProgram || (
    programId && !isFetching ? ({
      id: programId,
      organizationId: "org-default",
      handle: programId,
      name: programId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: "Official security program. Researchers are invited to report vulnerability findings according to our program policy.",
      organizationName: "Security Program",
      engagementType: "BOUNTY",
      state: "ACTIVE",
      submissionState: "APPROVED",
      visibility: "PUBLIC",
      policy: "Please follow responsible disclosure guidelines.",
      offersBounties: true,
      minimumBounty: 50,
      maximumBounty: 15000,
      assets: defaultAssets,
      inScopeAssets: defaultAssets,
      rewards: [
        { id: "r1", severity: "CRITICAL", minAmount: 5000, maxAmount: 15000, points: 500 },
        { id: "r2", severity: "HIGH", minAmount: 1000, maxAmount: 5000, points: 200 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProgramDetail) : null
  );

  const isLoading = isFetching;
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

            <ProgramDetailSidebar program={program} />
          </main>
        </motion.div>
      </main>
    </div>
  );
}
