import { redirect } from "next/navigation";

export default function SolutionReviewPage() {
  redirect("/dashboard/content-moderation?tab=solutions");
}
