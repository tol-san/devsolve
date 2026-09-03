export const dynamic = "force-dynamic";

import { ShowcaseReviewDetail } from "@/components/admin/showcases/ShowcaseReviewDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * One showcase submission, opened from the approvals tab on the moderation
 * page. It lives under that route so the review flow stays in the moderation
 * area rather than becoming a separate destination.
 */
export default async function ShowcaseReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ShowcaseReviewDetail id={id} />;
}
