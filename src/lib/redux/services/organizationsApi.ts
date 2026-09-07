import { proxyApi } from "./proxyApi";
import { PaginatedResponse, Program } from "@/lib/types/programs/types";

export type OrganizationStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED"
  | (string & {});

export type OrganizationIndustry =
  | "TECHNOLOGY"
  | "FINANCE"
  | "HEALTHCARE"
  | "ECOMMERCE"
  | "GOVERNMENT"
  | "EDUCATION"
  | "OTHER"
  | (string & {});

export type OrganizationStats = {
  activePrograms?: number;
  resolvedReports?: number;
  totalDisbursed?: number;
  topBountyAward?: number;
};

export type Organization = {
  id: string;
  ownerId?: string;
  name: string;
  slug?: string;
  domain?: string;
  websiteUrl?: string;
  logoUrl?: string;
  coverUrl?: string;
  coverImageUrl?: string;
  description?: string;
  industry?: OrganizationIndustry;
  companySize?: string;
  country?: string;
  status: OrganizationStatus;
  submissionVersion?: number;
  rejectionReason?: string;
  reviewedAt?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: OrganizationStats;
  [key: string]: unknown;
};

export type OrganizationVerification = {
  organizationId?: string;
  organizationName?: string;
  email?: string;
  emailVerified?: boolean;
  domain?: string;
  domainVerified?: boolean;
  status?: OrganizationStatus;
  nextAction?: string;
  rejectionReason?: string;
  [key: string]: unknown;
};

export type RegisterOrganizationRequest = {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyWebsite: string;
  industry: OrganizationIndustry;
  companySize: string;
  country: string;
  joiningReason: string;
};

export type UpdateOrganizationRequest = {
  name?: string;
  domain?: string;
  websiteUrl?: string;
  logoUrl?: string;
  coverUrl?: string;
  coverImageUrl?: string;
  description?: string;
  industry?: OrganizationIndustry;
  companySize?: string;
  country?: string;
};

export type OrganizationInvitationRole = "MANAGER" | "MEMBER" | "VIEWER";
export type OrganizationInvitationPermission =
  | "VIEW_PROGRAMS"
  | "CREATE_PROGRAM"
  | "EDIT_PROGRAM"
  | "MANAGE_PROGRAM_STATE"
  | "DELETE_PROGRAM"
  | "VIEW_REPORTS"
  | "TRIAGE_REPORTS"
  | "MANAGE_DISCLOSURE"
  | "AWARD_REWARDS"
  | "MANAGE_RESEARCHERS"
  | "MANAGE_MEMBERS";

export type OrganizationMemberInvitationStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED"
  | (string & {});

export type InviteOrganizationMemberRequest = {
  email: string;
  role: OrganizationInvitationRole;
  permissions: OrganizationInvitationPermission[];
};

export type UpdateMemberRoleRequest = {
  userId: string;
  role: OrganizationInvitationRole;
};

export type UpdateMemberPermissionsRequest = {
  userId: string;
  permissions: OrganizationInvitationPermission[];
};

export type OrganizationRoleResponse = {
  role: OrganizationInvitationRole;
  defaultPermissions: OrganizationInvitationPermission[];
  allowedPermissions: OrganizationInvitationPermission[];
};

export interface MemberCandidate {
  id: string;
  fullName: string | null;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  isExistingMember: boolean;
  isPendingInvite: boolean;
  memberRole: string | null;
}

export type RemoveMemberRequest = {
  userId: string;
};

export type OrganizationInvitationMember = {
  userId: string;
  username?: string | null;
  name: string;
  email: string;
  role: OrganizationInvitationRole | null;
  permissions: OrganizationInvitationPermission[];
  status: OrganizationMemberInvitationStatus;
  invitationPending: boolean;
  self?: boolean;
  owner?: boolean;
  joinedAt: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  reputation?: number | null;
  biography?: string | null;
  country?: string | null;
  coverImageUrl?: string | null;
  profile?: {
    id: string;
    fullName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    reputation?: number | null;
    biography?: string | null;
    country?: string | null;
    coverImageUrl?: string | null;
  } | null;
};

export type InviteOrganizationMemberResponse = {
  member?: OrganizationInvitationMember;
  invitationToken?: string;
  expiresAt?: string;
  [key: string]: unknown;
};

export type AcceptOrganizationInvitationRequest = {
  token: string;
};

export type MyOrganizationInvitation = {
  invitationToken: string;
  organizationId: string;
  organizationName: string;
  organizationSlug?: string | null;
  organizationLogoUrl?: string | null;
  role: OrganizationInvitationRole;
  invitedByName?: string | null;
  invitedAt: string;
  expiresAt: string;
};

export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  organizationSlug?: string | null;
  organizationLogoUrl?: string | null;
  organizationStatus: OrganizationStatus;
  owner: boolean;
  role?: OrganizationInvitationRole | null;
  permissions: OrganizationInvitationPermission[];
  joinedAt?: string;
};

type MyMembershipsEnvelope = {
  memberships?: OrganizationMembership[];
  data?: OrganizationMembership[];
  items?: OrganizationMembership[];
};

type MyInvitationsEnvelope = {
  invitations?: MyOrganizationInvitation[];
  data?: MyOrganizationInvitation[];
  items?: MyOrganizationInvitation[];
};

type OrganizationMembersEnvelope = {
  members?: OrganizationInvitationMember[];
  data?: OrganizationInvitationMember[];
  items?: OrganizationInvitationMember[];
};

function extractOrganizationMembers(
  response: OrganizationInvitationMember[] | OrganizationMembersEnvelope,
): OrganizationInvitationMember[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.members)) {
    return response.members;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

export const organizationsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    registerOrganization: builder.mutation<
      Organization,
      RegisterOrganizationRequest
    >({
      query: (body) => ({
        url: "/organizations/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Organization"],
    }),
    getMyOrganization: builder.query<Organization, void>({
      query: () => ({
        url: "/organizations/me",
        method: "GET",
      }),
      providesTags: ["Organization"],
    }),
    updateMyOrganization: builder.mutation<
      Organization,
      UpdateOrganizationRequest
    >({
      query: (body) => ({
        url: "/organizations/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Organization"],
    }),
    uploadOrganizationLogo: builder.mutation<Organization, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);

        return {
          url: "/organizations/me/logo",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Organization"],
    }),
    removeOrganizationLogo: builder.mutation<Organization, void>({
      query: () => ({
        url: "/organizations/me/logo",
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteMyOrganization: builder.mutation<void, void>({
      query: () => ({
        url: "/organizations/me",
        method: "DELETE",
      }),
      invalidatesTags: ["Organization", "OrganizationMembers"],
    }),
    getOrganizationVerification: builder.query<OrganizationVerification, void>({
      query: () => ({
        url: "/organizations/me/verification",
        method: "GET",
      }),
      providesTags: ["OrganizationVerification", "Organization"],
    }),
    sendVerificationEmail: builder.mutation<void, void>({
      query: () => ({
        url: "/organizations/me/verification-email",
        method: "POST",
      }),
      invalidatesTags: ["OrganizationVerification", "Organization"],
    }),
    resubmitOrganization: builder.mutation<Organization, void>({
      query: () => ({
        url: "/organizations/me/resubmit",
        method: "POST",
      }),
      invalidatesTags: ["OrganizationVerification", "Organization"],
    }),
    getOrganizationById: builder.query<Organization, string>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Organization", id }],
    }),
    getOrganizationBySlug: builder.query<Organization, string>({
      query: (slug) => ({
        url: `/organizations/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (_result, _error, slug) => [{ type: "Organization", id: slug }],
    }),
    getOrganizationProgramsById: builder.query<
      PaginatedResponse<Program> | Program[],
      {
        id: string;
        page?: number;
        size?: number;
        search?: string;
        engagementType?: string;
        state?: string;
      }
    >({
      query: ({ id, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) {
          queryParams.append("page", (params.page - 1).toString());
        }
        if (params.size) {
          queryParams.append("size", params.size.toString());
        }
        if (params.search && params.search.trim()) {
          queryParams.append("search", params.search.trim());
        }
        if (params.engagementType && params.engagementType !== "All") {
          queryParams.append("engagementType", params.engagementType);
        }
        if (params.state && params.state !== "All") {
          queryParams.append("state", params.state);
        }

        const queryString = queryParams.toString();
        return queryString
          ? `/organizations/${id}/programs?${queryString}`
          : `/organizations/${id}/programs`;
      },
      providesTags: ["Program"],
    }),
    getOrganizationMembers: builder.query<
      OrganizationInvitationMember[],
      void
    >({
      query: () => ({
        url: "/organizations/me/members",
        method: "GET",
      }),
      transformResponse: (
        response:
          | OrganizationInvitationMember[]
          | OrganizationMembersEnvelope,
      ) => extractOrganizationMembers(response),
      providesTags: ["OrganizationMembers"],
    }),
    inviteOrganizationMember: builder.mutation<
      InviteOrganizationMemberResponse,
      InviteOrganizationMemberRequest
    >({
      query: (body) => ({
        url: "/organizations/me/members/invitations",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "OrganizationMembers",
        "OrganizationInvitations",
      ],
    }),
    getMyMemberships: builder.query<OrganizationMembership[], void>({
      query: () => ({
        url: "/organizations/me/memberships",
        method: "GET",
      }),
      transformResponse: (
        response: OrganizationMembership[] | MyMembershipsEnvelope | null,
      ) => {
        if (Array.isArray(response)) return response;
        if (!response) return [];
        return (
          response.memberships ?? response.data ?? response.items ?? []
        );
      },
      providesTags: ["OrganizationMemberships"],
    }),

    getMyInvitations: builder.query<MyOrganizationInvitation[], void>({
      query: () => ({
        url: "/organizations/invitations/me",
        method: "GET",
      }),
      transformResponse: (
        response: MyOrganizationInvitation[] | MyInvitationsEnvelope | null,
      ) => {
        if (Array.isArray(response)) return response;
        if (!response) return [];
        return (
          response.invitations ??
          response.data ??
          response.items ??
          []
        );
      },
      providesTags: ["OrganizationInvitations"],
    }),
    acceptOrganizationInvitation: builder.mutation<
      OrganizationInvitationMember,
      AcceptOrganizationInvitationRequest
    >({
      query: ({ token }) => ({
        url: `/organizations/invitations/${token}/accept`,
        method: "POST",
      }),
      invalidatesTags: [
        "OrganizationMembers",
        "OrganizationMemberships",
        "OrganizationInvitations",
      ],
    }),
    updateMemberRole: builder.mutation<
      OrganizationInvitationMember,
      UpdateMemberRoleRequest
    >({
      query: ({ userId, role }) => ({
        url: `/organizations/me/members/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["OrganizationMembers"],
    }),
    updateMemberPermissions: builder.mutation<
      OrganizationInvitationMember,
      UpdateMemberPermissionsRequest
    >({
      query: ({ userId, permissions }) => ({
        url: `/organizations/me/members/${userId}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: ["OrganizationMembers"],
    }),
    removeMember: builder.mutation<void, RemoveMemberRequest>({
      query: ({ userId }) => ({
        url: `/organizations/me/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrganizationMembers"],
    }),
    uploadOrganizationCover: builder.mutation<Organization, File | FormData>({
      query: (fileOrForm) => {
        let body: FormData;
        if (fileOrForm instanceof FormData) {
          body = fileOrForm;
        } else {
          body = new FormData();
          body.append("file", fileOrForm);
        }

        return {
          url: "/organizations/me/cover",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Organization"],
    }),
    removeOrganizationCover: builder.mutation<Organization, void>({
      query: () => ({
        url: "/organizations/me/cover",
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
    getOrganizationHacktivity: builder.query<
      unknown,
      { id: string; page?: number; size?: number; sort?: string }
    >({
      query: ({ id, page = 0, size = 20, sort }) => ({
        url: `/organizations/${id}/hacktivity`,
        params: { page, size, ...(sort ? { sort } : {}) },
      }),
      providesTags: ["Organization"],
    }),
    getMyOrganizationHacktivity: builder.query<
      unknown,
      { organizationId?: string; page?: number; size?: number; sort?: string } | void
    >({
      query: (params) => ({
        url: `/organizations/me/hacktivity`,
        params: {
          ...(params?.organizationId ? { organizationId: params.organizationId } : {}),
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      }),
      providesTags: ["Organization"],
    }),
    getOrganizationRoles: builder.query<OrganizationRoleResponse[], void>({
      query: () => ({
        url: "/organizations/roles",
        method: "GET",
      }),
      providesTags: ["OrganizationRoles"],
    }),
    searchMemberCandidates: builder.query<
      MemberCandidate[],
      { query?: string; organizationId?: string } | void
    >({
      query: (arg) => {
        const query = arg?.query ?? "";
        const organizationId = arg?.organizationId;
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (organizationId) params.set("organizationId", organizationId);
        const qStr = params.toString();
        return `/organizations/me/members/candidates${qStr ? `?${qStr}` : ""}`;
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterOrganizationMutation,
  useGetMyOrganizationQuery,
  useUpdateMyOrganizationMutation,
  useUploadOrganizationLogoMutation,
  useRemoveOrganizationLogoMutation,
  useUploadOrganizationCoverMutation,
  useRemoveOrganizationCoverMutation,
  useGetOrganizationHacktivityQuery,
  useGetMyOrganizationHacktivityQuery,
  useDeleteMyOrganizationMutation,
  useGetOrganizationVerificationQuery,
  useSendVerificationEmailMutation,
  useResubmitOrganizationMutation,
  useGetOrganizationByIdQuery,
  useGetOrganizationBySlugQuery,
  useGetOrganizationProgramsByIdQuery,
  useGetOrganizationMembersQuery,
  useInviteOrganizationMemberMutation,
  useSearchMemberCandidatesQuery,
  useLazySearchMemberCandidatesQuery,
  useGetMyMembershipsQuery,
  useGetMyInvitationsQuery,
  useAcceptOrganizationInvitationMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberPermissionsMutation,
  useRemoveMemberMutation,
  useGetOrganizationRolesQuery,
} = organizationsApi;
