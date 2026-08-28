import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

export type MemberRole = "Manager" | "Member" | "Viewer";

/** `Invited` is an invitation nobody has accepted yet, not a lesser member. */
export type MemberStatus = "Active" | "Invited";

export type TeamMember = {
  id: string;
  /** Present once the account has claimed a handle; profile links prefer it. */
  username?: string;
  name: string;
  email: string;
  avatar?: string;
  /** Null for the owner: the three ranks describe invited members only. */
  role: MemberRole | null;
  status: MemberStatus;
  joined: string;
  /** What this member may do, as the roster reports it. */
  permissions: OrganizationInvitationPermission[];
  /** An invitation nobody has accepted yet, rather than a colleague. */
  isPending: boolean;
  /** This row is the signed-in account, as the roster reports it. */
  isSelf: boolean;
  /** Registered the company, rather than being invited into it. */
  isOwner: boolean;
};

export type RoleFilter = "All" | MemberRole;
export type StatusFilter = "All" | MemberStatus;

export type TeamCounts = {
  total: number;
  active: number;
  pending: number;
  managers: number;
  members: number;
  viewers: number;
};
