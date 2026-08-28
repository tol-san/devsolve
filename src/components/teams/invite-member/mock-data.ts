import type {
  OrganizationInvitationPermission,
  OrganizationInvitationRole,
} from "@/lib/redux/services/organizationsApi";
import type {
  InvitePermissionOption,
  InviteRoleOption,
} from "@/components/teams/invite-member/types";

export const INVITE_MEMBER_ENDPOINT =
  "POST /api/v1/organizations/me/members/invitations";

export const INVITE_ROLE_OPTIONS: InviteRoleOption[] = [
  {
    role: "MANAGER",
    title: "Manager",
    eyebrow: "Full workspace access",
    description: "Owns team coordination, invitation flow, and organization-side operations.",
    access: "Manage members, reports, and settings",
    caution: "Should be assigned carefully",
  },
  {
    role: "MEMBER",
    title: "Member",
    eyebrow: "Day-to-day collaborator",
    description: "Works across programs and reports while keeping admin controls limited.",
    access: "Collaborate on programs and reports",
    caution: "Recommended default role",
  },
  {
    role: "VIEWER",
    title: "Viewer",
    eyebrow: "Read-only visibility",
    description: "Best for stakeholders who need context without making workspace changes.",
    access: "Read-only access",
  },
];

export const INVITE_PERMISSION_OPTIONS: InvitePermissionOption[] = [
  {
    value: "VIEW_PROGRAMS",
    title: "View programs",
    description:
      "Allows the invited member to browse organization programs and their current state.",
  },
  {
    value: "CREATE_PROGRAM",
    title: "Create programs",
    description:
      "Allows the member to set up new bounty or disclosure programs for the organization.",
  },
  {
    value: "EDIT_PROGRAM",
    title: "Edit programs",
    description:
      "Allows updates to scope, rules, rewards, and other existing program details.",
  },
  {
    value: "MANAGE_PROGRAM_STATE",
    title: "Manage program state",
    description:
      "Allows opening, pausing, or closing programs when program status needs to change.",
  },
  {
    value: "DELETE_PROGRAM",
    title: "Delete programs",
    description:
      "Allows the member to take a program down. Destructive, and not part of any role's defaults — grant it deliberately.",
  },
  {
    value: "VIEW_REPORTS",
    title: "View reports",
    description:
      "Allows access to submitted vulnerability reports and their current progress.",
  },
  {
    value: "TRIAGE_REPORTS",
    title: "Triage reports",
    description:
      "Allows review, classification, and status handling for incoming security reports.",
  },
  {
    value: "MANAGE_DISCLOSURE",
    title: "Manage disclosure",
    description:
      "Allows control over disclosure timing and public communication for resolved reports.",
  },
  {
    value: "AWARD_REWARDS",
    title: "Award rewards",
    description:
      "Allows the member to assign bounty payouts or other rewards to valid submissions.",
  },
  {
    value: "MANAGE_RESEARCHERS",
    title: "Manage researchers",
    description:
      "Allows the member to decide which researchers may report to the organization — approving, rejecting, and revoking access.",
  },
];

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<
  OrganizationInvitationRole,
  OrganizationInvitationPermission[]
> = {
  MANAGER: [
    "VIEW_PROGRAMS",
    "CREATE_PROGRAM",
    "EDIT_PROGRAM",
    "MANAGE_PROGRAM_STATE",
    "VIEW_REPORTS",
    "TRIAGE_REPORTS",
    "MANAGE_DISCLOSURE",
    "AWARD_REWARDS",
    "MANAGE_RESEARCHERS",
  ],
  MEMBER: [
    "VIEW_PROGRAMS",
    "VIEW_REPORTS",
    "TRIAGE_REPORTS",
  ],
  VIEWER: ["VIEW_PROGRAMS"],
};
