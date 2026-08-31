import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Pass-through layout carrying the page's metadata.
 *
 * `about/page.tsx` is a large "use client" component built around scroll and
 * viewport hooks, and a client module cannot export metadata. Describing the
 * route from the layout above it says the same thing to a crawler without
 * splitting the page in two.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const copy = (await getDictionary(locale)).seoPages.about;
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/about",
    locale,
  });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
