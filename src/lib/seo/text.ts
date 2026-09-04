
export const DESCRIPTION_LIMIT = 160;

export function plainText(source: string | null | undefined): string {
  if (!source) return "";

  return (
    source
      // Fenced and indented code blocks.
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/~~~[\s\S]*?~~~/g, " ")
      // Images before links: `![alt](src)` would otherwise leave a stray `!`.
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Reference-style links and bare autolinks.
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
      .replace(/<https?:\/\/[^>]+>/g, " ")
      // Inline HTML, which Markdown allows.
      .replace(/<[^>]+>/g, " ")
      // Inline code.
      .replace(/`+/g, "")
      /* Emphasis is unwrapped in pairs rather than by deleting every `*` and
         `_` in the text. Underscores carry meaning of their own here —
         stripping them blindly turned `invalid_grant` into `invalidgrant` —
         so the underscore forms only match when the run is delimited by
         something other than a word character, which is what makes it
         emphasis rather than part of an identifier. */
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*\n]+)\*/g, "$1")
      .replace(/~~([^~]+)~~/g, "$1")
      .replace(/(^|[^\w])__([^_\n]+)__(?!\w)/g, "$1$2")
      .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, "$1$2")
      // Line-level markers: headings, quotes, list bullets, table pipes, rules.
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}>\s?/gm, "")
      .replace(/^\s{0,3}([-*+]|\d+[.)])\s+/gm, "")
      .replace(/^\s{0,3}([-*_]\s*){3,}$/gm, " ")
      .replace(/\|/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function truncate(value: string, limit: number): string {
  if (value.length <= limit) return value;

  const clipped = value.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const stem = lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped;

  return `${stem.replace(/[\s,;:.!?-]+$/, "")}…`;
}

export function describe(
  source: string | null | undefined,
  fallback: string,
  limit: number = DESCRIPTION_LIMIT,
): string {
  const text = plainText(source);
  return text ? truncate(text, limit) : truncate(fallback, limit);
}

export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "";
  const words = value.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
