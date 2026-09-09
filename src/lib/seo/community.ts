import type { Metadata } from "next";
import { cache } from "react";
import type { AuthorSummary, AttachmentSummary, ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { SolutionAttachmentSummary, SolutionResponse } from "@/lib/redux/services/solutionsApi";
import { attachmentUrl } from "@/lib/api/attachment-url";
import { authorNameOf } from "@/lib/discussions/format";
import { DEFAULT_LOCALE, isLocale, localise } from "@/lib/i18n/config";
import { getProblem, getProblemSolution } from "./content";
import { isoDateTime } from "./dates";
import { pageMetadata } from "./metadata";
import { absoluteUrl, SITE_NAME } from "./site";
import { publicImageDimensions, publicImageUrl } from "./social-image";
import { describe, plainText } from "./text";

export interface CommunityContent {
  problem: ProblemResponse | null;
  solution: SolutionResponse | null;
  solutionId?: string;
}

export const getCommunityContent = cache(async (id: string, solutionId?: string): Promise<CommunityContent> => {
  const raw = await getProblem(id);
  const unpublished = raw?.status && ["DRAFT", "PENDING_APPROVAL", "REJECTED"].includes(raw.status);
  const problem = raw?.title?.trim() && !raw.deletedAt && !unpublished ? raw : null;
  const solution = problem && solutionId ? await getProblemSolution(id, solutionId) : null;
  return { problem, solution, solutionId };
});

export function communityDetails({ problem, solution, solutionId }: CommunityContent) {
  const isSolution = solutionId !== undefined;
  const available = Boolean(problem && (!isSolution || solution));
  const kind = isSolution ? "Solution" : "Problem";
  const author: AuthorSummary | undefined = available ? (isSolution ? solution?.author : problem?.author) : undefined;
  const title = available
    ? (isSolution ? plainText(solution?.summary) || `Solution to ${problem?.title}` : problem?.title?.trim()) || kind
    : kind;
  const body = available ? (isSolution ? solution?.bodyMarkdown || solution?.summary : problem?.description) : undefined;
  const category = available ? problem?.category?.name?.trim() : undefined;
  const tags = available ? [...new Set([
    ...(problem?.tags ?? []).flatMap(tag => tag.name?.trim() ? [tag.name.trim()] : []),
    ...(problem?.technologies ?? []).flatMap(tech => tech.name?.trim() ? [tech.name.trim()] : []),
    ...(isSolution ? solution?.testedWith ?? [] : []).flatMap(tech => tech.technology?.trim() ? [tech.technology.trim()] : []),
  ])] : [];
  return {
    title, body, kind, available, author, category, tags,
    authorName: authorNameOf(author, ""),
    description: describe(body, available ? `${kind} shared on ${SITE_NAME}.` : `This ${kind.toLowerCase()} is not available on ${SITE_NAME}.`),
    published: isSolution ? solution?.createdAt : problem?.publishedAt || problem?.createdAt,
    modified: isSolution ? solution?.updatedAt : problem?.updatedAt,
    attachments: available ? (isSolution ? solution?.attachments : problem?.attachments) ?? [] : [],
  };
}

export function communityImageCandidates(
  attachments: (AttachmentSummary | SolutionAttachmentSummary)[], body?: string,
) {
  const candidates = attachments.filter(file => {
    if (file.mimeType) return /^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.mimeType);
    const name = "originalFileName" in file ? file.originalFileName : "fileName" in file ? file.fileName : undefined;
    return /\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(name || file.downloadUrl || "");
  }).map(file => file.downloadUrl);
  // The feed already uses Markdown images when there is no image attachment.
  const inline = body?.match(/!\[[^\]]*\]\((<?(?:https?:\/\/|\/)[^\s)>]+)>?(?:\s+"[^"]*")?\)/)?.[1]?.replace(/^</, "");
  if (inline) candidates.push(inline);
  return [...new Set(candidates.flatMap(value => {
    const url = publicImageUrl(attachmentUrl(value) || value);
    return url ? [url] : [];
  }))].slice(0, 3);
}

export async function communityMetadata(content: CommunityContent, id: string, lang: string): Promise<Metadata> {
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const details = communityDetails(content);
  const path = `/community/${encodeURIComponent(id)}`;
  const query = content.solutionId !== undefined ? `?solution=${encodeURIComponent(content.solutionId)}` : "";
  const authorUrl = details.author?.id ? absoluteUrl(localise(`/profile/${encodeURIComponent(details.author.id)}`, locale)) : undefined;
  const metadata = pageMetadata({
    title: `${details.title} · ${SITE_NAME}`, absoluteTitle: true,
    description: details.description, path: `${path}${query}`, locale, type: "article",
    noIndex: !details.available, publishedTime: isoDateTime(details.published), modifiedTime: isoDateTime(details.modified),
    authors: details.authorName ? [authorUrl || details.authorName] : undefined, tags: details.tags,
  });
  let shareImage = { url: absoluteUrl(localise(`${path}/social-image${query}`, locale)), width: 1200, height: 630, alt: details.title };
  for (const url of communityImageCandidates(details.attachments, details.body)) {
    const dimensions = await publicImageDimensions(url);
    if (dimensions?.width && dimensions.height) {
      shareImage = { url, width: dimensions.width, height: dimensions.height, alt: details.title };
      break;
    }
  }
  const keywords = [...new Set([...details.tags, ...(details.category ? [details.category] : [])])];
  return {
    ...metadata,
    authors: details.authorName ? [{ name: details.authorName, ...(authorUrl ? { url: authorUrl } : {}) }] : null,
    creator: details.authorName || null,
    keywords: keywords.length ? keywords : null,
    category: details.category || null,
    openGraph: { ...metadata.openGraph, images: [shareImage] },
    twitter: { ...metadata.twitter, creator: undefined, images: [shareImage] },
  };
}
