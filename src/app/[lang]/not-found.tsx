import type { Metadata } from "next";
import { NotFoundGlitch } from "@/components/not-found/not-found-glitch";
import { NO_INDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
  robots: NO_INDEX,
};

export default function NotFound() {
  return <NotFoundGlitch />;
}
