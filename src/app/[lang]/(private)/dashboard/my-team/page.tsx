"use client";

export const dynamic = "force-dynamic";

import { MyTeamView } from "@/components/teams/my-team/MyTeamView";

/**
 * The organization an account belongs to, seen from the member's side.
 *
 * Not role-guarded, deliberately: accepting an invitation puts someone on a
 * company's team without giving them a company account, so a role check here
 * would refuse exactly the people the page is for. What they are allowed to do
 * inside it is a matter of their permissions, which the page reads from their
 * own row on the roster.
 */
export default function MyTeamPage() {
  return <MyTeamView />;
}
