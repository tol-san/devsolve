"use client";

import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

/**
 * Whether the signed-in account holds one permission in its organization.
 *
 * A thin reading of `useCompanyAccess`, kept as its own hook because that is
 * how the guards read: one permission, one question.
 *
 * Absence refuses. This used to guess — the roster it read was owner-only, so
 * "no row" could mean either "not a member" or "not allowed to see the list",
 * and granting was the safer of two bad options. `/organizations/me/memberships`
 * answers for owners and members alike, so there is nothing left to guess at:
 * no membership means no company screen, and an owner arrives holding all ten.
 */
export function useOrganizationPermission(
  permission: OrganizationInvitationPermission,
): { granted: boolean; isResolved: boolean } {
  const { can, hasCompanyAccess, isLoading } = useCompanyAccess();

  if (isLoading) {
    return { granted: false, isResolved: false };
  }

  return {
    granted: hasCompanyAccess && can(permission),
    isResolved: true,
  };
}
