import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";

export default async function LegacyCommunityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  permanentRedirect(
    localise("/discussions", isLocale(lang) ? lang : DEFAULT_LOCALE),
  );
}
