const baseUrl = (process.env.SEO_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const canonicalOrigin = (
  process.env.SEO_CANONICAL_ORIGIN || "https://devsolve.app"
).replace(/\/+$/, "");

const routePaths = [
  "/",
  "/discussions",
  "/problems",
  "/showcases",
  "/programs",
  "/hacktivity",
  "/leaderboard",
  "/about",
  "/company",
  "/km",
  "/km/discussions",
  "/km/problems",
  "/km/showcases",
  "/km/programs",
  "/km/hacktivity",
  "/km/leaderboard",
  "/km/about",
  "/km/company",
];

const requestHeaders = {
  "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
  "accept-language": "en-US,en;q=0.9",
};

function fail(message) {
  throw new Error(message);
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return decodeHtml(match?.[1] ?? match?.[2] ?? "");
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function linkValues(html, rel) {
  return tags(html, "link")
    .filter((tag) => attr(tag, "rel").toLowerCase() === rel)
    .map((tag) => ({ href: attr(tag, "href"), hreflang: attr(tag, "hreflang") }));
}

function metaValue(html, key, value) {
  const tag = tags(html, "meta").find(
    (candidate) => attr(candidate, key).toLowerCase() === value.toLowerCase(),
  );
  return tag ? attr(tag, "content") : "";
}

function textContent(fragment) {
  return decodeHtml(
    fragment
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function expectedCanonical(path) {
  // Next serializes an origin-only canonical without the cosmetic trailing
  // slash. It identifies the same URL as `origin/`, which the sitemap uses.
  return `${canonicalOrigin}${path === "/" ? "" : path}`;
}

function expectedAlternates(path) {
  const withoutLocale = path === "/km" ? "/" : path.replace(/^\/km\//, "/");
  const english = expectedCanonical(withoutLocale);
  const khmer = `${canonicalOrigin}/km${withoutLocale === "/" ? "" : withoutLocale}`;
  return { en: english, "km-KH": khmer, "x-default": english };
}

function robotsRuleMatches(path, rule) {
  if (!rule) return false;
  const endAnchored = rule.endsWith("$");
  const source = (endAnchored ? rule.slice(0, -1) : rule)
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${source}${endAnchored ? "$" : ""}`).test(path);
}

function normalizePath(href) {
  try {
    const url = new URL(href, canonicalOrigin);
    if (url.origin !== canonicalOrigin) return null;
    return url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";
  } catch {
    return null;
  }
}

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: requestHeaders,
    redirect: "manual",
  });
  return { response, body: await response.text() };
}

const { response: robotsResponse, body: robotsText } = await fetchText(
  "/robots.txt",
);
if (robotsResponse.status !== 200) {
  fail(`/robots.txt returned HTTP ${robotsResponse.status}`);
}
if (!robotsText.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
  fail("robots.txt does not declare the canonical sitemap URL");
}
if (robotsText.includes("www.devsolve.app")) {
  fail("robots.txt contains the legacy www host");
}

const disallowRules = robotsText
  .split(/\r?\n/)
  .map((line) => line.match(/^Disallow:\s*(.*?)\s*$/i)?.[1])
  .filter(Boolean);

const { response: sitemapResponse, body: sitemapText } = await fetchText(
  "/sitemap.xml",
);
if (sitemapResponse.status !== 200) {
  fail(`/sitemap.xml returned HTTP ${sitemapResponse.status}`);
}
if (sitemapText.includes("www.devsolve.app")) {
  fail("sitemap.xml contains the legacy www host");
}

const discoveredLinks = new Map(routePaths.map((path) => [path, new Set()]));
const rows = [];

for (const path of routePaths) {
  const { response, body } = await fetchText(path);
  if (response.status !== 200) {
    fail(`${path} returned HTTP ${response.status} instead of 200`);
  }

  const canonicals = linkValues(body, "canonical");
  const expected = expectedCanonical(path);
  if (canonicals.length !== 1 || canonicals[0].href !== expected) {
    fail(
      `${path} canonical mismatch: expected one ${expected}, received ${JSON.stringify(canonicals)}`,
    );
  }

  const ogUrl = metaValue(body, "property", "og:url");
  if (ogUrl !== expected) {
    fail(`${path} Open Graph URL mismatch: expected ${expected}, received ${ogUrl}`);
  }

  const title = textContent(body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = metaValue(body, "name", "description");
  const robots = metaValue(body, "name", "robots").toLowerCase();
  const h1 = textContent(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const htmlTag = tags(body, "html")[0] ?? "";
  const documentLanguage = attr(htmlTag, "lang");
  const visibleHtml = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const visibleText = textContent(visibleHtml);

  if (!title) fail(`${path} has no page title`);
  if (description.length < 50) fail(`${path} has a missing or thin meta description`);
  if (robots.includes("noindex")) fail(`${path} is marked noindex`);
  if (!h1) fail(`${path} has no server-rendered H1`);
  const isKhmer = path === "/km" || path.startsWith("/km/");
  if (documentLanguage !== (isKhmer ? "km-KH" : "en")) {
    fail(`${path} has incorrect document language ${documentLanguage}`);
  }
  if (isKhmer && !/[\u1780-\u17ff]/u.test(`${title} ${description} ${h1}`)) {
    fail(`${path} has no Khmer text in its primary SEO content`);
  }
  if (visibleText.length < 250) {
    fail(`${path} has only ${visibleText.length} visible server-rendered characters`);
  }
  if (/page not found|404 not found/i.test(visibleText)) {
    fail(`${path} renders not-found copy with HTTP 200`);
  }

  const blockedBy = disallowRules.find((rule) => robotsRuleMatches(path, rule));
  if (blockedBy) fail(`${path} is blocked by robots rule ${blockedBy}`);

  const sitemapUrl = path === "/" ? `${canonicalOrigin}/` : expected;
  if (!sitemapText.includes(`<loc>${sitemapUrl}</loc>`)) {
    fail(`${path} is absent from sitemap.xml`);
  }

  const alternateLinks = Object.fromEntries(
    linkValues(body, "alternate")
      .filter((link) => link.hreflang)
      .map((link) => [link.hreflang, link.href]),
  );
  for (const [language, href] of Object.entries(expectedAlternates(path))) {
    if (alternateLinks[language] !== href) {
      fail(`${path} has an incorrect ${language} alternate`);
    }
  }

  for (const anchor of tags(visibleHtml, "a")) {
    const linkedPath = normalizePath(attr(anchor, "href"));
    if (linkedPath && discoveredLinks.has(linkedPath) && linkedPath !== path) {
      discoveredLinks.get(linkedPath).add(path);
    }
  }

  rows.push({ path, title, h1, visibleCharacters: visibleText.length });
}

for (const path of routePaths) {
  if (discoveredLinks.get(path).size === 0) {
    fail(`${path} has no crawlable internal link from another audited page`);
  }
}

console.log(`SEO verification passed for ${rows.length} public URLs at ${baseUrl}.`);
console.log("URL | HTTP | Canonical | Sitemap | Internal link | Visible chars");
console.log("--- | --- | --- | --- | --- | ---");
for (const row of rows) {
  console.log(
    `${row.path} | 200 | PASS | PASS | PASS | ${row.visibleCharacters}`,
  );
}
