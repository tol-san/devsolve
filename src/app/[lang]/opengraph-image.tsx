import { LOCALES } from "@/lib/i18n/config";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og-card";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

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
