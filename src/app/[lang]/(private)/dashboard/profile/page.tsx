"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { UserX } from "lucide-react";
import { useGetEditProfileFormQuery } from "@/lib/redux/services/profileApi";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import CompanyProfileView from "@/components/profile/company/CompanyProfileView";
import AdminProfileView from "@/components/profile/admin/AdminProfileView";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";

export default function MyProfilePage() {
  const router = useRouter();
  const { user, areRolesResolved } = useSidebarAuth();
  const { isOwner: isCompany } = useCompanyAccess();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const { data, isError } = useGetEditProfileFormQuery(undefined, {
    skip: !areRolesResolved || isCompany || isAdmin,
  });
  const username = data?.username;

  const search = useSearchParams().toString();

  useEffect(() => {
    if (areRolesResolved && !isCompany && !isAdmin && username) {
      router.replace(
        `/dashboard/profile/${username}${search ? `?${search}` : ""}`,
      );
    }
  }, [areRolesResolved, isCompany, isAdmin, username, search, router]);

  if (!areRolesResolved) {
    return <ProfileSkeleton />;
  }

  if (isAdmin) {
    return <AdminProfileView />;
  }

  if (isCompany) {
    return <CompanyProfileView />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full pb-12"
      >
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-card p-12 text-center shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <UserX className="size-6" />
          </span>
          <h1 className="text-xl font-bold text-foreground">
            Couldn&apos;t load your profile
          </h1>
          <p className="text-base text-muted-foreground">
            Your session may have expired. Try signing in again.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Back to dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  return <ProfileSkeleton />;
}

