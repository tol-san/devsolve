"use client";

import { useCallback, useEffect, useRef } from "react";

import { useDetectCountryQuery } from "@/lib/redux/services/geoApi";
import { isCountryCode } from "@/lib/countries";

/**
 * A first guess at where someone is, as an ISO alpha-2 code.
 *
 * Only ever produces a **code** — the country list itself is static and ships
 * with the frontend (`@/lib/countries`), so there is nothing to fetch and no
 * display name to carry around. The name is derived from the code wherever it
 * is shown.
 *
 * This is a convenience, not an answer: it prefills the picker so most people
 * do not have to open it, and every caller lets the person change it. A guess
 * that lands on the wrong country is a nuisance; one that cannot be overridden
 * would be a bug.
 */
export function useAutoDetectCountry(onDetect?: (code: string) => void) {
  const hasDetectedRef = useRef(false);

  /* The callback is usually written inline at the call site, so it is read
     through a ref — depending on it directly would re-run detection on every
     render of the form. */
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const { data: ipGeo, isLoading: isDetecting } = useDetectCountryQuery();

  /* Hands the guess to the form and keeps none of it. The hook holds no state
     of its own: the field it fills is the single source of truth, and a second
     copy here could only ever disagree with it. */
  const apply = useCallback((code: string) => {
    const normalized = code.trim().toLowerCase();
    if (!isCountryCode(normalized)) return;
    onDetectRef.current?.(normalized);
  }, []);

  useEffect(() => {
    if (hasDetectedRef.current) return;

    /* IP geolocation is the good answer when we have it. */
    if (ipGeo?.country_code) {
      hasDetectedRef.current = true;
      apply(ipGeo.country_code);
      return;
    }

    if (isDetecting) return;
    hasDetectedRef.current = true;

    /* Otherwise the browser's own locale, which carries a region for most
       people ("en-GB" -> gb). Deliberately not a timezone table: those need a
       hand-maintained list of cities and get a continent's worth of countries
       wrong. No guess at all is better than a confidently wrong one, so this
       gives up rather than defaulting to any particular country. */
    try {
      const region = new Intl.Locale(navigator.language).region;
      if (region) apply(region);
    } catch {
      /* Leaves the picker empty for the person to fill in. */
    }
  }, [ipGeo, isDetecting, apply]);

  return { isDetecting };
}
