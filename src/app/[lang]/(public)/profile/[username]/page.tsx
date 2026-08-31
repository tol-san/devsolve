import type { Metadata } from "next";
import PublicProfileView from "@/components/profile/PublicProfileView";
import { getPublicProfile, isUuid } from "@/lib/seo/content";
import { JsonLd, breadcrumbSchema, profileSchema } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";
import { describe } from "@/lib/seo/text";

interface PageProps {
  params: Promise<{ lang: string; username: string }>;
}

/**
 * The `username` segment carries a user id — the backend has no lookup by
 * name — with one alias, `me`, which resolves to whoever is signed in. A
 * crawler is nobody, so that alias has no stable page behind it and is kept
 * out of the index; every other id is a real person's public profile.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, username } = await params;
  const path = `/profile/${username}`;

  if (!isUuid(username)) {
    return pageMetadata({
      title: "Profile",
      description: `A member profile on ${SITE_NAME}.`,
      path,
      locale: lang,
      noIndex: true,
    });
  }

  const profile = await getPublicProfile(username);

  if (!profile?.fullName) {
    return pageMetadata({
      title: "Profile",
      description: `This profile is not available on ${SITE_NAME}.`,
      path,
      locale: lang,
      noIndex: true,
    });
  }

  const reputation = profile.reputation ?? 0;

  return pageMetadata({
    title: profile.fullName,
    description: describe(
      profile.biography,
      `${profile.fullName} on ${SITE_NAME} — ${reputation} reputation from ${
        profile.validReports ?? 0
      } valid reports, plus the problems and solutions they have posted.`,
    ),
    path,
    locale: lang,
    type: "profile",
  });
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = isUuid(username) ? await getPublicProfile(username) : null;
  const path = `/profile/${username}`;

  return (
    <>
      {profile?.fullName ? (
        <JsonLd
          data={[
            profileSchema(profile, path),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Leaderboard", path: "/leaderboard" },
              { name: profile.fullName, path },
            ]),
          ]}
        />
      ) : null}

      <PublicProfileView />
    </>
  );
}
