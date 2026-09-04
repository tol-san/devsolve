"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock3 } from "lucide-react";

import { SavedDraftEmptyState } from "@/components/saved-draft/SavedDraftEmptyState";
import { SavedDraftGrid } from "@/components/saved-draft/SavedDraftGrid";
import { SavedDraftHeader } from "@/components/saved-draft/SavedDraftHeader";
import { SavedDraftPagination } from "@/components/saved-draft/SavedDraftPagination";
import { SavedDraftSearch } from "@/components/saved-draft/SavedDraftSearch";
import { SavedDraftTabs } from "@/components/saved-draft/SavedDraftTabs";
import {
  pageEnterContainer,
  pageEnterItem,
} from "@/components/ui/page-enter-motion";
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

const ITEMS_PER_PAGE = 6;

const SEARCH_PLACEHOLDERS: Record<DraftCategory, string> = {
  all: "Search all saved drafts...",
  problem: "Search problem drafts...",
  showcase: "Search showcase drafts...",
  solution: "Search solution drafts...",
  program: "Search program drafts...",
  response: "Search response drafts...",
  report: "Search report drafts...",
};

function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

function getUpdatedRank(item: SavedDraftItem) {
  /* A formatted date cannot be ordered, so the instant is used when the item
     carries one — which is what makes "Recently updated" mean anything on a
     list mixing program drafts with report drafts. */
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

  /* Company drafts are program drafts, and a member invited to run programs
     has them too — the realm role would have hidden that. */
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");

  /* The company's own logo, taken from the membership — `/organizations/me`
     is an owner endpoint and a member drafting a program has no access to it.
     Memoised because the draft list is built in a `useMemo` that depends on
     it, and a fresh object each render would rebuild the whole list. */
  const companyOrg = useMemo(
    () =>
      membership ? { logoUrl: membership.organizationLogoUrl ?? "" } : undefined,
    [membership],
  );

  // Fetch real company programs (filter by state: DRAFT)
  const { data: companyProgramsData, isLoading: isCompanyProgramsLoading } =
    useGetMyCompanyProgramsQuery(
      { size: 100 },
      { skip: !isCompany, refetchOnMountOrArgChange: true },
    );

  // Fetch caller's problem drafts
  const { data: myProblemsData, isLoading: isProblemsLoading } =
    useGetMyProblemsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  // Fetch caller's showcase drafts
  const { data: showcaseDrafts, isLoading: isShowcaseDraftsLoading } =
    useGetShowcaseDraftsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  // Fetch caller's solution drafts
  const { data: solutionDrafts, isLoading: isSolutionDraftsLoading } =
    useGetSolutionDraftsQuery(
      { size: 100 },
      { skip: !isUser, refetchOnMountOrArgChange: true },
    );

  /* The reporter side of the same screen. Report drafts are saved by the
     submit form as it is typed into, and this is the only place they can be
     found again from outside that form. */
  const { data: reportDrafts, isLoading: isReportDraftsLoading } =
    useGetReportDraftsQuery(
      {},
      {
        skip: !isUser,
        refetchOnMountOrArgChange: true,
      },
    );

  /* Read for the program a draft belongs to — its name and its logo. The
     draft itself stores only `programId`, which names nothing on a card. */
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

  // Convert real backend DRAFT items to SavedDraftItem format
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

    /* One card per saved report draft. A draft may be untitled and almost
       empty — it is saved from the first keystroke — so every field falls
       back to something a reader can still act on rather than being hidden. */
    (reportDrafts ?? []).forEach((draft) => {
      const program = draft.programId
        ? programsById.get(draft.programId)
        : undefined;
      const title = draft.title?.trim() || "Untitled report draft";

      items.push({
        id: draft.id,
        title,
        /* The write-up is Markdown; `describe` strips it without mangling
           identifiers like `invalid_grant`. */
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
          /* `NONE` is the draft schema saying "undecided", not a severity. */
          draft.reportedSeverity && draft.reportedSeverity !== "NONE"
            ? draft.reportedSeverity
            : null,
        ].filter((tag): tag is string => Boolean(tag)),
        initials: title.slice(0, 2).toUpperCase(),
        logoSrc: program?.logoUrl ?? "",
        logoAlt: program?.name || "Program logo",
      });
    });

    /* One card per saved problem draft. */
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
        });
      });

    /* One card per saved showcase draft. */
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
        tags: ["Showcase", ...(draft.tags ?? [])],
        initials: title.slice(0, 2).toUpperCase(),
        logoSrc: draft.coverImageUrl || "",
        logoAlt: title,
      });
    });

    /* One card per saved solution draft. */
    (solutionDrafts ?? []).forEach((draft) => {
      const body = excerptOf(draft.bodyMarkdown ?? "", 160);
      const title =
        draft.summary?.trim() ||
        (draft.bodyMarkdown ? firstLine(draft.bodyMarkdown) : "") ||
        "Untitled solution draft";
        const techTags = (draft.testedWith ?? [])
          .map((t) => t.technology)
          .filter((t): t is string => Boolean(t));
        const tags = ["Solution", ...(draft.approachType ? [draft.approachType] : []), ...techTags];

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

  /**
   * Programs the reviewers are holding.
   *
   * They are deliberately absent from the list below, but an absence explains
   * nothing: saving a draft on a program already under review and then finding
   * this screen empty reads as a save that failed. Stating the count, and
   * where those programs actually are, is the difference between a rule and a
   * bug from where the reader sits.
   */
  const underReviewCount = useMemo(
    () => (companyProgramsData?.content ?? []).filter(isUnderReview).length,
    [companyProgramsData],
  );

  // Reset activeTab if it is no longer visible
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = filteredItems.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleDeleteItem = async (itemId: string) => {
    /* Different kinds of drafts share this list and they live at different
       endpoints — deleting through the wrong endpoint would 404. */
    const item = draftItems.find((draft) => draft.id === itemId);

    /* A problem, showcase, solution, or report draft is the user's own and always theirs to discard.
       A program draft belongs to the organization, so it takes DELETE_PROGRAM. */
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
    <motion.section
      initial="hidden"
      animate="visible"
      variants={pageEnterContainer}
      className="mx-auto w-full space-y-5 pb-12"
    >
      <motion.div variants={pageEnterItem}>
        <SavedDraftHeader totalDrafts={draftItems.length} />
      </motion.div>

      <motion.div variants={pageEnterItem} className="rounded-[24px] bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="space-y-4">
          <SavedDraftTabs
            activeTab={activeTab}
            counts={counts}
            onChange={(category) => {
              setActiveTab(category);
              setCurrentPage(1);
            }}
            visibleTabs={visibleTabs}
          />
          <SavedDraftSearch
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder={SEARCH_PLACEHOLDERS[activeTab]}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredItems.length}
          />
        </div>
      </motion.div>

      {!isLoading && underReviewCount > 0 ? (
        <motion.div
          variants={pageEnterItem}
          className="flex items-start gap-3 rounded-[20px] bg-card p-4 ring-1 ring-foreground/5 dark:ring-foreground/10 sm:items-center"
        >
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
        </motion.div>
      ) : null}

      {isLoading ? (
        <motion.div variants={pageEnterItem}>
          <SavedDraftGrid items={[]} isLoading />
        </motion.div>
      ) : paginatedItems.length > 0 ? (
        <motion.div variants={pageEnterItem} className="space-y-5">
          <SavedDraftGrid
            items={paginatedItems}
            onDelete={handleDeleteItem}
          />

          <SavedDraftPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      ) : (
        <motion.div variants={pageEnterItem}>
          <SavedDraftEmptyState
            activeTab={activeTab}
            searchTerm={searchTerm}
            onClear={() => setSearchTerm("")}
          />
        </motion.div>
      )}
    </motion.section>
  );
}
