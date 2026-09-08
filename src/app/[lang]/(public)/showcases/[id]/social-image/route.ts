import { getShowcase } from "@/lib/seo/content";
import { showcaseCard } from "@/lib/seo/showcase-card";

export const runtime = "nodejs";

// A regular public route avoids file-based metadata overriding real thumbnails.
export async function GET(_request: Request, { params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return showcaseCard(await getShowcase(id));
}
