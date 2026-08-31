"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronUp, Eye, MessageSquare } from "lucide-react";
import { CommunityPost } from "@/lib/types/profile/types";

interface CommunityPostCardProps {
  post: CommunityPost;
}

const TAG_STYLES: Record<CommunityPost["tag"], string> = {
  Problem: "border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  Solutions: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Showcase: "border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const TAG_LABELS: Record<CommunityPost["tag"], string> = {
  Problem: "Problem",
  Solutions: "Solution",
  Showcase: "Showcase",
};

const STATUS_STYLES: Record<"positive" | "pending", string> = {
  positive: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const body = (
    <div className="flex items-start gap-4">
      <div className="flex w-8 shrink-0 flex-col items-center gap-0.5 pt-1 text-primary">
        <ChevronUp size={18} />
        <span className="text-sm font-bold tabular-nums">{post.votes}</span>
      </div>

      {post.thumbnailUrl && (
        <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:block">
          <Image
            src={post.thumbnailUrl}
            alt=""
            fill
            quality={90}
            sizes="128px"
            className="object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
          <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors order-2 sm:order-1">
            {post.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-start shrink-0 order-1 sm:order-2">
            <span
              className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${TAG_STYLES[post.tag]}`}
            >
              {TAG_LABELS[post.tag]}
            </span>
            {post.status && (
              <span
                className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[post.status.tone]}`}
              >
                {post.status.label}
              </span>
            )}
          </div>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          {post.answers !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={14} />
              {post.answers} {post.answers === 1 ? "answer" : "answers"}
            </span>
          )}
          {post.views !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Eye size={14} />
              {post.views.toLocaleString()}
            </span>
          )}
          <span className="ml-auto">{formatDate(post.date)}</span>
        </div>
      </div>
    </div>
  );

  const surface =
    "block rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:border-border/80 hover:shadow-xs";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      {post.href ? (
        <Link href={post.href} className={surface}>
          {body}
        </Link>
      ) : (
        <div className={surface}>{body}</div>
      )}
    </motion.div>
  );
}
