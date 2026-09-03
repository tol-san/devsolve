import type { Metadata } from "next";
import HacktivityFeature from "@/components/hacktivity/HacktivityFeature";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getInitialHacktivity } from "@/lib/seo/content";

export const revalidate = 3600;

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
  const [dict, initialData] = await Promise.all([
    getDictionary(locale),
    getInitialHacktivity(),
  ]);
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

      <HacktivityFeature
        heading={copy.heading}
        description={copy.description}
        initialFeed={initialData.feed}
        initialStats={initialData.stats}
      />
    </>
  );
}
