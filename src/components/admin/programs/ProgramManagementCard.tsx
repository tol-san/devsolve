"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Coins,
  Globe,
  LoaderCircle,
  Lock,
  Shield,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ProgramReviewBadge,
  ProgramStateBadge,
} from "@/components/admin/programs/ProgramStatusBadge";
import { ProgramRejectDialog } from "@/components/admin/programs/ProgramRejectDialog";
import { ProgramManagementSummaryItem } from "@/lib/types/admin/programAdminTypes";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useDeleteProgramMutation } from "@/lib/redux/services/program/programsApi";
import {
  useApproveProgramMutation,
  useRejectProgramMutation,
} from "@/lib/redux/services/admin/programAdminApi";
import { cn } from "@/lib/utils";

interface ProgramManagementCardProps {
  program: ProgramManagementSummaryItem;
  scope?: "owner" | "admin";
  index?: number;
}

function initialsOf(name?: string) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "P";
}

function errorMessageOf(error: unknown) {
  return (
    (error as { data?: { message?: string } } | undefined)?.data?.message ??
    "The program could not be deleted. Please try again."
  );
}

export function ProgramManagementCard({
  program,
  scope = "owner",
  index = 0,
}: ProgramManagementCardProps) {
  // Owner Actions state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();
  const { can } = useCompanyAccess();
  const canDelete = can("DELETE_PROGRAM");

  // Admin Actions state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveProgram, { isLoading: isApproving }] =
    useApproveProgramMutation();
  const [rejectProgram, { isLoading: isRejecting }] =
    useRejectProgramMutation();

  const isBounty = program.engagementType === "BOUNTY";
  const isPrivate =
    program.visibility === "PRIVATE" || program.visibility === "INVITE_ONLY";

  const formattedDate = useMemo(() => {
    const raw = program.createdAt;
    if (!raw || Number.isNaN(Date.parse(raw))) return "—";
    return new Date(raw).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [program.createdAt]);

  const targetUrl = `/dashboard/program-management/${program.id}${
    scope === "admin" ? "?scope=admin" : ""
  }`;

  const handleDelete = async () => {
    try {
      await deleteProgram(program.id).unwrap();
      setDeleteOpen(false);
      toast.success("Program deleted", {
        description: `${program.name} was removed from your organization.`,
      });
    } catch (error) {
      toast.error("Delete failed", { description: errorMessageOf(error) });
    }
  };

  const handleApprove = async () => {
    try {
      await approveProgram({ id: program.id }).unwrap();
      toast.success("Program approved", {
        description: `"${program.name}" has been approved for publication.`,
      });
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error("Approval failed", {
        description: message || "Failed to approve program.",
      });
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    try {
      await rejectProgram({ id: program.id, reason }).unwrap();
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error("Rejection failed", {
        description: message || "Failed to reject program.",
      });
      throw err;
    }
  };

  const min = program.minimumBounty ?? 0;
  const max = program.maximumBounty ?? 0;
  const hasBountyRange = isBounty && (min > 0 || max > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md dark:hover:shadow-black/30"
    >
      <div className="space-y-3.5">
        {/* Top: Identity & Review Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Link href={targetUrl} tabIndex={-1} className="shrink-0">
              <Avatar className="size-11 rounded-xl border border-border bg-muted/60 shadow-2xs group-hover:scale-105 transition-transform cursor-pointer">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-sm font-bold text-foreground">
                  {initialsOf(program.name)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={targetUrl}
                className="block truncate text-base font-bold text-foreground transition-colors hover:text-primary leading-snug"
                title={program.name}
              >
                {program.name}
              </Link>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">@{program.handle}</span>
                {scope === "admin" && program.organizationName && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 truncate font-medium">
                      <Building2 className="size-3 shrink-0" />
                      <span className="truncate">{program.organizationName}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <ProgramReviewBadge status={program.submissionState} />
          </div>
        </div>

        {/* Chips: Lifecycle, Visibility, Engagement Type */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <ProgramStateBadge state={program.state} />

          <Badge
            variant="outline"
            className="gap-1 rounded-lg border-border bg-muted/40 px-2 py-0.5 text-xs font-semibold text-foreground"
          >
            {isBounty ? (
              <>
                <Coins className="size-3 text-amber-500 shrink-0" />
                <span>Bounty</span>
              </>
            ) : (
              <>
                <Shield className="size-3 text-blue-500 shrink-0" />
                <span>VDP</span>
              </>
            )}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              "gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold",
              isPrivate
                ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            {isPrivate ? (
              <>
                <Lock className="size-3 shrink-0" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="size-3 shrink-0" />
                <span>Public</span>
              </>
            )}
          </Badge>
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Bounty Rewards Strip */}
        {hasBountyRange && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
            <span className="font-medium text-muted-foreground">Reward range</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              ${min.toLocaleString()} – ${max.toLocaleString()}
            </span>
          </div>
        )}

        {/* Rejection notice callout */}
        {program.submissionState === "REJECTED" && program.rejectionReason && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold">Review note: </span>
              <span className="line-clamp-2">{program.rejectionReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Date & Actions */}
      <div className="mt-4 pt-3.5 border-t border-border/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {scope === "owner" ? (
            <>
              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${program.name}`}
                  onClick={() => setDeleteOpen(true)}
                  className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </>
          ) : (
            <>
              {program.submissionState === "PENDING_REVIEW" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isApproving || isRejecting}
                    onClick={handleApprove}
                    className="h-8 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 px-2.5 text-xs font-bold gap-1 cursor-pointer"
                  >
                    {isApproving ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span>Approve</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isApproving || isRejecting}
                    onClick={() => setRejectOpen(true)}
                    className="h-8 rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-400 px-2.5 text-xs font-bold gap-1 cursor-pointer"
                  >
                    <X className="size-3.5" />
                    <span>Reject</span>
                  </Button>
                </>
              )}

              <Link
                href={targetUrl}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 rounded-xl border-border bg-card px-3 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted cursor-pointer transition-colors gap-1",
                )}
              >
                <span>Review</span>
                <ArrowRight className="size-3 text-muted-foreground" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Delete Dialog for Owner */}
      {scope === "owner" && canDelete && (
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(nextOpen) => !isDeleting && setDeleteOpen(nextOpen)}
        >
          <AlertDialogContent className="rounded-2xl bg-card border border-border">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <Trash2 className="size-5 text-rose-500" aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete {program.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the program from your organization.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl font-semibold"
              >
                {isDeleting && (
                  <LoaderCircle className="size-3.5 animate-spin mr-1.5" />
                )}
                {isDeleting ? "Deleting..." : "Delete program"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Dialog for Admin */}
      {scope === "admin" && (
        <ProgramRejectDialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirmReject={handleRejectConfirm}
          programName={program.name}
        />
      )}
    </motion.div>
  );
}
