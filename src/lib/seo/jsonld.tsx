import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import type { SolutionResponse } from "@/lib/redux/services/solutionsApi";
import type { Program } from "@/lib/types/programs/types";
import { authorNameOf, type AuthorLike } from "@/lib/discussions/format";
import type { PublicProfile } from "./content";
import { isoDateTime } from "./dates";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "./site";
import { humanizeEnum, plainText, truncate } from "./text";

/**
 * Structured data — the machine-readable half of a page.
 *
 * Meta tags tell a crawler how to *display* a link; this tells it what the
 * page *is*. It is what lets a problem and its accepted solution appear as a
 * Q&A result with the answer attached, rather than as a title and a snippet.
 *
 * Every builder describes only what is actually on the page: Google treats
 * structured data that overstates the visible content as a violation, and the
 * penalty lands on the whole site rather than the one page.
 */

export type JsonLdNode = Record<string, unknown>;

/** Body text carried into structured data, capped so the HTML stays small. */
const TEXT_LIMIT = 4000;

/**
 * Renders one or more schema.org graphs into the document.
 *
 * `<` is escaped in the serialized JSON: a problem titled `</script>` would
 * otherwise close the tag early and inject the rest of the payload as markup.
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data];

  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}

function personNode(
  author: AuthorLike | null | undefined,
  authorId?: string,
): JsonLdNode | undefined {
  const name = authorNameOf(author, "");
  if (!name) return undefined;

  return {
    "@type": "Person",
    name,
    ...(authorId ? { url: absoluteUrl(`/profile/${authorId}`) } : {}),
  };
}

/** The publisher every content page points back to. */
export function organizationSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/devsolve-logo.png"),
    },
    /** Links Google's Knowledge Graph to the DevSolve brand entity across
     *  the web. Each URL should be a verified, publicly visible profile.
     *  Add LinkedIn, X, Product Hunt, etc. here as the accounts are created. */
    sameAs: [
      "https://github.com/ITE-GEN03-BASIC-COURSE/devsolve-frontend",
    ],
  };
}

/**
 * The site itself. No `SearchAction` is declared: the feed filters in the
 * browser without putting the query in the URL, so there is no address a
 * search engine could send a query to.
 */
export function websiteSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** The trail shown above a page, as search results render it under the title. */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

function answerNode(
  solution: SolutionResponse,
  problemPath: string,
): JsonLdNode {
  const body = plainText(solution.bodyMarkdown) || plainText(solution.summary);

  return {
    "@type": "Answer",
    text: truncate(body, TEXT_LIMIT),
    /* SolutionCard renders `id="solution-{id}"`, so the fragment lands on the
       answer rather than the top of the page. */
    url: `${absoluteUrl(problemPath)}#solution-${solution.id}`,
    upvoteCount: solution.voteScore ?? 0,
    ...(isoDateTime(solution.createdAt)
      ? { dateCreated: isoDateTime(solution.createdAt) }
      : {}),
    ...(personNode(solution.author, solution.author?.id)
      ? { author: personNode(solution.author, solution.author?.id) }
      : {}),
  };
}

/**
 * A problem and the solutions posted against it, as a Q&A page.
 *
 * `QAPage` is the schema for a page where one question has many competing
 * answers and one may be marked correct — which is exactly what
 * `/community/{id}` is. The accepted answers become `acceptedAnswer` and the
 * rest `suggestedAnswer`, the same distinction the page draws visually.
 */
export function problemSchema(
  problem: ProblemResponse,
  solutions: SolutionResponse[],
  path: string,
): JsonLdNode {
  const accepted = new Set(problem.acceptedSolutionIds ?? []);
  const acceptedAnswers = solutions.filter(
    (solution) => solution.isAccepted || accepted.has(solution.id),
  );
  const suggestedAnswers = solutions.filter(
    (solution) => !acceptedAnswers.includes(solution),
  );

  const published = isoDateTime(problem.publishedAt ?? problem.createdAt);
  const modified = isoDateTime(problem.updatedAt);
  const tags = (problem.tags ?? [])
    .map((tag) => tag.name)
    .filter((name): name is string => Boolean(name));

  const question: JsonLdNode = {
    "@type": "Question",
    name: problem.title ?? "Untitled problem",
    text: truncate(plainText(problem.description), TEXT_LIMIT),
    /* The count the page shows, not the number of answers embedded below —
       only the first page of solutions is fetched for metadata. */
    answerCount: problem.solutionCount ?? solutions.length,
    upvoteCount: problem.voteScore ?? 0,
    ...(published ? { datePublished: published, dateCreated: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    ...(personNode(problem.author, problem.author?.id)
      ? { author: personNode(problem.author, problem.author?.id) }
      : {}),
    ...(acceptedAnswers.length
      ? {
          acceptedAnswer: acceptedAnswers.map((solution) =>
            answerNode(solution, path),
          ),
        }
      : {}),
    ...(suggestedAnswers.length
      ? {
          suggestedAnswer: suggestedAnswers.map((solution) =>
            answerNode(solution, path),
          ),
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "@id": `${absoluteUrl(path)}#qa`,
    url: absoluteUrl(path),
    name: problem.title,
    inLanguage: "en",
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
    ...(problem.viewCount
      ? {
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ViewAction",
            userInteractionCount: problem.viewCount,
          },
        }
      : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: question,
  };
}

/** A showcase: someone's project, written up as an article about their work. */
export function showcaseSchema(
  showcase: ShowcaseResponse,
  path: string,
): JsonLdNode {
  const published = isoDateTime(showcase.createdAt);
  const modified = isoDateTime(showcase.updatedAt);
  const tags = (showcase.tags ?? [])
    .map((tag) => tag.name)
    .filter((name): name is string => Boolean(name));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    url: absoluteUrl(path),
    headline: truncate(showcase.title, 110),
    description: truncate(plainText(showcase.overview), 500),
    inLanguage: "en",
    ...(showcase.coverImageUrl ? { image: showcase.coverImageUrl } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    ...(showcase.authorName
      ? {
          author: {
            "@type": "Person",
            name: showcase.authorName,
            url: absoluteUrl(`/profile/${showcase.authorId}`),
          },
        }
      : {}),
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
    ...(showcase.categoryName ? { articleSection: showcase.categoryName } : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/**
 * A bug bounty program. Modelled as an `Offer` from the running organization
 * rather than a job posting — participation is open and paid per finding, not
 * an application for a role.
 */
export function programSchema(program: Program, path: string): JsonLdNode {
  const organizationName = program.organization?.name ?? program.organizationName;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#program`,
    url: absoluteUrl(path),
    name: program.name,
    description: truncate(plainText(program.description), 500),
    inLanguage: "en",
    ...(isoDateTime(program.createdAt)
      ? { datePublished: isoDateTime(program.createdAt) }
      : {}),
    ...(isoDateTime(program.updatedAt)
      ? { dateModified: isoDateTime(program.updatedAt) }
      : {}),
    ...(organizationName
      ? {
          about: {
            "@type": "Organization",
            name: organizationName,
            ...(program.organization?.websiteUrl
              ? { url: program.organization.websiteUrl }
              : {}),
            ...(program.organization?.logoUrl
              ? { logo: program.organization.logoUrl }
              : {}),
          },
        }
      : {}),
    ...(program.offersBounties && program.maximumBounty
      ? {
          offers: {
            "@type": "Offer",
            name: `${humanizeEnum(program.engagementType)} rewards`,
            priceCurrency: "USD",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: program.minimumBounty ?? 0,
              maxPrice: program.maximumBounty,
              priceCurrency: "USD",
            },
          },
        }
      : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/** A member's public profile. */
export function profileSchema(
  profile: PublicProfile,
  path: string,
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteUrl(path)}#profile`,
    url: absoluteUrl(path),
    ...(isoDateTime(profile.joinedAt)
      ? { dateCreated: isoDateTime(profile.joinedAt) }
      : {}),
    mainEntity: {
      "@type": "Person",
      name: profile.fullName,
      url: absoluteUrl(path),
      ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
      ...(profile.biography
        ? { description: truncate(plainText(profile.biography), 500) }
        : {}),
      ...(profile.country ? { nationality: profile.country } : {}),
      memberOf: { "@id": `${SITE_URL}/#organization` },
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/** A listing page — the feed, the showcase index, the program marketplace. */
export function collectionSchema(input: {
  name: string;
  description: string;
  path: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}
