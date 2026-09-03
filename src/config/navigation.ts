import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import {
  Home,
  LayoutDashboard,
  FileText,
  CircleDollarSign,
  Trophy,
  MessageSquare,
  Globe,
  Bookmark,
  PlusCircle,
  ClipboardList,
  Users,
  Building2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  PanelsTopLeft,
  FilePen,
  PenSquare,
  Tags,
  Tag,
  Bug,
  MailOpen,
  UsersRound,
  ShieldQuestion,
  UserRoundCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles?: string[];
  category?: "Overview" | "Researcher" | "Organization" | "Administration";
  /**
   * Organization permissions that decide this entry. Holding any one is
   * enough — they are an OR.
   *
   * An entry with both `roles` and `permissions` requires the user to hold
   * the role AND at least one permission.
   */
  permissions?: OrganizationInvitationPermission[];
  /**
   * Screen reserved for the account that owns the organization.
   *
   * Upstream returns 403 to any other role regardless of permissions granted,
   * so rendering the link for a manager is only an invitation to an error.
   */
  ownerOnly?: boolean;
  /**
   * Shown only to an account that belongs to at least one organization, in
   * whatever role. Unrelated to `roles` — a researcher can be on a team.
   */
  memberOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // Overview items
  { name: "Home", href: "/", icon: Home, category: "Overview" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Overview" },
  // Browsing surfaces, not workspace surfaces — they point at the public
  // pages, which carry the navbar instead of the dashboard sidebar. The navbar
  // shows the signed-in account, so leaving the dashboard isn't a dead end.
  { name: "Programs", href: "/programs", icon: Globe, category: "Overview" },
  { name: "Community", href: "/community", icon: MessageSquare, category: "Overview" },
  // A workspace surface, unlike the browse link above it: your own posts with
  // their review status, including the ones not public yet.
  { name: "My Community", href: "/dashboard/my-community", icon: PenSquare, category: "Overview" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, category: "Overview" },
  // Team invitations addressed to this account. Not role-scoped: a company
  // owner can be invited onto someone else's team just as a researcher can.
  { name: "Invitations", href: "/dashboard/invitations", icon: MailOpen, category: "Overview" },
  // The other end of that invitation: the workspace they are now part of.
  // Hidden until they are on one, so it is never an empty promise.
  { name: "My Team", href: "/dashboard/my-team", icon: UsersRound, category: "Overview", memberOnly: true },

  // USER Role items
  { name: "Reports", href: "/dashboard/my-reports", icon: FileText, roles: ["USER"], category: "Researcher" },
  { name: "Rewards", href: "/dashboard/rewards", icon: CircleDollarSign, roles: ["USER"], category: "Researcher" },
  { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark, roles: ["USER"], category: "Researcher" },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, roles: ["USER"], category: "Researcher" },
  // Where a researcher stands with each company. Reporting is gated on the
  // company approving them, so this is the screen that answers "can I file
  // this?" before the report form does.
  { name: "My Access", href: "/dashboard/my-access", icon: ShieldQuestion, roles: ["USER"], category: "Researcher" },

  // Company workspace — earned by organization permissions, not by role, so an
  // invited member reaches exactly the screens they were granted.
  { name: "Program Management", href: "/dashboard/program-management", icon: Building2, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Create Program", href: "/dashboard/create-program", icon: PlusCircle, category: "Organization", permissions: ["CREATE_PROGRAM"] },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Report Management", href: "/dashboard/report-management", icon: ClipboardList, category: "Organization", permissions: ["VIEW_REPORTS", "TRIAGE_REPORTS"] },
  { name: "Security Incidents", href: "/dashboard/organization-security", icon: ShieldAlert, category: "Organization", permissions: ["TRIAGE_REPORTS"] },
  // Owner-only: the roster and the organization profile are owner endpoints.
  { name: "Team Management", href: "/dashboard/team-management", icon: Users, category: "Organization", ownerOnly: true },
  // The other side of the same gate: who outside the organization may report
  // to it. One decision covers every program the company runs.
  { name: "Researcher Access", href: "/dashboard/researcher-access", icon: UserRoundCheck, category: "Organization", permissions: ["MANAGE_RESEARCHERS"] },

  // ADMIN Role items
  { name: "Organization Verification", href: "/dashboard/company-verification", icon: ShieldCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Program Review", href: "/dashboard/program-management?scope=admin", icon: Building2, roles: ["ADMIN"], category: "Administration" },
  { name: "Users", href: "/dashboard/users", icon: UserCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Content Management", href: "/dashboard/content-moderation", icon: PanelsTopLeft, roles: ["ADMIN"], category: "Administration" },
  { name: "Security Incidents", href: "/dashboard/security-incidents", icon: ShieldAlert, roles: ["ADMIN"], category: "Administration" },
  { name: "Categories", href: "/dashboard/categories", icon: Tags, roles: ["ADMIN"], category: "Administration" },
  { name: "Tags", href: "/dashboard/tags", icon: Tag, roles: ["ADMIN"], category: "Administration" },
  { name: "Weaknesses", href: "/dashboard/weaknesses", icon: Bug, roles: ["ADMIN"], category: "Administration" },
];
