"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
  X,
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
import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/components/motion/theme-toggle";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
  localise,
  type Locale,
} from "@/lib/i18n/config";
import { FLAGS, rememberLocale } from "@/components/LanguageSwitcher";
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

interface NavbarUserMenuProps {
  /** Sign-in handler, used only while signed out. */
  onLogin: () => void;
  isLoggingIn: boolean;
  user?: SidebarUser;
  identity: NavbarIdentity;
  isIdentityPending: boolean;
  onSignOut: () => void;
}

/**
 * Renders a distinct trust badge with clear status-specific iconography and color palettes.
 * Verified companies display a prominent emerald green badge with a checkmark.
 */
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
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="size-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{status === "ACTIVE" ? "Verified company" : status}</span>
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
        <Clock className="size-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{status === "PENDING" ? "Under review" : status}</span>
      </span>
    );
  }

  if (isSuspended) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400">
        <AlertCircle className="size-2.5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400">
      <Building2 className="size-2.5 shrink-0 text-blue-600 dark:text-blue-400" />
      <span>{status}</span>
    </span>
  );
}

/**
 * Compact, Sleek SaaS Account / Organization Menu
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
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, mounted: themeMounted, toggle: toggleTheme } = useThemeToggle({
    variant: "rectangle",
    start: "bottom-up",
  });

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLanguageSelect = (code: Locale) => {
    if (code === locale) return;
    rememberLocale(code);
    router.push(localise(pathname ?? "/", code));
    router.refresh();
  };

  // Prevent background scrolling when mobile bottom sheet is open
  useEffect(() => {
    if (mobileSheetOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileSheetOpen]);

  // Handle Escape key for mobile bottom sheet
  useEffect(() => {
    if (!mobileSheetOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSheetOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSheetOpen]);

  if (!mounted || isIdentityPending) {
    return (
      <div
        aria-hidden
        className="h-9 w-9 animate-pulse rounded-full bg-muted"
      />
    );
  }

  // Signed out state
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onLogin}
          disabled={isLoggingIn}
          className="h-8.5 rounded-xl border-border/80 bg-card px-3 text-xs font-medium text-foreground shadow-2xs transition-all hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {t("nav.connecting")}
            </>
          ) : (
            t("nav.login")
          )}
        </Button>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            nativeButton={false}
            render={<Link href="/account-type" />}
            className="group h-8.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-2xs transition-all hover:bg-primary/90 cursor-pointer"
          >
            {t("nav.getStarted")}
            <ArrowRight className="hidden size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:block" />
          </Button>
        </motion.div>
      </div>
    );
  }

  const CurrentFlag = FLAGS[locale];

  const userAvatar = (
    <Avatar
      className="size-7 shrink-0 transition-transform group-hover:scale-105 rounded-full"
    >
      {identity.image && (
        <AvatarImage
          src={identity.image}
          alt={identity.isCompany ? `${identity.name} logo` : `${identity.name} avatar`}
          className="rounded-full object-cover"
        />
      )}
      <AvatarFallback
        className="bg-primary text-[10px] font-bold text-primary-foreground rounded-full"
      >
        {getInitials(identity.name)}
      </AvatarFallback>
    </Avatar>
  );

  // -------------------------------------------------------------
  // Mobile (<480px) Bottom Sheet Variant
  // -------------------------------------------------------------
  if (isMobile) {
    return (
      <>
        {/* Pill Trigger: [ (Avatar) ▾ ] */}
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={mobileSheetOpen}
          aria-label={identity.isCompany ? "Organization menu" : "Account menu"}
          className="group relative flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-card p-1 pr-2 shadow-2xs transition-all hover:border-primary/40 hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {userAvatar}
          <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground" />
        </button>

        <AnimatePresence>
          {mobileSheetOpen && (
            <div className="fixed inset-0 z-[200] flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileSheetOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                aria-hidden="true"
              />

              <motion.div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label={identity.isCompany ? "Organization menu" : "Account menu"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
                className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-4 pb-8 shadow-2xl"
              >
                <div className="flex flex-col items-center">
                  <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 mb-3" />
                </div>

                <div className="flex items-start justify-between gap-3 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-10 shrink-0 rounded-full shadow-xs">
                      {identity.image && (
                        <AvatarImage
                          src={identity.image}
                          alt={identity.name}
                          className="rounded-full object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground rounded-full">
                        {getInitials(identity.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {identity.name}
                      </p>
                      {identity.detail && (
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {identity.detail}
                        </p>
                      )}
                      {identity.status && (
                        <div className="mt-1">
                          <StatusBadge status={identity.status} />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileSheetOpen(false)}
                    aria-label="Close menu"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="my-1.5 h-px bg-border/80" />

                {/* Primary Menu Items */}
                <div className="flex flex-col gap-0.5 py-1">
                  <Link
                    href={identity.profileHref}
                    onClick={() => setMobileSheetOpen(false)}
                    className="group flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {identity.isCompany ? (
                        <Building2 className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      ) : (
                        <UserRound className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      )}
                      <span className="font-semibold">{identity.profileLabel}</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileSheetOpen(false)}
                    className="group flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LayoutDashboard className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="font-semibold">Dashboard</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href={identity.settingsHref}
                    onClick={() => setMobileSheetOpen(false)}
                    className="group flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Settings className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="font-semibold">{identity.settingsLabel}</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="my-1.5 h-px bg-border/80" />

                {/* Preferences: Theme & Language */}
                <div className="flex flex-col gap-0.5 py-1">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="group flex min-h-[40px] w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {themeMounted && isDark ? (
                        <Sun className="size-4 shrink-0 text-amber-500" />
                      ) : (
                        <Moon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      )}
                      <span className="font-semibold">{t("nav.darkMode") || "Dark mode"}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {themeMounted && isDark ? "Dark" : "Light"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageSelect(locale === "en" ? "km" : "en")}
                    className="group flex min-h-[40px] w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/80 active:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="font-semibold">{t("nav.language") || "Language"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CurrentFlag className="h-3 w-4.5 shrink-0 rounded-xs shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {LOCALE_SHORT[locale]}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="my-2 h-px bg-border/80" />

                {/* Destructive Action */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileSheetOpen(false);
                    onSignOut();
                  }}
                  className="group flex min-h-[42px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 active:bg-rose-500/20"
                >
                  <LogOut className="size-4 shrink-0 text-rose-500 dark:text-rose-400 transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-300" />
                  <span>Log out</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // -------------------------------------------------------------
  // Desktop & Tablet (>=480px) Compact Floating Dropdown
  // -------------------------------------------------------------
  return (
    <DropdownMenu>
      {/* Pill Trigger: [ (Avatar) ▾ ] */}
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={identity.isCompany ? "Organization menu" : "Account menu"}
            className={cn(
              "group relative flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-card p-1 pr-2 shadow-2xs transition-all duration-150 hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          />
        }
      >
        {userAvatar}
        <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-hover:text-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-[235px] sm:w-[245px] rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40 ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-xl"
      >
        {/* Header: Org/User Info & Compact Trust Badge */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-2.5">
          <Avatar className="size-8.5 shrink-0 rounded-full shadow-xs">
            {identity.image && (
              <AvatarImage
                src={identity.image}
                alt={identity.name}
                className="rounded-full object-cover"
              />
            )}
            <AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground rounded-full">
              {getInitials(identity.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              {identity.name}
            </p>
            {identity.detail && (
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {identity.detail}
              </p>
            )}
            {identity.status && (
              <div className="mt-1">
                <StatusBadge status={identity.status} />
              </div>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Primary Menu Items (compact 36px touch heights) */}
        <DropdownMenuGroup className="flex flex-col gap-0.5">
          <DropdownMenuItem
            render={<Link href={identity.profileHref} />}
            className="group/item relative flex min-h-[36px] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground focus:bg-muted/80 focus:text-foreground active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              {identity.isCompany ? (
                <Building2 className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground group-focus/item:text-foreground" />
              ) : (
                <UserRound className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground group-focus/item:text-foreground" />
              )}
              <span className="font-semibold">{identity.profileLabel}</span>
            </div>
            <ChevronRight className="size-3 text-muted-foreground/40 transition-transform duration-150 group-hover/item:translate-x-0.5 group-hover/item:text-foreground" />
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/dashboard" />}
            className="group/item relative flex min-h-[36px] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground focus:bg-muted/80 focus:text-foreground active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <LayoutDashboard className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground group-focus/item:text-foreground" />
              <span className="font-semibold">Dashboard</span>
            </div>
            <ChevronRight className="size-3 text-muted-foreground/40 transition-transform duration-150 group-hover/item:translate-x-0.5 group-hover/item:text-foreground" />
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href={identity.settingsHref} />}
            className="group/item relative flex min-h-[36px] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground focus:bg-muted/80 focus:text-foreground active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Settings className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground group-focus/item:text-foreground" />
              <span className="font-semibold">{identity.settingsLabel}</span>
            </div>
            <ChevronRight className="size-3 text-muted-foreground/40 transition-transform duration-150 group-hover/item:translate-x-0.5 group-hover/item:text-foreground" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Preferences Section: Theme & Language */}
        <DropdownMenuGroup className="flex flex-col gap-0.5">
          {/* Dark Mode Row */}
          <DropdownMenuItem
            onClick={toggleTheme}
            className="group/item relative flex min-h-[36px] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground focus:bg-muted/80 focus:text-foreground active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              {themeMounted && isDark ? (
                <Sun className="size-3.5 shrink-0 text-amber-500" />
              ) : (
                <Moon className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground" />
              )}
              <span className="font-semibold">{t("nav.darkMode") || "Dark mode"}</span>
            </div>
            <span
              className={cn(
                "relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out",
                themeMounted && isDark ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                  themeMounted && isDark ? "translate-x-3.5" : "translate-x-0.5"
                )}
              />
            </span>
          </DropdownMenuItem>

          {/* Language Toggle Row - direct one-click auto toggle */}
          <DropdownMenuItem
            onClick={() => handleLanguageSelect(locale === "en" ? "km" : "en")}
            className="group/item relative flex min-h-[36px] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground focus:bg-muted/80 focus:text-foreground active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover/item:text-foreground" />
              <span className="font-semibold">{t("nav.language") || "Language"}</span>
            </div>
            <div className="flex items-center gap-1 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 shadow-2xs">
              <CurrentFlag className="h-3 w-4.5 shrink-0 rounded-xs shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
              <span className="text-[10px] font-bold text-foreground tracking-wide">
                {LOCALE_SHORT[locale]}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Destructive Action */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onSignOut}
            className="group/logout relative flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-700 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 focus:bg-rose-500/10 focus:text-rose-700 active:bg-rose-500/20"
          >
            <LogOut className="size-3.5 shrink-0 text-rose-500 dark:text-rose-400 transition-colors group-hover/logout:text-rose-600 dark:group-hover/logout:text-rose-300" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavbarUserMenu;
