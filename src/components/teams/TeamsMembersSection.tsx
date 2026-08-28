"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Crown,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ROLE_FILTERS, STATUS_FILTERS } from "@/components/teams/mock-data";
import type {
  MemberRole,
  RoleFilter,
  StatusFilter,
  TeamCounts,
  TeamMember,
} from "@/components/teams/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useMyMembership } from "@/hooks/useMyMembership";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  type OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

/** The signed-in account, as far as this roster is concerned. */
type TeamActor = {
  userId?: string;
  role?: OrganizationInvitationRole;
  isOwner: boolean;
};

/** The wire values, from the display ones this table carries. */
const API_ROLE: Record<MemberRole, OrganizationInvitationRole> = {
  Manager: "MANAGER",
  Member: "MEMBER",
  Viewer: "VIEWER",
};

const ROLE_CHOICES: { value: OrganizationInvitationRole; label: string }[] = [
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

/** What the upstream's refusals mean to the person who pressed the button. */
function memberActionMessage(error: unknown, fallback: string): string {
  const status = apiErrorStatus(error);

  if (status === 401) {
    return "Your session ended. Sign in again and try once more.";
  }
  if (status === 403) {
    return "Your role does not allow this. An owner or manager can do it.";
  }
  if (status === 404) {
    return "That person is no longer on this team — the list is already out of date.";
  }

  return apiErrorMessage(error, fallback);
}

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadgeVariant(role: MemberRole) {
  if (role === "Manager") return "default";
  if (role === "Member") return "secondary";
  return "outline";
}

function getRoleBadgeClass(role: MemberRole) {
  if (role === "Manager") {
    return "border-foreground bg-muted text-foreground hover:bg-muted";
  }

  if (role === "Member") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  }

  return "border-border bg-muted text-muted-foreground";
}

function getMemberPermissions(member: TeamMember, actor: TeamActor) {
  const isCurrentUser = Boolean(actor.userId) && member.id === actor.userId;

  /* An owner may act on anyone but themselves. A manager may act on the ranks
     below them and never on another manager. Everyone else is here to read.
     The backend decides the same question again on every request — this only
     keeps the menu from offering what it would refuse. */
  const canManageTarget =
    actor.isOwner || (actor.role === "MANAGER" && member.role !== "Manager");

  return {
    canViewProfile: true,
    canEditRole: !isCurrentUser && canManageTarget,
    canRemove: !isCurrentUser && canManageTarget,
    disableSelfRemoval: isCurrentUser,
  };
}

type TeamsMembersSectionProps = {
  counts: TeamCounts;
  filteredMembers: TeamMember[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: RoleFilter;
  setRoleFilter: (filter: RoleFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
};

export function TeamsMembersSection({
  counts,
  filteredMembers,
  isError,
  isLoading,
  onRetry,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: TeamsMembersSectionProps) {
  const router = useRouter();
  const lp = useLocalePath();
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);

  const { member: ownMembership, organization } = useMyMembership();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();

  const actor: TeamActor = {
    userId: ownMembership?.userId,
    role: ownMembership?.role,
    /* Not on the roster at all means the owner: they reach this screen through
       the company account rather than through a membership row. */
    isOwner:
      !ownMembership || organization?.ownerId === ownMembership.userId,
  };

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      /* Not while the request is in flight: closing the dialog would leave the
         person with no idea whether it went through. */
      if (event.key === "Escape" && !isRemoving) {
        setMemberToRemove(null);
      }
    }

    if (memberToRemove) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [memberToRemove, isRemoving]);

  function getAvatarTone(memberId: string) {
    const tones = [
      "bg-[#2563EB] text-white",
      "bg-blue-600 text-white",
      "bg-sky-600 text-white",
      "bg-indigo-600 text-white",
      "bg-blue-500 text-white",
      "bg-cyan-600 text-white",
    ];

    const numericSeed = memberId
      .split("")
      .reduce((total, char) => total + char.charCodeAt(0), 0);

    return tones[numericSeed % tones.length];
  }

  function openProfile(member: TeamMember) {
    setOpenMenuMemberId(null);

    /* `member.id` is the backend `userId`. The profile route takes either a
       username or a user id and tells the two apart itself, so the id goes
       straight in — there is no username on a member record to look up. */
    router.push(lp(`/dashboard/profile/${member.id}`));
  }

  async function handleRoleChange(
    member: TeamMember,
    nextRole: OrganizationInvitationRole,
  ) {
    setOpenMenuMemberId(null);
    if (nextRole === API_ROLE[member.role]) return;

    const label =
      ROLE_CHOICES.find((choice) => choice.value === nextRole)?.label ??
      "member";

    try {
      await updateMemberRole({ userId: member.id, role: nextRole }).unwrap();

      toast.success({
        title: "Role updated",
        description: `${member.name} is now a ${label.toLowerCase()} on this team.`,
      });
    } catch (error) {
      toast.destructive({
        title: "Role not updated",
        description: memberActionMessage(
          error,
          "The role could not be changed. Trying again is usually enough.",
        ),
      });
    }
  }

  function askToRemove(member: TeamMember) {
    setOpenMenuMemberId(null);
    setRemovalError(null);
    setMemberToRemove(member);
  }

  /**
   * The removal itself.
   *
   * `removeMember` invalidates `OrganizationMembers`, so the roster refetches
   * on its own and the row leaves without anything here tracking it. The
   * dialog stays open on failure: the message belongs next to the name it is
   * about, not only in a toast that fades.
   */
  async function handleRemoveConfirmed() {
    if (!memberToRemove) return;

    setRemovalError(null);

    try {
      await removeMember({ userId: memberToRemove.id }).unwrap();

      toast.success({
        title: "Member removed",
        description: `${memberToRemove.name} no longer has access to this workspace.`,
      });
      setMemberToRemove(null);
    } catch (error) {
      setRemovalError(
        memberActionMessage(
          error,
          "The member could not be removed. Trying again is usually enough.",
        ),
      );
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card text-card-foreground p-3.5 shadow-xs sm:p-4 ring-1 ring-foreground/5 dark:ring-foreground/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by member name or email..."
              className="h-10.5 w-full rounded-xl border border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-600/30"
            />
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1">
              {ROLE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRoleFilter(filter)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:flex-initial cursor-pointer",
                    roleFilter === filter
                      ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            <StatusFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3.5 sm:px-6">Member</th>
                <th className="px-4 py-3.5 sm:px-6">Email</th>
                <th className="px-4 py-3.5 sm:px-6">Role</th>
                <th className="px-4 py-3.5 sm:px-6">Status</th>
                <th className="px-4 py-3.5 sm:px-6">Joined</th>
                <th className="px-4 py-3.5 text-center sm:px-6">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`team-loading-${index}`} className="animate-pulse">
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-full bg-slate-200" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-40 rounded bg-slate-200" />
                            <div className="h-3 w-28 rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="h-4 w-40 rounded bg-slate-100" />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="h-8 w-24 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="h-8 w-24 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="h-4 w-28 rounded bg-slate-100" />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="ml-auto h-9 w-9 rounded-xl bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center"
                    >
                      <div className="space-y-3">
                        <p className="text-base font-medium text-slate-700">
                          We couldn&apos;t load your team members.
                        </p>
                        <p className="text-sm text-slate-400">
                          Check your organization access and try again.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onRetry}
                          className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Try again
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-base text-slate-400"
                  >
                    No members match your current filters.
                  </td>
                </tr>
                )
              ) : (
                filteredMembers.map((member, index) => {
                  const permissions = getMemberPermissions(member, actor);

                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="group transition-colors duration-200 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-4">
                          <Avatar
                            size="lg"
                            className={cn(
                              "size-12 rounded-full border-2 border-white shadow-[0_6px_18px_rgba(148,163,184,0.24)]",
                              getAvatarTone(member.id)
                            )}
                          >
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                              className="rounded-full object-cover"
                            />
                            <AvatarFallback
                              className={cn(
                                "rounded-full font-bold",
                                getAvatarTone(member.id)
                              )}
                            >
                              {getMemberInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold tracking-[-0.03em] text-foreground sm:text-base">
                                {member.name}
                              </span>
                              {member.role === "Manager" ? (
                                <Crown className="size-4 text-blue-600 dark:text-blue-400" />
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                              Workspace collaborator
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <span className="text-sm font-medium text-muted-foreground">
                          {member.email}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-semibold",
                            getRoleBadgeClass(member.role)
                          )}
                        >
                          {member.role === "Manager" ? (
                            <Crown className="size-3.5" />
                          ) : member.role === "Member" ? (
                            <UserRound className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                          {member.role}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <Badge
                          variant={member.status === "Active" ? "secondary" : "outline"}
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-semibold",
                            member.status === "Active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              member.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-amber-400"
                            )}
                          />
                          {member.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                          <CalendarDays className="size-4 text-muted-foreground" />
                          {member.joined}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap sm:px-6">
                        <DropdownMenu
                          open={openMenuMemberId === member.id}
                          onOpenChange={(open) => setOpenMenuMemberId(open ? member.id : null)}
                        >
                          <DropdownMenuTrigger
                            aria-label={`Open actions for ${member.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 cursor-pointer"
                          >
                            <MoreHorizontal className="size-4.5" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            side="bottom"
                            sideOffset={8}
                            className="w-56 min-w-0 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card text-card-foreground p-1 shadow-md"
                          >
                            {permissions.canViewProfile ? (
                              <DropdownMenuItem
                                onClick={() => openProfile(member)}
                                className="rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                              >
                                <Eye className="size-4" />
                                View profile
                              </DropdownMenuItem>
                            ) : null}

                            {/* The role is changed here rather than behind an
                                "edit" that opened nothing: three values, one
                                PATCH, and the roster refetches itself. There is
                                no status control — the API has no endpoint for
                                it, and PENDING is simply an invitation nobody
                                has accepted yet. */}
                            {permissions.canEditRole ? (
                              <>
                                <DropdownMenuSeparator className="my-1 bg-border" />
                                <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                                  Role
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                  value={API_ROLE[member.role]}
                                  onValueChange={(nextRole) =>
                                    void handleRoleChange(
                                      member,
                                      nextRole as OrganizationInvitationRole,
                                    )
                                  }
                                >
                                  {ROLE_CHOICES.map((choice) => (
                                    <DropdownMenuRadioItem
                                      key={choice.value}
                                      value={choice.value}
                                      className="rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                                    >
                                      {choice.label}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </>
                            ) : null}

                            {(permissions.canRemove || permissions.disableSelfRemoval) && (
                              <>
                                <DropdownMenuSeparator className="my-1 bg-border" />
                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={permissions.disableSelfRemoval}
                                  onClick={() => askToRemove(member)}
                                  className="rounded-[10px] px-3 py-2.5 text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="size-4" />
                                  Remove member
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground sm:flex-row">
          <span className="font-medium">
            Showing {filteredMembers.length} of {counts.total} members
          </span>
          <span className="text-muted-foreground/80">
            Filter by role or status to narrow the roster
          </span>
        </footer>
      </div>

      <AnimatePresence>
        {memberToRemove ? (
          <RemoveMemberDialog
            member={memberToRemove}
            isRemoving={isRemoving}
            error={removalError}
            onCancel={() => {
              if (isRemoving) return;
              setMemberToRemove(null);
              setRemovalError(null);
            }}
            onConfirm={() => void handleRemoveConfirmed()}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StatusFilterSelect({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-10.5 min-w-[160px] items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground shadow-2xs outline-none transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-blue-600/20 cursor-pointer"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[180px] rounded-2xl border border-border bg-card text-card-foreground p-1.5 shadow-md"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(nextValue) => onChange(nextValue as StatusFilter)}>
          {STATUS_FILTERS.map((filter) => (
            <DropdownMenuRadioItem
              key={filter}
              value={filter}
              className="rounded-xl px-3 py-2 text-sm text-foreground data-[checked]:bg-blue-500/10 data-[checked]:font-semibold data-[checked]:text-blue-600 dark:data-[checked]:text-blue-400 focus:bg-muted cursor-pointer"
            >
              <span>{filter}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The last stop before someone loses their access.
 *
 * It holds while the request is in flight and keeps itself open if the request
 * fails, with the reason under the name it is about — a toast that has already
 * faded is no help to someone deciding whether to press it again.
 */
function RemoveMemberDialog({
  member,
  isRemoving,
  error,
  onCancel,
  onConfirm,
}: {
  member: TeamMember;
  isRemoving: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>

          <div className="space-y-2">
            <h3
              id="team-member-confirm-title"
              className="text-lg font-semibold text-foreground"
            >
              Remove {member.name}?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              They lose access to this organization&apos;s workspace right away.
              Their reports and activity stay where they are. Getting them back
              on the team means sending a new invitation.
            </p>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-medium leading-relaxed text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isRemoving}
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-full border-border bg-card px-4 text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isRemoving}
            onClick={onConfirm}
            className="h-10 cursor-pointer rounded-full px-4"
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isRemoving ? "Removing…" : "Remove member"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
