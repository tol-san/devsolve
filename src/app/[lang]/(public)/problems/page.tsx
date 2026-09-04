import type { Metadata } from "next";
import { DiscussionsFeed } from "@/components/discussions/DiscussionsFeed";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getInitialDiscussions } from "@/lib/seo/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
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
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const [dict, initialData] = await Promise.all([
    getDictionary(locale),
    getInitialDiscussions("problems"),
  ]);
  const copy = dict.community.pages.problems;

  return (
    <>
      <JsonLd
        data={collectionSchema({
          name: copy.schemaName,
          description: copy.metaDescription,
          path: localise("/problems", locale),
        })}
      />

      <DiscussionsFeed
        defaultCategory="Problems"
        feed="problems"
        createHref="/community/create/problem"
        initialData={initialData}
      />
    </>
  );
}

