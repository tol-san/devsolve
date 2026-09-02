"use client";

import React from "react";
import { HallOfThanksBoard } from "@/components/thanks/HallOfThanksBoard";

interface OrganizationThanksBoardProps {
  organizationId: string;
  organizationName?: string;
  className?: string;
}

export function OrganizationThanksBoard({
  organizationId,
  organizationName,
  className,
}: OrganizationThanksBoardProps) {
  return (
    <div className={className}>
      <HallOfThanksBoard
        organizationId={organizationId}
        entityName={organizationName}
        title="Organization Hall of Thanks"
        subtitle={`Recognizing security researchers who have helped protect ${organizationName || "this organization"} across all active and past security programs.`}
      />
    </div>
  );
}
