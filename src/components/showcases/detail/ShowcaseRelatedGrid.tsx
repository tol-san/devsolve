"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Sparkles, User } from "lucide-react";
import type { ShowcaseRelatedItem } from "@/lib/redux/services/showcasesApi";
import { cn } from "@/lib/utils";

interface ShowcaseRelatedGridProps {
  related?: ShowcaseRelatedItem[];
}

export function ShowcaseRelatedGrid({
  related = [],
}: ShowcaseRelatedGridProps) {
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <section id="related-showcases" className="space-y-5 pt-8 border-t border-border/80 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            More Like This
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Similar builds and security projects from the community
          </p>
        </div>

        <Link
          href="/showcases"
          className="text-xs sm:text-sm font-semibold text-primary hover:underline"
        >
          Explore all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/showcases/${item.id}`}
            className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-md transition-all active:scale-99"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40">
              {item.coverImageUrl ? (
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-card to-primary/5">
                  <Sparkles className="size-8 text-primary/40" />
                </div>
              )}

              {item.categoryName && (
                <span className="absolute left-2.5 top-2.5 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-bold text-foreground shadow-2xs backdrop-blur-xs">
                  {item.categoryName}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col justify-between flex-1 gap-3">
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                <span className="flex items-center gap-1.5 truncate">
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {item.authorName || "Anonymous"}
                  </span>
                </span>

                <span className="flex items-center gap-1 tabular-nums shrink-0">
                  <Eye className="size-3.5" />
                  <span>{item.viewCount}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
