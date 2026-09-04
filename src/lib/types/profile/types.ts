
export interface SocialLinks {
  website?: string;
  github?: string;
  twitter?: string;
}

export interface ProfileBadge {
  id: string;
  label: string;
  icon: "trophy" | "shield" | "zap" | "activity" | "star" | "target" | "crown" | "check";
  locked: boolean;
}

export interface ProfileStats {
  reputation: number;
  globalRank?: number; 
  reportsSubmitted: number;
  accepted: number;
  acceptedRate: number; 
  totalEarned: number;
  bountyCurrency?: string;
  rewardedReports?: number;
}

export interface SeverityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  rejected: number;
  duplicate: number;
  retests: number;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarInitials: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  location?: string;
  memberSince: string; 
  socialLinks: SocialLinks;
  followers: number;
  following: number;
  isOwnProfile: boolean;
  phone?: string;
  dateOfBirth?: string; 
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export type Severity = "critical" | "high" | "medium" | "low";

export type HacktivityType = "resolved" | "badge" | "rank" | "retest";

export interface HacktivityEntry {
  id: string;
  type: HacktivityType;
  actorHandle: string; 
  date: string; 
  severity?: Severity;
  program?: string;
  bounty?: number;
  badgeName?: string;
  rankLabel?: string; 
}

export type CommunityPostTag = "Problem" | "Solutions" | "Showcase";

export interface CommunityPostStatus {
  label: string;
  tone: "positive" | "pending";
}

export interface CommunityPost {
  id: string;
  title: string;
  description: string;
  tag: CommunityPostTag;
  votes: number;
  answers?: number;
  views?: number;
  status?: CommunityPostStatus;
  date: string; 
  href?: string;
  thumbnailUrl?: string;
}

export interface ThanksEntry {
  id: string;
  orgName: string;
  orgLogoUrl?: string;
  message: string;
  date: string; 
}

export type FollowableType = "USER" | "ORGANIZATION" | "TOPIC" | (string & {});

export interface FollowRecord {
  id: string;
  followableType: FollowableType;
  followableId: string;
  createdAt: string; 
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  bio?: string;
  reputation?: number;
  isFollowing?: boolean;
}

export interface FollowingCounts {
  hackers: number;
  orgs: number;
  topics: number;
}

export interface FollowingUser {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  biography: string | null;
  followerCount: number;
  following: boolean;
  followedAt: string;
}

export interface FollowingUsersResponse {
  content: FollowingUser[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SocialLinksForm {
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

export type NotificationKey =
  | "reportStatusChanges"
  | "adminApprovals"
  | "newPrograms"
  | "retestInvites"
  | "communityActivity"
  | "followActivity";

export interface NotificationChannelPrefs {
  inApp: boolean;
  email: boolean;
}

export type NotificationPreferences = Record<NotificationKey, NotificationChannelPrefs>;

export interface EditProfileFormData {
  avatarInitials: string;
  avatarUrl?: string; 
  coverUrl?: string;
  fullName: string;
  username: string;
  email: string;
  accountType: string;
  bio: string;
  location: string;
  phone?: string; 
  dateOfBirth?: string; 
  gender?: "MALE" | "FEMALE" | "OTHER"; 
  socialLinks: SocialLinksForm;
  twoFactorEnabled: boolean;
  notifications: NotificationPreferences;
}
export interface AccountStatus {
  memberSince: string; 
  totalSubmissions: number;
  acceptedReports: number;
  reputationPoints: number;
  acceptanceRate: number; 
  phone?: string;
  dateOfBirth?: string; 
  gender?: "MALE" | "FEMALE" | "OTHER";
}
