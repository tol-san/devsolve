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
  const initials =
    (item.title || "Draft")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "DF";

  const isSecurity =
    item.category === "report" ||
    item.category === "program" ||
    item.category === "response";

  /* ──────────────────────────────────────────────────────────────────────────
   * DESIGN 1: SECURITY BUG BOUNTY CARD (Reports & Programs)
   * ────────────────────────────────────────────────────────────────────────── */
  if (isSecurity) {
    const isReport = item.category === "report";
    const reportSeverity =
      item.severity ||
      item.tags.find((t) =>
        ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(t.toUpperCase()),
      );

    return (
      <>
        <div className="group relative flex h-full flex-col justify-between rounded-2xl bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:ring-rose-500/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40">
          
          {/* TOP RIGHT MENU */}
          <div className="absolute top-5 right-5 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Draft actions for ${item.title}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50/80 active:scale-95 transition-all duration-200 outline-none dark:hover:text-rose-400 dark:hover:bg-rose-500/10 cursor-pointer"
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
                  className="rounded-[10px] px-3 py-2 text-foreground focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 cursor-pointer"
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
                    className="rounded-[10px] px-3 py-2 text-foreground focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 cursor-pointer"
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
            {/* HEADER: AVATAR / LOGO, TITLE & BADGES */}
            <div>
              <div className="flex items-start gap-3.5 pr-8">
                <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5 dark:ring-foreground/10 flex items-center justify-center shadow-xs">
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
                  ) : isReport ? (
                    <ShieldAlert className="size-5 text-rose-500" />
                  ) : (
                    <Building2 className="size-5 text-purple-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link href={href} className="group/title block">
                    <h4
                      className="font-bold text-[17px] leading-snug text-foreground group-hover/title:text-rose-600 dark:group-hover/title:text-rose-400 line-clamp-1 transition-colors"
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

              {/* DESCRIPTION */}
              <p className="mt-3 text-[13px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {item.description || "No write-up yet. Pick this up where you left off."}
              </p>
            </div>

            {/* IN-SCOPE ASSETS */}
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

          {/* FOOTER */}
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

        {/* DELETE DIALOG */}
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

  /* ──────────────────────────────────────────────────────────────────────────
   * DESIGN 2: COMMUNITY DRAFT CARD (Showcases, Problems, Solutions)
   * ────────────────────────────────────────────────────────────────────────── */
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
        hoverBorder: "hover:ring-blue-500/40",
        titleHover: "group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400",
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
          hoverBorder: "hover:ring-amber-500/40",
          titleHover: "group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400",
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
          hoverBorder: "hover:ring-emerald-500/40",
          titleHover:
            "group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400",
          tagsLabel: "Technologies",
          tagsIcon: Code2,
          emptyTags: "No technologies tagged",
        };

  const CategoryIcon = communityConfig.icon;
  const TagsIcon = communityConfig.tagsIcon;

  return (
    <>
      <div
        className={`group relative flex h-full flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all duration-300 ease-out hover:-translate-y-1 ${communityConfig.hoverBorder} hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40`}
      >
        <div>
          {/* TOP BAR: BADGES & 3-DOT MENU */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${communityConfig.badgeStyle}`}
              >
                <CategoryIcon className={`size-3 ${communityConfig.iconColor}`} />
                <span>{communityConfig.label}</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                Draft
              </span>
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

          {/* TITLE & OVERVIEW */}
          <div className="space-y-1 mt-3">
            <Link href={href} className="group/title block">
              <h4
                className={`font-bold text-[17px] leading-snug text-foreground ${communityConfig.titleHover} line-clamp-1 transition-colors`}
                title={item.title}
              >
                {item.title}
              </h4>
            </Link>
            <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {item.description || "No overview provided yet. Pick this up where you left off."}
            </p>
          </div>

          {/* INSET PREVIEW CONTAINER (Framed Media for Showcases / Thematic Card for Problems & Solutions) */}
          <div className="relative mt-3 h-36 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/40 dark:bg-muted/20 flex items-center justify-center">
            {/* ── SHOWCASE PREVIEW ── */}
            {isShowcase && (
              <>
                {logoSrc ? (
                  <div className="relative size-full overflow-hidden bg-slate-950/80 dark:bg-neutral-950/90 flex items-center justify-center">
                    {/* Ambient Blurred Fill (prevents cropping portrait or landscape photos) */}
                    <Image
                      src={logoSrc}
                      alt=""
                      fill
                      aria-hidden="true"
                      sizes="80px"
                      quality={20}
                      className="object-cover blur-xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
                    />
                    <div className="relative z-10 size-full flex items-center justify-center p-2">
                      <Image
                        src={logoSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={90}
                        className="object-contain drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        onError={() => setImageError(true)}
                        unoptimized
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-purple-600/20 p-4">
                    <div
                      className="absolute inset-0 opacity-[0.14] dark:opacity-[0.22] pointer-events-none"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                      <div className="size-10 rounded-xl bg-card/85 dark:bg-card/75 ring-1 ring-foreground/10 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="size-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase">
                        Showcase Project
                      </span>
                    </div>
                  </div>
                )}

                {/* OVERLAID REPO & DEMO CHIPS */}
                {(item.repoUrl || item.liveUrl) && (
                  <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 pointer-events-none">
                    {item.repoUrl && (
                      <span
                        title={`Repository: ${item.repoUrl}`}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 backdrop-blur-md text-foreground ring-1 ring-foreground/10 shadow-xs"
                      >
                        <SiGithub className="size-3" />
                        <span>Repo</span>
                      </span>
                    )}
                    {item.liveUrl && (
                      <span
                        title={`Live Demo: ${item.liveUrl}`}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 backdrop-blur-md text-foreground ring-1 ring-foreground/10 shadow-xs"
                      >
                        <Globe className="size-3 text-emerald-500" />
                        <span>Live</span>
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── PROBLEM PREVIEW ── */}
            {isProblem && (
              <div className="relative size-full flex flex-col justify-between bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-600/15 dark:via-orange-600/10 dark:to-yellow-600/15 p-3.5">
                <div
                  className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <CircleDot className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {item.categoryName || "Community Problem"}
                    </span>
                  </div>
                  {item.problemType && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      {item.problemType}
                    </span>
                  )}
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground/90 font-mono">
                  <Code2 className="size-3.5 text-amber-500/70" />
                  <span>Discussion Question</span>
                </div>
              </div>
            )}

            {/* ── SOLUTION PREVIEW ── */}
            {isSolution && (
              <div className="relative size-full flex flex-col justify-between bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 dark:from-emerald-600/15 dark:via-teal-600/10 dark:to-green-600/15 p-3.5">
                <div
                  className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Lightbulb className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Proposed Solution
                    </span>
                  </div>
                  {item.approachType && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-background/90 dark:bg-card/90 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      {item.approachType.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground/90 font-mono">
                  <Code2 className="size-3.5 text-emerald-500/70" />
                  <span>Verified Approach</span>
                </div>
              </div>
            )}
          </div>

          {/* TAGS / TECH STACK SECTION */}
          <div className="space-y-1.5 pt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              <TagsIcon className={`size-3.5 ${communityConfig.iconColor}`} />
              <span>{communityConfig.tagsLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
              {item.tags && item.tags.length > 0 ? (
                <>
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={tag || index}
                      className="bg-muted text-foreground/85 text-xs font-mono font-medium px-2.5 py-1 rounded-lg ring-1 ring-foreground/5 dark:ring-foreground/10 max-w-[160px] truncate transition-colors group-hover:border-primary/20"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="bg-muted/70 text-muted-foreground text-xs font-semibold px-2 py-1 rounded-md ring-1 ring-foreground/5 dark:ring-foreground/10">
                      +{item.tags.length - 3} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[13px] text-muted-foreground/70 italic">
                  {communityConfig.emptyTags}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between shrink-0">
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
            <ArrowRight className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* DELETE DIALOG */}
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
