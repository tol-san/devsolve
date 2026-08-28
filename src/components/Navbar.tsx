"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ThemeToggle, useThemeToggle } from "@/components/motion/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  NavbarUserMenu,
  type NavbarIdentity,
} from "@/components/navbar/NavbarUserMenu";
import { NotificationProvider } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { authClient } from "@/lib/auth/auth-client";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  description?: string;
  icon?: "problem" | "showcase" | "hacktivity";
  /** Catalogue key — `name` remains the stable identity and fallback. */
  tKey?: string;
};

type NavLink = {
  name: string;
  href?: string;
  items?: NavItem[];
  /**
   * Dropped from the bar once there is a session — an introduction to the
   * platform is for people deciding whether to join, not for members who
   * already have.
   */
  guestOnly?: boolean;
  /** Catalogue key — `name` remains the stable identity and fallback. */
  tKey?: string;
};

const navLinks: NavLink[] = [
  { name: "Home",
    tKey: "nav.home", href: "/" },
  { name: "Programs",
    tKey: "nav.programs", href: "/programs" },
  {
    name: "Community",
    tKey: "nav.community",
    href: "/community",
    items: [
      {
        name: "Hacktivity",
    tKey: "nav.hacktivity",
        href: "/hacktivity",
        description: "Real-time security activity feed and disclosures.",
        icon: "hacktivity",
      },
      {
        name: "Problem",
    tKey: "nav.problem",
        href: "/problems",
        description: "Post bugs, blockers, and security questions.",
        icon: "problem",
      },
      {
        name: "Showcase",
    tKey: "nav.showcase",
        href: "/showcases",
        description: "Share product wins, demos, and build highlights.",
        icon: "showcase",
      },
    ],
  },
  { name: "Leaderboard",
    tKey: "nav.leaderboard", href: "/leaderboard" },
  { name: "About",
    tKey: "nav.about", href: "/about", guestOnly: true },
];

// Scrolling down only retracts the island once the reader is past this much of
// the page, so a short flick near the top never makes the nav flicker away.
const HIDE_AFTER = 160;

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

function isHrefActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavLinkActive(pathname: string, link: NavLink) {
  if (link.href) {
    return isHrefActive(pathname, link.href);
  }

  return link.items?.some((item) => isHrefActive(pathname, item.href)) ?? false;
}

function CommunityMenuIcon({ icon }: { icon?: NavItem["icon"] }) {
  if (icon === "showcase") {
    return <Trophy className="size-4.5" />;
  }
  if (icon === "hacktivity") {
    return <Flame className="size-4.5" />;
  }

  return <Lightbulb className="size-4.5" />;
}

const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const reduce = useReducedMotion();
  // Read here as well as in the menu so the mobile panel's footer can swap
  // between account actions and the signed-out calls to action.
  const {
    user: sessionUser,
    isPending: isSessionPending,
    areRolesResolved,
    displayName,
    handleSignOut,
  } = useSidebarAuth();
  /* The session resolves on the client, so the guest-only links render on the
     first pass and drop out once a session is known — the same beat on which
     the sign-in buttons become the account menu. */
  const visibleNavLinks = useMemo(
    () => navLinks.filter((link) => !(link.guestOnly && sessionUser)),
    [sessionUser],
  );
  /* Company access is a membership, not the `COMPANY` realm role — that role
     is granted for registering a company, so an invited member never carries
     it. The membership also carries the identity shown here; `/organizations/me`
     is owner-only and answers 404 for a member. */
  const {
    isOwner,
    membership,
    isLoading: isMembershipLoading,
  } = useCompanyAccess();

  const organizationStatus = isOwner
    ? organizationStatusLabel(membership?.organizationStatus)
    : undefined;
  /* Only an owner's account is the organization. A member signs in as
     themselves and belongs to one, so the menu shows them. */
  const navbarIdentity: NavbarIdentity = isOwner
    ? {
      isCompany: true,
      name: membership?.organizationName || "Company workspace",
      detail: membership?.organizationSlug
        ? `@${membership.organizationSlug}`
        : organizationStatus,
      status: organizationStatus,
      image: membership?.organizationLogoUrl ?? undefined,
      profileHref: "/dashboard/profile",
      profileLabel: "Organization profile",
      settingsHref: "/dashboard/organizations",
      settingsLabel: "Organization settings",
    }
    : {
      isCompany: false,
      name: displayName,
      detail: sessionUser?.email || undefined,
      image: sessionUser?.image,
      profileHref: "/dashboard/profile",
      profileLabel: "My profile",
      settingsHref: "/dashboard/profile/settings",
      settingsLabel: "Settings",
    };
  const isNavbarIdentityPending =
    isSessionPending ||
    (Boolean(sessionUser) && !areRolesResolved) ||
    isMembershipLoading;
  // Anything inside this is "the menu"; a press anywhere else dismisses it.
  const headerRef = useRef<HTMLElement>(null);

  const closeAllMenus = () => {
    setCommunityMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);
  };
  const t = useT();
  /* Every internal href goes through this: a bare path would still work, but
     only by bouncing through the proxy redirect, which costs a round trip and
     drops client-side navigation. */
  const lp = useLocalePath();
  const { isDark, mounted, toggle } = useThemeToggle({
    variant: "rectangle",
    start: "bottom-up",
  });
  /* One artwork in both themes — see `BrandLogo` for why, and for the
     contrast trade it accepts. */
  const logoSrc = "/devsolve-logo.png";

  // The header is a fixed island with no backdrop band, so it always overlaps
  // page content. To keep the screen clear it retracts while the reader moves
  // down the page and springs back the moment they scroll up.
  /* Re-armed on every navigation rather than installed once, so each page
     starts measuring from where it opens. Sharing one listener across pages
     meant the first reading on a new page was compared against the last offset
     of the old one, and that difference is not a movement the reader made. */
  useEffect(() => {
    let previousY: number | null = null;
    let frame = 0;

    const update = () => {
      frame = 0;

      const currentY = window.scrollY;

      setScrolled(currentY > 4);

      // The first reading of a page establishes the baseline, nothing more.
      if (previousY === null) {
        previousY = currentY;
        return;
      }

      const delta = currentY - previousY;
      previousY = currentY;

      // Ignore sub-pixel jitter and rubber-band overscroll, and never retract
      // over the first screenful — the island should be there on arrival.
      if (Math.abs(delta) > 4 && currentY > 0) {
        setHidden(delta > 0 && currentY > HIDE_AFTER);
      }
    };

    const handleScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [pathname]);

  // An open menu must never be dragged off-screen with the island. Derived
  // rather than pushed back into `hidden` from an effect — that spent a whole
  // extra render on something the render already knows.
  const isRetracted = hidden && !mobileMenuOpen && !communityMenuOpen;

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResetLoading = () => {
      setIsLoggingIn(false);
    };

    window.addEventListener("pageshow", handleResetLoading);
    window.addEventListener("focus", handleResetLoading);

    return () => {
      window.removeEventListener("pageshow", handleResetLoading);
      window.removeEventListener("focus", handleResetLoading);
    };
  }, []);

  // Hover intent: the panel hangs a few pixels below the trigger, so an
  // instant close would drop the menu while the pointer crosses the gap.
  const communityCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const openCommunityMenu = () => {
    if (communityCloseTimer.current) {
      clearTimeout(communityCloseTimer.current);
      communityCloseTimer.current = null;
    }

    setCommunityMenuOpen(true);
  };

  const closeCommunityMenu = (delay = 0) => {
    if (communityCloseTimer.current) {
      clearTimeout(communityCloseTimer.current);
    }

    communityCloseTimer.current = setTimeout(
      () => setCommunityMenuOpen(false),
      delay,
    );
  };

  useEffect(
    () => () => {
      if (communityCloseTimer.current) {
        clearTimeout(communityCloseTimer.current);
      }
    },
    [],
  );

  // Navigating away should never leave a menu hanging over the new page.
  // Adjusted during render against the previous path rather than in an effect:
  // React re-runs this pass before committing, so the new page never paints
  // with the old menu open. Covers back/forward too, which the links' own
  // onClick handlers cannot.
  const [renderedPath, setRenderedPath] = useState(pathname);

  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setCommunityMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);

    /* The island retracts on the way down a page and is released by scrolling
       back up — but a new page opens at the top, where there is no up. Carrying
       the retracted state across a navigation is how the header went missing:
       the reader arrives, finds no navigation, and nothing they can do at the
       top of the page brings it back. Opening the mobile menu made it worse,
       since the menu forces the island visible and closing it on navigate let
       the stale state snap it away again. */
    setHidden(false);
  }

  // An open panel covers the page, so the page must not scroll underneath it —
  // otherwise the reader drags the content they were about to navigate to out
  // from behind the menu. Padding replaces the scrollbar's width so locking
  // does not shift the layout sideways.
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [mobileMenuOpen]);

  // Crossing into the desktop layout hides the panel via `lg:hidden` but leaves
  // it open in state, so narrowing again would flash it back. Closing on the
  // breakpoint change keeps the two in step.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileMenuOpen(false);
        setMobileCommunityOpen(false);
      }
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  /**
   * Dismissal, for whichever menu is open. Previously only the desktop flyout
   * answered Escape, and nothing answered a press outside — so on a phone the
   * panel could only be closed by finding the hamburger again, and on a touch
   * screen the flyout had no way out at all (there is no `mouseleave` to
   * close it).
   */
  useEffect(() => {
    if (!mobileMenuOpen && !communityMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllMenus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      // A press on the island itself is the trigger doing its own job.
      if (headerRef.current?.contains(event.target as Node)) {
        return;
      }
      closeAllMenus();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileMenuOpen, communityMenuOpen]);

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: "/",
        disableRedirect: true,
      });

      if (result?.error) {
        console.error("[Auth] Keycloak sign-in failed:", result.error);
        setIsLoggingIn(false);
        return;
      }

      if (!result?.data?.url) {
        console.error("[Auth] No redirect URL returned:", result);
        setIsLoggingIn(false);
        return;
      }

      window.location.assign(result.data.url);
    } catch (error) {
      console.error("[Auth] Keycloak sign-in error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <NotificationProvider enableStream={Boolean(sessionUser)}>
      {/* Fixed and out of flow: no full-width band, just the island floating
          over the page. `--navbar-height` reserves room for it in the layout. */}
      <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      /* Retracting on scroll is motion for its own sake — with reduced motion
         the island simply stays put. */
      animate={
        isRetracted && !reduce
          ? { y: "-115%", opacity: 0 }
          : { y: 0, opacity: 1 }
      }
      transition={
        reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 380, damping: 34, mass: 0.9 }
      }
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[100] w-full"
    >
      {/* `isolate` keeps the z-indexes below scoped to the header. */}
      <div className="pointer-events-none isolate">
        {/* Scrim under the open mobile panel. It makes "tap anywhere to close"
            visible rather than something you have to guess at, and it stops
            taps landing on the page behind.

            Being first in the tree is not enough to put it underneath: it is
            positioned, so it paints in the positioned pass, above any static
            sibling no matter what the tree order is. The island escaped that
            only by accident — `backdrop-blur-xl` makes it a stacking context,
            which promotes it into the same pass — while the panel, which has
            neither, was left painting below the scrim and swallowing every
            tap. The layering is spelled out with z-index instead. */}
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onClick={closeAllMenus}
              /* Sized from the top-left of the header rather than with
                 `inset-0`: the header carries a transform while it animates,
                 which makes it the containing block for `fixed` children, and
                 `inset-0` would then shrink the scrim to the header's own box
                 instead of the viewport. The header already sits at the top
                 edge and spans the full width, so this covers the screen
                 whether or not that transform is present. */
              className="pointer-events-auto fixed left-0 top-0 z-0 h-dvh w-full cursor-default bg-slate-950/25 backdrop-blur-[2px] lg:hidden"
            />
          ) : null}
        </AnimatePresence>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
          {/* Translucent + blurred, because page content now passes directly
              behind it rather than under an opaque band. */}
          <div
            className={cn(
              "pointer-events-auto flex min-h-16 items-center rounded-2xl border px-4 backdrop-blur-xl transition-shadow duration-300 sm:px-6",
              "border-slate-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-950/85",
              scrolled
                ? "shadow-[0_0_0_1px_rgba(30,41,59,0.05),0_14px_34px_-12px_rgba(15,23,42,0.45)] dark:shadow-[0_16px_38px_rgba(0,0,0,0.5)]"
                : "shadow-[0_0_0_1px_rgba(30,41,59,0.04),0_8px_24px_-14px_rgba(15,23,42,0.35)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]",
            )}
          >
            {/* Gaps tighten where the bar is tightest. `min-w-0` on the middle
                track is what stops the nav pushing into the actions instead of
                staying inside its column. */}
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:gap-3 xl:gap-4">
              <Link
                href={lp("/")}
                aria-label="Go to DevSolve homepage"
                className="group flex shrink-0 items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 24,
                  }}
                  className="flex items-center"
                >
                  {/* Narrows through the band where the nav is fighting for
                      room, back to full size once there is space again. */}
                  <span className="relative block h-11 w-38 sm:w-40 lg:w-36 xl:h-12 xl:w-44">
                    <Image
                      src={logoSrc}
                      alt="DevSolve"
                      fill
                      priority
                      sizes="(min-width: 1280px) 176px, 152px"
                      /* No `mix-blend-multiply`: the file is transparent, so
                         it bought nothing on light and would sink the mark
                         into the surface on dark. */
                      className="origin-left object-contain object-left transition-transform scale-[1.15]"
                    />
                  </span>
                </motion.div>
              </Link>

              <nav
                aria-label="Main navigation"
                className="hidden min-w-0 items-center justify-center lg:flex"
              >
                <div className="flex min-w-0 items-center gap-0.5 xl:gap-1">
                  {visibleNavLinks.map((link) => {
                    const isActive = isNavLinkActive(pathname, link);

                    if (link.items?.length) {
                      return (
                        <div
                          key={t(link.tKey ?? "") || link.name}
                          className="relative"
                          onMouseEnter={openCommunityMenu}
                          onMouseLeave={() => closeCommunityMenu(140)}
                        >
                          <div
                            className={cn(
                              "group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200",
                              isActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white",
                            )}
                          >
                            {/* The label navigates straight to /community;
                                the chevron is the only thing that toggles
                                the flyout, so a click never fights a nav. */}
                            <Link
                              href={lp(link.href ?? "/community")}
                              aria-current={isActive ? "page" : undefined}
                              onClick={() => {
                                setCommunityMenuOpen(false);
                                setMobileMenuOpen(false);
                              }}
                              className="inline-flex h-9 items-center rounded-l-lg pl-2 pr-0.5 xl:pl-3.5 xl:pr-1.5"
                            >
                              {t(link.tKey ?? "") || link.name}
                            </Link>
                            <button
                              type="button"
                              aria-expanded={communityMenuOpen}
                              aria-haspopup="menu"
                              aria-label={`${communityMenuOpen ? "Close" : "Open"} ${link.name} menu`}
                              onClick={() => {
                                if (communityMenuOpen) {
                                  closeCommunityMenu();
                                } else {
                                  openCommunityMenu();
                                }
                              }}
                              className="inline-flex h-9 items-center rounded-r-lg pl-0.5 pr-2 xl:pl-1.5 xl:pr-3.5"
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3.5 xl:size-4 transition-transform duration-200",
                                  communityMenuOpen && "rotate-180",
                                )}
                              />
                            </button>

                            {isActive ? (
                              <motion.span
                                layoutId="navbar-active-indicator"
                                className="absolute -bottom-[8px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400"
                                transition={{
                                  type: "spring",
                                  stiffness: 380,
                                  damping: 30,
                                }}
                              />
                            ) : null}
                          </div>

                          <AnimatePresence>
                            {communityMenuOpen ? (
                              <motion.div
                                role="menu"
                                aria-label={t(link.tKey ?? "") || link.name}
                                initial={{ opacity: 0, y: -6, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{
                                  opacity: 0,
                                  y: -4,
                                  scale: 0.96,
                                  transition: { duration: 0.12 },
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 460,
                                  damping: 32,
                                  mass: 0.7,
                                }}
                                style={{ transformOrigin: "top center" }}
                                // Padding, not margin: the gap under the
                                // trigger stays hoverable so the pointer can
                                // travel into the panel.
                                className="absolute left-1/2 top-full z-20 w-84 -translate-x-1/2 pt-2.5"
                              >
                                {/* Notch, tying the island back to its trigger */}
                                <span
                                  aria-hidden="true"
                                  className="absolute left-1/2 top-1.75 size-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-slate-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                                />

                                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_18px_44px_-14px_rgba(15,23,42,0.3)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_22px_50px_-16px_rgba(0,0,0,0.6)]">
                                  <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-blue-50/80 to-transparent dark:from-blue-500/10"
                                  />

                                  <p className="relative z-10 px-3 pb-1 pt-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-neutral-500">
                                    Start a discussion
                                  </p>

                                  <div className="relative z-10 flex flex-col gap-0.5">
                                    {link.items.map((item) => {
                                      const isItemActive = isHrefActive(
                                        pathname,
                                        item.href,
                                      );

                                      return (
                                        <Link
                                          key={item.href}
                                          href={lp(item.href)}
                                          role="menuitem"
                                          aria-current={
                                            isItemActive ? "page" : undefined
                                          }
                                          onClick={() => {
                                            setCommunityMenuOpen(false);
                                            setMobileMenuOpen(false);
                                          }}
                                          className={cn(
                                            "group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-500/40",
                                            isItemActive
                                              ? "bg-blue-50 dark:bg-blue-500/15"
                                              : "hover:bg-slate-50 dark:hover:bg-neutral-900/80",
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors duration-200",
                                              isItemActive
                                                ? "bg-blue-600 text-white ring-blue-600"
                                                : "bg-blue-50 text-blue-600 ring-blue-100 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:ring-blue-600 dark:bg-neutral-900 dark:text-blue-300 dark:ring-neutral-800 dark:group-hover/item:bg-blue-500 dark:group-hover/item:text-white dark:group-hover/item:ring-blue-500",
                                            )}
                                          >
                                            <CommunityMenuIcon
                                              icon={item.icon}
                                            />
                                          </span>

                                          <span className="min-w-0 flex-1">
                                            <span
                                              className={cn(
                                                "flex items-center gap-1.5 text-sm font-semibold",
                                                isItemActive
                                                  ? "text-blue-700 dark:text-blue-300"
                                                  : "text-slate-900 dark:text-neutral-100",
                                              )}
                                            >
                                              {t(item.tKey ?? "") || item.name}
                                              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                                            </span>
                                            <span className="mt-0.5 block text-sm leading-5 text-slate-500 dark:text-neutral-400">
                                              {item.description}
                                            </span>
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    // A link is either a dropdown (handled above) or a plain
                    // href — this narrows the optional away for both.
                    if (!link.href) {
                      return null;
                    }

                    return (
                      <Link
                        key={link.href}
                        href={lp(link.href)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-2 xl:px-3 text-xs xl:text-sm font-semibold transition-all duration-200",
                          link.guestOnly && "hidden xl:inline-flex",
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white",
                        )}
                      >
                        <span>{t(link.tKey ?? "") || link.name}</span>

                        {isActive ? (
                          <motion.span
                            layoutId="navbar-active-indicator"
                            className="absolute -bottom-2 left-1/2 h-0.75 w-6 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Staged so each width carries only what fits: hamburger alone,
                  then Get Started, then Log in, and the theme toggle last —
                  it is the one control the mobile panel also offers. */}
              <div className="flex shrink-0 items-center justify-end gap-1.5 xl:gap-2.5">
                {sessionUser && <NotificationTrigger />}

                {/* Beside the theme toggle: both are display preferences, and
                    the mobile panel offers the pair together too. */}
                <LanguageSwitcher className="hidden lg:inline-flex" />

                <ThemeToggle
                  variant="rectangle"
                  start="bottom-up"
                  aria-label={
                    mounted && isDark
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                  /* Appears at `lg`, the same width the hamburger disappears
                     at. Deferring it to `xl` left the 1024–1279px band with
                     the mobile panel already gone and the toggle not yet
                     arrived, so there was no way to change the theme at all. */
                  className="hidden size-9 xl:size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-300 dark:focus-visible:ring-blue-500/30 lg:inline-flex"
                  iconClassName="size-4 xl:size-[18px]"
                />

                {/* Signed out: Log in + Get Started. Signed in: the account
                    menu, so a session is visible outside /dashboard too. */}
                <NavbarUserMenu
                  onLogin={handleLogin}
                  isLoggingIn={isLoggingIn}
                  user={sessionUser}
                  identity={navbarIdentity}
                  isIdentityPending={isNavbarIdentityPending}
                  onSignOut={handleSignOut}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileMenuOpen((current) => !current)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                  aria-label={
                    mobileMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  className="size-10 rounded-lg border-slate-300 bg-white text-slate-700 shadow-xs hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-200 lg:hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={mobileMenuOpen ? "close" : "menu"}
                      initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {mobileMenuOpen ? (
                        <X className="size-5" />
                      ) : (
                        <Menu className="size-5" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, height: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                height: 0,
                y: -8,
                scale: 0.98,
                transition: { duration: 0.2, ease: "easeInOut" },
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    mass: 0.8,
                  }
              }
              style={{ transformOrigin: "top center" }}
              className="pointer-events-auto relative z-10 overflow-hidden px-4 pb-4 sm:px-6 lg:hidden"
            >
              {/* The panel is as tall as its contents, which on a short screen
                  — a landscape phone, or a signed-in reader with the Community
                  submenu expanded — runs past the bottom of the viewport. It
                  is capped to the room left under the island and scrolls
                  inside itself; `overscroll-contain` keeps that scroll from
                  chaining to the page behind once it bottoms out. */}
              {/* Fully opaque: this is a reading surface stacked over a busy
                  hero, and the scrim behind it already supplies the dimming. */}
              <div className="mx-auto max-h-[calc(100dvh-var(--navbar-height)-1rem)] w-full max-w-7xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:border-neutral-800/80 dark:bg-neutral-950 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-1"
                >
                  {visibleNavLinks.map((link) => {
                    const isActive = isNavLinkActive(pathname, link);

                    if (link.items?.length) {
                      return (
                        <div key={`${link.name}-mobile`} className="space-y-1">
                          <div
                            className={cn(
                              "flex min-h-10 w-full items-center justify-between rounded-lg text-sm font-semibold transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white",
                            )}
                          >
                            {/* Same split as desktop: label navigates, the
                                chevron only expands the submenu. */}
                            <Link
                              href={link.href ?? "/community"}
                              onClick={() => setMobileMenuOpen(false)}
                              aria-current={isActive ? "page" : undefined}
                              className="flex min-h-10 flex-1 items-center pl-4"
                            >
                              {t(link.tKey ?? "") || link.name}
                            </Link>
                            <button
                              type="button"
                              aria-expanded={mobileCommunityOpen}
                              aria-label={`${mobileCommunityOpen ? "Close" : "Open"} ${link.name} menu`}
                              onClick={() =>
                                setMobileCommunityOpen((current) => !current)
                              }
                              className="flex min-h-10 items-center pl-3 pr-4"
                            >
                              <motion.span
                                animate={{ rotate: mobileCommunityOpen ? 180 : 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 320,
                                  damping: 24,
                                }}
                                className="inline-flex items-center justify-center"
                              >
                                <ChevronDown className="size-4" />
                              </motion.span>
                            </button>
                          </div>

                          <AnimatePresence initial={false}>
                            {mobileCommunityOpen ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -6 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                  y: -6,
                                  transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
                                }}
                                transition={{
                                  duration: reduce ? 0 : 0.32,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col gap-1 pl-3 pt-1 pb-1">
                                  {link.items.map((item, idx) => {
                                    const isItemActive = isHrefActive(
                                      pathname,
                                      item.href,
                                    );

                                    return (
                                      <motion.div
                                        key={`${item.href}-mobile`}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={
                                          reduce
                                            ? { duration: 0 }
                                            : {
                                              type: "spring",
                                              stiffness: 420,
                                              damping: 28,
                                              delay: idx * 0.03,
                                            }
                                        }
                                      >
                                        <Link
                                          href={lp(item.href)}
                                          onClick={() => {
                                            setMobileCommunityOpen(false);
                                            setMobileMenuOpen(false);
                                          }}
                                          aria-current={
                                            isItemActive ? "page" : undefined
                                          }
                                          className={cn(
                                            "group flex items-center justify-between rounded-2xl px-3.5 py-2.5 transition-all duration-200",
                                            isItemActive
                                              ? "bg-slate-100 text-blue-700 dark:bg-neutral-900 dark:text-blue-300"
                                              : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white",
                                          )}
                                        >
                                          <div className="flex min-w-0 items-center gap-3">
                                            <span
                                              className={cn(
                                                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                                                isItemActive
                                                  ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                                                  : "bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white",
                                              )}
                                            >
                                              <CommunityMenuIcon
                                                icon={item.icon}
                                              />
                                            </span>
                                            <span className="truncate text-sm font-bold text-slate-900 dark:text-neutral-100">
                                              {t(item.tKey ?? "") || item.name}
                                            </span>
                                          </div>
                                          <ArrowRight
                                            className={cn(
                                              "size-4 transition-all duration-200",
                                              isItemActive
                                                ? "text-slate-400 opacity-100 translate-x-0 dark:text-neutral-400"
                                                : "text-slate-400 opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 dark:text-neutral-400",
                                            )}
                                          />
                                        </Link>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    if (!link.href) {
                      return null;
                    }

                    return (
                      <Link
                        key={`${link.href}-mobile`}
                        href={lp(link.href)}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white",
                        )}
                      >
                        {t(link.tKey ?? "") || link.name}
                      </Link>
                    );
                  })}

                  <div className="mt-3 grid gap-2 border-t border-slate-200 pt-4 dark:border-neutral-800">
                    {sessionUser ? (
                      <>
                        {/* The same account actions the desktop dropdown has,
                            flattened — a dropdown inside a drawer is a menu
                            inside a menu. */}
                        {isNavbarIdentityPending ? (
                          <div
                            aria-hidden="true"
                            className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                          >
                            <div className="size-9 shrink-0 rounded-lg bg-slate-200 dark:bg-neutral-800" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-neutral-800" />
                              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-neutral-800" />
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={navbarIdentity.profileHref}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                          >
                            <Avatar
                              className={cn(
                                "size-9 shrink-0",
                                navbarIdentity.isCompany &&
                                "rounded-lg after:rounded-lg",
                              )}
                            >
                              {navbarIdentity.image && (
                                <AvatarImage
                                  src={navbarIdentity.image}
                                  alt={
                                    navbarIdentity.isCompany
                                      ? `${navbarIdentity.name} logo`
                                      : ""
                                  }
                                  className={cn(
                                    navbarIdentity.isCompany && "rounded-lg",
                                  )}
                                />
                              )}
                              <AvatarFallback
                                className={cn(
                                  "bg-blue-600 text-xs font-bold text-white",
                                  navbarIdentity.isCompany && "rounded-lg",
                                )}
                              >
                                {getInitials(navbarIdentity.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-slate-900 dark:text-neutral-100">
                                {navbarIdentity.name}
                              </span>
                              <span className="block truncate text-sm text-slate-500 dark:text-neutral-400">
                                {navbarIdentity.detail ||
                                  navbarIdentity.profileLabel}
                              </span>
                              {navbarIdentity.status &&
                                navbarIdentity.status !==
                                navbarIdentity.detail && (
                                  <span className="mt-0.5 block truncate text-sm font-medium text-slate-500 dark:text-neutral-400">
                                    {navbarIdentity.status}
                                  </span>
                                )}
                            </span>
                          </Link>
                        )}

                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={lp("/dashboard")}
                              onClick={() => setMobileMenuOpen(false)}
                            />
                          }
                          className="h-10 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-[#1D4ED8] dark:bg-blue-600"
                        >
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSignOut}
                          className="h-10 rounded-lg border-slate-300 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:hover:bg-rose-950/40"
                        >
                          <LogOut className="size-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={lp("/account-type")}
                              onClick={() => setMobileMenuOpen(false)}
                            />
                          }
                          className="h-10 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-[#1D4ED8] dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
                        >
                          {t("nav.getStarted")}
                          <ArrowRight className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                          className="h-10 rounded-lg border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-200"
                        >
                          {isLoggingIn ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            t("nav.login")
                          )}
                        </Button>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={toggle}
                        className="h-10 flex-1 rounded-lg border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:border-blue-500/40 dark:hover:bg-neutral-800 dark:hover:text-blue-200"
                      >
                        {mounted && isDark ? (
                          <>
                            <Sun className="size-4" />
                            {t("nav.lightMode")}
                          </>
                        ) : (
                          <>
                            <Moon className="size-4" />
                            {t("nav.darkMode")}
                          </>
                        )}
                      </Button>

                      <LanguageSwitcher className="h-10 shrink-0 rounded-lg" />
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      </motion.header>
    </NotificationProvider>
  );
};

export default Navbar;
