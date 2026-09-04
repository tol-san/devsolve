import type { Metadata } from "next";
import PublicOrganizationProfileView from "@/components/company/PublicOrganizationProfileView";
import { CompanyLanding } from "@/components/company/CompanyLanding";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, localise } from "@/lib/i18n/config";
import { JsonLd } from "@/lib/seo/jsonld";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const copy = (await getDictionary(locale)).seoPages.company;
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/company",
    locale,
  });
}

export default async function PublicOrganizationProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const pagePath = localise("/company", locale);
  const hasOrganization = Boolean(query.id || query.orgId);
  const copy = (await getDictionary(locale)).seoPages.company;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl(pagePath)}#webpage`,
          url: absoluteUrl(pagePath),
          name: copy.schemaName,
          description: copy.metaDescription,
          inLanguage: LOCALE_TAGS[locale],
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          audience: {
            "@type": "Audience",
            audienceType: "Organizations running bug bounty programs",
          },
        }}
      />

      {hasOrganization ? <PublicOrganizationProfileView /> : <CompanyLanding />}
    </>
  );
}
