import { unstable_cache } from "next/cache";
import { fetchExternalImage, getImageSize } from "next/dist/server/image-optimizer";
import { SITE_URL } from "./site";

export function publicImageUrl(value: string | null | undefined): string | undefined {
  const source = value?.trim();
  if (!source || /[\\\u0000-\u001f]/.test(source)) return undefined;
  try {
    const url = new URL(source, `${SITE_URL}/`);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

// Next's image fetcher checks private IPs and redirects, sets a timeout, and
// bounds the response body. Keep this version-specific import covered by tests.
export const publicImageDimensions = unstable_cache(async (url: string) => {
  try {
    const image = await fetchExternalImage(url, false, 5 * 1024 * 1024);
    const size = await getImageSize(image.buffer);
    return size.width && size.height ? size : null;
  } catch {
    return null;
  }
}, ["showcase-social-cover-v1"], { revalidate: 300 });
