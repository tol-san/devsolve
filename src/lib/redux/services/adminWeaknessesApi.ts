import { proxyApi } from "./proxyApi";
import type { Weakness } from "./weaknessesApi";
import type {
  WeaknessCreateValues,
  WeaknessPatchValues,
} from "@/lib/validations/weakness";

interface WeaknessPage {
  content?: Weakness[];
  totalElements?: number;
  totalPages?: number;
  /** Zero-based index of the page that came back. */
  number?: number;
}

/** The upstream refuses anything larger: `pageSize must be <= 100`. */
export const WEAKNESS_PAGE_MAX = 100;

export interface AdminWeaknessQuery {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  size?: number;
}

export interface AdminWeaknessList {
  rows: Weakness[];
  /** Across the whole catalogue, not just this page. */
  total: number;
  page: number;
  totalPages: number;
}

/**
 * The catalogue as an admin sees it: retired entries included, and writeable.
 *
 * Every mutation invalidates `Weakness`, which the report form's search query
 * also provides — so renaming or retiring an entry here is reflected in the
 * submit form without a reload.
 */
export const adminWeaknessesApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminWeaknesses: builder.query<AdminWeaknessList, AdminWeaknessQuery | void>({
      query: (input) => {
        const {
          search = "",
          activeOnly = false,
          page = 0,
          size = WEAKNESS_PAGE_MAX,
        } = input ?? {};
        const params = new URLSearchParams({
          page: String(Math.max(0, page)),
          /* Clamped rather than trusted: the upstream answers 400 above 100,
             and a caller asking for more should get the most it will serve
             instead of an error. */
          size: String(Math.min(Math.max(1, size), WEAKNESS_PAGE_MAX)),
          sort: "name,ASC",
        });
        if (search.trim()) params.set("search", search.trim());
        if (activeOnly) params.set("activeOnly", "true");
        return `/admin/weaknesses?${params.toString()}`;
      },
      transformResponse: (response: WeaknessPage | Weakness[]): AdminWeaknessList => {
        if (Array.isArray(response)) {
          return {
            rows: response,
            total: response.length,
            page: 0,
            totalPages: 1,
          };
        }
        const rows = response.content ?? [];
        return {
          rows,
          total: response.totalElements ?? rows.length,
          page: response.number ?? 0,
          totalPages: Math.max(1, response.totalPages ?? 1),
        };
      },
      providesTags: ["Weakness"],
    }),

    createWeakness: builder.mutation<Weakness, WeaknessCreateValues>({
      query: (body) => ({ url: "/admin/weaknesses", method: "POST", body }),
      invalidatesTags: ["Weakness"],
    }),

    updateWeakness: builder.mutation<
      Weakness,
      { id: string; body: WeaknessPatchValues }
    >({
      query: ({ id, body }) => ({
        url: `/admin/weaknesses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Weakness"],
    }),

    deleteWeakness: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/weaknesses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Weakness"],
    }),
  }),
});

export const {
  useGetAdminWeaknessesQuery,
  useCreateWeaknessMutation,
  useUpdateWeaknessMutation,
  useDeleteWeaknessMutation,
} = adminWeaknessesApi;
