
import type { SearchHit, SearchType } from "@/lib/types/search/types";

const TYPE_LABELS: Record<SearchType, { one: string; many: string }> = {
  programs: { one: "Program", many: "Programs" },
  showcases: { one: "Showcase", many: "Showcases" },
  problems: { one: "Problem", many: "Problems" },
  organizations: { one: "Organization", many: "Organizations" },
  users: { one: "Researcher", many: "Researchers" },
};

export function typeLabel(type: SearchType, count = 2): string {
  return count === 1 ? TYPE_LABELS[type].one : TYPE_LABELS[type].many;
}

export function hrefForHit(hit: Pick<SearchHit, "type" | "slug" | "id">): string {
  const id = encodeURIComponent(hit.id);
  const handle = encodeURIComponent(hit.slug || hit.id);

  switch (hit.type) {
    case "programs":
      return `/programs/${id}`;
    case "showcases":
      return `/showcases/${id}`;
    case "problems":
      return `/community/${id}`;
    case "organizations":
      return `/company?id=${id}`;
    case "users":
      return `/profile/${handle}`;
  }
}

export function enumLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const words = trimmed.toLowerCase().split("_").filter(Boolean);
  if (words.length === 0) return null;

  return words.join(" ").replace(/^./, (c) => c.toUpperCase());
}

export function fromEpochSeconds(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function docString(
  document: Record<string, unknown>,
  key: string,
): string | null {
  const value = document[key];
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function docNumber(
  document: Record<string, unknown>,
  key: string,
): number | null {
  const value = document[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function docStrings(
  document: Record<string, unknown>,
  key: string,
): string[] {
  const value = document[key];
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is string => typeof entry === "string");
}

export type SnippetSegment = { text: string; marked: boolean };

export function snippetSegments(
  snippet: string | null | undefined,
): SnippetSegment[] {
  if (!snippet) return [];

  const normalized = stripMarkdown(snippet);

  const segments: SnippetSegment[] = [];
  const pattern = /<mark>([\s\S]*?)<\/mark>/gi;
  let cursor = 0;

  for (const match of normalized.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: plainText(normalized.slice(cursor, start)), marked: false });
    }
    segments.push({ text: plainText(match[1]), marked: true });
    cursor = start + match[0].length;
  }

  if (cursor < normalized.length) {
    segments.push({ text: plainText(normalized.slice(cursor)), marked: false });
  }

  const kept = segments.filter((segment) => segment.text.length > 0);

  return kept.some((segment) => segment.text.trim().length > 0) ? kept : [];
}

export function snippetToText(snippet: string | null | undefined): string {
  return snippetSegments(snippet)
    .map((segment) => segment.text)
    .join("")
    .trim();
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function stripMarkdown(raw: string): string {
  return raw
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|$)/g, "$1$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/`{1,3}/g, "");
}

function plainText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? "")
    .replace(/\s+/g, " ");
}
