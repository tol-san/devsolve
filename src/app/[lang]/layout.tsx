import type { Metadata, Viewport } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import StoreProvider from "@/lib/redux/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import { SearchModal } from "@/components/search/SearchModal";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { INDEX_RICH } from "@/lib/seo/metadata";
import {
  DEFAULT_LOCALE as DEFAULT_UI_LOCALE,
  isLocale,
  LOCALE_TAGS,
  LOCALES,
} from "@/lib/i18n/config";
import {
  DEFAULT_LOCALE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/seo/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/* Inter carries no Khmer glyphs, so Khmer would fall back to whatever the
   device happens to have — often tofu boxes, always inconsistent. Kantumruy
   Pro is a contemporary Khmer face with matching weights, loaded alongside
   Inter and placed after it in the stack: Latin still renders in Inter, and
   only Khmer codepoints fall through to Kantumruy. */
const khmer = Kantumruy_Pro({
  subsets: ["khmer"],
  variable: "--font-khmer",
  display: "swap",
});

/**
 * Site-wide defaults. Every field here is inherited by any route that does not
 * state its own, so this is the floor rather than the whole story — pages
 * build the rest with `pageMetadata`.
 *
 * Two things are deliberately absent. There is no `alternates.canonical`,
 * because metadata merges shallowly: a canonical set here would be inherited
 * by every page that forgets one, and each would then claim to be the home
 * page. `openGraph.images` is absent for the same reason as in
 * `pageMetadata` — the `opengraph-image` file convention owns those.
 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  // Lets every route below express canonical and image URLs as paths.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: DEFAULT_LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
  },
  robots: INDEX_RICH,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/icon.png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  // Stops iOS Safari from turning ids and version numbers into phone links.
  formatDetection: { telephone: false, address: false, email: false },
  /**
   * Search Console ownership verification.
   *
   * Set `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` in the
   * production environment after adding the site in each webmaster portal.
   * Leave both unset (or empty) in development — Next.js omits the tag
   * entirely when the value is falsy, so no invalid tag reaches the page.
   */
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": [process.env.BING_SITE_VERIFICATION] } }
      : {}),
  },
};

/**
 * The browser chrome colour per theme. The values are the `--background`
 * tokens from `globals.css` (`oklch(1 0 0)` and `oklch(0.145 0 0)`) in the hex
 * form the meta tag requires, so the address bar matches the page it sits above.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_UI_LOCALE;
  const dict = await getDictionary(locale);

  return (
    // next-themes writes the theme class onto <html> before paint, so the
    // server markup and the first client render disagree by design.
    <html
      lang={LOCALE_TAGS[locale]}
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, khmer.variable)}
    >
      {/* Browser extensions stamp their own attributes onto <body> before
          React gets there — Grammarly, Dark Reader, unit converters — and each
          one reads as a hydration mismatch we did not cause and cannot
          prevent. The flag covers this element's own attributes and text only,
          one level deep, so a genuine mismatch anywhere inside the app still
          reports normally. */}
      <body suppressHydrationWarning className={cn("h-full font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <I18nProvider locale={locale} dict={dict}>
              {children}
            </I18nProvider>
            <Toaster />
            <SearchModal />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
