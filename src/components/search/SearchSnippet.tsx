import { snippetSegments } from "@/lib/search/presentation";
import { cn } from "@/lib/utils";

type SearchSnippetProps = {
  snippet: string | null | undefined;
  className?: string;
};

/**
 * The matching stretch of a document, with the matched words picked out.
 *
 * The API's `snippet` is the only field carrying markup, and it is rendered by
 * *parsing* rather than by injecting: `snippetSegments` returns the text as
 * data and React escapes it, so there is no path from an indexed document to
 * live markup on the page. No `dangerouslySetInnerHTML`, and so nothing to
 * sanitize.
 *
 * Renders nothing at all when there is no snippet — it is null for most
 * organizations and users, whose indexed body is empty, and an empty grey bar
 * in its place would look like something failed to load.
 */
export function SearchSnippet({ snippet, className }: SearchSnippetProps) {
  const segments = snippetSegments(snippet);
  if (segments.length === 0) return null;

  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {segments.map((segment, index) =>
        segment.marked ? (
          <mark
            key={index}
            className="rounded-sm bg-amber-500/25 px-0.5 font-semibold text-foreground"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}
