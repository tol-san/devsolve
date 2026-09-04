export type ReviewQueueAccent = "amber" | "blue" | "emerald";

export type ReviewQueueLaneKey =
  | "Pending Intake"
  | "Under Review"
  | "Approval Ready";

export type ReviewQueueLaneFilter = "All" | ReviewQueueLaneKey;

export type ReviewSeverity = "Critical" | "High" | "Medium" | "Low";

export type ReviewQueueLane = {
  title: ReviewQueueLaneKey;
  count: number;
  description: string;
  accent: ReviewQueueAccent;
};

export type PriorityReviewItem = {
  id: string | number;
  reportId: string;
  title: string;
  severity: ReviewSeverity | null;
  reporter: string;
  submittedAt: string;
  submittedAtIso?: string;
  queue: ReviewQueueLaneKey;
  status: string;
  assets: string[];
  reportType: "Bounty" | "Response";
  authorInitials: string;
  logoSrc?: string;
};
