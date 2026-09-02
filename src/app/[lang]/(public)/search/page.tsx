import { Suspense } from "react";
import type { Metadata } from "next";

import { SearchResultsView } from "@/components/search/SearchResultsView";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * A results page is a thin listing over content that already has its own
 * canonical URLs, and every distinct `q` would be another near-duplicate of
 * it — so the page is described for anyone who lands on it and kept out of
 * the index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  return pageMetadata({
    title: "Search",
    description:
      "Search bug bounty programs, organizations, researchers, community problems and write-ups across DevSolve.",
    path: "/search",
    locale,
    noIndex: true,
  });
}

/**
 * The view reads `q`, `type` and `page` from the URL with `useSearchParams`,
 * which Next requires to sit under a Suspense boundary — without one the whole
 * route opts out of static rendering.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SearchResultsView />
    </Suspense>
  );
}
