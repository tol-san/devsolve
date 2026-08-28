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
    (member) => member.status === "Pending",
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

function formatRole(role?: string): MemberRole {
  if (role === "MANAGER") {
    return "Manager";
  }

  if (role === "VIEWER") {
    return "Viewer";
  }

  return "Member";
}

function formatStatus(
  status?: string,
  invitationPending?: boolean,
): MemberStatus {
  if (invitationPending || status === "PENDING") {
    return "Pending";
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
          Boolean(member.invitationPending) || member.status === "PENDING",
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
