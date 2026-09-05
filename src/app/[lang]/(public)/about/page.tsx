import { AboutHero } from "@/components/public-about/AboutHero";
import { AboutIntegrationsSection } from "@/components/public-about/AboutIntegrationsSection";
import { AboutTeamSection } from "@/components/public-about/AboutTeamSection";
import { AboutContactSection } from "@/components/public-about/AboutContactSection";
import { JsonLd } from "@/lib/seo/jsonld";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, localise } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const pagePath = localise("/about", locale);
  const copy = (await getDictionary(locale)).seoPages.about;

  return (
    <main className="text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:text-neutral-100 dark:selection:bg-blue-500/30 dark:selection:text-blue-50">
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
          about: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />

      <AboutHero
        eyebrow={copy.eyebrow}
        titleLineOne={copy.titleLineOne}
        titleLineTwo={copy.titleLineTwo}
        description={copy.description}
        actionLabel={copy.actionLabel}
        imageAlt={copy.imageAlt}
      />
      <AboutIntegrationsSection />
      <AboutTeamSection />
      <AboutContactSection />
    </main>
  );
}
