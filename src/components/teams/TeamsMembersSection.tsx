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
  SlidersHorizontal,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type {
  MemberRole,
  RoleFilter,
  StatusFilter,
  TeamCounts,
  TeamMember,
} from "@/components/teams/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_PERMISSIONS_BY_ROLE,
  INVITE_PERMISSION_OPTIONS,
  MAX_PERMISSIONS_BY_ROLE,
} from "@/components/teams/invite-member/mock-data";
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
import {
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";
import {
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { formatApiErrorMessage, parseApiError } from "@/lib/api/error-response";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  useRemoveMemberMutation,
  useUpdateMemberPermissionsMutation,
  useUpdateMemberRoleMutation,
  useGetOrganizationRolesQuery,
  type OrganizationInvitationPermission,
  type OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TeamActor = {
  role?: OrganizationInvitationRole;
  isOwner: boolean;
  canManage?: boolean;
};

const ROLE_FILTER_LABELS: Record<string, string> = {
  All: "All roles",
  Manager: "Manager",
  Member: "Member",
  Viewer: "Viewer",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  All: "All statuses",
  Active: "Active",
  Pending: "Invited",
};

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

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadgeVariant(role: MemberRole | null) {
  if (role === null) return "default";
  if (role === "Manager") return "default";
  if (role === "Member") return "secondary";
  return "outline";
}

function getRoleBadgeClass(role: MemberRole | null) {
  if (role === null) {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
  }

  if (role === "Manager") {
    return "border-foreground bg-muted text-foreground hover:bg-muted";
  }

  if (role === "Member") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  }

  return "border-border bg-muted text-muted-foreground";
}

function getMemberPermissions(member: TeamMember, actor: TeamActor) {
  // Owner is fully protected: role, permissions, and removal are completely locked
  if (member.isOwner) {
    return {
      canViewProfile: true,
      canEditRole: false,
      canEditPermissions: false,
      canRemove: false,
      disableSelfRemoval: true,
    };
  }

  const actorCanManage =
    actor.isOwner || actor.role === "MANAGER" || actor.canManage;

  return {
    canViewProfile: true,
    // Allowed to edit role if actor can manage and member is not pending
    canEditRole: Boolean(actorCanManage && !member.isPending),
    // Allowed to tune permissions if actor can manage and member is not pending
    canEditPermissions: Boolean(actorCanManage && !member.isPending),
    // Allowed to remove or cancel invitation
    canRemove: Boolean(actorCanManage),
    disableSelfRemoval: false,
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

type MemberMenuView = "card" | "row";

function memberMenuKey(view: MemberMenuView, memberId: string) {
  return `${view}:${memberId}`;
}

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
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [memberToTune, setMemberToTune] = useState<TeamMember | null>(null);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [offendingPermissions, setOffendingPermissions] = useState<string[]>([]);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    member: TeamMember;
    nextRole: OrganizationInvitationRole;
  } | null>(null);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);

  const { membership, isOwner, can } = useCompanyAccess();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [updateMemberRole, { isLoading: isUpdatingRole }] =
    useUpdateMemberRoleMutation();
  const [updateMemberPermissions, { isLoading: isSavingPermissions }] =
    useUpdateMemberPermissionsMutation();

  const actor: TeamActor = {
    role: membership?.role ?? undefined,
    isOwner,
    canManage: isOwner || membership?.role === "MANAGER" || can("MANAGE_MEMBERS"),
  };

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!isRemoving && memberToRemove) {
          setMemberToRemove(null);
        }
        if (!isUpdatingRole && pendingRoleChange) {
          setPendingRoleChange(null);
        }
        if (!isSavingPermissions && memberToTune) {
          setMemberToTune(null);
        }
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [memberToRemove, isRemoving, pendingRoleChange, isUpdatingRole, memberToTune, isSavingPermissions]);

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
    setOpenMenuKey(null);

    router.push(lp(`/dashboard/profile/${member.id}`));
  }

  function askToChangeRole(
    member: TeamMember,
    nextRole: OrganizationInvitationRole,
  ) {
    setOpenMenuKey(null);
    if (!member.role || nextRole === API_ROLE[member.role]) return;
    setRoleChangeError(null);
    setPendingRoleChange({ member, nextRole });
  }

  async function handleConfirmRoleChange() {
    if (!pendingRoleChange) return;
    const { member, nextRole } = pendingRoleChange;
    setRoleChangeError(null);

    const label =
      ROLE_CHOICES.find((choice) => choice.value === nextRole)?.label ??
      nextRole;

    try {
      await updateMemberRole({ userId: member.id, role: nextRole }).unwrap();

      toast.success({
        title: "Role updated",
        description: `${member.name} is now a ${label.toLowerCase()} on this team. Custom permissions have been reset to defaults.`,
      });
      setPendingRoleChange(null);
    } catch (error) {
      setRoleChangeError(
        formatApiErrorMessage(
          error,
          "The role could not be changed. Trying again is usually enough.",
        ),
      );
    }
  }

  function askToTunePermissions(member: TeamMember) {
    setOpenMenuKey(null);
    setPermissionsError(null);
    setOffendingPermissions([]);
    setMemberToTune(member);
  }

  async function handlePermissionsSave(
    next: OrganizationInvitationPermission[],
  ) {
    if (!memberToTune) return;

    setPermissionsError(null);
    setOffendingPermissions([]);
    try {
      await updateMemberPermissions({
        userId: memberToTune.id,
        permissions: next,
      }).unwrap();

      toast.success({
        title: "Permissions updated",
        description: `${memberToTune.name} now has ${next.length} of ${INVITE_PERMISSION_OPTIONS.length} permissions.`,
      });
      setMemberToTune(null);
    } catch (error) {
      const parsed = parseApiError(error);
      setOffendingPermissions(parsed.offendingPermissions ?? []);
      setPermissionsError(
        parsed.message ||
          "The permissions could not be saved. Trying again is usually enough.",
      );
    }
  }

  function askToRemove(member: TeamMember) {
    setOpenMenuKey(null);
    setRemovalError(null);
    setMemberToRemove(member);
  }

  async function handleRemoveConfirmed() {
    if (!memberToRemove) return;

    setRemovalError(null);

    try {
      await removeMember({ userId: memberToRemove.id }).unwrap();

      toast.success({
        title: memberToRemove.isPending ? "Invitation cancelled" : "Member removed",
        description: memberToRemove.isPending
          ? `The invitation to ${memberToRemove.name} has been cancelled.`
          : `${memberToRemove.name} no longer has access to this workspace.`,
      });
      setMemberToRemove(null);
    } catch (error) {
      setRemovalError(
        formatApiErrorMessage(
          error,
          memberToRemove.isPending
            ? "The invitation could not be cancelled. Trying again is usually enough."
            : "The member could not be removed. Trying again is usually enough.",
        ),
      );
    }
  }

  return (
    <>
      <div className="space-y-6">
        <FilterBar>
          <FilterRow>
            <FilterSearch
              value={searchTerm}
              onChange={setSearchTerm}
              label="Search members"
              placeholder="Search by member name or email..."
            />

            <FilterControls>
              <FilterSelect
                icon={UserRound}
                label="Role"
                items={ROLE_FILTER_LABELS}
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as RoleFilter)}
              />
              <FilterSelect
                icon={Filter}
                label="Status"
                items={STATUS_FILTER_LABELS}
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              />
            </FilterControls>
          </FilterRow>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredMembers.length} of {counts.total} members in view
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Team roster
            </p>
          </div>
        </FilterBar>

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
            <ul className="grid grid-cols-1 gap-3 lg:hidden">
              {filteredMembers.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  tone={getAvatarTone(member.id)}
                  permissions={getMemberPermissions(member, actor)}
                  isSelf={member.isSelf}
                  isOwner={member.isOwner}
                  menuOpen={openMenuKey === memberMenuKey("card", member.id)}
                  onMenuOpenChange={(open) =>
                    setOpenMenuKey(
                      open ? memberMenuKey("card", member.id) : null,
                    )
                  }
                  onViewProfile={() => openProfile(member)}
                  onRoleChange={(role) => askToChangeRole(member, role)}
                  onEditPermissions={() => askToTunePermissions(member)}
                  onRemove={() => askToRemove(member)}
                />
              ))}
            </ul>

            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 lg:block dark:ring-foreground/10">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="px-4 py-3.5 sm:px-6">
                      Member
                    </TableHead>
                    <TableHead scope="col" className="px-4 py-3.5 sm:px-6">
                      Role
                    </TableHead>
                    <TableHead scope="col" className="px-4 py-3.5 sm:px-6">
                      Access
                    </TableHead>
                    <TableHead scope="col" className="px-4 py-3.5 sm:px-6">
                      Status
                    </TableHead>
                    <TableHead scope="col" className="px-4 py-3.5 sm:px-6">
                      Joined
                    </TableHead>
                    <TableHead
                      scope="col"
                      className="px-4 py-3.5 text-center sm:px-6"
                    >
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMembers.map((member, index) => (
                    <MotionTableRow
                      key={member.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="group"
                    >
                      <TableCell className="px-4 py-4 whitespace-normal sm:px-6">
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
                              {member.isSelf ? <YouTag /> : null}
                              {member.isOwner ? <OwnerTag /> : null}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 sm:px-6">
                        <RoleBadge role={member.role} />
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-normal sm:px-6">
                        <AccessSummary
                          permissions={member.permissions}
                          isOwner={member.isOwner}
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4 sm:px-6">
                        <StatusBadge status={member.status} />
                      </TableCell>

                      <TableCell className="px-4 py-4 sm:px-6">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="size-4" />
                          {member.joined}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-center sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          {member.isPending && getMemberPermissions(member, actor).canRemove ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => askToRemove(member)}
                              className="h-8 cursor-pointer rounded-lg border-red-200/80 bg-red-50/50 px-2.5 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                              title="Cancel invitation"
                            >
                              <XCircle className="size-3.5 mr-1" />
                              Cancel invite
                            </Button>
                          ) : null}

                          <MemberActions
                            member={member}
                            permissions={getMemberPermissions(member, actor)}
                            open={openMenuKey === memberMenuKey("row", member.id)}
                            onOpenChange={(open) =>
                              setOpenMenuKey(
                                open ? memberMenuKey("row", member.id) : null,
                              )
                            }
                            onViewProfile={() => openProfile(member)}
                            onRoleChange={(role) => askToChangeRole(member, role)}
                            onEditPermissions={() => askToTunePermissions(member)}
                            onRemove={() => askToRemove(member)}
                          />
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {pendingRoleChange ? (
          <ConfirmRoleChangeDialog
            member={pendingRoleChange.member}
            nextRole={pendingRoleChange.nextRole}
            isUpdating={isUpdatingRole}
            error={roleChangeError}
            onCancel={() => {
              if (isUpdatingRole) return;
              setPendingRoleChange(null);
              setRoleChangeError(null);
            }}
            onConfirm={() => void handleConfirmRoleChange()}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {memberToTune && memberToTune.role ? (
          <EditPermissionsDialog
            member={memberToTune}
            role={memberToTune.role}
            offendingPermissions={offendingPermissions}
            isSaving={isSavingPermissions}
            error={permissionsError}
            onCancel={() => {
              if (isSavingPermissions) return;
              setMemberToTune(null);
              setPermissionsError(null);
              setOffendingPermissions([]);
            }}
            onSave={(next) => void handlePermissionsSave(next)}
          />
        ) : null}
      </AnimatePresence>

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

function RoleBadge({ role }: { role: MemberRole | null }) {
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
      {role ?? "Owner"}
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

function AccessSummary({
  permissions,
  isOwner,
}: {
  permissions: OrganizationInvitationPermission[];
  isOwner?: boolean;
}) {
  if (isOwner) {
    return (
      <Badge
        variant="secondary"
        className="rounded-full border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
      >
        All permissions
      </Badge>
    );
  }

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
          className="rounded-md border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {title}
        </Badge>
      ))}

      {rest > 0 ? (
        <Badge
          variant="outline"
          className="rounded-md border-dashed border-border px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          +{rest}
        </Badge>
      ) : null}
    </div>
  );
}

type MemberPermissions = ReturnType<typeof getMemberPermissions>;

function MemberActions({
  member,
  permissions,
  open,
  onOpenChange,
  onViewProfile,
  onRoleChange,
  onEditPermissions,
  onRemove,
}: {
  member: TeamMember;
  permissions: MemberPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewProfile: () => void;
  onRoleChange: (role: OrganizationInvitationRole) => void;
  onEditPermissions: () => void;
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

        {permissions.canEditRole ? (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              Role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={member.role ? API_ROLE[member.role] : undefined}
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

        {permissions.canEditPermissions ? (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem
              onClick={onEditPermissions}
              className="cursor-pointer rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground"
            >
              <SlidersHorizontal className="size-4" />
              Edit permissions
            </DropdownMenuItem>
          </>
        ) : null}

        {permissions.canRemove ? (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem
              variant="destructive"
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
  onEditPermissions,
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
  onEditPermissions: () => void;
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
          onEditPermissions={onEditPermissions}
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

      {member.isPending && permissions.canRemove ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="w-full cursor-pointer justify-center rounded-xl border-red-200/80 bg-red-50/50 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <XCircle className="size-4 mr-1.5" />
          Cancel invitation
        </Button>
      ) : null}

      <AccessSummary permissions={member.permissions} isOwner={member.isOwner} />
    </motion.li>
  );
}

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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center text-card-foreground shadow-xs"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Users className="size-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {body}
      </p>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.div>
  );
}

function ConfirmRoleChangeDialog({
  member,
  nextRole,
  isUpdating,
  error,
  onCancel,
  onConfirm,
}: {
  member: TeamMember;
  nextRole: OrganizationInvitationRole;
  isUpdating: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const roleLabel =
    ROLE_CHOICES.find((choice) => choice.value === nextRole)?.label ?? nextRole;
  const isDemotingSelf =
    member.isSelf &&
    ((member.role === "Manager" && nextRole !== "MANAGER") ||
      (member.role === "Member" && nextRole === "VIEWER"));

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
        aria-labelledby="confirm-role-change-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>

          <div className="space-y-2">
            <h3
              id="confirm-role-change-title"
              className="text-lg font-semibold text-foreground"
            >
              Change {member.name}&rsquo;s role to {roleLabel}?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Changing the role will reset custom permissions to the{" "}
              <strong className="font-semibold text-foreground">
                {roleLabel}
              </strong>{" "}
              defaults.
            </p>

            {member.isSelf ? (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                {isDemotingSelf
                  ? "You are about to demote yourself. You may lose access to this organization or its administrative settings."
                  : "You are about to change your own role. You may lose access to certain features in this organization."}
              </div>
            ) : null}
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
            disabled={isUpdating}
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-full border-border bg-card px-4 text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isUpdating}
            onClick={onConfirm}
            className="h-10 cursor-pointer rounded-full px-4"
          >
            {isUpdating ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {isUpdating ? "Updating…" : "Confirm role change"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditPermissionsDialog({
  member,
  role,
  offendingPermissions = [],
  isSaving,
  error,
  onCancel,
  onSave,
}: {
  member: TeamMember;
  role: MemberRole;
  offendingPermissions?: string[];
  isSaving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (permissions: OrganizationInvitationPermission[]) => void;
}) {
  const [selected, setSelected] = useState<OrganizationInvitationPermission[]>(
    () => member.permissions,
  );

  const { data: organizationRoles } = useGetOrganizationRolesQuery();

  const apiRole = API_ROLE[role];
  const backendRoleInfo = organizationRoles?.find((r) => r.role === apiRole);
  const roleDefaults =
    backendRoleInfo?.defaultPermissions ??
    DEFAULT_PERMISSIONS_BY_ROLE[apiRole] ??
    [];
  const roleCeiling =
    backendRoleInfo?.allowedPermissions ??
    MAX_PERMISSIONS_BY_ROLE[apiRole] ??
    [];

  const beyondRole = selected.filter(
    (permission) => !roleCeiling.includes(permission),
  );

  const isDirty =
    selected.length !== member.permissions.length ||
    selected.some((permission) => !member.permissions.includes(permission));

  function toggle(permission: OrganizationInvitationPermission) {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((entry) => entry !== permission)
        : [...current, permission],
    );
  }

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
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-permissions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <SlidersHorizontal className="size-5" />
          </div>

          <div className="min-w-0 space-y-1">
            <h3
              id="team-member-permissions-title"
              className="text-lg font-semibold text-foreground"
            >
              Permissions for {member.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is the set the workspace actually checks, and it takes effect
              the moment you save. A {role.toLowerCase()} can hold{" "}
              {roleCeiling.length} of {INVITE_PERMISSION_OPTIONS.length}{" "}
              permissions &mdash; promote them to grant more.
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-y border-border">
          <ul className="divide-y divide-border/60">
            {INVITE_PERMISSION_OPTIONS.map((option) => {
              const isOn = selected.includes(option.value);
              const withinRole = roleCeiling.includes(option.value);
              const isLocked = !withinRole;
              const isOffending = offendingPermissions.includes(option.value);

              return (
                <li
                  key={option.value}
                  className={cn(
                    "flex items-start justify-between gap-4 px-5 py-3.5 transition-colors",
                    isOffending && "bg-red-500/10 border-l-2 border-red-500",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isLocked ? "text-muted-foreground" : "text-foreground",
                          isOffending && "text-red-600 dark:text-red-400 font-bold",
                        )}
                      >
                        {option.title}
                      </p>
                      {isOffending ? (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Disallowed
                        </Badge>
                      ) : null}
                    </div>
                    <p
                      id={`permission-note-${option.value}`}
                      className="mt-0.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      {withinRole ? (
                        option.description
                      ) : (
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          Not available for {role} role &mdash; promote to grant.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-0.5 shrink-0">
                    <Switch
                      checked={isOn}
                      disabled={isSaving || isLocked}
                      onCheckedChange={() => toggle(option.value)}
                      aria-label={`${isOn ? "Remove" : "Grant"} ${option.title}`}
                      aria-describedby={`permission-note-${option.value}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {beyondRole.length > 0 ? (
          <div className="mx-5 mt-4 flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            <div className="flex items-start justify-between gap-3">
              <p>
                {beyondRole.length === 1
                  ? "1 permission is"
                  : `${beyondRole.length} permissions are`}{" "}
                outside a {role.toLowerCase()}&rsquo;s allowed permissions. You
                must remove them before saving.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelected((current) =>
                    current.filter((permission) =>
                      roleCeiling.includes(permission),
                    ),
                  )
                }
                className="shrink-0 h-7 rounded-lg border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-800 hover:bg-amber-500/20 dark:text-amber-200 cursor-pointer"
              >
                Remove disallowed
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mx-5 mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-medium leading-relaxed text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={() => setSelected(roleDefaults)}
            className="h-10 cursor-pointer rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Reset to {role.toLowerCase()} defaults
          </Button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onCancel}
              className="h-10 cursor-pointer rounded-full border-border bg-card px-4 text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSaving || !isDirty || beyondRole.length > 0}
              onClick={() => onSave(selected)}
              className="h-10 cursor-pointer rounded-full px-4"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              ) : null}
              {isSaving ? "Saving…" : "Save permissions"}
            </Button>
          </div>
        </div>
      </motion.div>
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

            {member.isSelf ? (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-50/70 p-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                Caution: You are about to remove yourself. You will immediately lose access to this organization.
              </div>
            ) : null}
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
