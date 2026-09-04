import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";

export type MemberRole = "Manager" | "Member" | "Viewer";

export type MemberStatus = "Active" | "Invited";

export type TeamMember = {
  id: string;
  username?: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole | null;
  status: MemberStatus;
  joined: string;
  permissions: OrganizationInvitationPermission[];
  isPending: boolean;
  isSelf: boolean;
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
