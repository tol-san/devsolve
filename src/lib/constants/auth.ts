import {
  Bug,
  MessagesSquare,
  Lightbulb,
  Trophy,
  PlusCircle,
  Inbox,
  BarChart3,
  UserCheck,
  LucideIcon,
} from "lucide-react";

export const JOB_TITLES = [
  "CTO / VP Engineering",
  "Security Lead / CISO",
  "Software Engineer",
  "IT Manager",
  "IT Company",
  "Security Researcher",
  "Product Manager",
  "Other",
];

export const INDUSTRIES = [
  "Software & Technology",
  "Financial Services",
  "Healthcare & Biotech",
  "E-Commerce & Retail",
  "Government & Public Sector",
  "Education",
  "Other",
];

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

export const REASONS = [
  "Launch a Bug Bounty Program",
  "Vulnerability Disclosure (VDP)",
  "Penetration Testing",
  "Security Assessment & Compliance",
  "Other",
];

export interface FeatureItem {
  icon: LucideIcon;
  text: string;
}

export const USER_FEATURES: FeatureItem[] = [
  { icon: Bug, text: "Hunt live bounty programs & earn rewards" },
  { icon: MessagesSquare, text: "Ask & discuss technical dev problems" },
  { icon: Lightbulb, text: "Share searchable solutions with the community" },
  { icon: Trophy, text: "Build your reputation, badges & rank" },
];

export const COMPANY_FEATURES: FeatureItem[] = [
  { icon: PlusCircle, text: "Create & manage custom bug bounty programs" },
  { icon: Inbox, text: "Receive, triage, and manage vulnerability reports" },
  { icon: BarChart3, text: "Track program performance & security metrics" },
  { icon: UserCheck, text: "Manage security team access & submissions" },
];
