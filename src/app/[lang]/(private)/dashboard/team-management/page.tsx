"use client";

import { Suspense } from "react";
import { motion } from "motion/react";

import { TeamsMembersSection } from "@/components/teams/TeamsMembersSection";
import { TeamsPageHeader } from "@/components/teams/TeamsPageHeader";
import { TeamsStatsGrid } from "@/components/teams/TeamsStatsGrid";
import {
  pageEnterContainer,
  pageEnterItem,
} from "@/components/ui/page-enter-motion";
import { useTeamMembers } from "@/hooks/useTeamMembers";

function TeamsPageContent() {
  const {
    counts,
    filteredMembers,
    isError,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
  } = useTeamMembers();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={pageEnterContainer}
      className="w-full space-y-7 pb-12"
    >
      <motion.div variants={pageEnterItem}>
        <TeamsPageHeader />
      </motion.div>

      <motion.div variants={pageEnterItem}>
        <TeamsStatsGrid counts={counts} />
      </motion.div>

      <motion.div variants={pageEnterItem}>
        <TeamsMembersSection
          counts={counts}
          filteredMembers={filteredMembers}
          isError={isError}
          isLoading={isLoading}
          onRetry={refetch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </motion.div>
    </motion.section>
  );
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-7 pb-12 animate-pulse">
          <div className="h-10 w-48 rounded-xl bg-muted/60" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/50" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-muted/40" />
        </div>
      }
    >
      <TeamsPageContent />
    </Suspense>
  );
}

