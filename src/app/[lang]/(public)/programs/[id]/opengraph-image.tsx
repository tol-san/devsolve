import { getProgram } from "@/lib/seo/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og-card";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { describe, humanizeEnum } from "@/lib/seo/text";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `A bug bounty program on ${SITE_NAME}`;

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgram(id);

  if (!program?.name) {
    return ogCard({
      eyebrow: "Bug bounty",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    });
  }

  const organization = program.organization?.name ?? program.organizationName;
  const chips = [
    humanizeEnum(program.engagementType),
    program.offersBounties && program.maximumBounty
      ? `Up to ${money(program.maximumBounty)}`
      : "",
    program.organization?.industry ? humanizeEnum(program.organization.industry) : "",
  ];

  return ogCard({
    eyebrow: organization ? `Program · ${organization}` : "Program",
    title: program.name,
    description: describe(program.description, "", 140),
    chips,
    footnote: `Report findings on ${SITE_NAME}`,
  });
}
