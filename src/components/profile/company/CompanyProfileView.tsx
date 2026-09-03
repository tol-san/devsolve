"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Globe2,
  Layers3,
  MapPin,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useGetMyOrganizationQuery,
  useGetOrganizationMembersQuery,
} from "@/lib/redux/services/organizationsApi";
import { useGetMyCompanyProgramsQuery } from "@/lib/redux/services/program/programsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrgStatusBadge } from "@/components/organizations/OrgStatusBadge";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CO"
  );
}

function safeExternalUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function formatDisplayValue(value?: string) {
  if (!value) return "Not specified";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function CompanyProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 animate-pulse"
    >
      {/* Mirrors the real layout — header, hero, then the 2:1 split — so the
          page does not rearrange itself the moment the data lands. */}
      <div className="h-20 rounded-2xl bg-muted" />
      <div className="h-80 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    </motion.div>
  );
}

export default function CompanyProfileView() {
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    isError,
    refetch,
  } = useGetMyOrganizationQuery();
  const { data: programsResponse, isLoading: isProgramsLoading } =
    useGetMyCompanyProgramsQuery({ size: 100 });
  const { data: members = [], isLoading: isMembersLoading } =
    useGetOrganizationMembersQuery();

  if (isOrganizationLoading || isProgramsLoading || isMembersLoading) {
    return <CompanyProfileSkeleton />;
  }

  if (isError || !organization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <Card className="mx-auto max-w-xl rounded-2xl text-center">
          <CardHeader className="justify-items-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <CardTitle className="text-xl font-bold">
              Company profile unavailable
            </CardTitle>
            <CardDescription className="max-w-md text-base">
              We couldn&apos;t load the organization connected to this account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
            <Link href="/dashboard" className={buttonVariants()}>
              Back to dashboard
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  const programs = programsResponse?.content ?? [];
  const activePrograms = programs.filter(
    (program) => program.state === "ACTIVE",
  ).length;
  const pendingPrograms = programs.filter(
    (program) => program.submissionState === "PENDING_REVIEW",
  ).length;
  const recentPrograms = [...programs]
    .sort((first, second) => {
      const firstDate = Date.parse(first.createdAt || "");
      const secondDate = Date.parse(second.createdAt || "");
      return (
        (Number.isNaN(secondDate) ? 0 : secondDate) -
        (Number.isNaN(firstDate) ? 0 : firstDate)
      );
    })
    .slice(0, 4);
  const websiteUrl = safeExternalUrl(organization.websiteUrl);

  const metrics = [
    {
      label: "All programs",
      value: programs.length,
      helper: "Owned by this company",
      icon: Layers3,
    },
    {
      label: "Active",
      value: activePrograms,
      helper: "Currently running",
      icon: ShieldCheck,
    },
    {
      label: "Team",
      value: members.length,
      helper: members.length === 1 ? "Member" : "Members",
      icon: Users,
    },
    {
      label: "In review",
      value: pendingPrograms,
      helper: pendingPrograms === 1 ? "Program pending" : "Programs pending",
      icon: CalendarDays,
    },
  ];

  const details = [
    {
      label: "Industry",
      value: formatDisplayValue(organization.industry),
      icon: BriefcaseBusiness,
    },
    {
      label: "Company size",
      value: organization.companySize
        ? `${organization.companySize} employees`
        : "Not specified",
      icon: Users,
    },
    {
      label: "Country",
      value: organization.country || "Not specified",
      icon: MapPin,
    },
    {
      label: "Domain",
      value: organization.domain || "Not specified",
      icon: Globe2,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Company Profile
          </h1>
          <p className="text-base text-muted-foreground">
            Your organization identity, security programs, and team presence.
          </p>
        </div>
        <Link
          href="/dashboard/organizations/edit"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-xl",
          )}
        >
          <Settings2 data-icon="inline-start" />
          Edit organization profile
        </Link>
      </header>

      {/* Hero: identity, then the numbers that describe it, then what you can
          do about them — one card instead of three stacked bands. */}
      <Card className="overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-36 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
          {(organization.coverUrl ||
            (organization as { coverImageUrl?: string })?.coverImageUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                organization.coverUrl ||
                (organization as { coverImageUrl?: string })?.coverImageUrl
              }
              alt=""
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

        <CardHeader className="border-b">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end -mt-12 sm:-mt-16 relative z-10">
            <Avatar
              className="size-24 sm:size-28 rounded-2xl ring-4 ring-card shadow-lg bg-card"
              aria-label={organization.name}
            >
              {organization.logoUrl && (
                <AvatarImage
                  src={organization.logoUrl}
                  alt={`${organization.name} logo`}
                  className="rounded-2xl"
                />
              )}
              <AvatarFallback className="rounded-2xl text-xl font-bold">
                {initialsOf(organization.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {organization.name}
                </CardTitle>
                <OrgStatusBadge status={organization.status} />
                <Badge variant="secondary">Organization profile</Badge>
              </div>
              <CardDescription className="text-base">
                {organization.slug
                  ? `@${organization.slug}`
                  : "Organization account"}
              </CardDescription>
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                {organization.description ||
                  "Add an organization description to introduce your security team and program goals."}
              </p>
            </div>
          </div>
        </CardHeader>
        {/* The metric row the design spec calls for on a detail hero. Separate
            tiles rather than a divided grid — the hairline rules this had at
            first drew a hard cross through the middle of the card. */}
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-1 rounded-xl bg-muted/50 p-4"
              >
                <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <metric.icon className="size-4" aria-hidden="true" />
                  {metric.label}
                </dt>
                <dd className="text-3xl font-bold tracking-tight tabular-nums">
                  {metric.value}
                </dd>
                <dd className="text-sm text-muted-foreground">
                  {metric.helper}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
        <CardFooter className="flex-wrap gap-3 border-t bg-muted/20">
          <Link
            href="/dashboard/program-management"
            className={buttonVariants({ size: "lg" })}
          >
            <Layers3 data-icon="inline-start" />
            Manage programs
          </Link>
          <Link
            href="/dashboard/team-management"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Users data-icon="inline-start" />
            Manage team
          </Link>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              <Globe2 data-icon="inline-start" />
              Visit website
              <ArrowUpRight data-icon="inline-end" />
            </a>
          )}
        </CardFooter>
      </Card>

      {/* Asymmetric grid per the design spec: the programs list is the reason
          to open this page, so it takes the two wide columns; the reference
          details sit in the aside. `items-start` keeps the shorter column from
          stretching to match the taller one. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-6 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Company details</CardTitle>
              <CardDescription>
                Public-facing organization information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {details.map((detail, index) => (
                <div key={detail.label} className="flex flex-col gap-4">
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <detail.icon className="size-4" aria-hidden="true" />
                      {detail.label}
                    </span>
                    <span className="max-w-[60%] truncate text-sm font-semibold">
                      {detail.value}
                    </span>
                  </div>
                </div>
              ))}
              {organization.createdAt && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      Registered
                    </span>
                    <span className="text-sm font-semibold">
                      {new Date(organization.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6 lg:order-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent programs</CardTitle>
              <CardDescription>
                Programs owned by {organization.name}.
              </CardDescription>
              <CardAction>
                <Link
                  href="/dashboard/program-management"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  View all
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {recentPrograms.length > 0 ? (
                recentPrograms.map((program, index) => (
                  <div key={program.id} className="flex flex-col gap-4">
                    {index > 0 && <Separator />}
                    <Link
                      href={`/dashboard/program-management/${program.id}`}
                      className="flex items-center justify-between gap-4 rounded-xl transition-colors hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {program.name}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          @{program.handle}
                        </span>
                      </span>
                      <Badge variant="secondary">
                        {formatDisplayValue(program.submissionState)}
                      </Badge>
                    </Link>
                </div>
              ))
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Layers3 className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-semibold">No programs yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first security program for this organization.
                  </p>
                </div>
                <Link
                  href="/dashboard/create-program"
                  className={buttonVariants({ size: "sm" })}
                >
                  Create program
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </motion.div>
  );
}
