"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Bug,
  ExternalLink,
  MessageSquareQuote,
  ShieldCheck,
  Shield,
  ArrowRight,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";
import { useGetProgramByIdQuery } from "@/lib/redux/services/program/programsApi";

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
  useGetMyProgramInvitationsQuery,
  useAcceptProgramInvitationMutation,
  useDeclineProgramInvitationMutation,
} from "@/lib/redux/services/programInvitationsApi";
import { ProgramInvitation } from "@/lib/types/programs/programInvitationTypes";
import { formatDateTime, formatTimeDistance } from "@/lib/format/datetime";
import { apiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";

type TabType = "pending" | "active" | "history";

function ProgramOrganizationHeader({
  programId,
  organizationId,
  compact = false,
}: {
  programId?: string;
  organizationId?: string;
  compact?: boolean;
}) {
  const lp = useLocalePath();
  const { data: program } = useGetProgramByIdQuery(programId ?? "", {
    skip: Boolean(organizationId) || !programId,
  });

  const effectiveOrgId =
    organizationId || program?.organizationId || program?.organization?.id;
  const directOrg = program?.organization;

  const { data: orgData, isLoading } = useGetOrganizationByIdQuery(
    effectiveOrgId ?? "",
    { skip: !effectiveOrgId || Boolean(directOrg) }
  );

  const org = directOrg || orgData;
  const [imageError, setImageError] = useState(false);

  if (!effectiveOrgId && !org) return null;

  if (isLoading && !org) {
    return (
      <div className="flex items-center gap-2 animate-pulse pt-0.5">
        <div className="size-5 rounded-md bg-muted shrink-0" />
        <div className="w-20 h-3 bg-muted rounded" />
      </div>
    );
  }

  if (!org) return null;

  const initials =
    (org.name || "Organization")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "OR";

  const orgName = org.name || "Organization";
  const orgWebsite = org.websiteUrl || (org as { domain?: string }).domain;
  const companyHref = lp(org.id ? `/company?id=${org.id}` : "/company");
  const logoUrl = !imageError ? org.logoUrl : null;

  if (compact) {
    return (
      <Link
        href={companyHref}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground group/org transition-colors"
      >
        <div className="size-4 rounded-sm border border-border bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden text-[9px] font-bold">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={orgName}
              width={16}
              height={16}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <span className="truncate group-hover/org:underline font-medium">
          {orgName}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={companyHref}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-2.5 group/org hover:opacity-95 transition-all cursor-pointer pt-1"
    >
      <div className="size-8 rounded-xl border border-border bg-card flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/org:scale-105 transition-transform duration-200">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={orgName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <span className="text-[11px] font-bold text-foreground">
            {initials}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h4 className="text-xs font-bold text-foreground group-hover/org:text-primary group-hover/org:underline transition-colors truncate">
            {orgName}
          </h4>
          <Building2 className="size-3 text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {orgWebsite && (
            <span className="truncate">{orgWebsite.replace(/^https?:\/\//, "")}</span>
          )}
          {orgWebsite && org.industry && <span>·</span>}
          {org.industry && (
            <span className="capitalize">{org.industry.toLowerCase()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function MyProgramInvitationsView() {
  const lp = useLocalePath();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [declineTarget, setDeclineTarget] = useState<ProgramInvitation | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Queries for the three tabs
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isFetching: isPendingFetching,
    refetch: refetchPending,
  } = useGetMyProgramInvitationsQuery({
    status: "INVITED",
    page: 0,
    size: 50,
  });

  const {
    data: acceptedData,
    isLoading: isAcceptedLoading,
    isFetching: isAcceptedFetching,
    refetch: refetchAccepted,
  } = useGetMyProgramInvitationsQuery({
    status: "ACCEPTED",
    page: 0,
    size: 50,
  });

  const {
    data: allData,
    isLoading: isAllLoading,
    isFetching: isAllFetching,
    refetch: refetchAll,
  } = useGetMyProgramInvitationsQuery({
    page: 0,
    size: 100,
  });

  const [acceptInvitation] = useAcceptProgramInvitationMutation();
  const [declineInvitation] = useDeclineProgramInvitationMutation();

  const refetchAllTabs = () => {
    refetchPending();
    refetchAccepted();
    refetchAll();
  };

  const pendingList = pendingData?.content ?? [];
  const acceptedList = acceptedData?.content ?? [];
  const historyList = (allData?.content ?? []).filter(
    (item) => item.status === "DECLINED" || item.status === "REVOKED",
  );

  const pendingCount = pendingData?.totalElements ?? pendingList.length;
  const acceptedCount = acceptedData?.totalElements ?? acceptedList.length;
  const historyCount = historyList.length;

  const handleAccept = async (invitation: ProgramInvitation) => {
    try {
      setActionInProgressId(invitation.programId);
      await acceptInvitation(invitation.programId).unwrap();
      toast.success(`Accepted invitation to "${invitation.programName || "Program"}"!`, {
        description: "You can now submit vulnerability reports to this private scope.",
      });
      refetchAllTabs();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to accept invitation."));
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleConfirmDecline = async () => {
    if (!declineTarget) return;

    try {
      setActionInProgressId(declineTarget.programId);
      await declineInvitation(declineTarget.programId).unwrap();
      toast.info(`Declined invitation to "${declineTarget.programName || "Program"}".`);
      setDeclineTarget(null);
      refetchAllTabs();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to decline invitation."));
    } finally {
      setActionInProgressId(null);
    }
  };

  const [now] = useState(() => Date.now());
  const isAnyFetching = isPendingFetching || isAcceptedFetching || isAllFetching;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Header pattern conforming to standard layout */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Private Programs</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Lock className="size-6 text-primary" />
            <span>Private Programs &amp; Invitations</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Review exclusive invitations from security teams, inspect private scopes, and submit authorized findings.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refetchAllTabs}
          disabled={isAnyFetching}
          className="rounded-xl h-9 px-3 gap-1.5 self-start sm:self-auto font-medium border-border"
        >
          <RefreshCw className={cn("size-3.5", isAnyFetching && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 relative",
            activeTab === "pending"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Mail className="size-4" />
          <span>Pending Invitations</span>
          {pendingCount > 0 && (
            <Badge className="size-5 p-0 flex items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
              {pendingCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 relative",
            activeTab === "active"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <ShieldCheck className="size-4" />
          <span>Active Programs</span>
          {acceptedCount > 0 && (
            <Badge className="size-5 p-0 flex items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
              {acceptedCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 relative",
            activeTab === "history"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Clock className="size-4" />
          <span>History</span>
          {historyCount > 0 && (
            <Badge variant="outline" className="text-xs font-semibold rounded-full px-1.5 py-0 border-border">
              {historyCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <main>
        <AnimatePresence mode="wait">
          {/* PENDING INVITATIONS */}
          {activeTab === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {isPendingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-56 rounded-2xl bg-card border border-border p-6 animate-pulse space-y-4"
                    >
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-16 bg-muted rounded-xl w-full" />
                      <div className="h-9 bg-muted rounded-xl w-full" />
                    </div>
                  ))}
                </div>
              ) : pendingList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-border bg-card shadow-2xs space-y-3">
                  <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Mail className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      No pending invitations
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      You do not have any pending invitations to private security programs right now. When an organization invites you to their private scope, it will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingList.map((item) => {
                    const isActing = actionInProgressId === item.programId;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-border/80 transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg px-2 py-0.5 gap-1 mb-1">
                                <Lock className="size-3" />
                                <span>Private Program Invitation</span>
                              </Badge>
                              <h3 className="text-lg font-bold text-foreground leading-snug">
                                {item.programName || "Security Program"}
                              </h3>
                              {item.programHandle && (
                                <p className="text-xs font-mono text-muted-foreground">
                                  @{item.programHandle}
                                </p>
                              )}
                              <ProgramOrganizationHeader
                                programId={item.programId}
                                organizationId={item.organizationId}
                              />
                            </div>

                            <span
                              title={`Invited on ${formatDateTime(item.invitedAt)}`}
                              className="text-xs text-muted-foreground shrink-0 cursor-help flex items-center gap-1 underline decoration-dotted underline-offset-2"
                            >
                              <Clock className="size-3" />
                              <span>{formatTimeDistance(item.invitedAt, now, "recently")}</span>
                            </span>
                          </div>

                          {/* Invitation Note */}
                          {item.note && (
                            <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                <MessageSquareQuote className="size-3.5 text-primary" />
                                <span>Note from Organization</span>
                              </div>
                              <p className="text-xs text-foreground/90 italic leading-relaxed">
                                &ldquo;{item.note}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center gap-2 justify-between">
                          <Link
                            href={lp(`/programs/${item.programId}`)}
                            className="w-full sm:w-auto"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl text-xs font-semibold gap-1.5 border-border"
                            >
                              <ExternalLink className="size-3.5" />
                              <span>View Scope &amp; Policy</span>
                            </Button>
                          </Link>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isActing}
                              onClick={() => setDeclineTarget(item)}
                              className="flex-1 sm:flex-initial rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              Decline
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleAccept(item)}
                              className="flex-1 sm:flex-initial rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                            >
                              {isActing ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span>Accepting...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Accept Invitation</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE ACCEPTED PROGRAMS */}
          {activeTab === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {isAcceptedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-44 rounded-2xl bg-card border border-border p-6 animate-pulse space-y-4"
                    >
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-9 bg-muted rounded-xl w-full" />
                    </div>
                  ))}
                </div>
              ) : acceptedList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-border bg-card shadow-2xs space-y-3">
                  <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Shield className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      No active private programs
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Once you accept an invitation to a private program, it will show up here with full reporting authorization.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedList.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-border/80 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg px-2 py-0.5 gap-1 mb-1">
                              <CheckCircle2 className="size-3" />
                              <span>Active Private Scope Member</span>
                            </Badge>
                            <h3 className="text-lg font-bold text-foreground leading-snug">
                              {item.programName || "Security Program"}
                            </h3>
                            {item.programHandle && (
                              <p className="text-xs font-mono text-muted-foreground">
                                @{item.programHandle}
                              </p>
                            )}
                            <ProgramOrganizationHeader
                              programId={item.programId}
                              organizationId={item.organizationId}
                            />
                          </div>

                          <span
                            title={`Accepted on ${formatDateTime(item.respondedAt || item.invitedAt)}`}
                            className="text-xs text-muted-foreground shrink-0 cursor-help flex items-center gap-1 underline decoration-dotted underline-offset-2"
                          >
                            <Clock className="size-3" />
                            <span>Joined {formatTimeDistance(item.respondedAt || item.invitedAt, now, "recently")}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-2 justify-between">
                        <Link
                          href={lp(`/programs/${item.programId}`)}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full rounded-xl text-xs font-semibold gap-1.5 border-border"
                          >
                            <ExternalLink className="size-3.5" />
                            <span>View Scope</span>
                          </Button>
                        </Link>

                        <Link
                          href={lp(`/dashboard/submit-report?programId=${item.programId}`)}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            type="button"
                            size="sm"
                            className="w-full rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
                          >
                            <Bug className="size-3.5" />
                            <span>Submit Report</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* HISTORY (DECLINED & REVOKED) */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {isAllLoading ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="size-6 text-primary animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-border bg-card shadow-2xs space-y-3">
                  <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Clock className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      No declined or revoked invitations
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Past private invitations that were declined or revoked will be listed here for your records.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="py-3 px-4 sm:px-6">Program</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Invited</th>
                          <th className="py-3 px-4">Closed</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {historyList.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground text-sm">
                                  {item.programName || "Security Program"}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.programHandle && (
                                    <span className="text-xs font-mono text-muted-foreground">
                                      @{item.programHandle}
                                    </span>
                                  )}
                                  <ProgramOrganizationHeader
                                    programId={item.programId}
                                    organizationId={item.organizationId}
                                    compact
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {item.status === "DECLINED" ? (
                                <Badge className="bg-muted text-muted-foreground border border-border text-xs font-semibold rounded-lg px-2 py-0.5">
                                  Declined
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg px-2 py-0.5">
                                  Revoked
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-muted-foreground">
                              {formatTimeDistance(item.invitedAt, now, "recently")}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-muted-foreground">
                              {item.respondedAt ? (
                                formatTimeDistance(item.respondedAt, now, "recently")
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <Link
                                href={lp(`/programs/${item.programId}`)}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                View Scope
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decline Confirmation Dialog */}
      <AlertDialog
        open={Boolean(declineTarget)}
        onOpenChange={(open) => !open && setDeclineTarget(null)}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-card p-6 border border-border shadow-xl">
          <AlertDialogHeader className="space-y-2">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Decline Private Program Invitation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to decline the invitation to{" "}
              <span className="font-semibold text-foreground">
                {declineTarget?.programName || "this program"}
              </span>
              ? You will not be able to submit vulnerability reports unless re-invited by the company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 gap-2">
            <AlertDialogCancel className="rounded-xl font-medium border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDecline}
              className="rounded-xl font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Decline Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
