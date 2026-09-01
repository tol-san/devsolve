/**
 * Mirrors `NotificationResponse.notifiableType` upstream. `USER` and `REWARD`
 * are the two the backend added most recently.
 */
export type NotificationType =
  | "COMMENT"
  | "REPORT"
  | "PROGRAM"
  | "SOLUTION"
  | "PROBLEM"
  | "KYC"
  | "ORGANIZATION"
  | "INVITATION"
  | "DISPUTE"
  | "RECOGNITION"
  | "SHOWCASE"
  | "USER"
  | "REWARD"
  | "SECURITY";

export interface Notification {
  id: string | null; // UUID — null only on bulk follower SSE push events
  title: string;
  content: string;
  notifiableType: NotificationType;
  notifiableId: string; // UUID of related entity
  /** Actor metadata is currently included for comment notifications. */
  authorId?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  read: boolean;
  readAt: string | null; // ISO-8601 LocalDateTime, e.g. "2025-08-13T10:30:00"
  createdAt: string; // ISO-8601 LocalDateTime
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based page index
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type NotificationPage = Page<Notification>;

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface GetNotificationsParams {
  pageNumber?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}
