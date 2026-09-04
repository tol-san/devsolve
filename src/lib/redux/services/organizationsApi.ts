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

/**
 * `ACTIVE` for somebody on the team, `SUSPENDED` for an invitation nobody has
 * accepted yet. `REMOVED` is documented but never listed, so the roster only
 * ever shows the first two.
 */
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

export type RemoveMemberRequest = {
  userId: string;
};

export type OrganizationInvitationMember = {
  userId: string;
  /** Stable handle, for profile links that read as a name rather than a UUID. */
  username?: string | null;
  name: string;
  email: string;
  /**
   * Null for the owner, who holds every permission without holding a role.
   * Also the ceiling: a member may not be granted more than the role allows.
   */
  role: OrganizationInvitationRole | null;
  permissions: OrganizationInvitationPermission[];
  status: OrganizationMemberInvitationStatus;
  invitationPending: boolean;
  /**
   * This row is the caller. The roster is the only place that can say so —
   * `GET /organizations/me/memberships` describes the account's relationship to
   * the organization and carries no user id to match a row against.
   */
  self?: boolean;
  /** Registered the company, rather than being invited into it. */
  owner?: boolean;
  joinedAt: string;
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

/**
 * An invitation as the *invitee* sees it, from
 * `GET /organizations/invitations/me`.
 *
 * A different shape from `OrganizationInvitationMember`, which is the company
 * looking at its own roster. This one carries the `invitationToken` — the only
 * place in the API a signed-in invitee can get it, since the token reaches
 * them otherwise only by email. The INVITATION notification does not have it:
 * its `notifiableId` is the organization's id.
 */
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

/**
 * One organization this account belongs to, from
 * `GET /organizations/me/memberships`.
 *
 * The answer to "does this account have a company workspace", which the
 * Keycloak `COMPANY` realm role cannot give: that role is granted for
 * *registering* a company, so an invited member never has it no matter what
 * the roster says. Owners appear here too — `owner: true`, `role: null`, all
 * ten permissions — so one call covers both, owned entries first.
 */
export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  organizationSlug?: string | null;
  organizationLogoUrl?: string | null;
  organizationStatus: OrganizationStatus;
  /** True when this account registered the company rather than joining it. */
  owner: boolean;
  /** Null for the owner: the three ranks describe invited members only. */
  role?: OrganizationInvitationRole | null;
  /** What this account may do here. The only thing worth gating UI on. */
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
    /**
     * Every organization this account belongs to.
     *
     * Cheap, cached and asked for every signed-in account, because it is what
     * decides whether there is a company workspace at all. An account on no
     * team gets `[]`, which is an answer rather than an error.
     */
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

    /**
     * Invitations waiting for the signed-in account.
     *
     * Server-side this is already filtered to invitations that would succeed
     * if accepted right now and ordered soonest-to-expire first, so the rows
     * are rendered in the order they arrive — no client-side pruning, and no
     * bookkeeping after an accept either: `acceptOrganizationInvitation`
     * invalidates this tag and the accepted row leaves on the refetch.
     */
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
      /* An invitation is not access; accepting it is. The new membership shows
         up only in `/organizations/me/memberships`, so that is what has to be
         re-read — the workspace appears on the strength of it. */
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
  useGetMyMembershipsQuery,
  useGetMyInvitationsQuery,
  useAcceptOrganizationInvitationMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberPermissionsMutation,
  useRemoveMemberMutation,
  useGetOrganizationRolesQuery,
} = organizationsApi;
