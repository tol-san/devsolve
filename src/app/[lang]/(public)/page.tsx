import type { Metadata } from "next";
import { HeroPlatform } from "@/components/landing/HeroPlatform";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { StatsSection } from "@/components/landing/StatsSection";
import { BountyPreview } from "@/components/landing/BountyPreview";
import { ProblemsSolutions } from "@/components/landing/ProblemsSolutions";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  return pageMetadata({
    title: dict.seoPages.home.title,
    absoluteTitle: true,
    description: dict.seoPages.home.description,
    path: "/",
    locale,
  });
}

export default function Page() {
  return (
    <main className="text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:text-neutral-100 dark:selection:bg-blue-500/30 dark:selection:text-blue-50">
      {/* The site's identity, declared once here — every other page's
          structured data references these two nodes by id rather than
          restating them. */}
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      {/* The pitch — built in the same language as the lifecycle section below */}
      <HeroPlatform />

      {/* How the three pillars work — an auto-scanning radar, no scroll hijack */}
      <FeatureHighlights />

      {/* Proof the platform is in use */}
      <StatsSection />

      {/* Pillar 1 — bug bounty */}
      <BountyPreview />

      {/* Pillar 2 — problems and solutions */}
      <ProblemsSolutions />

      {/* Pillar 3 — showcases */}
      <ShowcaseSection />

      {/* <CTABanner /> */}
    </main>
  );
}
