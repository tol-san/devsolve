"use client";

import React from "react";
import { HeartHandshake } from "lucide-react";

interface ThanksEmptyStateProps {
  entityName?: string;
  isOrganization?: boolean;
}

export function ThanksEmptyState({
  entityName,
  isOrganization = false,
}: ThanksEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 mb-4">
        <HeartHandshake className="size-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-foreground">
        No Researchers Thanked Yet
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        {entityName
          ? `${entityName} has not awarded any public thank-you recognitions yet.`
          : isOrganization
            ? "This organization has not awarded any public thank-you recognitions yet."
            : "This program has not awarded any public thank-you recognitions yet."}{" "}
        As valid security findings are triaged and accepted, credited researchers will be honored here.
      </p>
    </div>
  );
}
