import { proxyApi } from "./proxyApi";
import type {
  GetMyProgramInvitationsParams,
  GetProgramInvitationsParams,
  InviteResearcherRequest,
  ProgramInvitation,
  SpringPage,
} from "@/lib/types/programs/programInvitationTypes";

export const programInvitationsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgramInvitations: builder.query<
      SpringPage<ProgramInvitation>,
      GetProgramInvitationsParams
    >({
      query: ({ programId, status, page = 0, size = 20, sort }) => {
        const queryParams = new URLSearchParams();
        if (status && status !== "ALL") {
          queryParams.set("status", status);
        }
        queryParams.set("page", page.toString());
        queryParams.set("size", size.toString());
        if (sort) {
          queryParams.set("sort", sort);
        }

        return `/programs/${programId}/invitations?${queryParams.toString()}`;
      },
      providesTags: (_result, _error, { programId }) => [
        { type: "ProgramInvitation", id: `${programId}-list` },
      ],
    }),

    inviteProgramResearcher: builder.mutation<
      ProgramInvitation,
      { programId: string; body: InviteResearcherRequest }
    >({
      query: ({ programId, body }) => ({
        url: `/programs/${programId}/invitations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { programId }) => [
        { type: "ProgramInvitation", id: `${programId}-list` },
      ],
    }),

    revokeProgramInvitation: builder.mutation<
      void,
      { programId: string; userId: string }
    >({
      query: ({ programId, userId }) => ({
        url: `/programs/${programId}/invitations/${userId}/revoke`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { programId }) => [
        { type: "ProgramInvitation", id: `${programId}-list` },
      ],
    }),

    getMyProgramInvitations: builder.query<
      SpringPage<ProgramInvitation>,
      GetMyProgramInvitationsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "ALL") {
          queryParams.set("status", params.status);
        }
        if (params?.page !== undefined) {
          queryParams.set("page", params.page.toString());
        }
        if (params?.size !== undefined) {
          queryParams.set("size", params.size.toString());
        }
        if (params?.sort) {
          queryParams.set("sort", params.sort);
        }

        const queryString = queryParams.toString();
        return `/me/program-invitations${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["MyProgramInvitations"],
    }),

    acceptProgramInvitation: builder.mutation<void, { programId: string } | string>({
      query: (arg) => {
        const programId = typeof arg === "string" ? arg : arg.programId;
        return {
          url: `/me/program-invitations/${programId}/accept`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["MyProgramInvitations", "Program"],
    }),

    declineProgramInvitation: builder.mutation<void, { programId: string } | string>({
      query: (arg) => {
        const programId = typeof arg === "string" ? arg : arg.programId;
        return {
          url: `/me/program-invitations/${programId}/decline`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["MyProgramInvitations"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProgramInvitationsQuery,
  useInviteProgramResearcherMutation,
  useRevokeProgramInvitationMutation,
  useGetMyProgramInvitationsQuery,
  useAcceptProgramInvitationMutation,
  useDeclineProgramInvitationMutation,
} = programInvitationsApi;

/**
 * @deprecated Use `useInviteProgramResearcherMutation` instead to avoid endpoint name collision with organization `inviteResearcher`.
 */
export const useInviteResearcherMutation = useInviteProgramResearcherMutation;

