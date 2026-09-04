"use client";

import { useCallback } from "react";
import { useLocale, useT } from "./I18nProvider";
import { LOCALE_TAGS } from "./config";

export function useRelativeTime() {
  const t = useT();
  const locale = useLocale();

  return useCallback(
    (iso?: string): string => {
      if (!iso) return t("community.time.unknown");
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return t("community.time.unknown");

      const diffHrs = (Date.now() - date.getTime()) / 3_600_000;
      if (diffHrs < 1) return t("community.time.justNow");

      if (diffHrs < 24) {
        const hrs = Math.floor(diffHrs);
        return `${hrs} ${t(
          hrs === 1 ? "community.time.hourAgo" : "community.time.hoursAgo",
        )}`;
      }

      const days = Math.floor(diffHrs / 24);
      if (days < 7) {
        return `${days} ${t(
          days === 1 ? "community.time.dayAgo" : "community.time.daysAgo",
        )}`;
      }

      return date.toLocaleDateString(LOCALE_TAGS[locale], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
    [locale, t],
  );
}
