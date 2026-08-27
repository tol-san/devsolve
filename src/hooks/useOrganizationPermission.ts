"use client";

import { authClient } from "@/lib/auth/auth-client";
import {
  useGetOrganizationMembersQuery,
  type OrganizationInvitationPermission,
} from "@/lib/redux/services/organizationsApi";

/**
 * What the signed-in account is allowed to do inside its own organization.
 *
 * There is no "my membership" endpoint, so the reading is taken from the
 * roster — `GET /organizations/me/members` is scoped to the caller's own
 * organization, and the row whose email matches the session is this account's
 * own. Matching on email rather than id because the id in the session comes
 * from better-auth and the one on the roster comes from the backend; the
 * address is the value both sides agree on, and it is also the only thing an
 * invitation is ever addressed to.
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
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const email = session?.user?.email?.trim().toLowerCase();

  const { data: members, isLoading } = useGetOrganizationMembersQuery(
    undefined,
    { skip: !session },
  );

  if (sessionPending || isLoading) {
    return { granted: false, isResolved: false };
  }

  const own = email
    ? members?.find((member) => member.email?.trim().toLowerCase() === email)
    : undefined;

  if (!own) {
    return { granted: true, isResolved: true };
  }

  /* Only the three invitable roles carry a permission list. Anything else on
     the roster — an owner, or a role added upstream after this was written —
     is not something a permission list can describe, so it is not something to
     refuse on. Denying here would be locking an owner out of their own
     organization over a field that was never about them. */
  const carriesPermissions =
    own.role === "MANAGER" || own.role === "MEMBER" || own.role === "VIEWER";

  if (!carriesPermissions || !Array.isArray(own.permissions)) {
    return { granted: true, isResolved: true };
  }

  return {
    granted: own.permissions.includes(permission),
    isResolved: true,
  };
}
