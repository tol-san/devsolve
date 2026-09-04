import { getShowcase } from "@/lib/seo/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og-card";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { describe } from "@/lib/seo/text";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `A project showcase on ${SITE_NAME}`;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const showcase = await getShowcase(id);

  if (!showcase?.title) {
    return ogCard({
      eyebrow: "Showcase",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    });
  }

  return ogCard({
    eyebrow: showcase.categoryName
      ? `Showcase · ${showcase.categoryName}`
      : "Showcase",
    title: showcase.title,
    description: describe(showcase.overview, "", 140),
    chips: (showcase.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
    footnote: showcase.authorName ? `Built by ${showcase.authorName}` : undefined,
  });
}
