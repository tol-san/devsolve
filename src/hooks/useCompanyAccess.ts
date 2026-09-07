"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth/auth-client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  rememberActiveOrganization,
  setActiveOrganization,
} from "@/lib/redux/slices/activeOrganizationSlice";
import {
  useGetMyMembershipsQuery,
  type OrganizationInvitationPermission,
  type OrganizationMembership,
} from "@/lib/redux/services/organizationsApi";

export type CompanyAccess = {
  memberships: OrganizationMembership[];
  membership?: OrganizationMembership;
  hasCompanyAccess: boolean;
  isOwner: boolean;
  permissions: OrganizationInvitationPermission[];
  can: (permission: OrganizationInvitationPermission | string) => boolean;
  canAny: (permissions: (OrganizationInvitationPermission | string)[]) => boolean;
  isActive: boolean;
  hasMultiple: boolean;
  switchOrganization: (organizationId: string) => void;
  isLoading: boolean;
};

export function useCompanyAccess(): CompanyAccess {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(
    (state) => state.activeOrganization.organizationId,
  );

  const { data: memberships, isLoading } = useGetMyMembershipsQuery(undefined, {
    skip: !session,
  });

  const rows = memberships ?? [];

  const membership =
    rows.find((row) => row.organizationId === activeId) ?? rows[0];

  useEffect(() => {
    if (membership && membership.organizationId !== activeId) {
      dispatch(setActiveOrganization(membership.organizationId));
    }
  }, [membership, activeId, dispatch]);

  const permissions = membership?.permissions ?? [];

  const can = (permission: OrganizationInvitationPermission | string) =>
    (permissions as string[]).includes(permission);

  const canAny = (permissionsToCheck: (OrganizationInvitationPermission | string)[]) =>
    permissionsToCheck.some((p) => (permissions as string[]).includes(p));

  const switchOrganization = (organizationId: string) => {
    rememberActiveOrganization(organizationId);
    dispatch(setActiveOrganization(organizationId));
  };

  return {
    memberships: rows,
    membership,
    hasCompanyAccess: rows.length > 0,
    isOwner: membership?.owner === true,
    permissions,
    can,
    canAny: (wanted) => wanted.some(can),
    isActive: membership?.organizationStatus === "ACTIVE",
    hasMultiple: rows.length > 1,
    switchOrganization,
    isLoading: sessionPending || isLoading,
  };
}
