import { communityDetails, getCommunityContent } from "@/lib/seo/community";
import { contentCard } from "@/lib/seo/content-card";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const solutionId = new URL(request.url).searchParams.get("solution") ?? undefined;
  const details = communityDetails(await getCommunityContent(id, solutionId));
  return contentCard({
    title: details.title, description: details.body,
    label: details.category ? `${details.kind} · ${details.category}` : details.kind,
    author: { name: details.authorName },
  });
}
