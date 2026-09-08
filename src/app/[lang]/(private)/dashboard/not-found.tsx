import type { Metadata } from "next";
import { DashboardNotFound } from "@/components/dashboard/not-found/DashboardNotFound";
import { NO_INDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Section Not Found",
  description: "The dashboard section or resource does not exist.",
  robots: NO_INDEX,
};

export default function NotFound() {
  return <DashboardNotFound />;
}
