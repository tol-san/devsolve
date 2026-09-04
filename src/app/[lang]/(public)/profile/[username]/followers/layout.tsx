import type { Metadata } from "next";
import { NO_INDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Followers",
  robots: NO_INDEX,
};

export default function FollowersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
