import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";
import { LOCALES, localise } from "@/lib/i18n/config";

const PRIVATE_PREFIXES = [
  "/dashboard/",
  "/login",
  "/register/",
  "/account-type",
  "/test-login",
  "/invitations/",
  "/community/create",
  "/community/*/edit",
  "/community/*/solutions/",
  "/profile/me",
  "/search",
];

export default function robots(): MetadataRoute.Robots {
  const privatePaths = Array.from(
    new Set(
      PRIVATE_PREFIXES.flatMap((path) => [
        path,
        ...LOCALES.map((locale) => localise(path, locale)),
      ]),
    ),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          ...privatePaths,
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
