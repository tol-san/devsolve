import { authorNameOf } from "@/lib/discussions/format";
import { getProblem } from "@/lib/seo/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og-card";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { describe, humanizeEnum } from "@/lib/seo/text";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `A problem on ${SITE_NAME}`;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem?.title) {
    return ogCard({
      eyebrow: "Community",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    });
  }

  const kind = humanizeEnum(problem.problemType) || "Problem";
  const state = humanizeEnum(problem.status);
  const solutionCount = problem.solutionCount ?? 0;

  return ogCard({
    eyebrow: state ? `${kind} · ${state}` : kind,
    title: problem.title,
    description: describe(problem.description, "", 140),
    chips: (problem.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
    footnote: `${authorNameOf(problem.author, "A developer")} · ${solutionCount} ${
      solutionCount === 1 ? "solution" : "solutions"
    }`,
  });
}
