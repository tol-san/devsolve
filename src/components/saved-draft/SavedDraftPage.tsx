"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Clock3, FileText, RotateCcw } from "lucide-react";

import { SavedDraftCard } from "@/components/saved-draft/SavedDraftCard";
import { SavedDraftHeader, type DraftSort } from "@/components/saved-draft/SavedDraftHeader";
import { Button } from "@/components/ui/button";
import type { DraftCategory, SavedDraftItem } from "@/components/saved-draft/types";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import {
  useGetMyCompanyProgramsQuery,
  useDeleteProgramMutation,
  useGetProgramsQuery,
} from "@/lib/redux/services/program/programsApi";
import {
  useDeleteReportDraftMutation,
  useGetReportDraftsQuery,
} from "@/lib/redux/services/reportDraftsApi";
import {
  useDeleteProblemMutation,
  useGetMyProblemsQuery,
} from "@/lib/redux/services/problemsApi";
import {
  useDeleteShowcaseDraftMutation,
  useGetShowcaseDraftsQuery,
} from "@/lib/redux/services/showcaseDraftsApi";
import {
  useDeleteSolutionDraftMutation,
  useGetSolutionDraftsQuery,
} from "@/lib/redux/services/solutionDraftsApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import { toDate } from "@/lib/format/datetime";
import { describe } from "@/lib/seo/text";
import { isEditableDraft, isUnderReview } from "@/lib/programs/draft-status";
import { toast } from "sonner";

function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

function getUpdatedRank(item: SavedDraftItem) {
  if (item.updatedAtIso) {
    const parsed = toDate(item.updatedAtIso);
    if (parsed) return (Date.now() - parsed.getTime()) / 86_400_000;
  }

  const updatedAt = item.updatedAt;
  if (updatedAt === "Today" || updatedAt === "Recently") return 0;
  if (updatedAt === "Yesterday") return 1;

  const hourMatch = updatedAt.match(/(\d+)\s+hour/);
  if (hourMatch) {
    return Number(hourMatch[1]) / 24;
  }

  const dayMatch = updatedAt.match(/(\d+)\s+day/);
  if (dayMatch) {
    return Number(dayMatch[1]);
  }

  return 30;
}

export function SavedDraftPage() {
  const { user } = useSidebarAuth();
  const userRoles = (
    user?.roles ??
    (user?.role ? user.role.split(",") : ["USER"])
  ).map((r) => r.trim().toUpperCase());

  const { hasCompanyAccess: isCompany, can, membership } = useCompanyAccess();
  const isUser = userRoles.includes("USER");

  const ALL_TABS: DraftCategory[] = [
    "all",
    "problem",
    "showcase",
    "solution",
    "report",
    "program",
    "response",
  ];
  const visibleTabs: DraftCategory[] = ALL_TABS.filter((tab) => {
    if (
      (tab === "problem" || tab === "showcase" || tab === "solution") &&
      !isUser
    )
      return false;
    if (
      (tab === "program" || tab === "response") &&
      isUser &&
      !isCompany
    )
      return false;
    if (tab === "report" && isCompany && !isUser) return false;
    return true;
  });

  const [activeTab, setActiveTab] = useState<DraftCategory>(visibleTabs[0] ?? "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<DraftSort>("recent");

  const companyOrg = useMemo(
    () =>
      membership ? { logoUrl: membership.organizationLogoUrl ?? "" } : undefined,
    [membership],
  );

  const { data: companyProgramsData, isLoading: isCompanyProgramsLoading } =
    useGetMyCompanyProgramsQuery(
      { size: 100 },
      { skip: !isCompany, refetchOnMountOrArgChange: true },
    );

  const { data: myProblemsData, isLoading: isProblemsLoading } =
    useGetMyProblemsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  const { data: showcaseDrafts, isLoading: isShowcaseDraftsLoading } =
    useGetShowcaseDraftsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  const { data: solutionDrafts, isLoading: isSolutionDraftsLoading } =
    useGetSolutionDraftsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  const { data: reportDrafts, isLoading: isReportDraftsLoading } =
    useGetReportDraftsQuery(
      {},
      {
        skip: !isUser,
        refetchOnMountOrArgChange: true,
      },
    );

  const { data: programsData } = useGetProgramsQuery(
    { size: 100 },
    { skip: !isUser },
  );

  const isLoading =
    isCompanyProgramsLoading ||
    isReportDraftsLoading ||
    isProblemsLoading ||
    isShowcaseDraftsLoading ||
    isSolutionDraftsLoading;

  const [deleteProgram] = useDeleteProgramMutation();
  const [deleteReportDraft] = useDeleteReportDraftMutation();
  const [deleteProblem] = useDeleteProblemMutation();
  const [deleteShowcaseDraft] = useDeleteShowcaseDraftMutation();
  const [deleteSolutionDraft] = useDeleteSolutionDraftMutation();

  const programsById = useMemo(() => {
    const byId = new Map<string, { name: string; logoUrl: string }>();
    (programsData?.content ?? []).forEach((program) => {
      byId.set(program.id, {
        name: program.name,
        logoUrl: program.organization?.logoUrl || program.logoUrl || "",
      });
    });
    return byId;
  }, [programsData]);

  const draftItems = useMemo<SavedDraftItem[]>(() => {
    const items: SavedDraftItem[] = [];

    if (companyProgramsData?.content) {
      companyProgramsData.content
        .filter(isEditableDraft)
        .forEach((p) => {
          const isResponse = p.engagementType === "RESPONSE";
          const inScopeTags = p.assets
            ? p.assets
                .filter((a) => a.isInScope === true)
                .map((a) => a.identifier || "")
                .filter(Boolean)
            : p.inScopeAssets
                ?.map((a: { identifier?: string; target?: string }) => a.identifier || a.target || "")
                .filter(Boolean) ?? [];

          const realLogo = companyOrg?.logoUrl || "";

          items.push({
            id: p.id,
            title: p.name || "Untitled Program Draft",
            description: p.description || "No description provided for this draft.",
            category: isResponse ? "response" : "program",
            programDraftKind: isResponse ? "response" : "bounty",
            updatedAt: p.updatedAt
              ? new Date(p.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently",
            updatedAtIso: p.updatedAt,
            tags: inScopeTags,
            initials: (p.name || "PR").slice(0, 2).toUpperCase(),
            logoSrc: realLogo,
            logoAlt: p.name || "Program Logo",
          });
        });
    }

    (reportDrafts ?? []).forEach((draft) => {
      const program = draft.programId
        ? programsById.get(draft.programId)
        : undefined;
      const title = draft.title?.trim() || "Untitled report draft";

      items.push({
        id: draft.id,
        title,
        description: describe(
          draft.vulnerabilityInformation,
          "No write-up yet. Pick this up where you left off.",
          160,
        ),
        category: "report",
        updatedAt: draft.updatedAt
          ? new Date(draft.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        updatedAtIso: draft.updatedAt,
        tags: [
          program?.name,
          draft.reportedSeverity && draft.reportedSeverity !== "NONE"
            ? draft.reportedSeverity
            : null,
        ].filter((tag): tag is string => Boolean(tag)),
        initials: title.slice(0, 2).toUpperCase(),
        logoSrc: program?.logoUrl ?? "",
        logoAlt: program?.name || "Program logo",
        severity:
          draft.reportedSeverity && draft.reportedSeverity !== "NONE"
            ? draft.reportedSeverity
            : undefined,
        organizationName: program?.name,
      });
    });

    (myProblemsData?.content ?? [])
      .filter((p): p is typeof p & { id: string } => p.status === "DRAFT" && Boolean(p.id))
      .forEach((problem) => {
        const title = problem.title?.trim() || "Untitled problem draft";
        items.push({
          id: problem.id ?? "",
          title,
          description: describe(
            problem.description,
            "No description yet. Pick this up where you left off.",
            160,
          ),
          category: "problem",
          updatedAt: problem.updatedAt
            ? new Date(problem.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently",
          updatedAtIso: problem.updatedAt,
          tags: [
            problem.category?.name,
            problem.problemType,
            ...(problem.tags ?? []).map((t) => t.name).filter(Boolean),
          ].filter((tag): tag is string => Boolean(tag)),
          initials: title.slice(0, 2).toUpperCase(),
          logoSrc: "",
          logoAlt: title,
          categoryName: problem.category?.name,
          problemType: problem.problemType,
        });
      });

    (showcaseDrafts ?? []).forEach((draft) => {
      const title = draft.title?.trim() || "Untitled showcase draft";
      items.push({
        id: draft.id,
        title,
        description: describe(
          draft.overview,
          "No overview provided yet. Pick this up where you left off.",
          160,
        ),
        category: "showcase",
        updatedAt: draft.updatedAt
          ? new Date(draft.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        updatedAtIso: draft.updatedAt,
        tags: (draft.tags ?? []).filter(Boolean),
        initials: title.slice(0, 2).toUpperCase(),
        logoSrc: draft.coverImageUrl || "",
        logoAlt: title,
        repoUrl: draft.repoUrl || undefined,
        liveUrl: draft.liveUrl || undefined,
        categoryName: "Showcase",
      });
    });

    (solutionDrafts ?? []).forEach((draft) => {
      const body = excerptOf(draft.bodyMarkdown ?? "", 160);
      const title =
        draft.summary?.trim() ||
        (draft.bodyMarkdown ? firstLine(draft.bodyMarkdown) : "") ||
        "Untitled solution draft";
      const techTags = (draft.testedWith ?? [])
        .map((t) => t.technology)
        .filter((t): t is string => Boolean(t));
      const tags = [
        ...(draft.approachType ? [draft.approachType] : []),
        ...techTags,
      ];

      items.push({
        id: draft.id,
        problemId: draft.problemId,
        title,
        description:
          body || "No solution write-up yet. Pick this up where you left off.",
        category: "solution",
        updatedAt: draft.updatedAt
          ? new Date(draft.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        updatedAtIso: draft.updatedAt,
        tags,
        initials: title.slice(0, 2).toUpperCase(),
        logoSrc: "",
        logoAlt: title,
        approachType: draft.approachType || undefined,
      });
    });

    return items;
  }, [
    companyProgramsData,
    companyOrg,
    reportDrafts,
    programsById,
    myProblemsData,
    showcaseDrafts,
    solutionDrafts,
  ]);

  const underReviewCount = useMemo(
    () => (companyProgramsData?.content ?? []).filter(isUnderReview).length,
    [companyProgramsData],
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] ?? "all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompany, isUser]);

  const counts = useMemo(() => {
    return {
      all: draftItems.length,
      problem: draftItems.filter((item) => item.category === "problem").length,
      showcase: draftItems.filter((item) => item.category === "showcase").length,
      solution: draftItems.filter((item) => item.category === "solution").length,
      program: draftItems.filter(
        (item) => item.category === "program" || item.programDraftKind === "bounty"
      ).length,
      response: draftItems.filter(
        (item) => item.category === "response" || item.programDraftKind === "response"
      ).length,
      report: draftItems.filter((item) => item.category === "report").length,
    };
  }, [draftItems]);

  const isFilterActive =
    searchTerm.trim() !== "" ||
    activeTab !== "all" ||
    sortBy !== "recent";

  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setSortBy("recent");
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return draftItems
      .filter((item) => {
        if (activeTab === "all") return true;
        if (activeTab === "problem") return item.category === "problem";
        if (activeTab === "showcase") return item.category === "showcase";
        if (activeTab === "solution") return item.category === "solution";
        if (activeTab === "program")
          return item.category === "program" || item.programDraftKind === "bounty";
        if (activeTab === "response")
          return item.category === "response" || item.programDraftKind === "response";
        if (activeTab === "report") return item.category === "report";
        return true;
      })
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return [item.title, item.description, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }

        const diff = getUpdatedRank(a) - getUpdatedRank(b);
        return sortBy === "recent" ? diff : -diff;
      });
  }, [activeTab, draftItems, searchTerm, sortBy]);

  const groupedDrafts = useMemo(() => {
    const categoryOrder: { category: SavedDraftItem["category"]; title: string }[] = [
      { category: "program", title: "Programs" },
      { category: "problem", title: "Problems" },
      { category: "solution", title: "Solutions" },
      { category: "showcase", title: "Showcases" },
      { category: "report", title: "Reports" },
      { category: "response", title: "Responses" },
    ];

    return categoryOrder
      .map(({ category, title }) => ({
        category,
        title,
        items: filteredItems.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems]);

  const handleDeleteItem = async (itemId: string) => {
    const item = draftItems.find((draft) => draft.id === itemId);

    if (
      (item?.category === "program" || item?.category === "response") &&
      !can("DELETE_PROGRAM")
    ) {
      toast.error("Deleting a program needs the delete permission");
      return;
    }

    try {
      if (item?.category === "problem") {
        await deleteProblem(itemId).unwrap();
      } else if (item?.category === "showcase") {
        await deleteShowcaseDraft(itemId).unwrap();
      } else if (item?.category === "solution") {
        await deleteSolutionDraft(itemId).unwrap();
      } else if (item?.category === "report") {
        await deleteReportDraft(itemId).unwrap();
      } else {
        await deleteProgram(itemId).unwrap();
      }
      toast.success("Draft deleted successfully");
    } catch {
      toast.error("Failed to delete draft");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <SavedDraftHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isFilterActive={isFilterActive}
        onResetFilters={handleResetFilters}
        counts={counts}
        totalSavedCount={draftItems.length}
        visibleCount={filteredItems.length}
        visibleTabs={visibleTabs}
      />

      {!isLoading && underReviewCount > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 dark:ring-foreground/10 sm:items-center">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Clock3 className="size-4.5" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            {underReviewCount === 1
              ? "1 program is awaiting review and is not listed here."
              : `${underReviewCount} programs are awaiting review and are not listed here.`}{" "}
            <Link
              href="/dashboard/program-management"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Open program management
            </Link>{" "}
            to track them.
          </p>
        </div>
      ) : null}

      <main className="pt-2">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex h-64 animate-pulse flex-col justify-between rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded-lg w-24" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                  <div className="h-6 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
                <div className="h-9 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-12 text-center shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FileText className="size-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                No drafts found
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {isFilterActive
                  ? "No saved drafts match your current filter or search criteria. Try clearing filters or changing search keywords."
                  : "You haven't created any drafts in this section yet. Start creating content and your drafts will be saved here automatically."}
              </p>
            </div>
            {isFilterActive && (
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="rounded-xl font-semibold"
              >
                <RotateCcw data-icon="inline-start" />
                Reset Filters
              </Button>
            )}
          </motion.div>
        ) : activeTab === "all" ? (
          <div className="space-y-10">
            {groupedDrafts.map((group) => (
              <section key={group.category} className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
                  <h2 className="text-lg font-bold text-foreground">
                    {group.title}
                  </h2>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {group.items.length}
                  </span>
                </div>

                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {group.items.map((item) => (
                      <SavedDraftCard
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <SavedDraftCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
