import type { MetadataRoute } from "next";
import { isoDateTime } from "@/lib/seo/dates";
import { listProblems, listPrograms, listShowcases } from "@/lib/seo/content";
import { absoluteUrl } from "@/lib/seo/site";
import { LOCALES, LOCALE_TAGS, localise } from "@/lib/i18n/config";

/**
 * The public map of the site, served at `/sitemap.xml`.
 *
 * A crawler finds most of this by following links, but the feed paginates and
 * filters in the browser — a problem three pages down is reachable by a person
 * and invisible to a crawler. Listing them here is what gets them discovered.
 *
 * Only content an anonymous visitor can open is listed: published problems,
 * approved showcases, public programs. Anything the backend would refuse never
 * reaches the loop, since the fetches carry no session.
 */

/** Rebuilt hourly; new content is discoverable within the hour without a deploy. */
export const revalidate = 3600;

/** Landing pages, ordered by how much of the site they lead to. */
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/community", priority: 0.9, changeFrequency: "hourly" },
  { path: "/problems", priority: 0.8, changeFrequency: "hourly" },
  { path: "/showcases", priority: 0.8, changeFrequency: "daily" },
  { path: "/programs", priority: 0.8, changeFrequency: "daily" },
  { path: "/hacktivity", priority: 0.7, changeFrequency: "daily" },
  { path: "/leaderboard", priority: 0.6, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/company", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* One slow listing should not hold up the others, and any of them may come
     back empty when the backend is unreachable — the static routes below are
     always emitted, so the sitemap is never served empty. */
  const [problems, showcases, programs] = await Promise.all([
    listProblems(),
    listShowcases(),
    listPrograms(),
  ]);

  const now = new Date();

  const problemEntries: MetadataRoute.Sitemap = problems
    .filter((problem) => problem.id && !problem.deletedAt)
    .map((problem) => ({
      url: absoluteUrl(`/community/${problem.id}`),
      lastModified:
        isoDateTime(problem.updatedAt ?? problem.publishedAt ?? problem.createdAt) ??
        now,
      changeFrequency: "weekly",
      /* A problem with an answer is worth more of a crawl budget than one
         still waiting for its first. */
      priority: (problem.solutionCount ?? 0) > 0 ? 0.8 : 0.6,
    }));

  const showcaseEntries: MetadataRoute.Sitemap = showcases
    .filter((showcase) => showcase.id && showcase.reviewStatus === "APPROVED")
    .map((showcase) => ({
      url: absoluteUrl(`/showcases/${showcase.id}`),
      lastModified: isoDateTime(showcase.updatedAt ?? showcase.createdAt) ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
      ...(showcase.coverImageUrl ? { images: [showcase.coverImageUrl] } : {}),
    }));

  const programEntries: MetadataRoute.Sitemap = programs
    .filter((program) => program.id)
    .map((program) => ({
      url: absoluteUrl(`/programs/${program.id}`),
      lastModified: isoDateTime(program.updatedAt ?? program.createdAt) ?? now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  /* Static pages do not change on every crawl — `lastModified` is omitted so
     Google relies on its own change-detection rather than being told these
     pages were just modified at every sitemap fetch. */
  const singleLocale: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...problemEntries,
    ...showcaseEntries,
    ...programEntries,
  ];

  /* Every URL is emitted once per locale, and each entry declares the others
     through `alternates.languages`. Listing only one language would leave the
     other undiscoverable; listing both without the alternates would look like
     duplicate content. The paths above are still written locale-free, so a new
     route is added in one place and picks up both languages automatically. */
  return LOCALES.flatMap((locale) =>
    singleLocale.map((entry) => {
      const path = new URL(entry.url).pathname;
      return {
        ...entry,
        url: absoluteUrl(localise(path, locale)),
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((code) => [
              LOCALE_TAGS[code],
              absoluteUrl(localise(path, code)),
            ]),
          ),
        },
      };
    }),
  );
}

