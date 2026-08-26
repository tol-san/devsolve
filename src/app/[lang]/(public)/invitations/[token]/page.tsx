import type { Metadata } from "next";

import { AcceptInvitationView } from "@/components/teams/accept-invitation/AcceptInvitationView";
import { pageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ lang: string; token: string }>;
}

/**
 * Where an invitation email lands.
 *
 * Transactional and single-use: the token in the path is a credential, so the
 * page is kept out of the index rather than described for search. `robots.ts`
 * disallows the prefix as well, but a disallowed URL that someone links to can
 * still be listed — the header here is what actually keeps it out.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;

  return pageMetadata({
    title: "Accept your invitation",
    description:
      "Join an organization workspace you have been invited to on DevSolve.",
    path: "/invitations",
    locale: lang,
    noIndex: true,
  });
}

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { token } = await params;

  return <AcceptInvitationView token={token} />;
}
