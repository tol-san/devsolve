import { Suspense } from "react";
import type { Metadata } from "next";

import { SearchResultsView } from "@/components/search/SearchResultsView";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";

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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SearchResultsView />
    </Suspense>
  );
}
