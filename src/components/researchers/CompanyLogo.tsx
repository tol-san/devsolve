"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

export function CompanyLogo({
  organizationId,
  name,
  logoUrl,
  className,
}: {
  organizationId: string;
  name?: string | null;
  logoUrl?: string | null;
  className?: string;
}) {
  const { data: organization } = useGetOrganizationByIdQuery(organizationId, {
    skip: !organizationId || logoUrl !== undefined,
  });

  const label = organization?.name?.trim() || name?.trim() || "";
  const src = logoUrl !== undefined ? logoUrl : organization?.logoUrl;

  return (
    <Avatar
      className={cn("size-10 shrink-0 rounded-xl", className)}
      aria-label={label || undefined}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={label ? `${label} logo` : ""}
          className="rounded-[inherit] object-cover"
        />
      )}
      <AvatarFallback className="rounded-[inherit] bg-muted text-sm font-bold text-muted-foreground">
        {initialsOf(label)}
      </AvatarFallback>
    </Avatar>
  );
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CO"
  );
}

export default CompanyLogo;
