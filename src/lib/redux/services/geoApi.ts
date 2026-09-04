import { baseApi } from "./baseApi";

/**
 * IP geolocation only.
 *
 * The country *list* is static and ships with the frontend
 * (`@/lib/countries`) — there used to be a `/geo/countries` endpoint here that
 * proxied a CDN to learn that Cambodia is `kh`, which is a network round trip
 * that can fail before the register form can paint its picker.
 */

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
