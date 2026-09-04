"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  FileText,
  Globe,
  PanelsTopLeft,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useGetEditProfileFormQuery } from "@/lib/redux/services/profileApi";
import { useGetAdminOverviewQuery } from "@/lib/redux/services/admin/adminOverviewApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProfileEditPanel from "@/components/profile/edit/ProfileEditPanel";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";

function initialsOf(name?: string) {
  if (!name) return "AD";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AD"
  );
}

export function AdminProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 animate-pulse"
    >
      <div className="h-20 rounded-2xl bg-muted" />
      <div className="h-48 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
    </motion.div>
  );
}

export default function AdminProfileView() {
  const { user } = useSidebarAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch admin personal profile info
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetEditProfileFormQuery();

  // Fetch system overview statistics
  const {
    data: overview,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetAdminOverviewQuery();

  if (isProfileLoading || isOverviewLoading) {
    return <AdminProfileSkeleton />;
  }

  const displayName = profile?.fullName || user?.name || "Platform Admin";
  const avatarUrl = profile?.avatarUrl || user?.image || undefined;
  const location = profile?.location || "Global Administrator";

  /* Edit mode — render ProfileEditPanel */
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
          >
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer transition-colors hover:text-foreground"
            >
              Admin Profile
            </button>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-foreground font-semibold">Edit Profile</span>
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Close
          </Button>
        </div>

        <ProfileEditPanel
          onDone={() => {
            setIsEditing(false);
            refetchProfile();
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">
              Admin Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Administrator Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your administrator credentials and review system overview metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOverview()}
            disabled={isOverviewFetching}
            className="h-9 gap-2 rounded-xl border-border bg-card text-foreground text-xs font-semibold hover:bg-accent"
          >
            <RefreshCw
              className={`size-3.5 ${isOverviewFetching ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh Data</span>
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            className="h-9 gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
          >
            <Edit3 className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </header>

      {/* Admin Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="size-20 sm:size-24 rounded-2xl border-2 border-background shadow-md">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
                {initialsOf(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {displayName}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pt-1">
                <Globe className="size-3.5 text-muted-foreground" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {profile?.bio && (
          <div className="relative z-10 mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground italic">
              &quot;{profile.bio}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Streamlined Stats Summary (3 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 py-5 px-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              Total Users
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {overview?.users?.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              {overview?.users?.active ?? 0} Active
            </span>
          </div>
        </Card>

        <Card className="gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 py-5 px-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              Organizations
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {overview?.organizations?.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-amber-500">
              {overview?.organizations?.pendingReview ?? 0} Pending
            </span>
          </div>
        </Card>

        <Card className="gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 py-5 px-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              Vulnerability Reports
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {overview?.reports?.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-amber-500">
              {overview?.reports?.open ?? 0} Open
            </span>
          </div>
        </Card>
      </div>

      {/* Administrative Modules Shortcuts */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          Administrative Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/company-verification"
            className="group flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40 hover:bg-accent/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
                <UserCheck className="size-4" />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Company Verification
              </span>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/program-management?scope=admin"
            className="group flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40 hover:bg-accent/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
                <Building2 className="size-4" />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Program Approvals
              </span>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/users"
            className="group flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40 hover:bg-accent/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
                <Users className="size-4" />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                User Management
              </span>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/content-moderation"
            className="group flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40 hover:bg-accent/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
                <PanelsTopLeft className="size-4" />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Content Moderation
              </span>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
