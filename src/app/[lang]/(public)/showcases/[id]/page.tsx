import type { Metadata } from "next";
import { ShowcaseDetail } from "@/components/showcases/detail/ShowcaseDetail";
import { getShowcase } from "@/lib/seo/content";
import { isoDateTime } from "@/lib/seo/dates";
import { JsonLd, breadcrumbSchema, showcaseSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";
import { describe } from "@/lib/seo/text";

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const path = `/showcases/${id}`;
  const showcase = await getShowcase(id);

  /* Anonymous reads only return approved showcases, so anything else — a
     draft, a rejected submission, an unreachable backend — lands here and
     stays out of the index. */
  if (!showcase?.title) {
    return pageMetadata({
      title: "Showcase",
      description: `This showcase is not available on ${SITE_NAME}.`,
      path,
      locale: lang,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: showcase.title,
    description: describe(
      showcase.overview,
      `A project built by ${showcase.authorName} and written up on ${SITE_NAME}.`,
    ),
    path,
    locale: lang,
    type: "article",
    publishedTime: isoDateTime(showcase.createdAt),
    modifiedTime: isoDateTime(showcase.updatedAt),
    authors: showcase.authorName ? [showcase.authorName] : undefined,
    tags: (showcase.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
  });
}

export default async function PublicShowcaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const showcase = await getShowcase(id);
  const path = `/showcases/${id}`;

  /* The component owns the page shell, the way ProblemDetailPage does under
     /community/[id]. */
  return (
    <>
      {showcase?.title ? (
        <JsonLd
          data={[
            showcaseSchema(showcase, path),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Showcases", path: "/showcases" },
              { name: showcase.title, path },
            ]),
          ]}
        />
      ) : null}

      <ShowcaseDetail id={id} />
    </>
  );
}
