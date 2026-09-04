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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, username } = await params;
  const path = `/profile/${username}`;

  const profile = await getPublicProfile(username);

  if (!profile?.fullName) {
    const formattedName = username
      .split(/[_.-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return pageMetadata({
      title: `${formattedName} · Profile`,
      description: `Security researcher profile on ${SITE_NAME}.`,
      path,
      locale: lang,
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
  const profile = await getPublicProfile(username);
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
