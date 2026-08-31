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

/**
 * The problem is fetched twice on paper — once for the title tag, once for the
 * structured data — and once in practice: `getProblem` is memoised for the
 * render, and the client component below fetches its own copy anyway because
 * it needs the viewer's bookmark and vote state, which a crawler must not see.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const path = `/community/${id}`;
  const problem = await getProblem(id);

  /* Null covers three cases that all deserve the same answer: no such problem,
     a draft the backend refused to serve anonymously, and a backend that did
     not respond. None of them should be indexed under a guessed title. */
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

/**
 * One problem. The id is read from the route by the client component itself,
 * which is also what paints the page background — a wrapper painting its own
 * would have to repeat the light and dark halves of it to stay in step.
 *
 * The structured data is emitted here rather than inside that component: it
 * describes the published problem as anyone can see it, so it has to be built
 * from an anonymous read on the server, not from whatever the signed-in viewer
 * happens to have loaded.
 */
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
