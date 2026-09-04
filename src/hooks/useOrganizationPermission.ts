"use client";

import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

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
