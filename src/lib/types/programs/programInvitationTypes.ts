export type ProgramInvitationStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "REVOKED";

export interface ProgramInvitation {
  id: string;
  programId: string;
  programHandle?: string;
  programName?: string;
  organizationId?: string;
  status: ProgramInvitationStatus;
  researcherId?: string;
  userId?: string;
  researcherName?: string;
  fullName?: string;
  username?: string;
  researcherAvatarUrl?: string | null;
  avatarUrl?: string | null;
  invitedBy?: string | null;
  note?: string | null;
  invitedAt: string;
  respondedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements?: number;
}

export type ProgramInvitationSortField =
  | "id"
  | "status"
  | "invitedAt"
  | "respondedAt"
  | "createdAt"
  | "updatedAt";

export type ProgramInvitationSort =
  | `${ProgramInvitationSortField},asc`
  | `${ProgramInvitationSortField},desc`;

export interface GetProgramInvitationsParams {
  programId: string;
  status?: ProgramInvitationStatus | "ALL";
  page?: number;
  size?: number;
  sort?: ProgramInvitationSort | string;
}

export interface GetMyProgramInvitationsParams {
  status?: ProgramInvitationStatus | "ALL";
  page?: number;
  size?: number;
  sort?: ProgramInvitationSort | string;
}

export interface InviteResearcherRequest {
  userId: string;
  note?: string;
}
