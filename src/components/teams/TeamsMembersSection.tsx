"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  Crown,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  Users,
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
import { INVITE_PERMISSION_OPTIONS } from "@/components/teams/invite-member/mock-data";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useMyMembership } from "@/hooks/useMyMembership";
import { apiErrorMessage, apiErrorStatus } from "@/lib/api/error-message";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  type OrganizationInvitationPermission,
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

  /* The roster does not mark the owner — the role column only knows the three
     invitable ranks — but the organization names them, and knowing which row
     is the owner is half of reading a team list. */
  const ownerId = organization?.ownerId;

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
      {/* Same shell and controls as the saved drafts screen: one soft card,
          a muted search field, and the filters as labelled selects rather than
          a pill row — so the two list screens read as one family. */}
      <div className="rounded-[24px] bg-card p-5 text-card-foreground shadow-[0_10px_24px_rgba(15,23,42,0.04)] ring-1 ring-foreground/5 sm:p-6 dark:ring-foreground/10">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by member name or email..."
                className="h-11 rounded-xl border border-transparent bg-muted/50 pr-3 pl-9 text-sm text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <UserRound className="size-4" />
                <span className="shrink-0 font-medium">Role</span>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as RoleFilter)}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent font-medium text-foreground shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_FILTERS.map((filter) => (
                      <SelectItem key={filter} value={filter}>
                        {filter === "All" ? "All roles" : filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <Filter className="size-4" />
                <span className="shrink-0 font-medium">Status</span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger className="h-8 border-none bg-transparent font-medium text-foreground shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter} value={filter}>
                        {filter === "All" ? "All statuses" : filter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredMembers.length} of {counts.total} members in view
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Team roster
            </p>
          </div>
        </div>
      </div>

      {isError ? (
        <RosterMessage
          title="We could not load your team"
          body="The organization service did not answer. Your members are still there — this screen just could not read them."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
            >
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <RosterSkeleton />
      ) : filteredMembers.length === 0 ? (
        counts.total === 0 ? (
          <RosterMessage
            title="No one else is here yet"
            body="Invite the people who triage your reports and run your programs. They need a DevSolve account first — an invitation is matched to the address it was sent to."
            action={
              <Link
                href={lp("/dashboard/team-management/invite")}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 rounded-xl px-4 text-sm font-semibold",
                )}
              >
                <UserPlus className="size-4" />
                Invite your first member
              </Link>
            }
          />
        ) : (
          <RosterMessage
            title="No members match these filters"
            body={"All " + counts.total + " of them are still on the team — the search or the filters are hiding them."}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("All");
                  setStatusFilter("All");
                }}
                className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold"
              >
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <>
          {/* Cards below `lg`, where six columns would only mean a sideways
              scroll and a row nobody can read end to end. */}
          <ul className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredMembers.map((member, index) => (
              <MemberCard
                key={member.id}
                member={member}
                index={index}
                tone={getAvatarTone(member.id)}
                permissions={getMemberPermissions(member, actor)}
                isSelf={member.id === actor.userId}
                isOwner={member.id === ownerId}
                menuOpen={openMenuMemberId === member.id}
                onMenuOpenChange={(open) =>
                  setOpenMenuMemberId(open ? member.id : null)
                }
                onViewProfile={() => openProfile(member)}
                onRoleChange={(role) => void handleRoleChange(member, role)}
                onRemove={() => askToRemove(member)}
              />
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 lg:block dark:ring-foreground/10">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3.5 sm:px-6">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">
                    Access
                  </th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">
                    Joined
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center sm:px-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="group transition-colors duration-200 hover:bg-muted/50"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-4">
                        <Avatar
                          size="lg"
                          className={cn(
                            "size-11 rounded-full",
                            getAvatarTone(member.id),
                          )}
                        >
                          <AvatarImage
                            src={member.avatar}
                            alt=""
                            className="rounded-full object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "rounded-full font-bold",
                              getAvatarTone(member.id),
                            )}
                          >
                            {getMemberInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-base font-semibold tracking-[-0.01em] text-foreground">
                              {member.name}
                            </span>
                            {member.id === actor.userId ? <YouTag /> : null}
                            {member.id === ownerId ? <OwnerTag /> : null}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                      <RoleBadge role={member.role} />
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <AccessSummary permissions={member.permissions} />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                      <StatusBadge status={member.status} />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        {member.joined}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap sm:px-6">
                      <MemberActions
                        member={member}
                        permissions={getMemberPermissions(member, actor)}
                        open={openMenuMemberId === member.id}
                        onOpenChange={(open) =>
                          setOpenMenuMemberId(open ? member.id : null)
                        }
                        onViewProfile={() => openProfile(member)}
                        onRoleChange={(role) =>
                          void handleRoleChange(member, role)
                        }
                        onRemove={() => askToRemove(member)}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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

/**
 * The last stop before someone loses their access.
 *
 * It holds while the request is in flight and keeps itself open if the request
 * fails, with the reason under the name it is about — a toast that has already
 * faded is no help to someone deciding whether to press it again.
 */
/** The wording the invite screen uses for a permission, so both agree. */
function permissionTitle(permission: OrganizationInvitationPermission): string {
  return (
    INVITE_PERMISSION_OPTIONS.find((option) => option.value === permission)
      ?.title ?? permission
  );
}

function YouTag() {
  return (
    <Badge
      variant="outline"
      className="h-6 shrink-0 rounded-full px-2 text-xs font-semibold text-muted-foreground"
    >
      You
    </Badge>
  );
}

function OwnerTag() {
  return (
    <Badge
      variant="outline"
      className="h-6 shrink-0 gap-1 rounded-full border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
    >
      <Crown className="size-3" />
      Owner
    </Badge>
  );
}

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <Badge
      variant={getRoleBadgeVariant(role)}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-semibold",
        getRoleBadgeClass(role),
      )}
    >
      {role === "Manager" ? (
        <Crown className="size-3.5" />
      ) : role === "Member" ? (
        <UserRound className="size-3.5" />
      ) : (
        <Eye className="size-3.5" />
      )}
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: TeamMember["status"] }) {
  const active = status === "Active";

  return (
    <Badge
      variant={active ? "secondary" : "outline"}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          active ? "bg-emerald-500" : "bg-amber-400",
        )}
      />
      {active ? "Active" : "Invited"}
    </Badge>
  );
}

/**
 * What a member may actually do, in two chips and a count.
 *
 * The roster returns the whole list per member and the screen used to show
 * none of it — so a manager could see who was on the team but not what any of
 * them had been given. Two fit without crowding the row; the rest are on the
 * title, and all of them are on the card at small sizes.
 */
function AccessSummary({
  permissions,
}: {
  permissions: OrganizationInvitationPermission[];
}) {
  if (permissions.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">No permissions</span>
    );
  }

  const titles = permissions.map(permissionTitle);
  const shown = titles.slice(0, 2);
  const rest = titles.length - shown.length;

  return (
    <div
      title={titles.join(", ")}
      className="flex flex-wrap items-center gap-1.5"
    >
      {shown.map((title) => (
        <Badge
          key={title}
          variant="secondary"
          className="rounded-lg text-xs font-medium"
        >
          {title}
        </Badge>
      ))}
      {rest > 0 ? (
        <span className="text-xs font-semibold text-muted-foreground">
          +{rest} more
        </span>
      ) : null}
    </div>
  );
}

type MemberPermissions = ReturnType<typeof getMemberPermissions>;

/** The row menu, shared by the table and the cards so they cannot drift. */
function MemberActions({
  member,
  permissions,
  open,
  onOpenChange,
  onViewProfile,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  permissions: MemberPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewProfile: () => void;
  onRoleChange: (role: OrganizationInvitationRole) => void;
  onRemove: () => void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        aria-label={`Open actions for ${member.name}`}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
      >
        <MoreHorizontal className="size-4.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-56 min-w-0 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card p-1 text-card-foreground shadow-md"
      >
        {permissions.canViewProfile ? (
          <DropdownMenuItem
            onClick={onViewProfile}
            className="cursor-pointer rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground"
          >
            <Eye className="size-4" />
            View profile
          </DropdownMenuItem>
        ) : null}

        {/* The role is changed here rather than behind an "edit" that opened
            nothing: three values, one PATCH, and the roster refetches itself.
            There is no status control — the API has no endpoint for it, and an
            invited member is simply someone who has not accepted yet. */}
        {permissions.canEditRole ? (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              Role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={API_ROLE[member.role]}
              onValueChange={(nextRole) =>
                onRoleChange(nextRole as OrganizationInvitationRole)
              }
            >
              {ROLE_CHOICES.map((choice) => (
                <DropdownMenuRadioItem
                  key={choice.value}
                  value={choice.value}
                  className="cursor-pointer rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground"
                >
                  {choice.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        ) : null}

        {permissions.canRemove || permissions.disableSelfRemoval ? (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem
              variant="destructive"
              disabled={permissions.disableSelfRemoval}
              onClick={onRemove}
              className="cursor-pointer rounded-[10px] px-3 py-2.5 text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400"
            >
              <Trash2 className="size-4" />
              {member.isPending ? "Cancel invitation" : "Remove member"}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The same row, for widths where a six-column table is unreadable. */
function MemberCard({
  member,
  index,
  tone,
  permissions,
  isSelf,
  isOwner,
  menuOpen,
  onMenuOpenChange,
  onViewProfile,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  index: number;
  tone: string;
  permissions: MemberPermissions;
  isSelf: boolean;
  isOwner: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onViewProfile: () => void;
  onRoleChange: (role: OrganizationInvitationRole) => void;
  onRemove: () => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="space-y-3 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className={cn("size-11 shrink-0 rounded-full", tone)}>
            <AvatarImage
              src={member.avatar}
              alt=""
              className="rounded-full object-cover"
            />
            <AvatarFallback className={cn("rounded-full font-bold", tone)}>
              {getMemberInitials(member.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {member.name}
              </span>
              {isSelf ? <YouTag /> : null}
              {isOwner ? <OwnerTag /> : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {member.email}
            </p>
          </div>
        </div>

        <MemberActions
          member={member}
          permissions={permissions}
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          onViewProfile={onViewProfile}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RoleBadge role={member.role} />
        <StatusBadge status={member.status} />
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {member.joined}
        </span>
      </div>

      <AccessSummary permissions={member.permissions} />
    </motion.li>
  );
}

/** Loading, refused, empty — all three answer in the roster's own shape. */
function RosterSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your team"
      className="space-y-3"
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-20 animate-pulse rounded-2xl border border-border bg-muted/60"
        />
      ))}
    </div>
  );
}

function RosterMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center"
    >
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
      >
        <Users className="size-6" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.div>
  );
}

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
              {member.isPending
                ? `Cancel the invitation to ${member.name}?`
                : `Remove ${member.name}?`}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {member.isPending
                ? "They have not accepted yet, so nothing of theirs is affected. The link in their email stops working, and you can invite them again whenever you like."
                : "They lose access to this organization's workspace right away. Their reports and activity stay where they are. Getting them back on the team means sending a new invitation."}
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
            {isRemoving
              ? "Working…"
              : member.isPending
                ? "Cancel invitation"
                : "Remove member"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
