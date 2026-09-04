"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronRight,
  CircleDot,
  Code2,
  Eye,
  Globe,
  HelpCircle,
  Lightbulb,
  MoreVertical,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
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

function getSeverityBadgeStyle(severity?: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    case "HIGH":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "MEDIUM":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "LOW":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    default:
      return "bg-muted text-foreground/80 border-border";
  }
}

function getDraftHref(item: SavedDraftItem) {
  if (item.category === "problem") {
    return `/community/create/problem?draftId=${encodeURIComponent(item.id)}`;
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

function DeleteDraftDialog({
  isOpen,
  onClose,
  itemTitle,
  itemId,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemId: string;
  onConfirm?: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-draft-${itemId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              id={`delete-draft-${itemId}`}
              className="text-lg font-semibold text-foreground"
            >
              Delete draft?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Remove <span className="font-medium text-foreground">{itemTitle}</span> from your saved drafts. This action cannot be undone.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 rounded-xl bg-card px-4 text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onConfirm?.(itemId);
                  onClose();
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
  );
}

export function SavedDraftCard({ item, onDelete }: SavedDraftCardProps) {
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
  const href = lp(getDraftHref(item));

  const logoSrc = !imageError && item.logoSrc ? item.logoSrc : null;

  const isSecurity =
    item.category === "report" ||
    item.category === "program" ||
    item.category === "response";

  if (isSecurity) {
    const isReport = item.category === "report";

    return (
      <>
        <div className="group relative flex h-full flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 ease-out hover:shadow-md hover:ring-foreground/10 dark:hover:ring-foreground/20">
          
          <div className="absolute top-4 right-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Draft actions for ${item.title}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all outline-none cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-52 rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-1 shadow-lg z-30"
              >
                <DropdownMenuItem
                  onClick={() => router.push(href)}
                  className="rounded-[10px] px-3 py-2 text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Continue editing
                </DropdownMenuItem>
                {!isReport && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        lp(
                          `/dashboard/programs/${encodeURIComponent(item.id)}?from=saved-draft`,
                        ),
                      )
                    }
                    className="rounded-[10px] px-3 py-2 text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View in card
                  </DropdownMenuItem>
                )}
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
            <div>
              <div className="flex items-start gap-3.5 pr-8">
                <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5 dark:ring-foreground/10 flex items-center justify-center shadow-xs">
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={item.logoAlt || item.title}
                      className="size-full object-cover"
                      width={40}
                      height={40}
                      onError={() => setImageError(true)}
                      unoptimized
                    />
                  ) : isReport ? (
                    <ShieldAlert className="size-5 text-rose-500" />
                  ) : (
                    <Building2 className="size-5 text-purple-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link href={href} className="group/title block">
                    <h4
                      className="font-bold text-base leading-snug text-foreground group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 line-clamp-1 transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                  </Link>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isReport
                          ? "bg-rose-50 text-rose-600 border-rose-100/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20"
                          : "bg-purple-50 text-purple-600 border-purple-100/80 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
                      }`}
                    >
                      {isReport ? "Report draft" : "Program draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                      Draft
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[13px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {item.description || "No write-up yet. Pick this up where you left off."}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {isReport ? (
                  <Shield className="size-3.5 text-rose-500/80" />
                ) : (
                  <Briefcase className="size-3.5 text-purple-500/80" />
                )}
                <span>In-Scope Assets</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                {item.tags && item.tags.length > 0 ? (
                  <>
                    {item.tags.map((tag, index) => {
                      const isSev = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(
                        tag.toUpperCase(),
                      );
                      return (
                        <span
                          key={tag || index}
                          className={
                            isSev
                              ? `text-xs font-bold px-2.5 py-0.5 rounded-md border ${getSeverityBadgeStyle(
                                  tag,
                                )}`
                              : "bg-muted text-foreground/80 text-xs font-mono font-medium px-2.5 py-1 rounded-lg ring-1 ring-foreground/5 dark:ring-foreground/10 max-w-[180px] truncate"
                          }
                          title={tag}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </>
                ) : (
                  <span className="text-[13px] text-muted-foreground/70 italic">
                    No assets listed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between shrink-0">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status</p>
              <p className="text-[13px] font-semibold text-foreground">
                Updated {item.updatedAt}
              </p>
            </div>

            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 rounded-xl shadow-xs transition-all duration-200"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <DeleteDraftDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          itemTitle={item.title}
          itemId={item.id}
          onConfirm={onDelete}
        />
      </>
    );
  }

  const isShowcase = item.category === "showcase";
  const isProblem = item.category === "problem";
  const isSolution = item.category === "solution";

  const communityConfig = isShowcase
    ? {
        label: "Showcase draft",
        badgeStyle:
          "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
        icon: Sparkles,
        iconColor: "text-blue-500",
        titleColor: "text-blue-600 dark:text-blue-400 hover:underline",
        tagsLabel: "Tech Stack",
        tagsIcon: Code2,
        emptyTags: "No tech stack added yet",
      }
    : isProblem
      ? {
          label: "Problem draft",
          badgeStyle:
            "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
          icon: CircleDot,
          iconColor: "text-amber-500",
          titleColor: "text-blue-600 dark:text-blue-400 hover:underline",
          tagsLabel: "Tags",
          tagsIcon: HelpCircle,
          emptyTags: "No tags selected",
        }
      : {
          label: "Solution draft",
          badgeStyle:
            "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
          icon: Lightbulb,
          iconColor: "text-emerald-500",
          titleColor: "text-blue-600 dark:text-blue-400 hover:underline",
          tagsLabel: "Technologies",
          tagsIcon: Code2,
          emptyTags: "No technologies tagged",
        };

  const CategoryIcon = communityConfig.icon;
  const TagsIcon = communityConfig.tagsIcon;

  return (
    <>
      <div className="group relative flex h-full flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-200 ease-out hover:shadow-md hover:ring-foreground/10 dark:hover:ring-foreground/20">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${communityConfig.badgeStyle}`}
              >
                <CategoryIcon className={`size-3 ${communityConfig.iconColor}`} />
                <span>{communityConfig.label}</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                Draft
              </span>
              {isProblem && item.categoryName && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                  {item.categoryName}
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Draft actions for ${item.title}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all outline-none cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-52 rounded-xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-1 shadow-lg z-30"
              >
                <DropdownMenuItem
                  onClick={() => router.push(href)}
                  className="rounded-[10px] px-3 py-2 text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Continue editing
                </DropdownMenuItem>
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

          <div className="space-y-1.5 mt-3">
            <Link href={href} className="group/title block">
              <h4
                className={`font-bold text-base sm:text-lg leading-snug ${communityConfig.titleColor} line-clamp-1 transition-colors`}
                title={item.title}
              >
                {item.title}
              </h4>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description || "No write-up provided yet. Pick this up where you left off."}
            </p>
          </div>

          {isShowcase && logoSrc && (
            <div className="relative mt-3.5 w-full max-h-[300px] overflow-hidden rounded-xl bg-slate-950/80 dark:bg-neutral-950/90 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt=""
                fill
                aria-hidden="true"
                sizes="100px"
                quality={30}
                className="object-cover blur-2xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
              />
              <div className="relative z-10 w-full h-[180px] sm:h-[200px] flex items-center justify-center">
                <Image
                  src={logoSrc}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={90}
                  className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>

              {(item.repoUrl || item.liveUrl) && (
                <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 pointer-events-none">
                  {item.repoUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 backdrop-blur-md text-foreground ring-1 ring-foreground/10 shadow-xs">
                      <SiGithub className="size-3" />
                      <span>Repo</span>
                    </span>
                  )}
                  {item.liveUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 backdrop-blur-md text-foreground ring-1 ring-foreground/10 shadow-xs">
                      <Globe className="size-3 text-emerald-500" />
                      <span>Live</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 pt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              <TagsIcon className={`size-3.5 ${communityConfig.iconColor}`} />
              <span>{communityConfig.tagsLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
              {item.tags && item.tags.length > 0 ? (
                <>
                  {item.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={tag || index}
                      className="bg-muted text-foreground/85 text-xs font-mono font-medium px-2.5 py-1 rounded-lg ring-1 ring-foreground/5 dark:ring-foreground/10 max-w-[160px] truncate transition-colors"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 4 && (
                    <span className="bg-muted/70 text-muted-foreground text-xs font-semibold px-2 py-1 rounded-md ring-1 ring-foreground/5 dark:ring-foreground/10">
                      +{item.tags.length - 4} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground/70 italic">
                  {communityConfig.emptyTags}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <p className="text-[13px] font-semibold text-foreground">
              Updated {item.updatedAt}
            </p>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 rounded-xl shadow-xs transition-all duration-200"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <DeleteDraftDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        itemTitle={item.title}
        itemId={item.id}
        onConfirm={onDelete}
      />
    </>
  );
}
