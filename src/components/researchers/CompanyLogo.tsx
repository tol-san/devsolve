"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetOrganizationByIdQuery } from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";

/**
 * A company as its logo, looked up by id.
 *
 * An access record names the organization but carries no logo, so the row that
 * shows one has to ask. It is a query per company rather than per row — RTK
 * Query keys on the id, so a list of ten rows across four companies makes four
 * requests, and opening one of them afterwards costs none at all.
 *
 * The initials stand in until it lands, and stay if there is no logo to load,
 * which keeps the row from shifting under the reader.
 *
 * A caller whose data already carries the logo passes `logoUrl` instead, and
 * no request is made at all.
 */
export function CompanyLogo({
  organizationId,
  name,
  logoUrl,
  className,
}: {
  organizationId: string;
  /** The name already on screen — the fallback is drawn from it. */
  name?: string | null;
  /** Skips the lookup entirely. Pass it when the payload already has one. */
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
