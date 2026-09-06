"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useState, use } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  LoaderCircle,
  Zap,
  ChevronDown,
  Globe,
  Lock,
  UserCheck,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetProgramDetailQuery,
  useApproveProgramMutation,
  useRejectProgramMutation,
} from "@/lib/redux/services/admin/programAdminApi";
import {
  useGetProgramByIdQuery,
  useGetMyCompanyProgramByIdQuery,
  useUpdateProgramStateMutation,
  usePublishProgramMutation,
  useCloseProgramMutation,
  usePauseProgramMutation,
  useResumeProgramMutation,
  useUpdateProgramVisibilityMutation,
} from "@/lib/redux/services/program/programsApi";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { ProgramRejectDialog } from "@/components/admin/programs/ProgramRejectDialog";
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
import { ProgramGuestListTab } from "@/components/programs/management/ProgramGuestListTab";
import { ProgramThanksTab } from "@/components/programs/details/ProgramThanksTab";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api/error-message";

function ProgramDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const { user } = useSidebarAuth();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const {
    hasCompanyAccess: isCompanyUser,
    can,
    isLoading: isAccessLoading,
  } = useCompanyAccess();
  const isAdminScope = searchParams.get("scope") === "admin" && isAdmin;

  const [activeTab, setActiveTab] = useState<ProgramDetailTabId>("overview");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data: adminDetail,
    isLoading: isAdminDetailLoading,
    refetch: refetchAdmin,
  } = useGetProgramDetailQuery(id, { skip: !isAdminScope });

  const {
    data: publicDetail,
    isLoading: isPublicLoading,
    error: publicError,
    refetch: refetchPublic,
  } = useGetProgramByIdQuery(id);

  const {
    data: companyDetail,
    isLoading: isCompanyLoading,
    error: companyError,
    refetch: refetchCompany,
  } = useGetMyCompanyProgramByIdQuery(id, {
    skip: !isCompanyUser || Boolean(publicDetail),
  });

  const refetch = () => {
    if (isAdminScope) refetchAdmin();
    refetchPublic();
    if (isCompanyUser) refetchCompany();
  };

  const program = adminDetail ?? publicDetail ?? companyDetail;

  const isLoading = isAdminScope
    ? isAdminDetailLoading
    : (isAccessLoading || isPublicLoading || isCompanyLoading) && !program;
  const isError = !isLoading && !program;

  const failure = describeProgramFailure(
    statusOf(companyError) ?? statusOf(publicError),
  );

  const [approveProgram] = useApproveProgramMutation();
  const [rejectProgram] = useRejectProgramMutation();
  const [updateProgramState] = useUpdateProgramStateMutation();
  const [publishProgram, { isLoading: isPublishing }] = usePublishProgramMutation();
  const [closeProgram, { isLoading: isClosing }] = useCloseProgramMutation();
  const [pauseProgram, { isLoading: isPausing }] = usePauseProgramMutation();
  const [resumeProgram, { isLoading: isResuming }] = useResumeProgramMutation();
  const [updateProgramVisibility, { isLoading: isUpdatingVisibility }] =
    useUpdateProgramVisibilityMutation();

  const isStateChanging =
    isPublishing || isClosing || isPausing || isResuming || isActionLoading;
  const isActionInProgressRef = React.useRef(false);

  const handleUpdateVisibility = async (
    visibility: "PUBLIC" | "PRIVATE" | "INVITE_ONLY"
  ) => {
    if (program?.visibility === visibility) return;
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await updateProgramVisibility({ id, visibility }).unwrap();
      toast.success(`Program visibility updated to "${visibility}"!`);
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to update visibility."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handleApprove = async () => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await approveProgram({ id }).unwrap();
      toast.success(`Program "${program?.name || ""}" approved successfully!`);
      setApproveDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to approve program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handleApproveConfirm = async (reason: string) => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await approveProgram({ id, reason }).unwrap();
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to approve program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await rejectProgram({ id, reason }).unwrap();
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to reject program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handlePublishProgram = async () => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await publishProgram(id).unwrap();
      toast.success(`Program "${program?.name || ""}" published!`, {
        description:
          "Your security program is now ACTIVE and visible to researchers.",
      });
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to publish program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handlePauseProgram = async () => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await pauseProgram(id).unwrap();
      toast.success(`Program "${program?.name || ""}" paused!`, {
        description: "Your security program is now PAUSED.",
      });
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to pause program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handleResumeProgram = async () => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await resumeProgram(id).unwrap();
      toast.success(`Program "${program?.name || ""}" resumed!`, {
        description: "Your security program is now ACTIVE and visible to researchers.",
      });
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to resume program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const handleCloseProgram = async () => {
    if (isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    try {
      setIsActionLoading(true);
      await closeProgram(id).unwrap();
      toast.success(`Program "${program?.name || ""}" closed!`, {
        description: "Your security program state is now CLOSED.",
      });
      refetch();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, "Failed to close program."));
    } finally {
      setIsActionLoading(false);
      isActionInProgressRef.current = false;
    }
  };

  const backHref = isAdminScope
    ? "/dashboard/program-management?scope=admin"
    : "/dashboard/program-management";

  const backLabel = isAdminScope
    ? "Back to Program Review"
    : "Back to Program Management";

  if (isLoading) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-muted rounded-2xl" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="min-h-screen text-foreground font-sans flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 text-center space-y-4 my-8 max-w-md mx-auto">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
            <AlertOctagon className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {failure.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {failure.body}
            </p>
          </div>
          <Link href={backHref}>
            <Button variant="outline" className="rounded-xl font-semibold gap-2">
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = program.submissionState === "PENDING_REVIEW";
  const isApproved = program.submissionState === "APPROVED";
  const isRejected = program.submissionState === "REJECTED";

  return (
    <div className="min-h-screen text-foreground font-sans">
      <main className="w-full py-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6 w-full pb-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {backLabel}
            </Link>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {program.state !== "CLOSED" && (
                <>
                  {isPending && (
                    <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5 text-xs font-semibold gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending Review
                    </Badge>
                  )}
                  {isApproved && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 text-xs font-semibold gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Approved
                    </Badge>
                  )}
                  {isRejected && (
                    <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1.5 text-xs font-semibold gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold border-border"
                  >
                    {program.engagementType === "BOUNTY" ? "Bounty Program" : "VDP Response"}
                  </Badge>

                  {!isAdminScope ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUpdatingVisibility || isActionLoading}
                            className="rounded-xl px-3 py-1.5 h-8 text-xs font-semibold border-border uppercase gap-1.5 cursor-pointer bg-card"
                          >
                            {isUpdatingVisibility ? (
                              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                            ) : program.visibility === "PRIVATE" ? (
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                            ) : program.visibility === "INVITE_ONLY" ? (
                              <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span>{program.visibility || "PUBLIC"}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-2xl p-1.5 bg-card border border-border shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() => handleUpdateVisibility("PUBLIC")}
                          className="cursor-pointer font-semibold gap-2 rounded-xl text-xs"
                        >
                          <Globe className="w-4 h-4 text-blue-500" />
                          PUBLIC
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateVisibility("PRIVATE")}
                          className="cursor-pointer font-semibold gap-2 rounded-xl text-xs"
                        >
                          <Lock className="w-4 h-4 text-amber-500" />
                          PRIVATE
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateVisibility("INVITE_ONLY")}
                          className="cursor-pointer font-semibold gap-2 rounded-xl text-xs"
                        >
                          <UserCheck className="w-4 h-4 text-purple-500" />
                          INVITE_ONLY
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold border-border uppercase gap-1.5"
                    >
                      {program.visibility === "PRIVATE" ? (
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      ) : program.visibility === "INVITE_ONLY" ? (
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      {program.visibility || "PUBLIC"}
                    </Badge>
                  )}
                </>
              )}

              {!isAdminScope && can("MANAGE_PROGRAM_STATE") && (
                <div className="ml-0 sm:ml-2">
                  {program.state === "DRAFT" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            disabled={isStateChanging}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-9 px-4 gap-2 shadow-xs cursor-pointer"
                          >
                            {isStateChanging ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4 fill-current" />
                            )}
                            <span>DRAFT</span>
                            <ChevronDown className="w-4 h-4 ml-0.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 bg-card border border-border shadow-lg">
                        <DropdownMenuItem
                          onClick={handlePublishProgram}
                          className="cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 gap-2 rounded-xl text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          ACTIVE
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleCloseProgram}
                          className="cursor-pointer font-semibold text-rose-600 dark:text-rose-400 gap-2 rounded-xl text-xs"
                        >
                          <XCircle className="w-4 h-4" />
                          CLOSE
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : program.state === "ACTIVE" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            disabled={isStateChanging}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-9 px-4 gap-2 shadow-xs cursor-pointer"
                          >
                            {isStateChanging ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>ACTIVE</span>
                            <ChevronDown className="w-4 h-4 ml-0.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 bg-card border border-border shadow-lg">
                        <DropdownMenuItem
                          onClick={handlePauseProgram}
                          className="cursor-pointer font-semibold text-amber-600 dark:text-amber-400 gap-2 rounded-xl text-xs"
                        >
                          <PauseCircle className="w-4 h-4" />
                          PAUSE
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleCloseProgram}
                          className="cursor-pointer font-semibold text-rose-600 dark:text-rose-400 gap-2 rounded-xl text-xs"
                        >
                          <XCircle className="w-4 h-4" />
                          CLOSE
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : program.state === "PAUSED" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            disabled={isStateChanging}
                            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm h-9 px-4 gap-2 shadow-xs cursor-pointer"
                          >
                            {isStateChanging ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                              <PauseCircle className="w-4 h-4" />
                            )}
                            <span>PAUSED</span>
                            <ChevronDown className="w-4 h-4 ml-0.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 bg-card border border-border shadow-lg">
                        <DropdownMenuItem
                          onClick={handleResumeProgram}
                          className="cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400 gap-2 rounded-xl text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          ACTIVE
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleCloseProgram}
                          className="cursor-pointer font-semibold text-rose-600 dark:text-rose-400 gap-2 rounded-xl text-xs"
                        >
                          <XCircle className="w-4 h-4" />
                          CLOSE
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : program.state === "CLOSED" ? (
                    <Button
                      type="button"
                      disabled
                      variant="outline"
                      className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-400 font-semibold text-xs sm:text-sm h-9 px-3.5 gap-1.5 opacity-100 cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Program CLOSED
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      variant="outline"
                      className="rounded-xl border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 font-semibold text-xs sm:text-sm h-9 px-3.5 gap-1.5 cursor-not-allowed opacity-70"
                    >
                      <Zap className="w-4 h-4" />
                      {isPending
                        ? "Awaiting Platform Approval"
                        : isRejected
                        ? "Program Rejected"
                        : "Activate Program"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <ProgramDetailHero program={program} />

          {isRejected && program.rejectionReason && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-4 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide">
                  Rejection Reason & Feedback
                </h4>
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                  {program.rejectionReason}
                </p>
              </div>
            </div>
          )}

          <ProgramDetailTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showThanksTab={!isPending}
            showInvitationsTab={
              !isAdminScope &&
              (isCompanyUser ||
                can("MANAGE_RESEARCHERS") ||
                program.visibility === "PRIVATE" ||
                program.visibility === "INVITE_ONLY")
            }
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
                {activeTab === "invitations" && (
                  <ProgramGuestListTab program={program} />
                )}
                {activeTab === "thanks" && !isPending && (
                  <ProgramThanksTab
                    programId={program.id}
                    programName={program.name}
                  />
                )}
              </AnimatePresence>
            </section>

            <ProgramDetailSidebar program={program} isOwnProgram={true} />
          </main>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 min-w-0 flex-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {program.name}
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-mono truncate max-w-[120px] sm:max-w-[180px] hidden sm:inline text-slate-500">
              @{program.handle}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isAdminScope ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {isApproved && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Approved
                  </span>
                )}
                {isRejected && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Rejected
                  </span>
                )}

                <Button
                  variant="destructive"
                  disabled={!isPending || isActionLoading}
                  onClick={() => setRejectDialogOpen(true)}
                  className="rounded-xl font-semibold h-9 px-3 sm:px-4 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Reject Program</span>
                  <span className="sm:hidden">Reject</span>
                </Button>

                <Button
                  disabled={!isPending || isActionLoading}
                  onClick={() => setApproveDialogOpen(true)}
                  className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 sm:px-4 text-xs sm:text-sm shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Approve &amp; Publish</span>
                  <span className="sm:hidden">Approve</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isPending && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-none">Under Review by DevSolve Admins</span>
                  </span>
                )}
                {isApproved && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Program Approved & Active
                  </span>
                )}
                {isRejected && (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" /> Requires Revision
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl bg-card p-6 border border-border shadow-xl">
          <AlertDialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Approve Program Submission
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground font-normal">
              Are you sure you want to approve{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{program.name}&rdquo;
              </span>
              ? Once approved, the organization can manage and activate their bug bounty scope.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl font-semibold h-10 cursor-pointer w-full sm:w-auto text-sm border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-10 cursor-pointer w-full sm:w-auto text-sm shadow-2xs"
            >
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProgramRejectDialog
        open={rejectDialogOpen}
        programName={program.name}
        onClose={() => setRejectDialogOpen(false)}
        onConfirmReject={handleRejectConfirm}
      />
    </div>
  );
}

function ProgramDetailPageFallback() {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-64 bg-muted rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}

function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function describeProgramFailure(status: number | undefined) {
  if (status === 409) {
    return {
      title: "This account is on more than one organization",
      body: "The program endpoint takes no organization, so it will not guess which of yours you mean. Until it accepts one, program details are only reachable for accounts on a single organization.",
    };
  }

  if (status === 403) {
    return {
      title: "You cannot view this organization's programs",
      body: "This needs the View programs permission. An owner or a manager can grant it from Team management.",
    };
  }

  return {
    title: "Program not found",
    body: "Unable to load program details, or the program ID is invalid.",
  };
}

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ProgramDetailPageFallback />}>
      <ProgramDetailPageContent params={params} />
    </Suspense>
  );
}
