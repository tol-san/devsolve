// Profile

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
  globalRank?: number; // no leaderboard/rank endpoint exists yet — omitted, never faked
  reportsSubmitted: number;
  accepted: number;
  acceptedRate: number; // 0-100
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
  /** The banner behind the profile header, when one has been uploaded. */
  coverUrl?: string;
  bio: string;
  location?: string;
  memberSince: string; // e.g. "March 2023"
  socialLinks: SocialLinks;
  followers: number;
  following: number;
  isOwnProfile: boolean;
  phone?: string;
  dateOfBirth?: string; // ISO date string, e.g. "1998-04-12"
  gender?: "MALE" | "FEMALE" | "OTHER";
}

// Hacktivity

export type Severity = "critical" | "high" | "medium" | "low";

export type HacktivityType = "resolved" | "badge" | "rank" | "retest";

export interface HacktivityEntry {
  id: string;
  type: HacktivityType;
  actorHandle: string; // e.g. "@ghostkode"
  date: string; // ISO date
  /** resolved */
  severity?: Severity;
  program?: string;
  bounty?: number;
  /** badge */
  badgeName?: string;
  /** rank */
  rankLabel?: string; // e.g. "#7 Global"
}

// Community

/** The three kinds of post a portfolio holds, one endpoint each. */
export type CommunityPostTag = "Problem" | "Solutions" | "Showcase";

/** A small status chip — "Solved" on a problem, "Pending review" on a showcase. */
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
  /** Problems only: solutions are answers, showcases draw comments instead. */
  answers?: number;
  views?: number;
  status?: CommunityPostStatus;
  date: string; // ISO date
  /** Where the card opens — the problem thread, or the showcase page. */
  href?: string;
  /** Showcase cover, when there is one. */
  thumbnailUrl?: string;
}

// Hall of Thanks

export interface ThanksEntry {
  id: string;
  orgName: string;
  orgLogoUrl?: string;
  message: string;
  date: string; // ISO date
}

// Following
//
// GET /api/v1/follows/mine only returns raw follow relationships (id,
// followableType, followableId, createdAt) — no denormalized display name,
// avatar, or stats, since there's no per-type lookup endpoint yet to enrich
// them with. FollowRecord reflects exactly what the backend returns.

export type FollowableType = "USER" | "ORGANIZATION" | "TOPIC" | (string & {});

export interface FollowRecord {
  id: string;
  followableType: FollowableType;
  followableId: string;
  createdAt: string; // ISO date
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

// Edit Profile

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
  avatarUrl?: string; // NEW — backend-persisted photo URL
  /** The banner behind the profile header. Uploaded separately from the form. */
  coverUrl?: string;
  fullName: string;
  username: string;
  email: string;
  accountType: string;
  bio: string;
  location: string;
  phone?: string; // NEW
  dateOfBirth?: string; // NEW — ISO date string, e.g. "1998-04-12"
  gender?: "MALE" | "FEMALE" | "OTHER"; // NEW — matches backend enum exactly
  socialLinks: SocialLinksForm;
  twoFactorEnabled: boolean;
  notifications: NotificationPreferences;
}
export interface AccountStatus {
  memberSince: string; // e.g. "Jan 2025"
  totalSubmissions: number;
  acceptedReports: number;
  reputationPoints: number;
  acceptanceRate: number; // 0-100
  phone?: string;
  dateOfBirth?: string; // ISO date string, e.g. "1998-04-12"
  gender?: "MALE" | "FEMALE" | "OTHER";
}
