"use client";

import React, { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { CreateShowcaseForm } from "@/components/showcases/create/CreateShowcaseForm";

export default function EditShowcasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500"
          >
            <Link
              href="/dashboard/my-community"
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
            >
              My Community
            </Link>
            <ChevronRight className="size-3.5 text-slate-300 dark:text-slate-700" />
            <span className="text-slate-900 dark:text-slate-200">
              Edit showcase
            </span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Edit showcase
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Change the project, the links, or any step of the build guide.
          </p>
        </div>
      </header>

      <CreateShowcaseForm
        showcaseId={id}
        successHref="/dashboard/my-community"
        cancelHref="/dashboard/my-community"
      />
    </motion.div>
  );
}
