"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Trash2,
  Eye,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { SavedDraftItem } from "@/components/saved-draft/types";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedDraftCardProps {
  item: SavedDraftItem;
  onDelete?: (itemId: string) => void;
}



function getDraftMeta(item: SavedDraftItem) {
  if (item.category === "problem") {
    return { label: "Problem draft" };
  }
  if (item.category === "showcase") {
    return { label: "Showcase draft" };
  }
  if (item.category === "solution") {
    return { label: "Solution draft" };
  }
  if (item.category === "report") {
    return { label: "Report draft" };
  }
  if (item.category === "response" || item.programDraftKind === "response") {
    return { label: "Response draft" };
  }
  return { label: "Program draft" };
}

function getDraftHref(item: SavedDraftItem) {
  if (item.category === "problem") {
    return `/community/${encodeURIComponent(item.id)}/edit`;
  }
  if (item.category === "showcase") {
    return `/community/create/showcase?draftId=${encodeURIComponent(item.id)}`;
  }
  if (item.category === "solution") {
    return item.problemId
      ? `/community/${encodeURIComponent(item.problemId)}/solutions/create?draftId=${encodeURIComponent(item.id)}`
      : `/community`;
  }
  if (item.category === "report") {
    return `/dashboard/submit-report?id=${encodeURIComponent(item.id)}`;
  }
  return `/dashboard/create-program?id=${encodeURIComponent(item.id)}`;
}

export function SavedDraftCard({ item, onDelete }: SavedDraftCardProps) {
  /* A problem, showcase, solution, or report draft is the user's own and always theirs to discard. A
     program draft belongs to the organization and takes DELETE_PROGRAM, so
     without it there is nothing here to press. */
  const { can } = useCompanyAccess();
  const canDelete =
    item.category === "problem" ||
    item.category === "showcase" ||
    item.category === "solution" ||
    item.category === "report" ||
    can("DELETE_PROGRAM");
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const lp = useLocalePath();
  const meta = getDraftMeta(item);
  /* Locale-prefixed: a bare path leaves the reader's language behind on the
     redirect, so opening a draft from the Khmer list landed in English. */
  const href = lp(getDraftHref(item));

  const logoSrc = !imageError ? item.logoSrc : null;
  const initials = (item.title || "Draft")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "DF";

  return (
    <>
      <div className="group relative flex h-full flex-col justify-between rounded-2xl bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:ring-blue-500/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40">
        
        {/* DROPDOWN ACTIONS MENU (Top Right) */}
        <div className="absolute top-5 right-5 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Draft actions for ${item.title}`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-2 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50/80 active:scale-95 transition-all duration-200 outline-none dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
            >
              <MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-52 rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-1 shadow-lg z-30"
            >
              <DropdownMenuItem
                onClick={() => router.push(href)}
                className="rounded-[10px] px-3 py-2 text-foreground focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Continue editing
              </DropdownMenuItem>
              {item.category === "program" || item.category === "response" ? (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      lp(
                        `/dashboard/programs/${encodeURIComponent(item.id)}?from=saved-draft`,
                      ),
                    )
                  }
                  className="rounded-[10px] px-3 py-2 text-foreground focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in card
                </DropdownMenuItem>
              ) : null}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="rounded-[10px] px-3 py-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete draft
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col flex-1 justify-between space-y-4">
          {/* HEADER: LOGO, TITLE & BADGES */}
          <div>
            <div className="flex items-start gap-3.5 pr-8">
              <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5 shadow-sm transition-all duration-300 group-hover:scale-105 dark:ring-foreground/10 flex items-center justify-center">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={item.logoAlt || item.title}
                    className="size-full object-cover"
                    width={44}
                    height={44}
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-extrabold text-foreground tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[17px] leading-snug text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors" title={item.title}>
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-colors bg-blue-50 text-blue-600 border-blue-100/80 group-hover:border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                    Draft
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="mt-3 text-[13px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {item.description || "No description provided for this draft."}
            </p>
          </div>

          {/* IN-SCOPE ASSETS / TAGS SECTION */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              In-Scope Assets
            </p>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
              {item.tags && item.tags.length > 0 ? (
                <>
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={tag || index}
                      className="bg-muted text-foreground/80 text-xs font-mono font-medium px-2.5 py-1 rounded-lg ring-1 ring-foreground/5 dark:ring-foreground/10 max-w-[180px] truncate transition-colors"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}

                  {item.tags.length > 2 && (
                    <span className="bg-muted/70 text-muted-foreground text-xs font-semibold px-2 py-1 rounded-md ring-1 ring-foreground/5 dark:ring-foreground/10">
                      +{item.tags.length - 2} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[13px] text-muted-foreground/70 italic">No assets listed</span>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER: UPDATED DATE & CONTINUE BUTTON */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <p className="text-[13px] font-semibold text-foreground">
              Updated {item.updatedAt}
            </p>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted ring-1 ring-foreground/5 dark:ring-foreground/10 px-4 py-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`delete-draft-${item.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              <h3
                id={`delete-draft-${item.id}`}
                className="text-lg font-semibold text-foreground"
              >
                Delete draft?
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Remove <span className="font-medium text-foreground">{item.title}</span> from your saved drafts. This action cannot be undone.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="h-10 rounded-xl bg-card px-4 text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDelete?.(item.id);
                    setShowDeleteDialog(false);
                  }}
                  className="h-10 rounded-xl px-4"
                >
                  Delete draft
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}