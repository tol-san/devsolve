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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { useGetBookmarksQuery } from "@/lib/redux/services/bookmarksApi";
import {
  type Organization,
  useGetMyOrganizationQuery,
} from "@/lib/redux/services/organizationsApi";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function getInitials(text: string): string {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function organizationStatusLabel(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "Verified company";
    case "PENDING":
      return "Under review";
    case "REJECTED":
      return "Verification rejected";
    case "SUSPENDED":
      return "Company suspended";
    default:
      return "Company workspace";
  }
}

/** Does this path sit under that nav href? */
function matches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarContentProps {
  pathname: string;
  user?: SidebarUser;
  isPending: boolean;
  displayName: string;
  organization?: Organization;
  isCompany: boolean;
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
  isCompany,
  isOrganizationLoading,
  onNavItemClick,
  onSignOut,
  collapsed = false,
}: SidebarContentProps) {
  const t = useT();
  const { openNotification } = useNotification();
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
    if (!item.roles) return true;
    return item.roles.some((reqRole) => userRoles.includes(reqRole.toUpperCase()));
  });

  /* Longest match wins, so a nested route lights up only its own entry.
     `/dashboard/profile/settings` used to highlight "My Profile" as well,
     because a plain `startsWith` can't tell a parent from the real target. */
  const activeHref = filteredNavItems
    .map((item) => item.href)
    .filter((href) => matches(pathname, href))
    .sort((a, b) => b.length - a.length)[0];

  const categories = Array.from(
    new Set(filteredNavItems.map((item) => item.category || "Overview")),
  );

  const identityName = isCompany
    ? organization?.name || t("sidebar.status.default")
    : displayName;
  const identityImage = isCompany ? organization?.logoUrl : user?.image;
  const identityDetail = isCompany
    ? organization?.slug
      ? `@${organization.slug}`
      : organization?.domain || getOrgStatusLabel(organization?.status)
    : user?.email;
  const identityStatus = isCompany
    ? getOrgStatusLabel(organization?.status)
    : undefined;
  const identityIsLoading =
    isPending || (isCompany && isOrganizationLoading);
  const settingsHref = isCompany
    ? "/dashboard/organizations"
    : "/dashboard/profile/settings";
  const settingsLabel = isCompany ? t("sidebar.orgSettings") : t("sidebar.settings");

  return (
    /* `data-scroll-host` makes the whole sidebar the hover target for the
       nav's scrollbar below, rather than the narrow strip the bar sits in. */
    <div data-scroll-host className="flex h-full flex-col overflow-hidden">
      {/* Brand. The drawer shares this row with its close control; the
          desktop rail gives it a row of its own, and swaps the lockup for the
          circular badge once the rail is too narrow to hold a wordmark. */}
      <div
        className={cn(
          "mb-3 flex h-10 shrink-0 items-center",
          onNavItemClick
            ? "justify-between"
            : collapsed
              ? "justify-center"
              : "justify-start",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavItemClick}
          aria-label="DevSolve dashboard"
          className="flex items-center"
        >
          <BrandLogo
            variant={collapsed && !onNavItemClick ? "badge" : "lockup"}
            className={
              collapsed && !onNavItemClick ? "size-10" : "h-10 w-38"
            }
            sizes={collapsed && !onNavItemClick ? "40px" : "152px"}
          />
        </Link>

        {onNavItemClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onNavItemClick}
            aria-label={t("sidebar.closeMenu")}
            className="size-9 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Profile card — resolves the real username rather than guessing a slug */}
      <Link
        href="/dashboard/profile"
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
            {/* Bigger than the 40px it was: for a company account this is
                their own mark, and the card has the room. */}
            <Avatar className="size-12 shrink-0 border-none rounded-full">
              {identityImage && (
                <AvatarImage
                  src={identityImage}
                  alt={isCompany ? `${identityName} logo` : ""}
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

      {/* Navigation */}
      <nav className="scrollbar-hover-only min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {categories.map((category, catIndex) => {
          const categoryItems = filteredNavItems.filter(
            (item) => (item.category || "Overview") === category,
          );
          const categoryLabel = t(`sidebar.category.${category.toLowerCase()}`);

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
                const itemLabel = t(`sidebar.nav.${item.name.toLowerCase()}`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
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
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    )}
                  >
                    {/* The rail is the only active cue left when labels are
                        hidden, so it lives outside the label block. */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-rail"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600 dark:bg-blue-400"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
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
                            : "text-slate-400 dark:text-neutral-500",
                        )}
                      />
                      {!collapsed && <span className="truncate">{itemLabel}</span>}
                    </span>

                    {badgeCount !== undefined && badgeCount > 0 && !collapsed && (
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
          href={settingsHref}
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
  const {
    user,
    isPending,
    areRolesResolved,
    displayName,
    handleSignOut,
  } = useSidebarAuth();
  const isCompany = user?.roles?.includes("COMPANY") ?? false;
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    isFetching: isOrganizationFetching,
  } = useGetMyOrganizationQuery(undefined, {
    skip: !areRolesResolved || !isCompany,
  });
  const isCompanyIdentityLoading =
    !areRolesResolved || isOrganizationLoading || isOrganizationFetching;
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
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-900/90">
        {/* The lockup already says "DevSolve", so the word is not repeated
            beside it. It also replaces `/logo-1.png`, which is not a file that
            exists — the header has been rendering a broken image, and a broken
            image has no dark variant to get wrong. */}
        <Link
          href="/dashboard"
          aria-label="DevSolve dashboard"
          className="flex items-center"
        >
          <BrandLogo priority className="h-10 w-36" sizes="144px" />
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationTrigger />
          <ThemeToggle
            variant="rectangle"
            start="bottom-up"
            className="size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            iconClassName="size-5"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            className="cursor-pointer rounded-xl text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Menu className="size-6" />
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
              className="fixed inset-y-0 left-0 z-50 flex h-full w-70 flex-col overflow-hidden border-r border-slate-200 bg-white p-4 shadow-2xl lg:hidden dark:border-neutral-800 dark:bg-neutral-950"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                isPending={isSidebarIdentityPending}
                displayName={displayName}
                organization={organization}
                isCompany={isCompany}
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
        className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col overflow-visible border-r border-slate-200/80 p-4 lg:flex dark:border-neutral-800"
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          isPending={isSidebarIdentityPending}
          displayName={displayName}
          organization={organization}
          isCompany={isCompany}
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
