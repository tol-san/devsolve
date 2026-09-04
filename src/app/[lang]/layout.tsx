import type { Metadata, Viewport } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import localFont from "next/font/local";
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

const hackdaddy = localFont({
  src: "../fonts/Hackdaddy.otf",
  variable: "--font-cyber",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const khmer = Kantumruy_Pro({
  subsets: ["khmer"],
  variable: "--font-khmer",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
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
  formatDetection: { telephone: false, address: false, email: false },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": [process.env.BING_SITE_VERIFICATION] } }
      : {}),
  },
};

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
    <html
      lang={LOCALE_TAGS[locale]}
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, khmer.variable, hackdaddy.variable)}
    >
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
