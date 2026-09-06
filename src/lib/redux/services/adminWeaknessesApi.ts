import { proxyApi } from "./proxyApi";
import type { Weakness, PopularWeakness } from "./weaknessesApi";
import type {
  WeaknessCreateValues,
  WeaknessPatchValues,
} from "@/lib/validations/weakness";

export interface SuggestedWeakness {
  name: string;
  reportCount: number;
  inCatalog: boolean;
  firstSuggestedAt: string;
  lastSuggestedAt: string;
}

export interface WeaknessStatsQuery {
  includeUnused?: boolean;
  activeOnly?: boolean;
  page?: number;
  size?: number;
}

export interface SuggestedWeaknessQuery {
  page?: number;
  size?: number;
}

interface WeaknessPage {
  content?: Weakness[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
}

export const WEAKNESS_PAGE_MAX = 100;

export interface AdminWeaknessQuery {
  search?: string;
  activeOnly?: boolean;
  page?: number;
  size?: number;
}

export interface AdminWeaknessList {
  rows: Weakness[];
  total: number;
  page: number;
  totalPages: number;
}

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

    getWeaknessStats: builder.query<
      {
        content: PopularWeakness[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      },
      WeaknessStatsQuery | void
    >({
      query: (input) => {
        const {
          includeUnused = false,
          activeOnly = false,
          page = 0,
          size = 20,
        } = input ?? {};
        const params = new URLSearchParams({
          page: String(Math.max(0, page)),
          size: String(Math.min(Math.max(1, size), 100)),
        });
        if (includeUnused) params.set("includeUnused", "true");
        if (activeOnly) params.set("activeOnly", "true");
        return `/admin/weaknesses/stats?${params.toString()}`;
      },
      providesTags: ["Weakness"],
    }),

    getSuggestedWeaknesses: builder.query<
      {
        content: SuggestedWeakness[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      },
      SuggestedWeaknessQuery | void
    >({
      query: (input) => {
        const { page = 0, size = 20 } = input ?? {};
        const params = new URLSearchParams({
          page: String(Math.max(0, page)),
          size: String(Math.min(Math.max(1, size), 100)),
        });
        return `/admin/weaknesses/suggested?${params.toString()}`;
      },
      providesTags: ["Weakness"],
    }),
  }),
});

export const {
  useGetAdminWeaknessesQuery,
  useCreateWeaknessMutation,
  useUpdateWeaknessMutation,
  useDeleteWeaknessMutation,
  useGetWeaknessStatsQuery,
  useGetSuggestedWeaknessesQuery,
} = adminWeaknessesApi;

