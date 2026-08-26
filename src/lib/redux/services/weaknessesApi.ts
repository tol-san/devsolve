import { proxyApi } from "./proxyApi";

/** `WeaknessResponse` — one entry in the CWE catalogue. */
export interface Weakness {
  id: string;
  cweId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

/** `PageWeaknessResponse` — only the parts the form needs. */
interface WeaknessPage {
  content?: Weakness[];
  totalElements?: number;
  totalPages?: number;
}

export interface WeaknessSearch {
  /** Matched upstream against the name and CWE id. */
  search?: string;
  size?: number;
}

/**
 * The weakness catalogue behind the report form's classification field.
 *
 * Searching happens upstream rather than over a cached full list: the
 * catalogue is paginated and free to grow, so the page size here is a cap on
 * what one dropdown shows, not an assumption about how many exist.
 */
export const weaknessesApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    searchWeaknesses: builder.query<Weakness[], WeaknessSearch | void>({
      query: (input) => {
        const { search = "", size = 50 } = input ?? {};
        const params = new URLSearchParams({
          page: "0",
          /* The upstream answers 400 above 100 (`pageSize must be <= 100`). */
          size: String(Math.min(Math.max(1, size), 100)),
          sort: "name,ASC",
        });
        if (search.trim()) params.set("search", search.trim());
        return `/weaknesses?${params.toString()}`;
      },
      transformResponse: (response: WeaknessPage | Weakness[]) => {
        const rows = Array.isArray(response) ? response : (response.content ?? []);
        /* A retired entry stays readable on old reports but must not be
           offered for a new one. */
        return rows.filter((row) => row.isActive !== false);
      },
      providesTags: ["Weakness"],
      /* The catalogue is reference data — it changes when an admin edits it,
         not while someone fills in a form. Holding each search for a few
         minutes keeps typing responsive without going stale in a session. */
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useSearchWeaknessesQuery } = weaknessesApi;
