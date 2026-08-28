"use client";

import { useMyMembership } from "@/hooks/useMyMembership";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

/**
 * What the signed-in account is allowed to do inside its own organization.
 *
 * The reading comes from its own row on the roster — see `useMyMembership` for
 * how that row is found.
 *
 * **Absence is not a refusal.** An owner is not necessarily on the member
 * roster, and the proxy route answers `[]` rather than an error when the
 * upstream refuses the list. Both look identical from here, so a missing row
 * means *unknown*, and unknown grants — the backend authorizes every request
 * on its own and will refuse what this account may not do. Only an actual
 * membership row that lacks the permission denies anything.
 */
export function useOrganizationPermission(
  permission: OrganizationInvitationPermission,
): { granted: boolean; isResolved: boolean } {
  const { member, isLoading } = useMyMembership();

  if (isLoading) {
    return { granted: false, isResolved: false };
  }

  if (!member) {
    return { granted: true, isResolved: true };
  }

  /* Only the three invitable roles carry a permission list. Anything else on
     the roster — an owner, or a role added upstream after this was written —
     is not something a permission list can describe, so it is not something to
     refuse on. Denying here would be locking an owner out of their own
     organization over a field that was never about them. */
  const carriesPermissions =
    member.role === "MANAGER" ||
    member.role === "MEMBER" ||
    member.role === "VIEWER";

  if (!carriesPermissions || !Array.isArray(member.permissions)) {
    return { granted: true, isResolved: true };
  }

  return {
    granted: member.permissions.includes(permission),
    isResolved: true,
  };
}
