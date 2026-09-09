import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import { contentCard } from "./content-card";
import { showcaseAuthor } from "./showcase";

export function showcaseCard(showcase: ShowcaseResponse | null) {
  return contentCard({
    title: showcase?.title?.trim() || "Showcase",
    description: showcase?.overview,
    label: showcase?.categoryName?.trim() || "Showcase",
    author: showcaseAuthor(showcase),
  });
}
