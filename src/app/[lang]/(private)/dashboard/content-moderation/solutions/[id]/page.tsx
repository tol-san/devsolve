export const dynamic = "force-dynamic";

import { SolutionReviewDetail } from "@/components/admin/solutions/SolutionReviewDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * One solution under review, opened from the approvals tab on the moderation
 * page. It lives under that route so the review flow stays in the moderation
 * area rather than becoming a separate destination — which is what the old
 * `/dashboard/solution-review` page became, unlinked from anywhere.
 */
export default async function SolutionReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <SolutionReviewDetail id={id} />;
}
