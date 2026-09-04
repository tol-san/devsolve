import type { Metadata } from "next";
import ProblemDetailPage from "@/components/discussions/ProblemDetailPage";
import { authorNameOf } from "@/lib/discussions/format";
import { getProblem, getProblemSolutions } from "@/lib/seo/content";
import { isoDateTime } from "@/lib/seo/dates";
import { JsonLd, breadcrumbSchema, problemSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";
import { describe, humanizeEnum } from "@/lib/seo/text";

type PageProps = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const path = `/community/${id}`;
  const problem = await getProblem(id);

  if (!problem?.title) {
    return pageMetadata({
      title: "Problem",
      description: `This problem is not available on ${SITE_NAME}.`,
      path,
      locale: lang,
      noIndex: true,
    });
  }

  const kind = humanizeEnum(problem.problemType) || "Engineering";

  return pageMetadata({
    title: problem.title,
    description: describe(
      problem.description,
      `A ${kind.toLowerCase()} problem posted on ${SITE_NAME}, with solutions from the community.`,
    ),
    path,
    locale: lang,
    type: "article",
    publishedTime: isoDateTime(problem.publishedAt ?? problem.createdAt),
    modifiedTime: isoDateTime(problem.updatedAt),
    authors: [authorNameOf(problem.author, SITE_NAME)],
    tags: (problem.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
  });
}

export default async function PublicDiscussionDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const problem = await getProblem(id);
  const solutions = problem ? await getProblemSolutions(id) : [];
  const path = `/community/${id}`;

  return (
    <>
      {problem?.title ? (
        <JsonLd
          data={[
            problemSchema(problem, solutions, path),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Community", path: "/community" },
              { name: problem.title, path },
            ]),
          ]}
        />
      ) : null}

      <ProblemDetailPage />
    </>
  );
}
