import { baseApi } from "./baseApi";
import type {
  VirusTotalAnalysisResponse,
  VirusTotalUrlRequest,
} from "@/lib/types/virustotal/types";

export const virusTotalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    submitUrlScan: builder.mutation<VirusTotalAnalysisResponse, VirusTotalUrlRequest>({
      query: (body) => ({
        url: "/virus-total/urls",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VirusTotal"],
    }),

    getAnalysis: builder.query<VirusTotalAnalysisResponse, string>({
      query: (analysisId) => `/virus-total/analyses/${encodeURIComponent(analysisId)}`,
      providesTags: (_result, _error, analysisId) => [
        { type: "VirusTotal", id: analysisId },
      ],
    }),

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
