import { baseApi } from "./baseApi";
import type {
  VirusTotalAnalysisResponse,
  VirusTotalUrlRequest,
} from "@/lib/types/virustotal/types";

export const virusTotalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /api/virus-total/files -> POST /api/v1/virus-total/files */
    submitFileScan: builder.mutation<VirusTotalAnalysisResponse, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: "/virus-total/files",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["VirusTotal"],
    }),

    /** POST /api/virus-total/urls -> POST /api/v1/virus-total/urls */
    submitUrlScan: builder.mutation<VirusTotalAnalysisResponse, VirusTotalUrlRequest>({
      query: (body) => ({
        url: "/virus-total/urls",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VirusTotal"],
    }),

    /** GET /api/virus-total/analyses/{analysisId} -> GET /api/v1/virus-total/analyses/{analysisId} */
    getAnalysis: builder.query<VirusTotalAnalysisResponse, string>({
      query: (analysisId) => `/virus-total/analyses/${encodeURIComponent(analysisId)}`,
      providesTags: (_result, _error, analysisId) => [
        { type: "VirusTotal", id: analysisId },
      ],
    }),

    /** Imperative fetch for poll steps within custom scanning hooks */
    pollAnalysis: builder.mutation<VirusTotalAnalysisResponse, string>({
      query: (analysisId) => ({
        url: `/virus-total/analyses/${encodeURIComponent(analysisId)}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSubmitFileScanMutation,
  useSubmitUrlScanMutation,
  useGetAnalysisQuery,
  useLazyGetAnalysisQuery,
  usePollAnalysisMutation,
} = virusTotalApi;
