"use client";

import { useCallback, useEffect, useRef } from "react";

import { useDetectCountryQuery } from "@/lib/redux/services/geoApi";
import { isCountryCode } from "@/lib/countries";

export function useAutoDetectCountry(onDetect?: (code: string) => void) {
  const hasDetectedRef = useRef(false);

  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const { data: ipGeo, isLoading: isDetecting } = useDetectCountryQuery();

  const apply = useCallback((code: string) => {
    const normalized = code.trim().toLowerCase();
    if (!isCountryCode(normalized)) return;
    onDetectRef.current?.(normalized);
  }, []);

  useEffect(() => {
    if (hasDetectedRef.current) return;

    if (ipGeo?.country_code) {
      hasDetectedRef.current = true;
      apply(ipGeo.country_code);
      return;
    }

    if (isDetecting) return;
    hasDetectedRef.current = true;

    try {
      const region = new Intl.Locale(navigator.language).region;
      if (region) apply(region);
    } catch {
      /* Leaves the picker empty for the person to fill in. */
    }
  }, [ipGeo, isDetecting, apply]);

  return { isDetecting };
}
