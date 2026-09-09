import type { Metadata } from "next";
import ProblemDetailPage from "@/components/discussions/ProblemDetailPage";
import { getProblemSolutions } from "@/lib/seo/content";
import { communityMetadata, getCommunityContent } from "@/lib/seo/community";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { JsonLd, breadcrumbSchema, problemSchema } from "@/lib/seo/jsonld";

type PageProps = {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ solution?: string | string[] }>;
};

function selectedSolution(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params, searchParams,
}: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const solutionId = selectedSolution((await searchParams).solution);
  return communityMetadata(await getCommunityContent(id, solutionId), id, lang);
}

export default async function PublicDiscussionDetailPage({
  params, searchParams,
}: PageProps) {
  const { id, lang } = await params;
  const solutionId = selectedSolution((await searchParams).solution);
  const { problem, solution } = await getCommunityContent(id, solutionId);
  const solutions = problem ? [...await getProblemSolutions(id)] : [];
  if (solution && !solutions.some(item => item.id === solution.id)) solutions.push(solution);
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const path = localise(`/community/${encodeURIComponent(id)}`, locale);

  return (
    <>
      {problem?.title ? (
        <JsonLd
          data={[
            { ...problemSchema(problem, solutions, path), inLanguage: locale },
            breadcrumbSchema([
              { name: "Home", path: localise("/", locale) },
              { name: "Community", path: localise("/community", locale) },
              { name: problem.title, path },
            ]),
          ]}
        />
      ) : null}

      <ProblemDetailPage sharedSolution={solution ?? undefined} />
    </>
  );
}
