"use client";

import React from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ThanksNotFoundStateProps {
  message?: string;
  backHref?: string;
  backLabel?: string;
}

export function ThanksNotFoundState({
  message = "The requested program or organization could not be found.",
  backHref = "/programs",
  backLabel = "Browse Programs",
}: ThanksNotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20 mb-4">
        <AlertCircle className="size-7" />
      </div>

      <h3 className="text-xl font-bold text-foreground">
        Hall of Thanks Not Found
      </h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>

      {backHref && (
        <Link href={backHref} className="mt-6">
          <Button variant="outline" className="rounded-xl font-semibold gap-2">
            <ArrowLeft className="size-4" />
            <span>{backLabel}</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
