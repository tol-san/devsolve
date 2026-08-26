import type { Metadata } from "next";
import PublicOrganizationProfileView from "@/components/company/PublicOrganizationProfileView";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale } from "@/lib/i18n/config";
import { JsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";

const DESCRIPTION =
  "Run a bug bounty or vulnerability disclosure program on DevSolve: publish your scope, set your reward ranges, and work with researchers who report findings you can act on.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    title: "For companies",
    description: DESCRIPTION,
    path: "/company",
    locale: lang,
  });
}

export default async function PublicOrganizationProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  return (
    <>
      {/* WebPage + audience schema helps Google surface this page for
          "bug bounty platform for companies" and similar B2B queries.

          It used to live on an unlocalised copy of this route at the root of
          `app`, which the locale middleware made unreachable — so none of it
          ever shipped. The path stays unprefixed here, matching what
          `collectionSchema` emits for every other localised page. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl("/company")}#webpage`,
          url: absoluteUrl("/company"),
          name: `${SITE_NAME} for companies`,
          description: DESCRIPTION,
          inLanguage: LOCALE_TAGS[locale],
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          audience: {
            "@type": "Audience",
            audienceType: "Organizations running bug bounty programs",
          },
        }}
      />

      <PublicOrganizationProfileView />
    </>
  );
}
