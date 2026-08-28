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
  /** Every organization this account belongs to; owned entries first. */
  memberships: OrganizationMembership[];
  /** The one the workspace is currently showing. */
  membership?: OrganizationMembership;
  /** Whether there is a company workspace to show at all. */
  hasCompanyAccess: boolean;
  /** True only for the account that registered the active organization. */
  isOwner: boolean;
  /** What this account may do in the active organization. */
  permissions: OrganizationInvitationPermission[];
  /** Holds this permission in the active organization. */
  can: (permission: OrganizationInvitationPermission) => boolean;
  /** Holds at least one of these. */
  canAny: (permissions: OrganizationInvitationPermission[]) => boolean;
  /** Only an ACTIVE organization accepts program and report actions. */
  isActive: boolean;
  /** On more than one organization, so the workspace has a choice to make. */
  hasMultiple: boolean;
  /** Point the workspace at another organization this account belongs to. */
  switchOrganization: (organizationId: string) => void;
  isLoading: boolean;
};

/**
 * Whether this account has a company workspace, and what it may do there.
 *
 * **This replaces reading the `COMPANY` realm role.** That role is granted for
 * *registering* a company, so it is true for owners and false for everyone
 * invited into one — an invited member is an ordinary `USER` account, and
 * accepting an invitation never changes their token. Gating the workspace on
 * it meant a member could hold ten permissions in the database and still be
 * shown a researcher-only app.
 *
 * `GET /organizations/me/memberships` answers the question properly: owners
 * appear with `owner: true` and all ten permissions, members with the
 * permissions they were granted. Gate features on `permissions`, never on
 * `role` or `owner` — an owner may customise a member's set per organization,
 * so the role's defaults are a starting point, not a fact. `owner` is only for
 * the owner-exclusive screens whose endpoints 404 for a member: company
 * profile, logo, team management, verification, resubmit.
 *
 * An account can be on several organizations, so which one the company screens
 * are showing is a choice — held in `activeOrganization` and remembered across
 * reloads. Everything below reads the *active* membership, so a screen never
 * has to think about the list.
 *
 * Roles still decide `ADMIN`, which is genuinely an account-level fact.
 */
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

  /* The remembered choice, when it is still one of theirs — access can be
     revoked, and a stale id should fall back rather than empty the workspace.
     Owned entries come first from the API, so the head of the list is the
     sensible default. */
  const membership =
    rows.find((row) => row.organizationId === activeId) ?? rows[0];

  /* Resolving the default locally is not enough: requests carry the id from
     the store, so an account that has never touched the switcher would send
     nothing and get a 409 back from every `/organizations/me/*` call. Held in
     Redux only — writing it to storage would record a choice nobody made, and
     the fallback should keep following the list if memberships change. */
  useEffect(() => {
    if (membership && membership.organizationId !== activeId) {
      dispatch(setActiveOrganization(membership.organizationId));
    }
  }, [membership, activeId, dispatch]);

  const permissions = membership?.permissions ?? [];

  const can = (permission: OrganizationInvitationPermission) =>
    permissions.includes(permission);

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
