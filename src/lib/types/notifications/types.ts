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
  id: string | null; 
  title: string;
  content: string;
  notifiableType: NotificationType;
  notifiableId: string; 
  authorId?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  read: boolean;
  readAt: string | null; 
  createdAt: string; 
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; 
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
