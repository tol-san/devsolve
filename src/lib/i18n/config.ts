export const LOCALES = ["en", "km"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  km: "ភាសាខ្មែរ",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  km: "KH",
};

export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en",
  km: "km-KH",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function splitLocale(pathname: string): {
  locale: Locale;
  rest: string;
  hadLocale: boolean;
} {
  const [, first = "", ...others] = pathname.split("/");
  if (isLocale(first)) {
    return { locale: first, rest: `/${others.join("/")}`, hadLocale: true };
  }
  return { locale: DEFAULT_LOCALE, rest: pathname, hadLocale: false };
}

export function localise(pathname: string, locale: Locale): string {
  const { rest } = splitLocale(pathname);
  const clean = rest === "/" ? "" : rest;
  return locale === DEFAULT_LOCALE ? clean || "/" : `/${locale}${clean}`;
}
