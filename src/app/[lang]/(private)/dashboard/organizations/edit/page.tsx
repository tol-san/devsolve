"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Building2, ChevronRight, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrgEditPanel from "@/components/organizations/edit/OrgEditPanel";
import { useGetMyOrganizationQuery } from "@/lib/redux/services/organizationsApi";

export default function EditMyOrganizationPage() {
  const {
    data: organization,
    isLoading,
    isError,
    refetch,
  } = useGetMyOrganizationQuery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Home className="size-3.5" /> Dashboard
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            <Link
              href="/dashboard/organizations"
              className="transition-colors hover:text-foreground"
            >
              Organization
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            <span className="text-foreground">
              Edit details
            </span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Edit organization
          </h1>
          <p className="text-base text-muted-foreground">
            Researchers browsing your programs see this — keep it current.
          </p>
        </div>
      </header>

      {isLoading ? (
        <FormSkeleton />
      ) : isError || !organization ? (
        <Card className="border-border bg-card px-6 py-12 text-center shadow-sm">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="size-8" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              No organization to edit
            </CardTitle>
            <CardDescription className="mx-auto max-w-md text-base text-muted-foreground">
              We couldn&apos;t load your organization. You may not be associated
              with one, or the connection dropped.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => void refetch()}
              className="gap-2 border-border"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Link
              href="/dashboard/organizations"
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Back to organization
            </Link>
          </CardContent>
        </Card>
      ) : (
        <OrgEditPanel organization={organization} />
      )}
    </motion.div>
  );
}

function FormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your organization"
      className="animate-pulse space-y-6"
    >
      <span className="sr-only">Loading your organization…</span>
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="h-6 w-56 rounded-lg bg-muted" />
        <div className="h-11 rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="h-11 rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="h-28 rounded-xl bg-muted" />
      </div>
      <div className="h-20 rounded-2xl bg-muted" />
    </div>
  );
}
