import { useMemo, useState } from "react";

import type {
  MemberRole,
  MemberStatus,
  RoleFilter,
  StatusFilter,
  TeamCounts,
  TeamMember,
} from "@/components/teams/types";
import { useGetOrganizationMembersQuery } from "@/lib/redux/services/organizationsApi";

function buildTeamCounts(members: TeamMember[]): TeamCounts {
  const active = members.filter(
    (member) => member.status === "Active",
  ).length;
  const pending = members.filter(
    (member) => member.status === "Invited",
  ).length;
  const managers = members.filter(
    (member) => member.role === "Manager",
  ).length;
  const collaborators = members.filter(
    (member) => member.role === "Member",
  ).length;
  const viewers = members.filter(
    (member) => member.role === "Viewer",
  ).length;

  return {
    total: members.length,
    active,
    pending,
    managers,
    members: collaborators,
    viewers,
  };
}

function formatJoinedDate(joinedAt?: string): string {
  if (!joinedAt) {
    return "Pending invitation";
  }

  const parsedDate = new Date(joinedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Pending invitation";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The owner has no role, and defaulting them to `Member` was not harmless: it
 * read as a demotion in the Role column, and it made the owner look like a rank
 * a manager may act on.
 */
function formatRole(role?: string | null): MemberRole | null {
  if (role === "MANAGER") return "Manager";
  if (role === "MEMBER") return "Member";
  if (role === "VIEWER") return "Viewer";

  return null;
}

/**
 * `SUSPENDED` names an invitation nobody has accepted yet rather than a
 * disciplinary state — reading it as anything else showed people who had never
 * arrived as fully active members of the team.
 */
function formatStatus(
  status?: string,
  invitationPending?: boolean,
): MemberStatus {
  if (invitationPending || status === "SUSPENDED") {
    return "Invited";
  }

  return "Active";
}

function formatMemberName(
  name: string | undefined,
  email: string,
): string {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const [localPart = "Member"] = email.split("@");

  return localPart;
}

export function useTeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("All");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const {
    data: organizationMembers = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetOrganizationMembersQuery();

  const teamMembers = useMemo<TeamMember[]>(
    () =>
      organizationMembers.map((member) => ({
        id: member.userId,
        username: member.username ?? undefined,
        name: formatMemberName(member.name, member.email),
        email: member.email,
        role: formatRole(member.role),
        status: formatStatus(
          member.status,
          member.invitationPending,
        ),
        joined: formatJoinedDate(member.joinedAt),
        permissions: member.permissions ?? [],
        isPending:
          Boolean(member.invitationPending) || member.status === "SUSPENDED",
        isSelf: member.self === true,
        isOwner: member.owner === true,
      })),
    [organizationMembers],
  );

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return teamMembers.filter((member) => {
      const matchesSearch =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesRole =
        roleFilter === "All" || member.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    roleFilter,
    searchTerm,
    statusFilter,
    teamMembers,
  ]);

  const counts = useMemo(
    () => buildTeamCounts(teamMembers),
    [teamMembers],
  );

  return {
    counts,
    filteredMembers,
    isError,
    isFetching,
    isLoading,
    refetch,
    searchTerm,
    setRoleFilter,
    setSearchTerm,
    setStatusFilter,
    statusFilter,
    roleFilter,
  };
}
