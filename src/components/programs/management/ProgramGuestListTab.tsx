"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserX,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

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
  useGetProgramInvitationsQuery,
  useRevokeProgramInvitationMutation,
} from "@/lib/redux/services/programInvitationsApi";
import {
  ProgramInvitation,
  ProgramInvitationStatus,
} from "@/lib/types/programs/programInvitationTypes";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { InviteResearcherModal } from "@/components/programs/management/InviteResearcherModal";
import { formatDateTime, formatTimeDistance } from "@/lib/format/datetime";
import { apiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";

interface ProgramGuestListTabProps {
  program: {
    id: string;
    name: string;
    visibility?: string;
  };
}

const STATUS_FILTERS: { label: string; value: "ALL" | ProgramInvitationStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending (Invited)", value: "INVITED" },
  { label: "Members (Accepted)", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Revoked", value: "REVOKED" },
];

function getResearcherId(inv: ProgramInvitation): string {
  return inv.userId || inv.researcherId || "";
}

function getResearcherName(inv: ProgramInvitation): string {
  return inv.fullName || inv.researcherName || inv.username || "Researcher";
}

function getResearcherAvatar(inv: ProgramInvitation): string | null {
  return inv.avatarUrl || inv.researcherAvatarUrl || null;
}

export function ProgramGuestListTab({ program }: ProgramGuestListTabProps) {
  const { can, isOwner } = useCompanyAccess();
  const canManage = isOwner || can("MANAGE_RESEARCHERS");

  const [activeFilter, setActiveFilter] = useState<"ALL" | ProgramInvitationStatus>("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [preselectedUser, setPreselectedUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null>(null);

  // Revoke dialog state
  const [revokeTarget, setRevokeTarget] = useState<ProgramInvitation | null>(null);

  // RTK Query hooks
  const {
    data: invitationsPage,
    isLoading,
    isFetching,
    refetch,
  } = useGetProgramInvitationsQuery(
    {
      programId: program.id,
      status: activeFilter === "ALL" ? undefined : activeFilter,
      page,
      size: pageSize,
      sort: "invitedAt,desc",
    },
    { skip: !canManage },
  );

  // Also query all invitations for top-level counter breakdown
  const { data: allInvitationsData } = useGetProgramInvitationsQuery(
    {
      programId: program.id,
      page: 0,
      size: 100,
      sort: "invitedAt,desc",
    },
    { skip: !canManage },
  );

  const [revokeInvitation, { isLoading: isRevoking }] =
    useRevokeProgramInvitationMutation();

  const now = useMemo(() => Date.now(), []);

  // Compute status counts from the full (or top 100) snapshot
  const counts = useMemo(() => {
    const list = allInvitationsData?.content ?? [];
    return {
      total: allInvitationsData?.totalElements ?? 0,
      invited: list.filter((i) => i.status === "INVITED").length,
      accepted: list.filter((i) => i.status === "ACCEPTED").length,
      declined: list.filter((i) => i.status === "DECLINED").length,
      revoked: list.filter((i) => i.status === "REVOKED").length,
    };
  }, [allInvitationsData]);

  const invitations = invitationsPage?.content ?? [];
  const totalPages = invitationsPage?.totalPages ?? 1;

  const handleOpenInvite = () => {
    setPreselectedUser(null);
    setIsInviteModalOpen(true);
  };

  const handleReinvite = (invitation: ProgramInvitation) => {
    setPreselectedUser({
      id: getResearcherId(invitation),
      name: getResearcherName(invitation),
      avatarUrl: getResearcherAvatar(invitation),
    });
    setIsInviteModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;

    try {
      await revokeInvitation({
        programId: program.id,
        userId: getResearcherId(revokeTarget),
      }).unwrap();

      toast.success(
        `Revoked access for ${getResearcherName(revokeTarget)}.`,
      );
      setRevokeTarget(null);
      refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to revoke invitation."));
    }
  };

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center space-y-3">
        <div className="mx-auto size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Researcher Management Restricted
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You need the <span className="font-semibold text-foreground">MANAGE_RESEARCHERS</span>{" "}
          organization permission to view and manage private program invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span>Program Guest List</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage invited security researchers who are authorized to submit vulnerability reports
            to this program.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl h-9 px-3 gap-1.5 font-medium border-border"
            title="Refresh guest list"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            type="button"
            onClick={handleOpenInvite}
            className="rounded-xl h-9 px-4 gap-1.5 font-semibold shadow-xs"
          >
            <UserPlus className="size-4" />
            <span>Invite Researcher</span>
          </Button>
        </div>
      </div>

      {/* Counter Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Guests
          </span>
          <div className="text-2xl font-bold text-foreground mt-2">
            {counts.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending
            </span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {counts.invited}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Members
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {counts.accepted}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Declined
            </span>
            <XCircle className="size-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {counts.declined}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Revoked
            </span>
            <UserX className="size-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {counts.revoked}
          </div>
        </div>
      </div>

      {/* Filter Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setActiveFilter(filter.value);
                setPage(0);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Table / List View */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="size-7 text-primary animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading guest list...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Users className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                {activeFilter === "ALL"
                  ? "No researchers on guest list"
                  : `No ${activeFilter.toLowerCase()} invitations`}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeFilter === "ALL"
                  ? "Private programs require invited researchers to submit bug reports. Invite your trusted researchers to grant them access."
                  : "Researchers with this status will show up here once available."}
              </p>
            </div>
            {activeFilter === "ALL" && (
              <Button
                type="button"
                onClick={handleOpenInvite}
                variant="outline"
                size="sm"
                className="rounded-xl mt-2 gap-1.5 font-semibold"
              >
                <UserPlus className="size-4" />
                <span>Invite Researcher</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 sm:px-6">Researcher</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invited</th>
                  <th className="py-3 px-4">Responded</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((item) => {
                  const researcherId = getResearcherId(item);
                  const name = getResearcherName(item);
                  const avatar = getResearcherAvatar(item);
                  const username = item.username;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Researcher Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative size-9 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                            {avatar ? (
                              <Image
                                src={avatar}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/profile/${username || researcherId}`}
                              className="font-semibold text-foreground hover:text-primary hover:underline transition-colors block truncate text-sm"
                            >
                              {name}
                            </Link>
                            {username && (
                              <span className="text-xs text-muted-foreground font-mono block truncate">
                                @{username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Invited At */}
                      <td
                        className="py-3.5 px-4 text-xs text-muted-foreground cursor-help underline decoration-dotted underline-offset-2"
                        title={formatDateTime(item.invitedAt)}
                      >
                        {formatTimeDistance(item.invitedAt, now, "recently")}
                      </td>

                      {/* Responded At */}
                      <td
                        className="py-3.5 px-4 text-xs text-muted-foreground"
                        title={item.respondedAt ? formatDateTime(item.respondedAt) : undefined}
                      >
                        {item.respondedAt ? (
                          <span className="cursor-help underline decoration-dotted underline-offset-2">
                            {formatTimeDistance(item.respondedAt, now, "recently")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4">
                        {item.note ? (
                          <span
                            title={`Invitation Note: ${item.note}`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <MessageSquare className="size-3.5 text-primary/70" />
                            <span className="max-w-[120px] truncate text-[11px]">
                              {item.note}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {item.status === "INVITED" || item.status === "ACCEPTED" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokeTarget(item)}
                            className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-medium rounded-xl gap-1 cursor-pointer"
                          >
                            <UserX className="size-3.5" />
                            <span>Revoke</span>
                          </Button>
                        ) : item.status === "DECLINED" || item.status === "REVOKED" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleReinvite(item)}
                            className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1 cursor-pointer border-border"
                          >
                            <RotateCcw className="size-3.5" />
                            <span>Re-invite</span>
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-card">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isFetching}
                className="rounded-xl h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="size-4 mr-1" /> Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isFetching}
                className="rounded-xl h-8 px-2.5 text-xs"
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Researcher Modal */}
      <InviteResearcherModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setPreselectedUser(null);
          refetch();
        }}
        programId={program.id}
        programName={program.name}
        preselectedUser={preselectedUser}
      />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-card p-6 border border-border shadow-xl">
          <AlertDialogHeader className="space-y-2">
            <div className="size-10 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Revoke Researcher Invitation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to revoke the invitation for{" "}
              <span className="font-semibold text-foreground">
                {revokeTarget ? getResearcherName(revokeTarget) : "this researcher"}
              </span>
              ? They will lose reporting access to this private program immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 gap-2">
            <AlertDialogCancel
              disabled={isRevoking}
              className="rounded-xl font-medium border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="rounded-xl font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Revoking...</span>
                </>
              ) : (
                <>
                  <UserX className="size-4" />
                  <span>Revoke Access</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ProgramInvitationStatus }) {
  switch (status) {
    case "INVITED":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg px-2 py-0.5">
          Invited
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg px-2 py-0.5">
          Accepted
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge className="bg-muted text-muted-foreground border border-border text-xs font-semibold rounded-lg px-2 py-0.5">
          Declined
        </Badge>
      );
    case "REVOKED":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg px-2 py-0.5">
          Revoked
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs font-semibold rounded-lg px-2 py-0.5">
          {status}
        </Badge>
      );
  }
}
