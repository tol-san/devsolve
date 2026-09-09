import type { Metadata } from "next";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { isoDateTime } from "./dates";
import { pageMetadata } from "./metadata";
import { absoluteUrl, SITE_NAME } from "./site";
import { publicImageUrl as showcaseCoverUrl, publicImageDimensions as coverDimensions } from "./social-image";
export { publicImageUrl as showcaseCoverUrl } from "./social-image";
import { describe } from "./text";

export function showcaseAuthor(showcase: ShowcaseResponse | null) {
  const username = showcase?.author?.username?.trim() || undefined;
  const name = showcase?.author?.fullName?.trim() || showcase?.authorName?.trim()
    || showcase?.author?.displayName?.trim() || username;
  return { name, username };
}

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
