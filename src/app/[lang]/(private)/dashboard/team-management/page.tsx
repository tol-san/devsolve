"use client";

import { motion } from "motion/react";

import { TeamsMembersSection } from "@/components/teams/TeamsMembersSection";
import { TeamsPageHeader } from "@/components/teams/TeamsPageHeader";
import { TeamsStatsGrid } from "@/components/teams/TeamsStatsGrid";
import {
  pageEnterContainer,
  pageEnterItem,
} from "@/components/ui/page-enter-motion";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export default function TeamsPage() {
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

      {/* The shape of the team before the list of it: how many, how many are
          still only invited, and how the ranks are split. */}
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
