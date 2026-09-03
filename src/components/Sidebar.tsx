"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { NAV_ITEMS } from "@/config/navigation";
import { useSidebarAuth, SidebarUser } from "@/hooks/useSidebarAuth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { OrganizationSwitcher } from "@/components/teams/OrganizationSwitcher";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { useGetBookmarksQuery } from "@/lib/redux/services/bookmarksApi";
import { cn } from "@/lib/utils";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavbarSearch } from "@/components/search/NavbarSearch";

function getInitials(text: string): string {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Does this path sit under that nav href? */
/**
 * Whether this entry is the page being looked at.
 *
 * `usePathname` returns the URL as it actually is, locale and all
 * (`/km/dashboard/team-management`), while the nav entries are written without
 * one. Comparing the two directly meant no entry ever matched and nothing was
 * ever highlighted, so the target is localised first.
 *
 * The two roots are exact-match only: every dashboard path begins with
 * `/km/dashboard`, so a prefix test would light Dashboard up on every screen,
 * and `/km` would light up Home on all of them.
 */
function matches(pathname: string, target: string, isRoot: boolean): boolean {
  if (isRoot) return pathname === target;
  return pathname === target || pathname.startsWith(`${target}/`);
}

/** All the sidebar needs of an organization, and all a membership carries. */
export type SidebarOrganizationIdentity = {
  name?: string;
  slug?: string | null;
  logoUrl?: string | null;
  status?: string;
};

interface SidebarContentProps {
  pathname: string;
  user?: SidebarUser;
  isPending: boolean;
  displayName: string;
  organization?: SidebarOrganizationIdentity;
  isOrganizationLoading: boolean;
  onNavItemClick?: () => void;
  onSignOut: () => void;
  /** Desktop icon-rail mode. The toggle itself lives on the aside's edge. */
  collapsed?: boolean;
}

function SidebarContent({
  pathname,
  user,
  isPending,
  displayName,
  organization,
  isOrganizationLoading,
  onNavItemClick,
  onSignOut,
  collapsed = false,
}: SidebarContentProps) {
  const t = useT();
  /* Every entry goes through this: a locale-less href still resolves, but only
     by bouncing off the middleware redirect, which costs a round trip and
     drops client-side navigation. It is also what the active check compares
     against. */
  const lp = useLocalePath();
  const { openNotification } = useNotification();
  const { hasCompanyAccess, isOwner, canAny } = useCompanyAccess();
  const { data: bookmarksResponse } = useGetBookmarksQuery(undefined, {
    skip: !user,
  });
  const bookmarkCount = bookmarksResponse?.totalCount;

  const getOrgStatusLabel = (status?: string): string => {
    switch (status) {
      case "ACTIVE":
        return t("sidebar.status.active");
      case "PENDING":
        return t("sidebar.status.pending");
      case "REJECTED":
        return t("sidebar.status.rejected");
      case "SUSPENDED":
        return t("sidebar.status.suspended");
      default:
        return t("sidebar.status.default");
    }
  };

  const userRoles = (
    user?.roles || (user?.role ? user.role.split(",") : ["USER"])
  ).map((r) => r.trim().toUpperCase());

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    /* Owner-exclusive screens sit on endpoints that answer 404 for a member,
       so they are hidden rather than offered as a dead end. */
    if (item.ownerOnly && !isOwner) return false;

    /* The member's own view of a workspace they joined; for an owner it would
       only restate the screens they already have. */
    if (item.memberOnly && (!hasCompanyAccess || isOwner)) return false;

    /* The company workspace is decided by permissions, never by the `COMPANY`
       realm role — that role means "registered a company", so an invited
       member never has it however much access they were granted. Owners come
       back from the memberships endpoint holding all ten, so this covers them
       without a second rule. */
    if (item.permissions?.length) return canAny(item.permissions);

    if (!item.roles) return true;
    return item.roles.some((reqRole) =>
      userRoles.includes(reqRole.toUpperCase()),
    );
  })
    /* Saved drafts is listed for both audiences; an account that is a
       researcher *and* a company member matches both and would see it twice. */
    .filter(
      (item, index, items) =>
        items.findIndex((other) => other.href === item.href) === index,
    );

  /* Longest match wins, so a nested route lights up only its own entry.
     `/dashboard/profile/settings` used to highlight "My Profile" as well,
     because a plain `startsWith` can't tell a parent from the real target. */
  const activeHref = filteredNavItems
    .map((item) => item.href)
    .filter((href) =>
      matches(pathname, lp(href), href === "/" || href === "/dashboard"),
    )
    .sort((a, b) => b.length - a.length)[0];

  const categories = Array.from(
    new Set(filteredNavItems.map((item) => item.category || "Overview")),
  );

  /* Whose card is this? An owner's account IS the company, so it shows
     the organization. A member is a person who happens to belong to one:
     their own name, email and avatar belong here, and the workspace they
     were invited into is on My Team. Company *access* is a different
     question, and the nav below answers it separately. */
  const identityName = isOwner
    ? organization?.name || t("sidebar.status.default")
    : displayName;
  const identityImage = isOwner ? organization?.logoUrl : user?.image;
  const identityDetail = isOwner
    ? organization?.slug
      ? `@${organization.slug}`
      : getOrgStatusLabel(organization?.status)
    : user?.email;
  const identityStatus = isOwner
    ? getOrgStatusLabel(organization?.status)
    : undefined;
  const identityIsLoading = isPending || (isOwner && isOrganizationLoading);
  /* Organization settings belong to the owner — `/organizations/me` is an
     owner endpoint. A member's settings are their own account's. */
  const settingsHref = isOwner
    ? "/dashboard/organizations"
    : "/dashboard/profile/settings";
  const settingsLabel = isOwner
    ? t("sidebar.orgSettings")
    : t("sidebar.settings");

  return (
    /* `data-scroll-host` makes the whole sidebar the hover target for the
       nav's scrollbar below, rather than the narrow strip the bar sits in. */
    <div data-scroll-host className="flex h-full flex-col overflow-hidden">
      {/* Close control, drawer only. Desktop has no row here at all — its
          collapse toggle floats on the sidebar's edge, so the profile card
          starts flush with the top padding instead of after an empty band. */}
      {onNavItemClick && (
        <div className="mb-2 flex h-9 shrink-0 items-center justify-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={onNavItemClick}
            aria-label={t("sidebar.closeMenu")}
            className="size-9 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <X className="size-5" />
          </Button>
        </div>
      )}

      {/* Profile card — resolves the real username rather than guessing a slug */}
      <Link
        href={lp("/dashboard/profile")}
        onClick={onNavItemClick}
        title={collapsed ? identityName : undefined}
        className={cn(
          "mb-3 flex shrink-0 items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 p-3 shadow-2xs transition-colors hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:bg-neutral-900",
          collapsed && "justify-center px-0",
        )}
      >
        {identityIsLoading ? (
          <div className="flex w-full animate-pulse items-center gap-3">
            <div className="size-12 shrink-0 rounded-full bg-slate-300/60 dark:bg-neutral-700" />
            {!collapsed && (
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="h-3.5 w-20 rounded bg-slate-300/60 dark:bg-neutral-700" />
                <div className="h-2.5 w-28 rounded bg-slate-300/60 dark:bg-neutral-700" />
              </div>
            )}
          </div>
        ) : (
          <>
            <Avatar className="size-12 shrink-0 border-none rounded-full">
              {identityImage && (
                <AvatarImage
                  src={identityImage}
                  alt={isOwner ? `${identityName} logo` : ""}
                  className="rounded-full"
                />
              )}
              <AvatarFallback className="bg-blue-600 font-bold text-white rounded-full">
                {getInitials(identityName)}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className="truncate text-sm font-bold text-slate-800 dark:text-neutral-100"
                  title={identityName}
                >
                  {identityName}
                </span>
                {identityDetail && (
                  <span
                    className="truncate text-sm text-slate-500 dark:text-neutral-400"
                    title={identityDetail}
                  >
                    {identityDetail}
                  </span>
                )}
                {identityStatus && identityStatus !== identityDetail && (
                  <Badge variant="secondary" className="mt-1 max-w-full">
                    <span className="truncate">{identityStatus}</span>
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </Link>

      {/* Which organization the company screens below are showing. Renders
          nothing unless this account is on more than one. */}
      <OrganizationSwitcher collapsed={collapsed} />

      {/* Navigation */}
      <nav className="scrollbar-hover-only min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {categories.map((category, catIndex) => {
          const categoryItems = filteredNavItems.filter(
            (item) => (item.category || "Overview") === category,
          );
          const categoryKey = `sidebar.category.${category.toLowerCase()}`;
          const translatedCategory = t(categoryKey);
          const categoryLabel =
            translatedCategory === categoryKey ? category : translatedCategory;

          return (
            <div key={category} className="space-y-1">
              {catIndex > 0 && (
                <Separator className="my-2.5 bg-slate-200/60 dark:bg-neutral-800" />
              )}

              {collapsed ? (
                <div className="py-1" aria-hidden />
              ) : (
                <div className="select-none px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  {categoryLabel}
                </div>
              )}

              {categoryItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === activeHref;
                const badgeCount =
                  item.name === "Bookmarks" ? bookmarkCount : item.badge;
                const itemKey = `sidebar.nav.${item.name.toLowerCase()}`;
                const translated = t(itemKey);
                const itemLabel =
                  translated === itemKey ? item.name : translated;

                return (
                  <Link
                    key={item.name}
                    href={lp(item.href)}
                    title={collapsed ? itemLabel : undefined}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => {
                      if (item.name === "Notification") {
                        e.preventDefault();
                        openNotification();
                      }
                      onNavItemClick?.();
                    }}
                    className={cn(
                      "group relative flex h-10 w-full items-center rounded-xl px-3 text-sm font-semibold transition-colors",
                      collapsed ? "justify-center px-0" : "justify-between",
                      /* On a card surface a tint alone is easy to miss, so
                         the active row carries a ring as well as the rail. */
                      isActive
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {/* The rail is the only active cue left when labels are
                        hidden, so it lives outside the label block. */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-rail"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600 dark:bg-blue-400"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                      />
                    )}

                    <span
                      className={cn(
                        "flex min-w-0 items-center",
                        collapsed ? "gap-0" : "gap-3",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4.5 shrink-0",
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground",
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{itemLabel}</span>
                      )}
                    </span>

                    {badgeCount !== undefined &&
                      badgeCount > 0 &&
                      !collapsed && (
                        <Badge className="flex size-5 items-center justify-center rounded-full bg-blue-600 p-0 text-xs text-white hover:bg-blue-700">
                          {badgeCount}
                        </Badge>
                      )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto shrink-0 space-y-1.5 border-t border-slate-200/60 pt-3 dark:border-neutral-800">
        <Link
          href={lp(settingsHref)}
          onClick={onNavItemClick}
          title={collapsed ? settingsLabel : undefined}
          className={cn(
            "flex h-10 w-full items-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700",
            collapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>{settingsLabel}</span>}
        </Link>

        <Button
          variant="ghost"
          onClick={() => {
            onNavItemClick?.();
            onSignOut();
          }}
          title={collapsed ? t("sidebar.logout") : undefined}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center rounded-xl text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40",
            collapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>{t("sidebar.logout")}</span>}
        </Button>
      </div>
    </div>
  );
}

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, isPending, areRolesResolved, displayName, handleSignOut } =
    useSidebarAuth();

  /* Company access is a membership, not a realm role: `COMPANY` is granted for
     registering a company, so an invited member never carries it. The
     membership row also carries the identity this card needs — `/organizations/me`
     is owner-only and answers 404 for a member. */
  const { membership, isLoading: isMembershipLoading } = useCompanyAccess();

  const organization: SidebarOrganizationIdentity | undefined = membership
    ? {
        name: membership.organizationName,
        slug: membership.organizationSlug,
        logoUrl: membership.organizationLogoUrl,
        status: membership.organizationStatus,
      }
    : undefined;

  const isCompanyIdentityLoading = !areRolesResolved || isMembershipLoading;
  const isSidebarIdentityPending =
    isPending || (Boolean(user) && !areRolesResolved);

  /* Escape closes the drawer, and the page behind it stops scrolling while it
     is open — a drawer you can scroll past is a drawer that feels broken. */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /* Back/forward navigation doesn't run a nav item's onClick, so the drawer
     would otherwise stay open over the new page. Adjusted during render
     against the previous path rather than in an effect. */
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setIsOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-xl lg:hidden dark:bg-card/85">
        <Link
          href="/dashboard"
          aria-label="DevSolve dashboard"
          className="flex items-center shrink-0"
        >
          <BrandLogo priority className="h-9 w-32 sm:h-10 sm:w-36" sizes="(max-width: 640px) 128px, 144px" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <NavbarSearch variant="icon" />
          <LanguageSwitcher />
          <NotificationTrigger />
          <ThemeToggle
            variant="rectangle"
            start="bottom-up"
            className="size-9 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-colors hover:bg-muted cursor-pointer"
            iconClassName="size-4.5 sm:size-5"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            className="size-9 sm:size-10 cursor-pointer rounded-xl text-foreground hover:bg-muted"
          >
            <Menu className="size-5 sm:size-6" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 cursor-default bg-slate-900/40 backdrop-blur-xs lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex h-full w-70 flex-col overflow-hidden border-r border-border bg-card p-4 shadow-2xl backdrop-blur-xl lg:hidden dark:bg-card/95"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                isPending={isSidebarIdentityPending}
                displayName={displayName}
                organization={organization}
                isOrganizationLoading={isCompanyIdentityLoading}
                onNavItemClick={() => setIsOpen(false)}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop — collapses to an icon rail.
          `overflow-visible` so the edge toggle can sit half outside; the
          content wrapper inside does its own clipping during the animation. */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        /* The navbar's surface: opaque in light, translucent and blurred in
           dark, so the page backdrop reads through it without washing the nav
           out. It sat on the bare backdrop before, which left the grid paper
           running straight under the labels. */
        className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col overflow-visible border-r border-border bg-card p-4 backdrop-blur-xl lg:flex dark:bg-card/85"
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          isPending={isSidebarIdentityPending}
          displayName={displayName}
          organization={organization}
          isOrganizationLoading={isCompanyIdentityLoading}
          onSignOut={handleSignOut}
          collapsed={collapsed}
        />

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 flex size-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-300"
        >
          {collapsed ? (
            <ChevronsRight className="size-3.5" />
          ) : (
            <ChevronsLeft className="size-3.5" />
          )}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
