import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

interface ProblemsOverviewProps {
  title: string;
  description: string;
  browseLabel: string;
  discussionsHref: string;
}

/**
 * Durable page content for the public problem directory.
 *
 * The actual feed remains interactive and loads through RTK Query, but this
 * explanation is present in the first HTML response even when the public API
 * is slow or currently has no rows. That makes an empty listing useful rather
 * than a 200 response containing only loading placeholders.
 */
export function ProblemsOverview({
  title,
  description,
  browseLabel,
  discussionsHref,
}: ProblemsOverviewProps) {
  return (
    <section
      aria-labelledby="problems-overview-title"
      className="rounded-2xl border border-border bg-card p-5 ring-1 ring-foreground/5 sm:p-6 dark:ring-foreground/10"
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2
            id="problems-overview-title"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-4xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
          <Link
            href={discussionsHref}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {browseLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
