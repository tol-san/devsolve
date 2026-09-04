import type { Metadata } from "next";
import {
  SITE_NAME,
  TWITTER_HANDLE,
  absoluteUrl,
} from "./site";
import {
  DEFAULT_LOCALE as DEFAULT_UI_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  isLocale,
  localise,
  type Locale,
} from "@/lib/i18n/config";

export interface PageSeoInput {
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
  locale?: string;
}

export const NO_INDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export const INDEX_RICH: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  km: "km_KH",
};

export function pageMetadata(input: PageSeoInput): Metadata {
  const {
    title,
    absoluteTitle = false,
    description,
    path,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    tags,
    noIndex = false,
    locale: localeInput,
  } = input;

  const locale: Locale = isLocale(localeInput) ? localeInput : DEFAULT_UI_LOCALE;

  const url = absoluteUrl(localise(path, locale));
  const socialTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  const openGraphLocale = OPEN_GRAPH_LOCALES[locale];
  const alternateLocale = LOCALES.filter((code) => code !== locale).map(
    (code) => OPEN_GRAPH_LOCALES[code],
  );

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title: socialTitle,
          description,
          url,
          siteName: SITE_NAME,
          locale: openGraphLocale,
          alternateLocale,
          publishedTime,
          modifiedTime,
          authors,
          tags,
        }
      : {
          type,
          title: socialTitle,
          description,
          url,
          siteName: SITE_NAME,
          locale: openGraphLocale,
          alternateLocale,
        };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localise(path, locale),
      languages: {
        ...Object.fromEntries(
          LOCALES.map((code) => [LOCALE_TAGS[code], localise(path, code)]),
        ),
        "x-default": localise(path, DEFAULT_UI_LOCALE),
      },
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
    robots: noIndex ? NO_INDEX : INDEX_RICH,
  };
}
