import { baseApi } from "./baseApi";

export interface IpGeoResult {
  country_name: string;
  country_code: string;
}

export const geoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    detectCountry: builder.query<IpGeoResult | null, void>({
      query: () => "/geo/detect-country",
    }),
  }),
});

export const { useDetectCountryQuery } = geoApi;
