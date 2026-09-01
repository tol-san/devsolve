import type { Metadata } from "next";
import { DiscussionsFeed } from "@/components/discussions/DiscussionsFeed";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getInitialDiscussions } from "@/lib/seo/content";

/* Title, description and schema name come from the same catalogue the feed
   renders from, so a Khmer URL is described in Khmer everywhere a crawler or a
   share card looks — not only in the body copy. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const copy = dict.community.pages.showcases;

  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/showcases",
    locale: lang,
  });
}

export default async function ShowcasesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const [dict, initialData] = await Promise.all([
    getDictionary(locale),
    getInitialDiscussions("showcases"),
  ]);
  const copy = dict.community.pages.showcases;

  return (
    <>
      <JsonLd
        data={collectionSchema({
          name: copy.schemaName,
          description: copy.metaDescription,
          path: localise("/showcases", locale),
        })}
      />

      <DiscussionsFeed
        defaultCategory="Showcase"
        feed="showcases"
        createHref="/community/create/showcase"
        initialData={initialData}
      />
    </>
  );
}


