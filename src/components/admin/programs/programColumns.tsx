"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  ArrowUpDown,
  Building2,
  Check,
  LoaderCircle,
  Trash2,
  X,
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
import { ProgramManagementSummaryItem } from "@/lib/types/admin/programAdminTypes";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useDeleteProgramMutation } from "@/lib/redux/services/program/programsApi";
import {
  useApproveProgramMutation,
  useRejectProgramMutation,
} from "@/lib/redux/services/admin/programAdminApi";
import { ProgramRejectDialog } from "@/components/admin/programs/ProgramRejectDialog";
import { cn } from "@/lib/utils";

/** The sortable header the users table uses, so both read the same. */
function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="cursor-pointer px-0 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-transparent dark:text-slate-300"
    >
      {label}
      <ArrowUpDown data-icon="inline-end" />
    </Button>
  );
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

function OwnerProgramActions({
  program,
}: {
  program: ProgramManagementSummaryItem;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProgram, { isLoading }] = useDeleteProgramMutation();

  /* Deleting a program is its own permission, and a member without it meets a
     403 at the end of the confirmation. The button is not shown at all rather
     than shown and refused. */
  const { can } = useCompanyAccess();
  const canDelete = can("DELETE_PROGRAM");

  const handleDelete = async () => {
    try {
      await deleteProgram(program.id).unwrap();
      setIsOpen(false);
      toast.success("Program deleted", {
        description: `${program.name} was removed from your organization.`,
      });
    } catch (error) {
      toast.error("Delete failed", { description: errorMessageOf(error) });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/dashboard/program-management/${program.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold shadow-2xs dark:border-slate-800"
          )}
        >
          View
          <ArrowRight data-icon="inline-end" />
        </Link>
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label={`Delete ${program.name}`}
            onClick={() => setIsOpen(true)}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <AlertDialog
        open={isOpen}
        onOpenChange={(nextOpen) => !isLoading && setIsOpen(nextOpen)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete {program.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the program from your organization. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading && (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              )}
              {isLoading ? "Deleting..." : "Delete program"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AdminProgramActions({
  program,
}: {
  program: ProgramManagementSummaryItem;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveProgram, { isLoading: isApproving }] =
    useApproveProgramMutation();
  const [rejectProgram, { isLoading: isRejecting }] =
    useRejectProgramMutation();

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
      toast.success("Program rejected", {
        description: `"${program.name}" review feedback sent to organization.`,
      });
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error("Rejection failed", {
        description: message || "Failed to reject program.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {program.submissionState === "PENDING_REVIEW" && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isApproving || isRejecting}
              onClick={handleApprove}
              className="h-8 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/80 px-2.5 text-xs font-bold gap-1 cursor-pointer"
            >
              {isApproving ? (
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isApproving || isRejecting}
              onClick={() => setRejectOpen(true)}
              className="h-8 rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/80 px-2.5 text-xs font-bold gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
          </>
        )}
        <Link
          href={`/dashboard/program-management/${program.id}?scope=admin`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold shadow-2xs dark:border-slate-800"
          )}
        >
          Review
          <ArrowRight data-icon="inline-end" />
        </Link>
      </div>

      <ProgramRejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirmReject={handleRejectConfirm}
        programName={program.name}
      />
    </>
  );
}

export const getProgramColumns =
  ({ scope = "owner" }: { scope?: "owner" | "admin" } = {}): ColumnDef<ProgramManagementSummaryItem>[] => {
    const cols: ColumnDef<ProgramManagementSummaryItem>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader label="Program" column={column} />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 py-0.5 min-w-[200px]">
              <Avatar className="size-9 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {initialsOf(item.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/dashboard/program-management/${item.id}${
                    scope === "admin" ? "?scope=admin" : ""
                  }`}
                  className="block truncate text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                >
                  {item.name}
                </Link>
                <div className="truncate text-sm text-slate-500 dark:text-slate-400">
                  @{item.handle}
                </div>
              </div>
            </div>
          );
        },
      },
    ];

    if (scope === "admin") {
      cols.push({
        accessorKey: "organizationName",
        header: ({ column }) => (
          <SortableHeader label="Organization" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-slate-600 min-w-[140px] dark:text-slate-400">
            <Building2 aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{row.original.organizationName || "—"}</span>
          </div>
        ),
      });
    }

    cols.push(
      {
        accessorKey: "engagementType",
        header: ({ column }) => <SortableHeader label="Type" column={column} />,
        cell: ({ row }) => (
          <Badge variant="secondary" className="rounded-lg font-semibold text-xs dark:bg-slate-800 dark:text-slate-300">
            {row.original.engagementType === "BOUNTY" ? "BOUNTY" : "RESPONSE"}
          </Badge>
        ),
      },
      {
        accessorKey: "visibility",
        header: ({ column }) => (
          <SortableHeader label="Visibility" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium uppercase text-slate-600 dark:text-slate-400">
            {row.original.visibility}
          </span>
        ),
      },
      {
        accessorKey: "state",
        header: ({ column }) => (
          <SortableHeader label="Lifecycle" column={column} />
        ),
        cell: ({ row }) => <ProgramStateBadge state={row.original.state} />,
      },
      {
        accessorKey: "submissionState",
        header: ({ column }) => (
          <SortableHeader label="Review Status" column={column} />
        ),
        cell: ({ row }) => (
          <ProgramReviewBadge status={row.original.submissionState} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader label="Submitted" column={column} />
        ),
        cell: ({ row }) => {
          const raw = row.original.createdAt;
          const formatted =
            raw && !Number.isNaN(Date.parse(raw))
              ? new Date(raw).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—";
          return (
            <span className="text-sm font-medium whitespace-nowrap text-slate-600 dark:text-slate-400">
              {formatted}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 min-w-[100px]">
            Actions
          </div>
        ),
        cell: ({ row }) => {
          if (scope === "owner") {
            return <OwnerProgramActions program={row.original} />;
          }

          return <AdminProgramActions program={row.original} />;
        },
      }
    );

    return cols;
  };
