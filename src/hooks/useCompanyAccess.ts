"use client";

import { authClient } from "@/lib/auth/auth-client";
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
  /** True only for the account that registered the company. */
  isOwner: boolean;
  /** What this account may do in the active organization. */
  permissions: OrganizationInvitationPermission[];
  /** Holds this permission in the active organization. */
  can: (permission: OrganizationInvitationPermission) => boolean;
  /** Holds at least one of these. */
  canAny: (permissions: OrganizationInvitationPermission[]) => boolean;
  /** Only an ACTIVE organization accepts program and report actions. */
  isActive: boolean;
  /**
   * Both owns a company and belongs to another. `/organizations/me/programs`
   * answers 409 for these accounts until there is a switcher to disambiguate.
   */
  hasMultiple: boolean;
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
 * Roles still decide `ADMIN`, which is genuinely an account-level fact.
 */
export function useCompanyAccess(): CompanyAccess {
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data: memberships, isLoading } = useGetMyMembershipsQuery(undefined, {
    skip: !session,
  });

  const rows = memberships ?? [];
  /* Owned entries come first from the API, so the head of the list is the
     workspace to open when an account has more than one. */
  const membership = rows[0];
  const permissions = membership?.permissions ?? [];

  const can = (permission: OrganizationInvitationPermission) =>
    permissions.includes(permission);

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
    isLoading: sessionPending || isLoading,
  };
}
