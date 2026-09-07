import type {
  OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";

export type SupportedInvitationPermission =
  | "VIEW_PROGRAMS"
  | "CREATE_PROGRAM"
  | "EDIT_PROGRAM"
  | "MANAGE_PROGRAM_STATE"
  | "VIEW_REPORTS"
  | "TRIAGE_REPORTS"
  | "MANAGE_DISCLOSURE"
  | "AWARD_REWARDS";

export type InviteRoleOption = {
  role: OrganizationInvitationRole;
  title: string;
  eyebrow: string;
  description: string;
  access: string;
  caution?: string;
};

export type InvitePermissionOption = {
  value: SupportedInvitationPermission;
  title: string;
  description: string;
};
