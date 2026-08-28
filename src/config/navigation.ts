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
  BarChart3,
  PlusCircle,
  ClipboardList,
  Users,
  Building2,
  ShieldCheck,
  UserCheck,
  PanelsTopLeft,
  FilePen,
  PenSquare,
  Tags,
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
   * enough.
   *
   * This is how every company screen is gated now. `COMPANY` was never the
   * right test: the realm role is granted for *registering* a company, so an
   * invited member — who may hold all ten permissions — never has it. Owners
   * come back from the memberships endpoint with the full set, so they keep
   * everything they had.
   */
  permissions?: OrganizationInvitationPermission[];
  /**
   * Owner-exclusive. The endpoints behind these screens (`/organizations/me`,
   * `/me/members`, `/me/verification`, `/me/logo`, `/me/resubmit`) answer 404
   * for a member, so offering them would be offering a dead end.
   */
  ownerOnly?: boolean;
  /**
   * For accounts that joined a company rather than registering one — the
   * member's own view of the workspace, which would only duplicate the owner's
   * screens for an owner.
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
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Program Management", href: "/dashboard/program-management", icon: Building2, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Create Program", href: "/dashboard/create-program", icon: PlusCircle, category: "Organization", permissions: ["CREATE_PROGRAM"] },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Report Management", href: "/dashboard/report-management", icon: ClipboardList, category: "Organization", permissions: ["VIEW_REPORTS", "TRIAGE_REPORTS"] },
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
  { name: "Categories", href: "/dashboard/categories", icon: Tags, roles: ["ADMIN"], category: "Administration" },
  { name: "Weaknesses", href: "/dashboard/weaknesses", icon: Bug, roles: ["ADMIN"], category: "Administration" },
];
