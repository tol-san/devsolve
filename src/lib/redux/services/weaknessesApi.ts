import { proxyApi } from "./proxyApi";

export interface Weakness {
  id: string;
  cweId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface WeaknessPage {
  content?: Weakness[];
  totalElements?: number;
  totalPages?: number;
}

export interface WeaknessSearch {
  search?: string;
  size?: number;
}

export interface PopularWeakness {
  id: string;
  cweId: string;
  name: string;
  isActive: boolean;
  reportCount: number;
  validCount: number;
  share: number;
  lastReportedAt: string;
}

export const weaknessesApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    searchWeaknesses: builder.query<Weakness[], WeaknessSearch | void>({
      query: (input) => {
        const { search = "", size = 50 } = input ?? {};
        const params = new URLSearchParams({
          page: "0",
          size: String(Math.min(Math.max(1, size), 100)),
          sort: "name,ASC",
        });
        if (search.trim()) params.set("search", search.trim());
        return `/weaknesses?${params.toString()}`;
      },
      transformResponse: (response: WeaknessPage | Weakness[]) => {
        const rows = Array.isArray(response) ? response : (response.content ?? []);
        return rows.filter((row) => row.isActive !== false);
      },
      providesTags: ["Weakness"],
      keepUnusedDataFor: 300,
    }),

    getPopularWeaknesses: builder.query<
      PopularWeakness[],
      { limit?: number } | void
    >({
      query: (input) => {
        const limit = Math.min(Math.max(1, input?.limit ?? 10), 50);
        return `/weaknesses/popular?limit=${limit}`;
      },
      providesTags: ["Weakness"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useSearchWeaknessesQuery, useGetPopularWeaknessesQuery } =
  weaknessesApi;

