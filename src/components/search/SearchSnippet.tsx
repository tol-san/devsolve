import { snippetSegments } from "@/lib/search/presentation";
import { cn } from "@/lib/utils";

type SearchSnippetProps = {
  snippet: string | null | undefined;
  className?: string;
};

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
