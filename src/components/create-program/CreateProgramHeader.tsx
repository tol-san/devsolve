"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CreateProgramHeader({ isEditing = false }: { isEditing?: boolean }) {
  const title = isEditing ? "Edit Program" : "Create New Program";

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link
            href="/dashboard/program-management"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Program Management</span>
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {isEditing
            ? "Update the scope, rules and rewards of this program for your organization."
            : "Configure and launch a new security bug bounty or vulnerability disclosure program for your organization."}
        </p>
      </div>
    </header>
  );
}
