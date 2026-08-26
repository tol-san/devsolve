import { LOCALES } from "@/lib/i18n/config";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og-card";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

/**
 * The site-wide social card.
 *
 * Sitting on the `[lang]` segment, it covers every route that does not draw
 * its own — the landing page, the feeds, the leaderboard. Routes that do (a
 * problem, a showcase, a program) place an `opengraph-image` of their own
 * further down the tree, and the closer file wins.
 *
 * It belongs here rather than at the root of `app`. `[lang]/layout.tsx` is
 * what carries `metadataBase`, and a card above that layout is resolved
 * against a fallback origin instead — which is what made `/_not-found`
 * advertise a `localhost` image, and left the pages people actually share
 * with no card at all.
 *
 * Nothing here varies, so Next renders it once per locale at build time.
 */

/* Without this the card sits on an unresolved `[lang]` and Next builds it at
   the placeholder route `/-/opengraph-image`, where it attaches to no page at
   all. Enumerating the locales gives it one real URL per language. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

export default function Image() {
  return ogCard({
    eyebrow: "Developer community",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    chips: ["Problems", "Solutions", "Showcases", "Bug bounty"],
    footnote: "devsolve.app",
  });
}
