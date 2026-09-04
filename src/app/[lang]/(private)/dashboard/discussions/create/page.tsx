"use client";

import React from "react";
import { motion } from "motion/react";
import { CreatePostSelection } from "@/components/discussions/create/CreatePostSelection";

export default function DashboardCreatePostSelectionPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="-m-6 md:-m-8"
    >
      <CreatePostSelection
        basePath="/dashboard/discussions/create"
        backHref="/dashboard/discussions"
        backLabel="Back to your posts"
        className="min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100dvh-4rem)]"
      />
    </motion.div>
  );
}
