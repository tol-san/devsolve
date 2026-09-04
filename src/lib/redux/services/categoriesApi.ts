import { proxyApi } from "./proxyApi";
import type {
  CategoryCreateValues,
  CategoryPatchValues,
  CategoryScope,
} from "@/lib/validations/category";

export type { CategoryScope };

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  scope: CategoryScope;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const bySortOrder = (a: CategoryResponse, b: CategoryResponse) =>
  (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name);

export const categoriesApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], CategoryScope | void>({
      query: (scope) => ({
        url: "/categories",
        params: scope ? { scope } : undefined,
      }),
      transformResponse: (raw: CategoryResponse[]) => [...raw].sort(bySortOrder),
      providesTags: ["Category"],
    }),

    getActiveCategories: builder.query<CategoryResponse[], CategoryScope | void>(
      {
        query: (scope) => ({
          url: "/categories/active",
          params: scope ? { scope } : undefined,
        }),
        transformResponse: (raw: CategoryResponse[]) =>
          [...raw].sort(bySortOrder),
        providesTags: ["Category"],
      },
    ),

    createCategory: builder.mutation<CategoryResponse, CategoryCreateValues>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      CategoryResponse,
      { id: string; body: CategoryPatchValues }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    uploadCategoryIcon: builder.mutation<
      CategoryResponse,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append("file", file);

        return { url: `/categories/${id}/icon`, method: "PUT", body };
      },
      invalidatesTags: ["Category"],
    }),

    removeCategoryIcon: builder.mutation<CategoryResponse, string>({
      query: (id) => ({ url: `/categories/${id}/icon`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryIconMutation,
  useRemoveCategoryIconMutation,
} = categoriesApi;
