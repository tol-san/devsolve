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
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles?: string[];
  category?: "Overview" | "Researcher" | "Organization" | "Administration";
}

export const NAV_ITEMS: NavItem[] = [
  // Overview items
  { name: "Home", href: "/", icon: Home, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },
  // Browsing surfaces, not workspace surfaces — they point at the public
  // pages, which carry the navbar instead of the dashboard sidebar. The navbar
  // shows the signed-in account, so leaving the dashboard isn't a dead end.
  { name: "Programs", href: "/programs", icon: Globe, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },
  { name: "Community", href: "/community", icon: MessageSquare, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },
  // A workspace surface, unlike the browse link above it: your own posts with
  // their review status, including the ones not public yet.
  { name: "My Community", href: "/dashboard/my-community", icon: PenSquare, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, roles: ["USER", "COMPANY", "ADMIN"], category: "Overview" },

  // USER Role items
  { name: "Reports", href: "/dashboard/my-reports", icon: FileText, roles: ["USER"], category: "Researcher" },
  { name: "Rewards", href: "/dashboard/rewards", icon: CircleDollarSign, roles: ["USER"], category: "Researcher" },
  { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark, roles: ["USER"], category: "Researcher" },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, roles: ["USER"], category: "Researcher" },

  // COMPANY Role items
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["COMPANY"], category: "Organization" },
  { name: "Program Management", href: "/dashboard/program-management", icon: Building2, roles: ["COMPANY"], category: "Organization" },
  { name: "Create Program", href: "/dashboard/create-program", icon: PlusCircle, roles: ["COMPANY"], category: "Organization" },
  { name: "Saved Drafts", href: "/dashboard/saved-draft", icon: FilePen, roles: ["COMPANY"], category: "Organization" },
  { name: "Report Management", href: "/dashboard/report-management", icon: ClipboardList, roles: ["COMPANY"], category: "Organization" },
  { name: "Team Management", href: "/dashboard/team-management", icon: Users, roles: ["COMPANY"], category: "Organization" },

  // ADMIN Role items
  { name: "Organization Verification", href: "/dashboard/company-verification", icon: ShieldCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Program Review", href: "/dashboard/program-management?scope=admin", icon: Building2, roles: ["ADMIN"], category: "Administration" },
  { name: "Users", href: "/dashboard/users", icon: UserCheck, roles: ["ADMIN"], category: "Administration" },
  { name: "Content Management", href: "/dashboard/content-moderation", icon: PanelsTopLeft, roles: ["ADMIN"], category: "Administration" },
  { name: "Categories", href: "/dashboard/categories", icon: Tags, roles: ["ADMIN"], category: "Administration" },
  { name: "Weaknesses", href: "/dashboard/weaknesses", icon: Bug, roles: ["ADMIN"], category: "Administration" },
];
