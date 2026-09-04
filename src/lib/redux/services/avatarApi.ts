import { proxyApi } from "./proxyApi";
import { baseApi } from "./baseApi";

export interface AvatarUpdateResponse {
  id: string;
  avatarUrl?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

const invalidateProfileEverywhere = async (
  _arg: unknown,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: (action: unknown) => unknown;
    queryFulfilled: Promise<unknown>;
  },
) => {
  try {
    await queryFulfilled;
    dispatch(baseApi.util.invalidateTags(["Profile"]));
  } catch {
    // A failed upload changed nothing, so the caches are still correct.
  }
};

export const avatarApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadAvatar: builder.mutation<AvatarUpdateResponse, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);

        return { url: "/user-profiles/me/avatar", method: "PUT", body };
      },
      onQueryStarted: invalidateProfileEverywhere,
    }),

    removeAvatar: builder.mutation<AvatarUpdateResponse, void>({
      query: () => ({ url: "/user-profiles/me/avatar", method: "DELETE" }),
      onQueryStarted: invalidateProfileEverywhere,
    }),
  }),
  overrideExisting: true,
});

export const { useUploadAvatarMutation, useRemoveAvatarMutation } = avatarApi;
