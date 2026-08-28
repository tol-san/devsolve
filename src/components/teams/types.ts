import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

export type MemberRole = "Manager" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Pending";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string;
  /** What this member may do, as the roster reports it. */
  permissions: OrganizationInvitationPermission[];
  /** An invitation nobody has accepted yet, rather than a colleague. */
  isPending: boolean;
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
