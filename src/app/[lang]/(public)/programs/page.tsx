import type { Metadata } from "next";
import MarketplacePage from "@/components/programs/details/PublicProgramBrowsePage";
import React from "react";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { JsonLd, collectionSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { listPrograms } from "@/lib/seo/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return pageMetadata({
    title: dict.programs.metaTitle,
    description: dict.programs.metaDescription,
    path: "/programs",
    locale: lang,
  });
}

export default async function PublicProgramBrowse({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const [dict, initialPrograms] = await Promise.all([
    getDictionary(locale),
    listPrograms(),
  ]);

  return (
    <>
      <JsonLd
        data={collectionSchema({
          name: dict.programs.metaTitle,
          description: dict.programs.metaDescription,
          path: localise("/programs", locale),
        })}
      />

      <MarketplacePage initialPrograms={initialPrograms} />
    </>
  );
}

