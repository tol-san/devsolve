"use client";

import { authClient } from "@/lib/auth/auth-client";
import {
  useGetMyOrganizationQuery,
  useGetOrganizationMembersQuery,
  type Organization,
  type OrganizationInvitationMember,
} from "@/lib/redux/services/organizationsApi";

export type MyMembership = {
  /** The organization itself, when the caller is allowed to read it. */
  organization?: Organization;
  /** This account's own row on that roster. */
  member?: OrganizationInvitationMember;
  /** Everyone on it, this account included. Empty when it cannot be read. */
  members: OrganizationInvitationMember[];
  /** Whether either source says this account is on a team. */
  belongs: boolean;
  isLoading: boolean;
};

/**
 * The organization this account is part of, and what it is there.
 *
 * There is no "my membership" endpoint, so this reads the two that exist and
 * takes either as an answer:
 *
 * - `GET /organizations/me` — the organization the caller belongs to.
 * - `GET /organizations/me/members` — its roster. The row whose email matches
 *   the session is this account's own.
 *
 * Matching on email rather than id because the id in the session comes from
 * better-auth and the one on the roster comes from the backend; the address is
 * the value both sides agree on, and it is the only thing an invitation is
 * ever addressed to.
 *
 * Both are asked for every signed-in account, not just company ones — an
 * invited member holds no company role, and a screen that waited for one would
 * never show them the team they just joined. For an account on no team the
 * roster answers `[]` (the proxy softens the upstream's refusal) and the
 * organization answers 404, which together mean `belongs: false` rather than
 * an error anybody has to look at.
 */
export function useMyMembership(): MyMembership {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const email = session?.user?.email?.trim().toLowerCase();

  const { data: members, isLoading: rosterLoading } =
    useGetOrganizationMembersQuery(undefined, { skip: !session });

  const { data: organization, isLoading: organizationLoading } =
    useGetMyOrganizationQuery(undefined, { skip: !session });

  const member = email
    ? members?.find((row) => row.email?.trim().toLowerCase() === email)
    : undefined;

  return {
    organization,
    member,
    members: members ?? [],
    belongs: Boolean(organization || member),
    isLoading: sessionPending || rosterLoading || organizationLoading,
  };
}
