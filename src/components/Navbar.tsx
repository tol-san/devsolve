"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Home,
  Info,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogOut,
  LucideIcon,
  Menu,
  MessageSquare,
  Moon,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useRouter } from "next/navigation";
import { useThemeToggle } from "@/components/motion/theme-toggle";
import { FLAGS, rememberLocale } from "@/components/LanguageSwitcher";
import { useLocale, useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_SHORT, localise, type Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import {
  NavbarUserMenu,
  type NavbarIdentity,
} from "@/components/navbar/NavbarUserMenu";
import { NotificationProvider } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { NavbarSearch } from "@/components/search/NavbarSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarAuth } from "@/hooks/useSidebarAuth";
import { authClient } from "@/lib/auth/auth-client";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  description?: string;
  descTKey?: string;
  icon?: "problem" | "showcase" | "hacktivity";
  /** Catalogue key — `name` remains the stable identity and fallback. */
  tKey?: string;
};

type NavLink = {
  name: string;
  href?: string;
  items?: NavItem[];
  icon?: LucideIcon;
  external?: boolean;
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
  { name: "Home", tKey: "nav.home", href: "/", icon: Home },
  { name: "Programs", tKey: "nav.programs", href: "/programs", icon: Globe },
  {
    name: "Community",
    tKey: "nav.community",
    href: "/discussions",
    icon: MessageSquare,
    items: [
      {
        name: "Hacktivity",
        tKey: "nav.hacktivity",
        descTKey: "nav.hacktivityDesc",
        href: "/hacktivity",
        description: "Real-time security activity feed and disclosures.",
        icon: "hacktivity",
      },
      {
        name: "Problem",
        tKey: "nav.problem",
        descTKey: "nav.problemDesc",
        href: "/problems",
        description: "Post bugs, blockers, and security questions.",
        icon: "problem",
      },
      {
        name: "Showcase",
        tKey: "nav.showcase",
        descTKey: "nav.showcaseDesc",
        href: "/showcases",
        description: "Share product wins, demos, and build highlights.",
        icon: "showcase",
      },
    ],
  },
  { name: "Leaderboard", tKey: "nav.leaderboard", href: "/leaderboard", icon: Trophy },
  {
    name: "Docs",
    tKey: "nav.docs",
    href: "https://docs.devsolve.app/",
    icon: BookOpen,
    external: true,
  },
  { name: "About", tKey: "nav.about", href: "/about", guestOnly: true, icon: Info },
];

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
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return false;
  }
  if (href === "/") {
    return pathname === "/" || pathname === "/en" || pathname === "/km";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavLinkActive(pathname: string, link: NavLink) {
  if (link.external) {
    return false;
  }
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

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const isVerified =
    status === "Verified company" ||
    status === "ACTIVE" ||
    status.toLowerCase().includes("verified") ||
    status.toLowerCase().includes("active");

  const isPending =
    status === "Under review" ||
    status === "PENDING" ||
    status.toLowerCase().includes("review") ||
    status.toLowerCase().includes("pending");

  const isSuspended =
    status === "Suspended" ||
    status === "Company suspended" ||
    status === "SUSPENDED" ||
    status.toLowerCase().includes("suspend") ||
    status.toLowerCase().includes("reject");

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{status === "ACTIVE" ? "Verified" : status}</span>
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
        <Clock className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{status === "PENDING" ? "Under review" : status}</span>
      </span>
    );
  }

  if (isSuspended) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400">
        <AlertCircle className="size-3 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400">
      <Building2 className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
      <span>{status}</span>
    </span>
  );
}

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const reduce = useReducedMotion();

  const {
    user: sessionUser,
    isPending: isSessionPending,
    areRolesResolved,
    displayName,
    handleSignOut,
  } = useSidebarAuth();

  const visibleNavLinks = useMemo(
    () => navLinks.filter((link) => !(link.guestOnly && sessionUser)),
    [sessionUser],
  );

  const {
    isOwner,
    membership,
    isLoading: isMembershipLoading,
  } = useCompanyAccess();

  const organizationStatus = isOwner
    ? organizationStatusLabel(membership?.organizationStatus)
    : undefined;

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

  const headerRef = useRef<HTMLElement>(null);

  const closeAllMenus = () => {
    setCommunityMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);
  };

  const t = useT();
  const lp = useLocalePath();
  const locale = useLocale();
  const router = useRouter();
  const CurrentFlag = FLAGS[locale];
  const { isDark, mounted, toggle } = useThemeToggle({
    variant: "rectangle",
    start: "bottom-up",
  });

  // Track scroll for elevation styling
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

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

  // Hover intent for community dropdown
  const communityCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Auto-close on route change
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setCommunityMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);
  }

  // Close mobile menu when expanding to desktop
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

  // Keyboard Escape & click outside dismissal
  useEffect(() => {
    if (!mobileMenuOpen && !communityMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllMenus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
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
    if (isLoggingIn) return;
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
      <motion.header
        initial={reduce ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 34, mass: 0.9 }
        }
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[100] w-full"
      >
        <div className="pointer-events-none isolate">
          {/* Mobile Backdrop Scrim */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.button
                type="button"
                aria-label="Close navigation menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                onClick={closeAllMenus}
                className="pointer-events-auto fixed inset-0 z-0 h-dvh w-full cursor-default bg-slate-950/30 backdrop-blur-xs lg:hidden"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
            {/* Desktop & Mobile Top Capsule */}
            <div
              className={cn(
                "pointer-events-auto flex min-h-16 items-center rounded-2xl border px-3.5 sm:px-5 backdrop-blur-xl transition-all duration-300",
                "border-border/80 bg-card/90 dark:bg-card/95",
                scrolled
                  ? "shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_38px_rgba(0,0,0,0.5)]"
                  : "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
              )}
            >
              <div className="flex w-full items-center justify-between gap-3 lg:gap-4 xl:gap-6">
                {/* 1. Brand Logo (Clickable, Compact) */}
                <Link
                  href={lp("/")}
                  aria-label="Go to DevSolve homepage"
                  className="group flex shrink-0 items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 24,
                    }}
                    className="flex items-center"
                  >
                    <span className="relative block h-9 w-32 sm:h-10 sm:w-36 xl:h-11 xl:w-40">
                      {/* Light Mode Logo */}
                      <Image
                        src="/devsolve-logo.png"
                        alt="DevSolve"
                        fill
                        priority
                        sizes="(min-width: 1280px) 160px, 144px"
                        className="origin-left object-contain object-left scale-[1.12] dark:hidden"
                      />
                      {/* Dark Mode Logo */}
                      <Image
                        src="/devsolve-fulltext-logo-darkmode.png"
                        alt="DevSolve"
                        fill
                        priority
                        sizes="(min-width: 1280px) 160px, 144px"
                        className="hidden origin-left object-contain object-left scale-[1.12] dark:block"
                      />
                    </span>
                  </motion.div>
                </Link>

                {/* 2. Desktop Navigation Links (Center: Home, Programs, Community, Leaderboard) */}
                <nav
                  aria-label="Main navigation"
                  className="hidden items-center justify-center lg:flex flex-1"
                >
                  <div className="flex items-center gap-1 xl:gap-1.5">
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
                                "group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors duration-150",
                                isActive
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                              )}
                            >
                              <Link
                                href={lp(link.href ?? "/discussions")}
                                aria-current={isActive ? "page" : undefined}
                                onClick={() => {
                                  setCommunityMenuOpen(false);
                                  setMobileMenuOpen(false);
                                }}
                                className="inline-flex h-9 items-center rounded-l-[10px] pl-3.5 pr-1"
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
                                className="inline-flex h-9 items-center rounded-r-[10px] pl-1 pr-2.5 cursor-pointer"
                              >
                                <ChevronDown
                                  className={cn(
                                    "size-3.5 transition-transform duration-200",
                                    communityMenuOpen && "rotate-180",
                                  )}
                                />
                              </button>
                            </div>

                            <AnimatePresence>
                              {communityMenuOpen && (
                                <motion.div
                                  role="menu"
                                  aria-label={t(link.tKey ?? "") || link.name}
                                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{
                                    opacity: 0,
                                    y: -4,
                                    scale: 0.98,
                                    transition: { duration: 0.12 },
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 460,
                                    damping: 32,
                                    mass: 0.7,
                                  }}
                                  style={{ transformOrigin: "top center" }}
                                  className="absolute left-1/2 top-full z-20 w-72 -translate-x-1/2 pt-2"
                                >
                                  <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-xl ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-xl">
                                    <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                      {t("nav.startDiscussion") || "Start a discussion"}
                                    </p>

                                    <div className="flex flex-col gap-0.5">
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
                                              "group/item flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                              isItemActive
                                                ? "bg-primary/10"
                                                : "hover:bg-muted",
                                            )}
                                          >
                                            <span
                                              className={cn(
                                                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-colors duration-150",
                                                isItemActive
                                                  ? "bg-primary text-primary-foreground ring-primary"
                                                  : "bg-primary/10 text-primary ring-primary/20 group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:ring-primary",
                                              )}
                                            >
                                              <CommunityMenuIcon
                                                icon={item.icon}
                                              />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                              <span
                                                className={cn(
                                                  "flex items-center gap-1.5 text-xs font-semibold",
                                                  isItemActive
                                                    ? "text-primary"
                                                    : "text-foreground",
                                                )}
                                              >
                                                {t(item.tKey ?? "") || item.name}
                                                <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all duration-150 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                                              </span>
                                              <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground line-clamp-1">
                                                {(item.descTKey && t(item.descTKey)) || item.description}
                                              </span>
                                            </span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      if (!link.href) return null;

                      if (link.external) {
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[10px] px-3.5 text-sm font-medium transition-colors duration-150 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          >
                            <span>{t(link.tKey ?? "") || link.name}</span>
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={link.href}
                          href={lp(link.href)}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[10px] px-3.5 text-sm font-medium transition-colors duration-150",
                            link.guestOnly && "hidden xl:inline-flex",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                          )}
                        >
                          <span>{t(link.tKey ?? "") || link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                {/* 3. Clean Desktop Utilities (Logged In: Notification + Search + Profile. Logged Out: Search + Theme + Language + Login/Get Started) */}
                <div className="hidden lg:flex shrink-0 items-center justify-end gap-2">
                  {sessionUser && <NotificationTrigger />}

                  <NavbarSearch variant="icon" />

                  {/* When logged out: Provide direct Dark Mode and Language toggles */}
                  {!sessionUser && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggle}
                        aria-label={
                          mounted && isDark
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                        }
                        title={
                          mounted && isDark
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                        }
                        className="size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-all hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {mounted && isDark ? (
                          <Sun className="size-4.5 text-amber-500" />
                        ) : (
                          <Moon className="size-4.5 text-muted-foreground hover:text-foreground" />
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const nextLocale: Locale = locale === "en" ? "km" : "en";
                          rememberLocale(nextLocale);
                          router.push(localise(pathname ?? "/", nextLocale));
                          router.refresh();
                        }}
                        aria-label={`Switch language (current: ${LOCALE_SHORT[locale]})`}
                        title={`Switch language (current: ${LOCALE_SHORT[locale]})`}
                        className="size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-2xs transition-all hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <CurrentFlag className="h-3.5 w-5 shrink-0 rounded-xs shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
                      </Button>
                    </>
                  )}

                  <NavbarUserMenu
                    onLogin={handleLogin}
                    isLoggingIn={isLoggingIn}
                    user={sessionUser}
                    identity={navbarIdentity}
                    isIdentityPending={isNavbarIdentityPending}
                    onSignOut={handleSignOut}
                  />
                </div>

                {/* 4. Clean Mobile Top Bar Utilities (<1024px: Notification, Search & Menu of equal size) */}
                <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
                  {sessionUser && <NotificationTrigger className="size-9" />}

                  <NavbarSearch variant="icon" className="size-9" />

                  {/* Hamburger ↔ X Menu Button (Equal 36px x 36px circular button with 18px icon) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMobileMenuOpen((current) => !current)}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation-drawer"
                    aria-label={
                      mobileMenuOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                    }
                    className="size-9 cursor-pointer rounded-full text-foreground hover:bg-muted hover:border-primary/40 inline-flex items-center justify-center border-0 shadow-none transition-all"
                  >
                    {mobileMenuOpen ? (
                      <X className="size-4.5 text-foreground" />
                    ) : (
                      <Menu className="size-4.5 text-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Refined Mobile Navigation Drawer Card */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-navigation-drawer"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: -6,
                  scale: 0.98,
                  transition: { duration: 0.16, ease: "easeInOut" },
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                        mass: 0.8,
                      }
                }
                style={{ transformOrigin: "top center" }}
                className="pointer-events-auto relative z-10 px-4 pb-5 sm:px-6 lg:hidden"
              >
                <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/98 p-3.5 sm:p-4 shadow-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-2xl">
                  {/* Navigation Links */}
                  <nav
                    aria-label="Mobile navigation"
                    className="flex flex-col gap-1 pb-2.5"
                  >
                    {visibleNavLinks.map((link) => {
                      const isActive = isNavLinkActive(pathname, link);
                      const Icon = link.icon;

                      if (link.items?.length) {
                        return (
                          <div key={`${link.name}-mobile`} className="space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setMobileCommunityOpen((current) => !current)
                              }
                              aria-expanded={mobileCommunityOpen}
                              aria-label={`${mobileCommunityOpen ? "Close" : "Open"} ${link.name} menu`}
                              className={cn(
                                "flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl px-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.99]",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted/70",
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {Icon && (
                                  <Icon
                                    className={cn(
                                      "size-4.5 shrink-0 transition-colors",
                                      isActive ? "text-primary" : "text-muted-foreground",
                                    )}
                                  />
                                )}
                                <span>{t(link.tKey ?? "") || link.name}</span>
                              </div>
                              <motion.span
                                animate={{ rotate: mobileCommunityOpen ? 180 : 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 340,
                                  damping: 24,
                                }}
                                className="inline-flex items-center justify-center text-muted-foreground"
                              >
                                <ChevronDown className="size-4" />
                              </motion.span>
                            </button>

                            <AnimatePresence initial={false}>
                              {mobileCommunityOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, y: -4 }}
                                  animate={{ opacity: 1, height: "auto", y: 0 }}
                                  exit={{
                                    opacity: 0,
                                    height: 0,
                                    y: -4,
                                    transition: { duration: 0.16, ease: "easeInOut" },
                                  }}
                                  transition={{
                                    duration: reduce ? 0 : 0.22,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-1 pl-4 pt-1 pb-1">
                                    {link.items.map((item) => {
                                      const isItemActive = isHrefActive(
                                        pathname,
                                        item.href,
                                      );

                                      return (
                                        <Link
                                          key={`${item.href}-mobile`}
                                          href={lp(item.href)}
                                          onClick={() => {
                                            setMobileCommunityOpen(false);
                                            setMobileMenuOpen(false);
                                          }}
                                          aria-current={
                                            isItemActive ? "page" : undefined
                                          }
                                          className={cn(
                                            "group flex min-h-[38px] items-center justify-between rounded-xl px-3 py-1.5 transition-all duration-150 active:scale-[0.99]",
                                            isItemActive
                                              ? "bg-primary/10 text-primary font-semibold"
                                              : "text-foreground hover:bg-muted/70",
                                          )}
                                        >
                                          <div className="flex min-w-0 items-center gap-2.5">
                                            <span
                                              className={cn(
                                                "flex size-6.5 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                isItemActive
                                                  ? "bg-primary text-primary-foreground"
                                                  : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                                              )}
                                            >
                                              <CommunityMenuIcon
                                                icon={item.icon}
                                              />
                                            </span>
                                            <span className="truncate text-xs font-medium">
                                              {t(item.tKey ?? "") || item.name}
                                            </span>
                                          </div>
                                          <ArrowRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      if (!link.href) return null;

                      if (link.external) {
                        return (
                          <a
                            key={`${link.href}-mobile`}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="group flex min-h-10 items-center justify-between rounded-xl px-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.99] text-foreground hover:bg-muted/70"
                          >
                            <div className="flex items-center gap-3">
                              {Icon && (
                                <Icon className="size-4.5 shrink-0 transition-colors text-muted-foreground" />
                              )}
                              <span>{t(link.tKey ?? "") || link.name}</span>
                            </div>
                            <ExternalLink className="size-3.5 text-muted-foreground/60" />
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={`${link.href}-mobile`}
                          href={lp(link.href)}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group flex min-h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.99]",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/70",
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "size-4.5 shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground",
                              )}
                            />
                          )}
                          <span>{t(link.tKey ?? "") || link.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User Card & Actions */}
                  <div className="space-y-2.5 border-t border-border/70 pt-2.5">
                    {sessionUser ? (
                      <>
                        {isNavbarIdentityPending ? (
                          <div
                            aria-hidden="true"
                            className="flex animate-pulse items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3"
                          >
                            <div className="size-10 shrink-0 rounded-full bg-muted" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="h-4 w-28 rounded bg-muted" />
                              <div className="h-3 w-36 rounded bg-muted" />
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={navbarIdentity.profileHref}
                            onClick={() => setMobileMenuOpen(false)}
                            className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/60 active:scale-[0.99]"
                          >
                            <Avatar
                              className="size-10 shrink-0 rounded-full shadow-2xs"
                            >
                              {navbarIdentity.image && (
                                <AvatarImage
                                  src={navbarIdentity.image}
                                  alt={
                                    navbarIdentity.isCompany
                                      ? `${navbarIdentity.name} logo`
                                      : ""
                                  }
                                  className="rounded-full object-cover"
                                />
                              )}
                              <AvatarFallback
                                className="bg-primary text-xs font-bold text-primary-foreground rounded-full"
                              >
                                {getInitials(navbarIdentity.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-foreground">
                                {navbarIdentity.name}
                              </p>
                              {navbarIdentity.detail && (
                                <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
                                  {navbarIdentity.detail}
                                </p>
                              )}
                              {navbarIdentity.status && (
                                <div className="mt-1">
                                  <StatusBadge status={navbarIdentity.status} />
                                </div>
                              )}
                            </div>
                          </Link>
                        )}

                        <div className="flex flex-col gap-2 pt-0.5">
                          <Button
                            nativeButton={false}
                            render={
                              <Link
                                href={lp("/dashboard")}
                                onClick={() => setMobileMenuOpen(false)}
                              />
                            }
                            className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                          >
                            <LayoutDashboard className="size-4" />
                            <span>Dashboard</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleSignOut();
                            }}
                            className="h-10 w-full rounded-xl border border-rose-500/25 bg-rose-500/5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                          >
                            <LogOut className="size-4 text-rose-500 dark:text-rose-400" />
                            <span>Log out</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 pt-0.5">
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={lp("/account-type")}
                              onClick={() => setMobileMenuOpen(false)}
                            />
                          }
                          className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                        >
                          <span>{t("nav.getStarted")}</span>
                          <ArrowRight className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                          className="h-10 w-full rounded-xl border-border bg-card text-sm font-semibold text-foreground hover:bg-muted flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                        >
                          {isLoggingIn ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <span>{t("nav.login")}</span>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Bottom Utility Controls (Two-Column Pill Layout) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70">
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={
                          mounted && isDark
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                        }
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-muted active:scale-[0.99]"
                      >
                        {mounted && isDark ? (
                          <>
                            <Sun className="size-4 text-amber-500" />
                            <span>{t("nav.lightMode") || "Light mode"}</span>
                          </>
                        ) : (
                          <>
                            <Moon className="size-4 text-slate-600 dark:text-slate-400" />
                            <span>{t("nav.darkMode") || "Dark mode"}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextLocale: Locale = locale === "en" ? "km" : "en";
                          rememberLocale(nextLocale);
                          router.push(localise(pathname ?? "/", nextLocale));
                          router.refresh();
                        }}
                        aria-label={`Switch language (current: ${LOCALE_SHORT[locale]})`}
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-muted active:scale-[0.99]"
                      >
                        <CurrentFlag className="h-3.5 w-5 shrink-0 rounded-xs shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
                        <span>{LOCALE_SHORT[locale]}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </NotificationProvider>
  );
};

export default Navbar;
