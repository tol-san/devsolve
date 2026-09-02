/**
 * Turning a search hit into something a screen can render.
 *
 * The API deliberately returns no href and no display labels — it indexes
 * documents and does not know our routes. Both mappings live here so a card,
 * a dropdown row and a results list cannot drift apart on where a hit points
 * or what its type is called.
 */

import type { SearchHit, SearchType } from "@/lib/types/search/types";

/** What each index is called on screen, singular and plural. */
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

/**
 * Where a hit lives in this app.
 *
 * `slug` means two different things depending on the index — the id for
 * showcases and problems, a real handle for the rest — but which of the two a
 * *route* wants is a separate question, and they do not always agree:
 *
 * - **programs** take the id. `/programs/[id]` resolves through `getProgram`,
 *   which returns null for anything that is not a UUID, so linking by the
 *   handle the index carries would render an empty page.
 * - **organizations** have no path of their own; `/company` selects one from
 *   an `id` query parameter.
 * - **users** take the handle, which `/profile/[username]` resolves by name.
 * - **showcases** and **problems** take the id, which is what their slug is.
 */
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

/**
 * `UPPER_SNAKE` as a person would read it — `FINANCE` to `Finance`,
 * `REQUIREMENTS_ANALYSIS` to `Requirements analysis`.
 *
 * Only the first word is capitalised: these are labels inside a sentence or a
 * chip, not titles, and title-casing every word turns `SDLC phase` values into
 * shouting.
 */
export function enumLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const words = trimmed.toLowerCase().split("_").filter(Boolean);
  if (words.length === 0) return null;

  return words.join(" ").replace(/^./, (c) => c.toUpperCase());
}

/**
 * A timestamp from an indexed document.
 *
 * Every one of them is in **epoch seconds**, not the milliseconds `Date`
 * expects — passing the raw number gives a date in 1970 that looks plausible
 * enough to ship.
 */
export function fromEpochSeconds(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A string field from `document`, or null when absent or empty. */
export function docString(
  document: Record<string, unknown>,
  key: string,
): string | null {
  const value = document[key];
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** A number field from `document`, or null. `0` is kept — it is a value. */
export function docNumber(
  document: Record<string, unknown>,
  key: string,
): number | null {
  const value = document[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** A string array from `document`, empty when the field is absent. */
export function docStrings(
  document: Record<string, unknown>,
  key: string,
): string[] {
  const value = document[key];
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is string => typeof entry === "string");
}

export type SnippetSegment = { text: string; marked: boolean };

/**
 * A snippet split into plain and matched runs.
 *
 * `snippet` is the one field carrying markup, and the safe way to keep the
 * highlighting is to *parse* it rather than to sanitize and inject it: the
 * text between the tags is returned as data, React escapes it on render, and
 * no path exists for anything else in the string to become markup. That is a
 * stronger guarantee than an allowlist, and it costs a regex.
 *
 * Everything that is not a `<mark>` is treated as text, entities included —
 * the API sends `&amp;` for an ampersand in the body, so those are decoded
 * back to the characters they stand for.
 */
export function snippetSegments(
  snippet: string | null | undefined,
): SnippetSegment[] {
  if (!snippet) return [];

  /* Markdown comes off first, while the string is still whole. Emphasis wraps
     *around* a match — the API sends `**<mark>Auth</mark>entication:**` — so
     the opening and closing `**` land in different segments once the string is
     split, and neither can be paired with the other. Stripping per segment
     leaves both behind. This pass leaves tags alone. */
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

  /* A snippet of nothing but spaces is nothing to show. Without this it
     renders as a one-space paragraph — an empty grey line, which rule 2 is
     specifically about not doing. */
  return kept.some((segment) => segment.text.trim().length > 0) ? kept : [];
}

/** The same snippet with the highlighting dropped, for titles and `alt`. */
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

/**
 * Markdown syntax removed, markup left untouched.
 *
 * Bodies are stored as Markdown, so a snippet cut from one arrives with `**`,
 * `#` and list bullets still in it. Runs over the whole snippet before it is
 * split, because emphasis can open on one side of a `<mark>` and close on the
 * other.
 */
function stripMarkdown(raw: string): string {
  return raw
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|$)/g, "$1$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/`{1,3}/g, "");
}

/**
 * One segment as text.
 *
 * Any tag other than the `<mark>` already consumed is dropped rather than
 * shown — a stray one is markup we were not promised, and printing it raw
 * would put `<div>` in the middle of a sentence. Nothing here is ever injected
 * as HTML, so this is tidying, not sanitising: the safety comes from returning
 * text that React escapes.
 */
function plainText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? "")
    .replace(/\s+/g, " ");
}
