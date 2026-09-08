"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const DASHBOARD_SHORTCUTS = [
  {
    title: "Programs Management",
    description: "View, create, and manage bounty programs",
    href: "/dashboard/programs",
    icon: FolderKanban,
  },
  {
    title: "Team Management",
    description: "Manage organization members, invites, and roles",
    href: "/dashboard/team-management",
    icon: Users,
  },
  {
    title: "Reports & Submissions",
    description: "Track vulnerability reports and review status",
    href: "/dashboard/my-reports",
    icon: FileText,
  },
  {
    title: "Analytics & SLA",
    description: "Explore program performance and team velocity",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
] as const;

export function DashboardNotFound() {
  const lp = useLocalePath();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Standard Dashboard Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <Link
              href={lp("/dashboard")}
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-semibold text-foreground">404 Error</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Section Not Found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            The dashboard page or resource you were trying to access could not be found.
          </p>
        </div>

        <Link
          href={lp("/dashboard")}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "h-10 rounded-xl border-border bg-card px-4 font-semibold text-foreground shadow-xs hover:bg-muted cursor-pointer shrink-0",
          )}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Overview
        </Link>
      </header>

      {/* Main 404 Hero Container */}
      <Card className="rounded-2xl border border-border bg-card text-card-foreground shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10 overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6 ring-1 ring-amber-500/20">
            <ShieldAlert className="size-8" />
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4"
          >
            404 · Unresolved Dashboard Resource
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground max-w-xl">
            We couldn&apos;t find this dashboard section
          </h2>

          <p className="mt-3 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
            The page may have been moved, renamed, or you might not have the required
            organization permissions to view this resource.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={lp("/dashboard")}
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "h-11 rounded-xl px-5 font-semibold shadow-xs cursor-pointer",
              )}
            >
              <LayoutDashboard className="mr-2 size-4" />
              Return to Dashboard
            </Link>

            <Link
              href={lp("/dashboard/programs")}
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-11 rounded-xl border-border bg-card px-5 font-semibold text-foreground hover:bg-muted cursor-pointer",
              )}
            >
              <FolderKanban className="mr-2 size-4" />
              Browse Programs
            </Link>

            <Link
              href={lp("/dashboard/team-management")}
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-11 rounded-xl border-border bg-card px-5 font-semibold text-foreground hover:bg-muted cursor-pointer",
              )}
            >
              <Users className="mr-2 size-4" />
              Team Management
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Navigation Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Suggested Dashboard Destinations
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DASHBOARD_SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.href}
                href={lp(shortcut.href)}
                className="group block"
              >
                <Card className="h-full rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs ring-1 ring-foreground/5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-md dark:ring-foreground/10 hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors group-hover:border-blue-500/30 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-400">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-semibold text-foreground text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {shortcut.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {shortcut.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
