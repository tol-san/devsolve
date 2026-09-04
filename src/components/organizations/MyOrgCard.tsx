"use client";

import Link from "next/link";
import { Organization } from "@/lib/redux/services/organizationsApi";
import { OrgStatusBadge } from "./OrgStatusBadge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Building2, Globe, MapPin, Users, Calendar, Edit3, Link2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountryDisplay } from "@/components/shared/CountryDisplay";

/**
 * The organization at a glance. Read-only by design: everything editable,
 * logo included, lives behind the Edit details link so there is one place
 * changes are made rather than two.
 */

interface MyOrgCardProps {
  organization: Organization;
}

export function MyOrgCard({ organization }: MyOrgCardProps) {
  const coverUrl =
    organization.coverUrl ||
    (organization as { coverImageUrl?: string })?.coverImageUrl;

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Cover Banner */}
      <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
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

      <CardHeader className="border-b border-border bg-muted/40 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
          <div className="flex items-end gap-4">
            {organization.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-card bg-card shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-card bg-card shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl ring-1 ring-blue-500/20">
                {organization.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="mb-0.5">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {organization.name}
                </CardTitle>
                <OrgStatusBadge status={organization.status} />
              </div>
              {organization.slug && (
                <CardDescription className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" /> slug: <span className="font-mono text-foreground">{organization.slug}</span>
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            {/* Its own page rather than a dialog — the form is nine fields
                deep, and a modal loses everything typed into it to a stray
                click outside. */}
            <Link
              href="/dashboard/organizations/edit"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border text-foreground hover:bg-muted",
              )}
            >
              <Edit3 data-icon="inline-start" />
              Edit details
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {organization.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              About Organization
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {organization.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-border bg-muted/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Industry
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">
              {organization.industry || "Not specified"}
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-muted/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Company Size
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">
              {organization.companySize ? `${organization.companySize} employees` : "Not specified"}
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-muted/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Country
            </div>
            <p className="text-sm font-semibold text-foreground mt-1">
              <CountryDisplay
                value={organization.country}
                fallback="Not specified"
              />
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-muted/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Domain / Website
            </div>
            <p className="text-sm font-semibold text-foreground mt-1 truncate">
              {organization.websiteUrl ? (
                <a
                  href={organization.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {organization.domain || organization.websiteUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                organization.domain || "Not specified"
              )}
            </p>
          </div>
        </div>
      </CardContent>

      {organization.createdAt && (
        <CardFooter className="border-t border-border bg-muted/30 py-3 text-xs text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          Registered on {new Date(organization.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </CardFooter>
      )}
    </Card>
  );
}
