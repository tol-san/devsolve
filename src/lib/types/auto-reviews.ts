export type AutoReviewTarget = "PROBLEM" | "SHOWCASE";

export type AutoReviewStatus = "APPROVED" | "HELD" | "NOT_CHECKED";

export type AutoReviewHold =
  | "UNCLEAR"
  | "OFF_TOPIC"
  | "UNSAFE"
  | "NOT_CHECKED"
  | null;

export interface AutoReviewVerdict {
  target: AutoReviewTarget;
  contentId: string;
  title?: string | null;
  status: AutoReviewStatus;
  hold: AutoReviewHold;
  reason?: string | null;
  checkedAt: string;
  message: string;
}

export interface AutoReviewListParams {
  target?: AutoReviewTarget;
  approved?: boolean;
  page?: number;
  size?: number;
}
