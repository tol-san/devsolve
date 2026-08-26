import type { Metadata } from "next";
import { DiscussionsFeed } from "@/components/discussions/DiscussionsFeed";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

/* Title, description and schema name come from the same catalogue the feed
   renders from, so a Khmer URL is described in Khmer everywhere a crawler or a
   share card looks — not only in the body copy. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE);
  const copy = dict.community.pages.problems;

  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/problems",
    locale: lang,
  });
}

export default async function ProblemsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE);
  const copy = dict.community.pages.problems;

  return (
    <>
      <JsonLd
        data={collectionSchema({
          name: copy.schemaName,
          description: copy.metaDescription,
          path: "/problems",
        })}
      />

      <DiscussionsFeed
        defaultCategory="Problems"
        feed="problems"
        createHref="/community/create/problem"
      />
    </>
  );
}
