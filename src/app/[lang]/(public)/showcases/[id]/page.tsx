import type { Metadata } from "next";
import { ShowcaseDetail } from "@/components/showcases/detail/ShowcaseDetail";
import { getShowcase } from "@/lib/seo/content";
import { JsonLd, breadcrumbSchema, showcaseSchema } from "@/lib/seo/jsonld";
import { showcaseAuthor, showcaseCoverUrl, showcaseMetadata } from "@/lib/seo/showcase";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo/site";


interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const showcase = await getShowcase(id);
  return showcaseMetadata(showcase, id, lang);
}

export default async function PublicShowcaseDetailPage({ params }: PageProps) {
  const { id, lang } = await params;
  const showcase = await getShowcase(id);
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const path = localise(`/showcases/${encodeURIComponent(id)}`, locale);
  const author = showcaseAuthor(showcase);

  return (
    <>
      {showcase?.title ? (
        <JsonLd
          data={[
            {
              ...showcaseSchema(showcase, path),
              inLanguage: locale,
              image: showcaseCoverUrl(showcase.coverImageUrl),
              author: author.name ? {
                "@type": "Person",
                name: author.name,
                ...(author.username ? { url: absoluteUrl(localise(`/profile/${encodeURIComponent(author.username)}`, locale)) } : {}),
              } : undefined,
            },
            breadcrumbSchema([
              { name: "Home", path: localise("/", locale) },
              { name: "Showcases", path: localise("/showcases", locale) },
              { name: showcase.title, path },
            ]),
          ]}
        />
      ) : null}

      <div className="font-sans">
        <ShowcaseDetail id={id} />
      </div>
    </>
  );
}
