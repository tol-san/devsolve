import type { OrganizationInvitationPermission } from "@/lib/redux/services/organizationsApi";
import {
  Home,
  LayoutDashboard,
  FileCheck,
  FileText,
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
  Sparkles,
  LucideIcon,
  Lock,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles?: string[];
  category?: "Overview" | "Researcher" | "Organization" | "Administration";
  permissions?: OrganizationInvitationPermission[];
  ownerOnly?: boolean;
  memberOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home, category: "Overview" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Overview" },
  { name: "Programs", href: "/programs", icon: Globe, category: "Overview" },
  { name: "Community", href: "/community", icon: MessageSquare, category: "Overview" },
  { name: "My Community", href: "/dashboard/my-community", icon: PenSquare, category: "Overview" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, category: "Overview" },
  { name: "Invitations", href: "/dashboard/invitations", icon: MailOpen, category: "Overview" },
  { name: "My Team", href: "/dashboard/my-team", icon: UsersRound, category: "Overview", memberOnly: true },

  { name: "Reports", href: "/dashboard/my-reports", icon: FileText, roles: ["USER"], category: "Researcher" },
  { name: "Private Programs", href: "/dashboard/program-invitations", icon: Lock, roles: ["USER"], category: "Researcher" },
  { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark, roles: ["USER"], category: "Researcher" },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, roles: ["USER"], category: "Researcher" },
  { name: "My Access", href: "/dashboard/my-access", icon: ShieldQuestion, roles: ["USER"], category: "Researcher" },

  { name: "Program Management", href: "/dashboard/program-management", icon: Building2, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Create Program", href: "/dashboard/create-program", icon: PlusCircle, category: "Organization", permissions: ["CREATE_PROGRAM"] },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, category: "Organization", permissions: ["VIEW_PROGRAMS"] },
  { name: "Report Management", href: "/dashboard/report-management", icon: ClipboardList, category: "Organization", permissions: ["VIEW_REPORTS", "TRIAGE_REPORTS"] },
  { name: "Security Incidents", href: "/dashboard/organization-security", icon: ShieldAlert, category: "Organization", permissions: ["TRIAGE_REPORTS"] },
  { name: "Team Management", href: "/dashboard/team-management", icon: Users, category: "Organization", ownerOnly: true },
  { name: "Researcher Access", href: "/dashboard/researcher-access", icon: UserRoundCheck, category: "Organization", permissions: ["MANAGE_RESEARCHERS"] },

  { name: "Organization Verification", href: "/dashboard/company-verification", icon: ShieldCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Program Review", href: "/dashboard/program-management?scope=admin", icon: Building2, roles: ["ADMIN"], category: "Administration" },
  { name: "Users", href: "/dashboard/users", icon: UserCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Content Management", href: "/dashboard/content-moderation", icon: PanelsTopLeft, roles: ["ADMIN"], category: "Administration" },
  { name: "Report Confirmation", href: "/dashboard/report-confirmation", icon: FileCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "AI Auto-Approval", href: "/dashboard/auto-approval", icon: Sparkles, roles: ["ADMIN"], category: "Administration" },
  { name: "Security Incidents", href: "/dashboard/security-incidents", icon: ShieldAlert, roles: ["ADMIN"], category: "Administration" },
  { name: "Categories", href: "/dashboard/categories", icon: Tags, roles: ["ADMIN"], category: "Administration" },
  { name: "Tags", href: "/dashboard/tags", icon: Tag, roles: ["ADMIN"], category: "Administration" },
  { name: "Weaknesses", href: "/dashboard/weaknesses", icon: Bug, roles: ["ADMIN"], category: "Administration" },
];
