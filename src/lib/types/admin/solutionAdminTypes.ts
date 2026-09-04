import { PaginatedResponse } from "./types";

export type SolutionReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACCEPTED";

export interface SolutionAuthor {
  id?: string;
  fullName?: string;
  displayName?: string;
  avatarUrl?: string;
  reputation?: number;
}

export interface SolutionModerationDetails {
  revisionId?: string;
  revisionNumber?: number;
  status?: SolutionReviewStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SolutionVerificationStep {
  instruction?: string;
  expectedResult?: string;
}

export interface SolutionTestedWith {
  technology?: string;
  version?: string;
}

export interface SolutionResource {
  id?: string;
  type?:
    | "DOCUMENTATION"
    | "REPOSITORY"
    | "VIDEO"
    | "DIAGRAM"
    | "DEMO"
    | "ARTICLE";
  label?: string;
  url?: string;
  displayOrder?: number;
}

export interface SolutionAttachment {
  id?: string;
  originalFileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  downloadUrl?: string;
}

export interface SolutionResponse {
  id: string;
  problemId?: string;
  authorId?: string;
  author?: SolutionAuthor;
  summary?: string;
  bodyMarkdown?: string;
  description?: string;
  videoUrl?: string;
  diagramUrl?: string;
  approachType?: "FIX" | "WORKAROUND" | "EXPLANATION" | "ALTERNATIVE";
  verificationSteps?: SolutionVerificationStep[];
  testedWith?: SolutionTestedWith[];
  tradeoffs?: string;
  resources?: SolutionResource[];
  attachments?: SolutionAttachment[];
  isAccepted?: boolean;
  voteScore?: number;
  commentCount?: number;
  version?: number;
  moderation?: SolutionModerationDetails;
  reviewStatus?: SolutionReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PageSolutionResponse = PaginatedResponse<SolutionResponse>;

export interface UpdateSolutionReviewStatusRequest {
  reviewStatus: SolutionReviewStatus;
  rejectionReason?: string;
}

export interface GetAdminSolutionsParams {
  reviewStatus?: SolutionReviewStatus;
  pageNumber?: number;
  pageSize?: number;
}
