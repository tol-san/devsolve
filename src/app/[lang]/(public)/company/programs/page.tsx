"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Search,
  ExternalLink,
  Globe,
  ArrowLeft,
  Building2,
} from "lucide-react";
import {
  useGetOrganizationByIdQuery,
  useGetOrganizationProgramsByIdQuery,
} from "@/lib/redux/services/organizationsApi";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Program } from "@/lib/types/programs/types";

const defaultCompanyData = {
  name: "Organization Profile",
  handle: "@organization",
  logo: null as string | null,
  verified: true,
  website: "https://cybershield.io",
};

function CompanyProgramsCatalogContent() {
  const [filter, setFilter] = useState<"ALL" | "BOUNTY" | "RESPONSE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const orgId = searchParams.get("id") || searchParams.get("orgId");

  const { data: orgData } = useGetOrganizationByIdQuery(orgId!, {
    skip: !orgId,
  });

  const { data: orgProgramsData, isLoading } =
    useGetOrganizationProgramsByIdQuery(
      { id: orgId!, page: 1, size: 50 },
      { skip: !orgId }
    );

  const displayCompany = useMemo(() => {
    return {
      name: orgData?.name || defaultCompanyData.name,
      handle: orgData?.slug
        ? `@${orgData.slug}`
        : orgData?.name
        ? `@${orgData.name.toLowerCase().replace(/\s+/g, "-")}`
        : defaultCompanyData.handle,
      logo: orgData?.logoUrl || defaultCompanyData.logo,
      verified: orgData
        ? !!orgData.verifiedAt || orgData.status === "ACTIVE"
        : defaultCompanyData.verified,
      website:
        orgData?.websiteUrl ||
        (orgData?.domain
          ? `https://${orgData.domain}`
          : defaultCompanyData.website),
    };
  }, [orgData]);

  const backHref = orgId ? `/company?id=${orgId}` : "/company";

  const fetchedPrograms: any[] = useMemo(() => {
    if (!orgProgramsData) return [];
    if (Array.isArray(orgProgramsData)) return orgProgramsData;
    return (
      (orgProgramsData as any).content ||
      (Array.isArray((orgProgramsData as any).data)
        ? (orgProgramsData as any).data
        : [])
    );
  }, [orgProgramsData]);

  const rawPrograms: Program[] = useMemo(() => {
    return fetchedPrograms.map((p) => ({
      ...p,
      organizationId: p.organizationId || orgId || p.organization?.id || "",
      organizationName:
        p.organizationName || p.organization?.name || displayCompany.name,
      organization: {
        id: p.organization?.id || p.organizationId || orgId || "",
        name:
          p.organization?.name ||
          p.organizationName ||
          displayCompany.name,
        slug: p.organization?.slug || orgData?.slug,
        logoUrl: p.organization?.logoUrl || p.logoUrl || displayCompany.logo,
        websiteUrl: p.organization?.websiteUrl || displayCompany.website,
      },
    }));
  }, [fetchedPrograms, orgId, orgData, displayCompany]);

  const filteredPrograms = useMemo(() => {
    return rawPrograms.filter((p) => {
      const isBounty = p.offersBounties || p.engagementType === "BOUNTY";
      const matchesFilter =
        filter === "ALL" ? true : filter === "BOUNTY" ? isBounty : !isBounty;
      const matchesSearch =
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [rawPrograms, filter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6 pb-16"
    >
      {/* Back to Profile Button */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Organization Profile</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="size-16 sm:size-20 shrink-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex items-center justify-center">
              {displayCompany.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayCompany.logo}
                  alt={displayCompany.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black text-primary">
                  {(displayCompany.name || "OR")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {displayCompany.name}
                </h1>
                {displayCompany.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                {displayCompany.handle}
              </p>
              <p className="text-sm text-muted-foreground pt-0.5">
                Browsing all security programs and disclosure targets published by{" "}
                <span className="font-semibold text-foreground">
                  {displayCompany.name}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <a
              href={displayCompany.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <Globe className="size-3.5 text-primary" />
              <span>Official Website</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({rawPrograms.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("BOUNTY")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              filter === "BOUNTY"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bounty
          </button>
          <button
            type="button"
            onClick={() => setFilter("RESPONSE")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              filter === "RESPONSE"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Response
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${displayCompany.name}'s programs...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      {/* Programs Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-border bg-card p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Globe className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No programs found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            No bug bounty or disclosure programs published for {displayCompany.name}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function CompanyProgramsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
          Loading catalog...
        </div>
      }
    >
      <CompanyProgramsCatalogContent />
    </Suspense>
  );
}