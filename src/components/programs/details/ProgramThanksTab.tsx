"use client";

import React from "react";
import { HallOfThanksBoard } from "@/components/thanks/HallOfThanksBoard";

interface ProgramThanksTabProps {
  programId: string;
  programName?: string;
}

export function ProgramThanksTab({
  programId,
  programName,
}: ProgramThanksTabProps) {
  return (
    <div className="w-full">
      <HallOfThanksBoard
        programId={programId}
        entityName={programName}
        title="Program Hall of Thanks"
        subtitle={`Honoring the security researchers who have discovered and responsibly reported valid security vulnerabilities to ${programName || "this program"}.`}
      />
    </div>
  );
}
