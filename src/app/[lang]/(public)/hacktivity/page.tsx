import type { Metadata } from "next";
import { Suspense } from "react";
import HacktivityFeature from "@/components/hacktivity/HacktivityFeature";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const copy = dict.seoPages.hacktivity;
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/hacktivity",
    locale,
  });
}

export default async function HacktivityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const copy = dict.seoPages.hacktivity;

  return (
    <>
      <JsonLd
        data={collectionSchema({
          name: copy.schemaName,
          description: copy.metaDescription,
          path: localise("/hacktivity", locale),
        })}
      />

      {/* The feed reads its filters from the URL, which needs a boundary here
          so the rest of the page can still render on the server. */}
      <Suspense fallback={null}>
        <HacktivityFeature
          heading={copy.heading}
          description={copy.description}
        />
      </Suspense>
    </>
  );
}
