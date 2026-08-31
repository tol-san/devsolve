import { proxyApi } from "./proxyApi";

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  usageCount?: number;
}

export interface TagDeletionResponse {
  id: string;
  name: string;
  slug: string;
  unlinkedProblems: number;
  unlinkedShowcases: number;
  unlinkedRevisions: number;
}

export interface TagsQuery {
  q?: string;
  limit?: number;
}

export interface DeleteTagRequest {
  id: string;
  force?: boolean;
}

export const tagsApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<TagResponse[], TagsQuery | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.q) queryParams.set("q", params.q);
        if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
        const queryStr = queryParams.toString();
        return `/tags${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tag" as const, id })),
              { type: "Tag", id: "LIST" },
            ]
          : [{ type: "Tag", id: "LIST" }],
    }),

    deleteTag: builder.mutation<TagDeletionResponse, DeleteTagRequest>({
      query: ({ id, force }) => ({
        url: `/admin/tags/${id}${force ? "?force=true" : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),
  }),
});

export const { useGetTagsQuery, useDeleteTagMutation } = tagsApi;
