"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/I18nProvider";
import { motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SidebarUser } from "@/hooks/useSidebarAuth";
import { cn } from "@/lib/utils";

function getInitials(text: string): string {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface NavbarUserMenuProps {
  /** Sign-in handler, used only while signed out. */
  onLogin: () => void;
  isLoggingIn: boolean;
  user?: SidebarUser;
  identity: NavbarIdentity;
  isIdentityPending: boolean;
  onSignOut: () => void;
}

export interface NavbarIdentity {
  isCompany: boolean;
  name: string;
  detail?: string;
  status?: string;
  image?: string | null;
  profileHref: string;
  profileLabel: string;
  settingsHref: string;
  settingsLabel: string;
}

/**
 * The right-hand end of the public navbar.
 *
 * Signed out it offers Log in / Get Started; signed in it shows the account,
 * which is what the rest of the app already assumed. Previously the public
 * pages had no idea a session existed, so a signed-in reader was still being
 * asked to log in on every page outside /dashboard.
 */
export function NavbarUserMenu({
  onLogin,
  isLoggingIn,
  user,
  identity,
  isIdentityPending,
  onSignOut,
}: NavbarUserMenuProps) {
  const t = useT();
  if (isIdentityPending) {
    return (
      <div
        aria-hidden
        className="hidden h-10 w-10 animate-pulse rounded-full bg-muted sm:block"
      />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={onLogin}
          disabled={isLoggingIn}
          className="hidden h-9 xl:h-10 rounded-lg border-border bg-card px-3 xl:px-4 text-xs xl:text-sm font-semibold text-foreground shadow-xs transition-all hover:border-blue-400 hover:bg-muted disabled:cursor-not-allowed md:inline-flex"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="size-3.5 xl:size-4 animate-spin" />
              {t("nav.connecting")}
            </>
          ) : (
            t("nav.login")
          )}
        </Button>

        <motion.div whileTap={{ scale: 0.98 }} className="hidden sm:block">
          <Button
            nativeButton={false}
            render={<Link href="/account-type" />}
            className="group h-9 xl:h-10 rounded-lg bg-primary px-3 xl:px-4 text-xs xl:text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-blue-700"
          >
            {t("nav.getStarted")}
            <ArrowRight className="hidden size-4 transition-transform duration-200 group-hover:translate-x-1 xl:block" />
          </Button>
        </motion.div>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={identity.isCompany ? "Organization menu" : "Account menu"}
            className={cn(
              "hidden cursor-pointer items-center gap-2 rounded-full border border-border bg-card p-1 pr-2 shadow-xs transition-colors hover:border-blue-400 hover:bg-muted sm:inline-flex"
            )}
          />
        }
      >
        <Avatar className="size-8 shrink-0 rounded-full">
          {identity.image && (
            <AvatarImage
              src={identity.image}
              alt={identity.isCompany ? `${identity.name} logo` : ""}
              className="rounded-full"
            />
          )}
          <AvatarFallback className="bg-blue-600 text-xs font-bold text-white rounded-full">
            {getInitials(identity.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border-border bg-card p-1.5"
      >
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-bold text-foreground">
            {identity.name}
          </p>
          {identity.detail && (
            <p className="truncate text-sm text-muted-foreground">
              {identity.detail}
            </p>
          )}
          {identity.status && identity.status !== identity.detail && (
            <Badge variant="secondary" className="mt-2 max-w-full rounded-lg">
              <span className="truncate">{identity.status}</span>
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href={identity.profileHref} />}
            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium"
          >
            {identity.isCompany ? (
              <Building2 className="size-4 text-muted-foreground" />
            ) : (
              <UserRound className="size-4 text-muted-foreground" />
            )}
            {identity.profileLabel}
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/dashboard" />}
            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium"
          >
            <LayoutDashboard className="size-4 text-muted-foreground" />
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href={identity.settingsHref} />}
            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium"
          >
            <Settings className="size-4 text-muted-foreground" />
            {identity.settingsLabel}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onSignOut}
            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavbarUserMenu;
