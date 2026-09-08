import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { fetchExternalImage, getImageSize } from "next/dist/server/image-optimizer";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { isoDateTime } from "./dates";
import { pageMetadata } from "./metadata";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./site";
import { describe } from "./text";

export function showcaseAuthor(showcase: ShowcaseResponse | null) {
  const username = showcase?.author?.username?.trim() || undefined;
  const name = showcase?.author?.fullName?.trim() || showcase?.authorName?.trim()
    || showcase?.author?.displayName?.trim() || username;
  return { name, username };
}

export function showcaseCoverUrl(value: string | null | undefined): string | undefined {
  const source = value?.trim();
  if (!source || /[\\\u0000-\u001f]/.test(source)) return undefined;
  try {
    const url = new URL(source, `${SITE_URL}/`);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

// Next's image fetcher checks DNS/redirect targets for private IPs, sets a timeout,
// and bounds the response body. Reuse that protection for user-supplied covers.
// Keep this version-specific import covered by the Showcase verification script.
const coverDimensions = unstable_cache(async (url: string) => {
  try {
    const image = await fetchExternalImage(url, false, 5 * 1024 * 1024);
    const size = await getImageSize(image.buffer);
    return size.width && size.height ? size : null;
  } catch {
    return null;
  }
}, ["showcase-social-cover-v1"], { revalidate: 300 });

export async function showcaseMetadata(
  showcase: ShowcaseResponse | null, id: string, lang: string,
): Promise<Metadata> {
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const path = `/showcases/${encodeURIComponent(id)}`;
  const title = showcase?.title?.trim() || "Showcase";
  const author = showcaseAuthor(showcase);
  const authorUrl = author.username
    ? absoluteUrl(localise(`/profile/${encodeURIComponent(author.username)}`, locale)) : undefined;
  const category = showcase?.categoryName?.trim() || undefined;
  const tags = (showcase?.tags ?? []).flatMap(tag => tag.name?.trim() ? [tag.name.trim()] : []);
  const keywords = [...new Set([...tags, ...(category ? [category] : [])])];
  const description = describe(showcase?.overview,
    showcase?.title ? (author.name ? `A project built by ${author.name} and shared on ${SITE_NAME}.`
      : `A project shared on ${SITE_NAME}.`) : `This showcase is not available on ${SITE_NAME}.`);
  const metadata = pageMetadata({
    title: `${title} · ${SITE_NAME}`, absoluteTitle: true, description, path, locale,
    type: "article", noIndex: !showcase?.title,
    publishedTime: isoDateTime(showcase?.createdAt),
    modifiedTime: isoDateTime(showcase?.updatedAt),
    authors: author.name ? [authorUrl || author.name] : undefined, tags,
  });
  const coverUrl = showcaseCoverUrl(showcase?.coverImageUrl);
  const dimensions = coverUrl ? await coverDimensions(coverUrl) : null;
  const shareImage = {
    url: coverUrl && dimensions ? coverUrl : absoluteUrl(localise(`${path}/social-image`, locale)),
    ...(dimensions || { width: 1200, height: 630 }),
    alt: title,
  };
  return {
    ...metadata,
    // Clear inherited site defaults when optional Showcase data is absent.
    authors: author.name ? [{ name: author.name, ...(authorUrl ? { url: authorUrl } : {}) }] : null,
    creator: author.name || null,
    keywords: keywords.length ? keywords : null,
    category: category || null,
    openGraph: { ...metadata.openGraph, images: [shareImage] },
    twitter: { ...metadata.twitter, creator: undefined, images: [shareImage] },
  };
}
