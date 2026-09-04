"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, localise, type Locale } from "./config";
import type { Dictionary } from "./get-dictionary";

type I18nValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nValue | null {
  return useContext(I18nContext);
}

export function useLocale(): Locale {
  return useI18n()?.locale ?? DEFAULT_LOCALE;
}

export function useT() {
  const ctx = useI18n();
  return useCallback(
    (key: string): string => {
      if (!ctx) return key;
      const found = key
        .split(".")
        .reduce<unknown>(
          (node, part) =>
            node && typeof node === "object"
              ? (node as Record<string, unknown>)[part]
              : undefined,
          ctx.dict,
        );
      return typeof found === "string" ? found : key;
    },
    [ctx],
  );
}

export function useLocalePath() {
  const locale = useLocale();
  return useCallback(
    (href: string) => (href.startsWith("/") ? localise(href, locale) : href),
    [locale],
  );
}
