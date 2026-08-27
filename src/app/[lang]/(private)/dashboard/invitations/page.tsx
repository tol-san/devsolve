"use client";

export const dynamic = "force-dynamic";

import { MyInvitationsView } from "@/components/teams/my-invitations/MyInvitationsView";

/**
 * Invitations addressed to the signed-in account.
 *
 * Not role-guarded: anyone with an account can be invited onto a team, a
 * company owner included.
 */
export default function MyInvitationsPage() {
  return <MyInvitationsView />;
}
