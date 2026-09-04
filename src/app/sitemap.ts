import type { MetadataRoute } from "next";
import { isoDateTime } from "@/lib/seo/dates";
import {
  isUuid,
  listProblems,
  listPrograms,
  listPublicProfiles,
  listShowcases,
} from "@/lib/seo/content";
import { absoluteUrl } from "@/lib/seo/site";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  localise,
} from "@/lib/i18n/config";

export const revalidate = 3600;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/discussions", priority: 0.9, changeFrequency: "hourly" },
  { path: "/problems", priority: 0.8, changeFrequency: "hourly" },
  { path: "/showcases", priority: 0.8, changeFrequency: "daily" },
  { path: "/programs", priority: 0.8, changeFrequency: "daily" },
  { path: "/hacktivity", priority: 0.7, changeFrequency: "daily" },
  { path: "/leaderboard", priority: 0.6, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/company", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [problems, showcases, programs, profiles] = await Promise.all([
    listProblems(),
    listShowcases(),
    listPrograms(),
    listPublicProfiles(),
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

  const profileEntries: MetadataRoute.Sitemap = profiles
    .filter((profile) => isUuid(profile.id) && Boolean(profile.fullName))
    .map((profile) => ({
      url: absoluteUrl(`/profile/${profile.id}`),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  const singleLocale: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...problemEntries,
    ...showcaseEntries,
    ...programEntries,
    ...profileEntries,
  ];

  return LOCALES.flatMap((locale) =>
    singleLocale.map((entry) => {
      const path = new URL(entry.url).pathname;
      return {
        ...entry,
        url: absoluteUrl(localise(path, locale)),
        alternates: {
          languages: Object.fromEntries(
            [
              ...LOCALES.map(
                (code) =>
                  [
                    LOCALE_TAGS[code],
                    absoluteUrl(localise(path, code)),
                  ] as const,
              ),
              [
                "x-default",
                absoluteUrl(localise(path, DEFAULT_LOCALE)),
              ] as const,
            ],
          ),
        },
      };
    }),
  );
}

