"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Globe,
  Building2,
  Users,
  MapPin,
  ShieldCheck,
  Send,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Award,
  DollarSign,
  ArrowLeft,
  Share2,
  Check,
  Shield,
  FileCheck2,
  Lock,
  Search,
  Clock,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetOrganizationByIdQuery,
  useGetOrganizationProgramsByIdQuery,
} from "@/lib/redux/services/organizationsApi";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import type { Program } from "@/lib/types/programs/types";

const defaultCompanyProfile = {
  name: "CyberShield Security",
  handle: "@cybershield",
  logo: null as string | null,
  verified: true,
  description:
    "Official CyberShield Security Organization. We invite security researchers to help us keep our web applications, core API infrastructure, and payment gateways secure through responsible disclosure and reward-driven bug bounty programs.",
  stats: {
    activePrograms: 0,
    resolvedReports: 0,
    totalBountyPaid: "$0",
    maxBounty: "$0",
  },
  details: {
    industry: "Cybersecurity & SaaS",
    companySize: "51-200 employees",
    country: "United States",
    domain: "cybershield.io",
    websiteUrl: "https://cybershield.io",
  },
};

type OrganizationTab = "programs" | "policy" | "about";

function CompanyProfileContent() {
  const [activeTab, setActiveTab] = useState<OrganizationTab>("programs");
  const [programFilter, setProgramFilter] = useState<"ALL" | "BOUNTY" | "RESPONSE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchParams = useSearchParams();
  const orgId = searchParams.get("id") || searchParams.get("orgId");

  const { data: orgData } = useGetOrganizationByIdQuery(
    orgId!,
    { skip: !orgId }
  );

  const { data: orgProgramsData } =
    useGetOrganizationProgramsByIdQuery(
      { id: orgId!, page: 1, size: 20 },
      { skip: !orgId }
    );

  const fetchedPrograms: Program[] = useMemo(() => {
    if (!orgProgramsData) return [];
    if (Array.isArray(orgProgramsData)) return orgProgramsData as Program[];
    const payload = orgProgramsData as {
      content?: Program[];
      data?: Program[];
    };
    return payload.content || payload.data || [];
  }, [orgProgramsData]);

  const activeProgramsCount =
    (orgProgramsData as { totalElements?: number } | undefined)?.totalElements ??
    fetchedPrograms.length;

  const displayProfile = useMemo(() => {
    return {
      name: orgData?.name || defaultCompanyProfile.name,
      handle: orgData?.slug
        ? `@${orgData.slug}`
        : orgData?.name
        ? `@${orgData.name.toLowerCase().replace(/\s+/g, "-")}`
        : defaultCompanyProfile.handle,
      logo: orgData?.logoUrl || defaultCompanyProfile.logo,
      verified: orgData
        ? !!orgData.verifiedAt || orgData.status === "ACTIVE"
        : defaultCompanyProfile.verified,
      description: orgData?.description || defaultCompanyProfile.description,
      stats: {
        activePrograms: activeProgramsCount,
        resolvedReports: 0,
        totalBountyPaid: "$0",
        maxBounty: "$0",
      },
      details: {
        industry: orgData?.industry || defaultCompanyProfile.details.industry,
        companySize:
          orgData?.companySize || defaultCompanyProfile.details.companySize,
        country: orgData?.country || defaultCompanyProfile.details.country,
        domain: orgData?.domain || defaultCompanyProfile.details.domain,
        websiteUrl:
          orgData?.websiteUrl ||
          (orgData?.domain
            ? `https://${orgData.domain}`
            : defaultCompanyProfile.details.websiteUrl),
      },
    };
  }, [orgData, activeProgramsCount]);

  const logoUrl = orgData?.logoUrl;
  const coverUrl =
    orgData?.coverUrl ||
    (orgData as { coverImageUrl?: string } | undefined)?.coverImageUrl;
  const companyInitials = (displayProfile.name || "OR")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const catalogHref = orgId
    ? `/company/programs?id=${orgId}`
    : "/company/programs";

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success("Organization link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      if (next) {
        toast.success(`Following ${displayProfile.name}`);
      } else {
        toast.success(`Unfollowed ${displayProfile.name}`);
      }
      return next;
    });
  };

  const filteredPrograms = useMemo(() => {
    return fetchedPrograms.filter((p) => {
      const title = p.name || (p as { title?: string }).title || "";
      const desc = p.description || "";
      const isBounty =
        p.offersBounties || (p.engagementType as string) === "BOUNTY";

      const matchesType =
        programFilter === "ALL"
          ? true
          : programFilter === "BOUNTY"
          ? isBounty
          : !isBounty;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q);

      return matchesType && matchesQuery;
    });
  }, [fetchedPrograms, programFilter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6 pb-16"
    >
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Programs Marketplace</span>
        </Link>
      </div>

      {/* ── 1. Hero Cover & Profile Banner ──────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Cover Banner */}
        <div className="relative h-36 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`${displayProfile.name} cover`}
              className="size-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-20" />
            </>
          )}
        </div>

        {/* Profile Identity Bar */}
        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: Logo & Identity Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20">
              <div className="relative size-28 sm:size-36 shrink-0 rounded-3xl border-4 border-card bg-card shadow-md overflow-hidden ring-2 ring-primary/20 flex items-center justify-center">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={displayProfile.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-primary">
                    {companyInitials}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {displayProfile.name}
                  </h1>
                  {displayProfile.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-3.5" />
                      Verified Org
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80 font-mono">
                    {displayProfile.handle}
                  </span>
                  {displayProfile.details.industry && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3.5" />
                      {displayProfile.details.industry}
                    </span>
                  )}
                  {displayProfile.details.country && (
                    <CountryDisplay
                      value={displayProfile.details.country}
                      size={12}
                      className="gap-1"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions Hub */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  isFollowing
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {isFollowing ? (
                  <>
                    <BookmarkCheck className="size-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4 text-muted-foreground" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <a
                href={displayProfile.details.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Globe className="size-4" />
                <span>Website</span>
                <ExternalLink className="size-3.5 opacity-80" />
              </a>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleCopyLink}
                title="Share organization"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Performance & Activity Metrics Strip ─────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-blue-500/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Programs
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {displayProfile.stats.activePrograms}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Live bug bounty scopes
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-emerald-500/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg. Response SLA
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              &lt; 24h
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              First triage response
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-emerald-500/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Disbursed
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {displayProfile.stats.totalBountyPaid}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Bounties rewarded
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-purple-500/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Bounty Award
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {displayProfile.stats.maxBounty}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              For Critical findings
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Tabbed Navigation Rail ───────────────────────────────── */}
      <div className="border-b border-border">
        <nav className="flex gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("programs")}
            className={`relative flex items-center gap-2 pb-3.5 pt-1 text-sm font-semibold transition cursor-pointer ${
              activeTab === "programs"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-4" />
            <span>Programs</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
              {activeProgramsCount}
            </span>
            {activeTab === "programs" && (
              <motion.div
                layoutId="org-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`relative flex items-center gap-2 pb-3.5 pt-1 text-sm font-semibold transition cursor-pointer ${
              activeTab === "policy"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="size-4" />
            <span>Scope & Disclosure Policy</span>
            {activeTab === "policy" && (
              <motion.div
                layoutId="org-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`relative flex items-center gap-2 pb-3.5 pt-1 text-sm font-semibold transition cursor-pointer ${
              activeTab === "about"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="size-4" />
            <span>About Organization</span>
            {activeTab === "about" && (
              <motion.div
                layoutId="org-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        </nav>
      </div>

      {/* ── 4. Main Content Two-Column Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8 items-start">
        {/* Left Section (2 Columns) */}
        <div className="space-y-6 lg:col-span-2">
          {/* TAB 1: PROGRAMS */}
          {activeTab === "programs" && (
            <div className="space-y-5">
              {/* Filter and Search Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1">
                  <button
                    type="button"
                    onClick={() => setProgramFilter("ALL")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      programFilter === "ALL"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({fetchedPrograms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter("BOUNTY")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      programFilter === "BOUNTY"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bounty
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter("RESPONSE")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      programFilter === "RESPONSE"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Response
                  </button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Program Items */}
              {filteredPrograms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    No matching programs found
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your filters or search keywords.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredPrograms.map((program) => {
                    const title =
                      program.name || (program as { title?: string }).title || "Program";
                    const rawHandle =
                      program.handle ||
                      title.toLowerCase().replace(/\s+/g, "-");
                    const handle = rawHandle.startsWith("@")
                      ? rawHandle
                      : `@${rawHandle}`;
                    const isBounty =
                      program.offersBounties ||
                      (program.engagementType as string) === "BOUNTY";
                    const maxBounty = program.maximumBounty ?? 0;
                    const rewardBadgeText = isBounty
                      ? maxBounty > 0
                        ? `Up to $${maxBounty.toLocaleString()}`
                        : "Up to $15,000"
                      : "Points Only";

                    return (
                      <div
                        key={program.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-xs shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/programs/${program.id}`}
                              className="text-base font-bold text-foreground transition-colors group-hover:text-primary"
                            >
                              {title}
                            </Link>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {handle}
                          </p>
                          {program.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
                              {program.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                              isBounty
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {rewardBadgeText}
                          </span>

                          <Link
                            href={`/programs/${program.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-2xs"
                          >
                            <Send className="size-3.5" />
                            <span>View Scope</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POLICY & SAFE HARBOR */}
          {activeTab === "policy" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="size-5 text-emerald-500" />
                  <span>DevSolve Safe Harbor Commitment</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displayProfile.name} adheres to the DevSolve Standard Safe Harbor terms. When you conduct vulnerability research within the stated scope and in compliance with this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-2">
                  <li>We consider your research activities to be authorized and will not initiate legal action against you.</li>
                  <li>We will work with you to understand and resolve the report quickly.</li>
                  <li>We will recognize your contribution publicly unless you request anonymity.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock className="size-5 text-primary" />
                  <span>Response SLA Targets</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <p className="text-xs text-muted-foreground">First Response</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">&lt; 24 Hours</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <p className="text-xs text-muted-foreground">Triage & Validation</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">&lt; 48 Hours</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <p className="text-xs text-muted-foreground">Bounty Award</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">&lt; 5 Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3">
                <h3 className="text-base font-bold text-foreground">
                  Organization Summary
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displayProfile.description}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3">
                <h3 className="text-base font-bold text-foreground">
                  Security Operations
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displayProfile.name}&apos;s security engineering team conducts continuous reviews and coordinates with independent researchers worldwide to safeguard user data and maintain zero-day defense integrity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (1 Column) */}
        <div className="space-y-6">
          {/* Quick Submit Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Zap className="size-4" />
              <span>Found a Vulnerability?</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Report security findings responsibly to {displayProfile.name} and earn rewards.
            </p>
            <Link
              href={catalogHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              <Send className="size-3.5" />
              <span>Submit a Report</span>
            </Link>
          </div>

          {/* Company Details Meta List */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
              Company Overview
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="size-4 text-muted-foreground" />
                  Industry
                </span>
                <span className="font-semibold text-foreground truncate">
                  {displayProfile.details.industry}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="size-4 text-muted-foreground" />
                  Size
                </span>
                <span className="font-semibold text-foreground truncate">
                  {displayProfile.details.companySize}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-4 text-muted-foreground" />
                  Country
                </span>
                <CountryDisplay
                  value={displayProfile.details.country}
                  size={14}
                  textClassName="font-semibold text-foreground"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Globe className="size-4 text-muted-foreground" />
                  Domain
                </span>
                <a
                  href={displayProfile.details.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary hover:underline"
                >
                  <span>{displayProfile.details.domain}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Security Verification Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Lock className="size-4 text-primary" />
              <span>Verified Enterprise</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This organization is identity-verified and registered on the DevSolve bug bounty marketplace.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PublicOrganizationProfileView() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
          Loading organization profile...
        </div>
      }
    >
      <CompanyProfileContent />
    </Suspense>
  );
}