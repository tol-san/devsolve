"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Program } from "@/lib/types/programs/types";
import { usePathname, useRouter } from "next/navigation";
import { splitLocale } from "@/lib/i18n/config";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  useGetBookmarkStatusQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const t = useT();
  const lp = useLocalePath();
  const orgId = program.organizationId || program.organization?.id;
  const { data: orgData } = useGetOrganizationByIdQuery(orgId ?? "", {
    skip: !orgId,
  });

  const [imageError, setImageError] = React.useState(false);
  const logoUrl = !imageError
    ? (program.organization?.logoUrl || program.logoUrl || orgData?.logoUrl)
    : null;
  const orgName =
    program.organizationName ||
    program.organization?.name ||
    orgData?.name ||
    t("programs.card.organization");
  const initials =
    orgName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "OR";

  const companyHref = lp(orgId ? `/company?id=${orgId}` : "/company");

  const { data: isBookmarked } = useGetBookmarkStatusQuery({ type: "PROGRAM", targetId: program.id });
  const [addBookmark, { isLoading: isSaving }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemoving }] = useRemoveBookmarkMutation();
  const isToggling = isSaving || isRemoving;

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
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
      if (isBookmarked) {
        await removeBookmark({ type: "PROGRAM", targetId: program.id }).unwrap();
        toast.success(`"${program.name}" removed from saved bookmarks.`);
      } else {
        await addBookmark({ type: "PROGRAM", targetId: program.id }).unwrap();
        toast.success(`"${program.name}" saved to bookmarks.`);
      }
    } catch {
      toast.error(t("programs.card.bookmarkError"));
    }
  };

  const isBounty = program.engagementType
    ? program.engagementType === "BOUNTY"
    : program.offersBounties;

  const badgeStyle = isBounty
    ? "bg-blue-50 text-blue-600 border-blue-100/80 group-hover:border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 dark:group-hover:border-blue-500/40"
    : "bg-emerald-50 text-emerald-600 border-emerald-100/80 group-hover:border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 dark:group-hover:border-emerald-500/40";

  const companyTitleColor = isBounty
    ? "text-blue-600 dark:text-blue-400"
    : "text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors";

  const renderRewards = () => {
    if (isBounty) {
      const min = program.minimumBounty ?? 0;
      const max = program.maximumBounty ?? 0;
      return (
        <p className="text-[15px] font-extrabold text-emerald-600 dark:text-emerald-400">
          ${min.toLocaleString()} - ${max.toLocaleString()}
        </p>
      );
    }

    const minPts = program.rewards?.[0]?.points ?? 20;
    const maxPts = program.rewards?.[program.rewards.length - 1]?.points ?? 80;
    return (
      <p className="text-[15px] font-extrabold text-blue-600 dark:text-blue-400">
        {minPts} - {maxPts} {t("programs.card.points")}
      </p>
    );
  };

  const pathname = usePathname();
  const router = useRouter();
  const { rest } = splitLocale(pathname);
  const isDashboard = rest.startsWith("/dashboard");
  const basePath = lp(isDashboard ? "/dashboard/programs" : "/programs");
  const targetHref = `${basePath}/${program.id}`;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button']")) {
      return;
    }
    router.push(targetHref);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:ring-blue-500/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 h-full cursor-pointer"
    >
      <Link
        href={targetHref}
        className="absolute inset-0 z-0 rounded-2xl outline-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      <button
        onClick={toggleBookmark}
        type="button"
        disabled={isToggling}
        aria-pressed={!!isBookmarked}
        aria-label={
          isBookmarked
            ? t("programs.card.removeBookmark")
            : t("programs.card.bookmark")
        }
        className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50/80 active:scale-95 transition-all duration-200 z-10 disabled:opacity-60 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 cursor-pointer"
      >
        <Bookmark
          className={`w-5 h-5 transition-colors ${
            (isBookmarked ?? isDashboard)
              ? "fill-blue-500 stroke-none"
              : ""
          }`}
        />
      </button>

      <div className="space-y-4 relative z-10 pointer-events-none">
        <div className="flex items-start gap-3.5 pr-8">
          <Link
            href={companyHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-start gap-3.5 group/org cursor-pointer pointer-events-auto"
          >
            <div className="w-11 h-11 bg-card border border-border rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/org:scale-105 transition-all duration-300">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={orgName}
                  className="w-full h-full object-cover"
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
            <div>
              <h4 className={`font-bold text-[17px] leading-tight hover:underline ${companyTitleColor}`}>
                {orgName}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${badgeStyle}`}>
                  {isBounty ? t("programs.card.bounty") : t("programs.card.response")}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-[13px] text-muted-foreground capitalize">
                  {program.state?.toLowerCase() || t("programs.card.open")}
                </span>
                {(orgData?.domain || orgData?.industry || program.organization?.industry) && (
                  <>
                    <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-[12px] text-muted-foreground truncate max-w-[130px] hidden sm:inline capitalize">
                      {orgData?.domain || (orgData?.industry || program.organization?.industry)?.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-foreground text-[17px] leading-snug line-clamp-1 transition-colors group-hover:text-primary">
            {program.name}
          </h3>
          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
            {program.description}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {t("programs.card.inScope")}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {program.inScopeAssets && program.inScopeAssets.length > 0 ? (
              <>
                {program.inScopeAssets.slice(0, 2).map((asset, index) => {
                  const assetName = asset.identifier;
                  return (
                    <span
                      key={asset.id || index}
                      className="bg-muted text-foreground/80 text-xs font-mono font-medium px-2.5 py-1 rounded-lg ring-1 ring-foreground/5 dark:ring-foreground/10 max-w-[200px] truncate transition-colors"
                      title={assetName}
                    >
                      {assetName}
                    </span>
                  );
                })}

                {program.inScopeAssets.length > 2 && (
                  <span className="bg-muted/70 text-muted-foreground text-xs font-semibold px-2 py-1 rounded-md ring-1 ring-foreground/5 dark:ring-foreground/10">
                    +{program.inScopeAssets.length - 2} {t("programs.card.more")}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[13px] text-muted-foreground italic">
                {t("programs.card.noAssets")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between relative z-10 pointer-events-none">
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            {t("programs.card.rewards")}
          </p>
          {renderRewards()}
        </div>
      </div>
    </div>
  );
}