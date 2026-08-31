"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import {
  Bookmark,
  Send,
  Trophy,
  Award,
  Layers,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Program, ProgramDetail } from "@/lib/types/programs/types";
import { isPublished, isUnderReview } from "@/lib/programs/draft-status";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  useGetBookmarkStatusQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";

interface ProgramDetailHeroProps {
  program: ProgramDetail;
}

export function ProgramDetailHero({ program }: ProgramDetailHeroProps) {
  const [imageError, setImageError] = React.useState(false);
  const logoUrl = !imageError ? (program.organization?.logoUrl || program.logoUrl) : null;
  const orgName = program.organizationName || program.organization?.name || program.handle || "Organization";
  const initials =
    orgName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "OR";

  /* Saving is for programs a researcher can come back to. A draft has no
     public page to return to — this hero is also what the owner previews from
     Saved drafts — so the control is left out rather than shown against
     something nobody else can open. The status request goes with it.

     One under review is excluded on top of that, and needs saying separately:
     `state` and `submissionState` move independently, so a program that was
     published and then resubmitted sits at `ACTIVE` with `PENDING_REVIEW`, and
     the published check alone let Save through on it. */
  const canBookmark = isPublished(program) && !isUnderReview(program);

  const { data: isSaved } = useGetBookmarkStatusQuery(
    { type: "PROGRAM", targetId: program.id },
    { skip: !canBookmark },
  );
  const [addBookmark, { isLoading: isSaving }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemoving }] = useRemoveBookmarkMutation();
  const isToggling = isSaving || isRemoving;

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const handleToggleSave = async () => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/programs/${program.id}`,
      );
      return;
    }
    if (isToggling) return;
    try {
      if (isSaved) {
        await removeBookmark({ type: "PROGRAM", targetId: program.id }).unwrap();
      } else {
        await addBookmark({ type: "PROGRAM", targetId: program.id }).unwrap();
      }
    } catch {
      toast.error("Failed to update bookmark. Please try again.");
    }
  };

  const isBounty = program.offersBounties || program.engagementType === "BOUNTY";

  const minBounty = program.minimumBounty ?? 0;
  const maxBounty = program.maximumBounty ?? 0;

  const totalAssetsCount = program.assets?.length || 0;

  const assetTypes = Array.from(
    new Set(
      (program.assets || [])
        .map((a) => a.assetType || "Web")
        .filter(Boolean)
    )
  );

  const badgesElement = (
    <>
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
        • {program.state || "Active"}
      </span>
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          isBounty
            ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20"
            : "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
        }`}
      >
        {isBounty ? "Bounty" : "Response"}
      </span>
    </>
  );

  const saveButton = canBookmark ? (
    <Button
      onClick={handleToggleSave}
      disabled={isToggling}
      variant="outline"
      size="sm"
      className={`rounded-lg h-9 border-transparent text-xs font-semibold gap-1.5 transition-all ${
        isSaved
          ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
          : "bg-card text-foreground hover:bg-muted"
      }`}
    >
      <Bookmark
        className={`w-3.5 h-3.5 ${
          isSaved
            ? "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"
            : "text-muted-foreground"
        }`}
      />
      {isSaved ? "Saved" : "Save"}
    </Button>
  ) : null;

  return (
    <div className="relative bg-card rounded-xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href="/dashboard/visit"
              className="flex items-center gap-3.5 group/org cursor-pointer"
            >
              <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center font-bold text-foreground text-base ring-1 ring-foreground/5 dark:ring-foreground/10 shrink-0 overflow-hidden shadow-sm group-hover/org:scale-105 transition-all duration-300">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={orgName}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-extrabold text-foreground tracking-wider">
                    {initials}
                  </span>
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover/org:text-blue-600 dark:group-hover/org:text-blue-400 group-hover/org:underline transition-colors truncate">
                    {orgName}
                  </h1>
                  <div className="hidden sm:inline-flex items-center gap-2">
                    {badgesElement}
                  </div>
                </div>
                {program.handle && (
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    @{program.handle}
                  </p>
                )}
              </div>
            </Link>

            {/* Mobile badges & Save button row */}
            <div className="flex sm:hidden items-center justify-between w-full pt-2">
              <div className="flex items-center gap-2">
                {badgesElement}
              </div>
              {saveButton}
            </div>
          </div>

          {/* Desktop Save button */}
          {saveButton && (
            <div className="hidden sm:flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              {saveButton}
            </div>
          )}
        </div>

        {/* PROGRAM NAME – responsive size */}
        {program.description && (
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-snug w-full line-clamp-2">
            {program.name}
          </p>
        )}

        {/* PROGRAM DESCRIPTION – responsive */}
        {program.description && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed w-full line-clamp-2">
            {program.description}
          </p>
        )}

        {/* ASSET TYPE BADGES */}
        {assetTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {assetTypes.map((type, i) => (
              <span
                key={i}
                className="bg-muted text-muted-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-md ring-1 ring-foreground/5 dark:ring-foreground/10 uppercase tracking-wider"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* STATS ROW – responsive grid with proper gaps */}
        <div className="pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* MIN REWARD */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isBounty ? "Min Reward" : "Min Points"}
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {isBounty ? `$${minBounty.toLocaleString()}` : `${minBounty} pts`}
            </p>
          </div>

          {/* MAX REWARD */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isBounty ? "Max Reward" : "Max Points"}
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
              {isBounty ? `$${maxBounty.toLocaleString()}` : `${maxBounty} pts`}
            </p>
          </div>

          {/* TOTAL ASSETS */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Total Assets
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {totalAssetsCount}
            </p>
          </div>

          {/* CREATED DATE */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Created Date
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">
              <span>{program.createdAt?.split('T')[0]}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}