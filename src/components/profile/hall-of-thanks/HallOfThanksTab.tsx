"use client";

import React from "react";
import type { UserRecognitionItem } from "@/lib/types/thanks/types";
import ThanksCard from "./ThanksCard";
import { HeartHandshake } from "lucide-react";

interface HallOfThanksTabProps {
  recognitions?: UserRecognitionItem[];
}

export default function HallOfThanksTab({
  recognitions = [],
}: HallOfThanksTabProps) {
  if (recognitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 mb-3.5">
          <HeartHandshake className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          No Thank-You Recognitions Yet
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Security programs you&apos;ve helped protect will appear here once your reported vulnerabilities are resolved and credited.
        </p>
      </div>
    );
  }

  return (


    <div className="space-y-3.5">
      {recognitions.map((recognition) => (
        <ThanksCard key={recognition.id} recognition={recognition} />
      ))}
    </div>
  );
}
