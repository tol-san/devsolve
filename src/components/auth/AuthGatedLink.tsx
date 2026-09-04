"use client";

import React from "react";
import Link from "next/link";

import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";
import { useAuthGate } from "@/hooks/useAuthGate";

interface AuthGatedLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  href: string;
  promptTitle?: string;
  promptDescription?: string;
}

export function AuthGatedLink({
  href,
  promptTitle,
  promptDescription,
  onClick,
  children,
  ...props
}: AuthGatedLinkProps) {
  const { pendingHref, guard, dismiss } = useAuthGate();

  return (
    <>
      <Link
        href={href}
        onClick={(event) => {
          onClick?.(event);
          guard(event, href);
        }}
        {...props}
      >
        {children}
      </Link>

      <LoginRequiredDialog
        open={pendingHref !== null}
        onOpenChange={(open) => {
          if (!open) {
            dismiss();
          }
        }}
        redirectTo={pendingHref ?? href}
        title={promptTitle}
        description={promptDescription}
      />
    </>
  );
}
