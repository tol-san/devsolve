"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Trophy,
  Award,
  Layers,
  Calendar,
  Lock,
  Zap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { ProgramDetail } from "@/lib/types/programs/types";
import { isPublished, isUnderReview } from "@/lib/programs/draft-status";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  useGetBookmarkStatusQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

interface ProgramDetailHeroProps {
  program: ProgramDetail;
}

export function ProgramDetailHero({ program }: ProgramDetailHeroProps) {
  const router = useRouter();
  const lp = useLocalePath();
  const orgId = program.organization?.id || program.organizationId;
  const companyHref = orgId ? lp(`/company?id=${orgId}`) : lp("/company");
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

  const handleSubmitReport = () => {
    const targetUrl = lp(`/dashboard/submit-report?programId=${program.id}`);
    if (session?.user) {
      router.push(targetUrl);
    } else {
      handleLogin(targetUrl);
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

  const isPrivate =
    program.visibility === "PRIVATE" || program.visibility === "INVITE_ONLY";

  const isPendingReview =
    isUnderReview(program) || program.submissionState === "PENDING_REVIEW";

  const badgesElement = (
    <>
      {isPendingReview ? (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 inline-flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          Pending Review
        </span>
      ) : program.state === "DRAFT" ? (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          • Draft
        </span>
      ) : (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
          • {program.state || "Active"}
        </span>
      )}
      {isPrivate && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 inline-flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" />
          Private
        </span>
      )}
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

  const submitButton = (
    <Button
      onClick={handleSubmitReport}
      size="sm"
      className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
    >
      <Zap className="w-3.5 h-3.5" />
      <span>Submit a Report</span>
    </Button>
  );

  const saveButton = canBookmark ? (
    <Button
      onClick={handleToggleSave}
      disabled={isToggling}
      variant="outline"
      size="sm"
      className={`rounded-lg h-9 border-transparent text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={companyHref}
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

            <div className="flex sm:hidden flex-wrap items-center justify-between w-full pt-2 gap-2">
              <div className="flex items-center gap-2">
                {badgesElement}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {submitButton}
                {saveButton}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {submitButton}
            {saveButton}
          </div>
        </div>

        {program.description && (
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-snug w-full line-clamp-2">
            {program.name}
          </p>
        )}

        {program.description && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed w-full line-clamp-2">
            {program.description}
          </p>
        )}

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

        <div className="pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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