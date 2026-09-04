import type { Metadata } from "next";
import { NO_INDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Following",
  robots: NO_INDEX,
};

export default function FollowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
