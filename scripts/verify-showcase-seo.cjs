/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness intercepts TS module loading. */
// Focused contract checks, plus real PNG rendering. No live backend is required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
process.env.NEXT_PUBLIC_SITE_URL = "https://devsolve.app";
const original = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  return original.call(this, id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : id, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
// Only external I/O is stubbed. Metadata and Next's PNG renderer are real.
const cache = require("next/cache");
cache.unstable_cache = fn => fn;
const optimizer = require("next/dist/server/image-optimizer");
const sharp = require("sharp");
let inspected = [];
require.cache[require.resolve("next/dist/server/image-optimizer")].exports = { ...optimizer, fetchExternalImage: async (url, allowPrivate, limit) => {
  assert.equal(allowPrivate, false);
  assert.equal(limit, 5 * 1024 * 1024);
  inspected.push(url);
  if (url.includes("broken")) throw new Error("Unavailable public image");
  return { buffer: await sharp({ create: { width: 960, height: 540, channels: 3, background: "white" } }).png().toBuffer() };
} };
const { showcaseMetadata, showcaseCoverUrl } = require("../src/lib/seo/showcase.ts");
const { showcaseCard } = require("../src/lib/seo/showcase-card.tsx");
const fixture = {
  id: "11111111-1111-4111-8111-111111111111", title: "A useful developer project", overview: "**Real project** description with <b>safe</b> text.",
  author: { fullName: "forU M", username: "formu6369" }, categoryName: "Developer tools", tags: [{ name: "TypeScript" }],
  createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z",
};
async function main() {
  for (const cover of ["https://cdn.example.com/cover.png", "/uploads/cover.png", "//cdn.example.com/cover.png"]) {
    const metadata = await showcaseMetadata({ ...fixture, coverImageUrl: cover }, fixture.id, "en");
    assert.equal(metadata.openGraph.images[0].url, new URL(cover, "https://devsolve.app").href);
    assert.deepEqual(metadata.openGraph.images, metadata.twitter.images);
    assert.equal(metadata.openGraph.images[0].width, 960);
    assert.equal(metadata.title.absolute, `${fixture.title} · DevSolve`);
    assert.equal(metadata.description, "Real project description with safe text.");
    assert.equal(metadata.authors[0].name, "forU M");
    assert.equal(metadata.openGraph.authors[0], "https://devsolve.app/profile/formu6369");
    assert.deepEqual(metadata.keywords, ["TypeScript", "Developer tools"]);
    assert.equal(metadata.openGraph.publishedTime, "2026-09-01T00:00:00.000Z");
  }
  for (const cover of [null, "", "javascript:alert(1)", "https://user:pass@example.com/x", "https://cdn.example.com/broken.png"]) {
    const metadata = await showcaseMetadata({ ...fixture, coverImageUrl: cover, categoryName: null, tags: [] }, fixture.id, "km");
    assert.equal(metadata.openGraph.images[0].url, `https://devsolve.app/km/showcases/${fixture.id}/social-image`);
    assert.deepEqual(metadata.openGraph.images, metadata.twitter.images);
    assert.equal(metadata.openGraph.images[0].width, 1200);
    assert.equal(metadata.openGraph.locale, "km_KH");
    assert.deepEqual(metadata.openGraph.alternateLocale, ["en_US"]);
    assert.equal(metadata.alternates.canonical, `/km/showcases/${fixture.id}`);
    assert.equal(metadata.alternates.languages.en, `/showcases/${fixture.id}`);
    assert.equal(metadata.keywords, null);
    assert.equal(metadata.category, null);
  }
  const missing = await showcaseMetadata(null, fixture.id, "en");
  assert.equal(missing.authors, null);
  assert.equal(missing.creator, null);
  assert.equal(missing.robots.index, false);
  assert.equal(missing.openGraph.locale, "en_US");
  assert.equal(showcaseCoverUrl("data:image/png;base64,xxx"), undefined);
  const khmer = { ...fixture, title: "ប្រព័ន្ធគ្រប់គ្រងគម្រោងសម្រាប់អ្នកអភិវឌ្ឍន៍", overview: "ចែករំលែកគម្រោង និងបទពិសោធន៍ជាមួយសហគមន៍អ្នកអភិវឌ្ឍន៍កម្ពុជា។", categoryName: "ការអភិវឌ្ឍកម្មវិធី", author: { fullName: "សុខ សុភា", username: "sophea" } };
  const km = await showcaseMetadata(khmer, fixture.id, "km");
  assert.equal(km.title.absolute, `${khmer.title} · DevSolve`);
  assert.equal(km.description, khmer.overview);
  const output = path.join(root, ".next", "showcase-seo-verification");
  fs.mkdirSync(output, { recursive: true });
  for (const [name, data] of [["english", fixture], ["khmer", khmer], ["long-title", { ...fixture, title: fixture.title.repeat(10) }], ["missing", null]]) {
    const response = await showcaseCard(data);
    const buffer = Buffer.from(await response.arrayBuffer());
    const size = await sharp(buffer).metadata();
    assert.equal(size.width, 1200);
    assert.equal(size.height, 630);
    fs.writeFileSync(path.join(output, `${name}.png`), buffer);
  }
  console.log(`Showcase metadata contracts passed; ${inspected.length} bounded cover probes; four 1200×630 PNGs rendered in ${output}`);
  if (process.argv.includes("--html") || process.argv.includes("--live-html")) {
    await verifyHtml(process.argv.includes("--live-html") ? { ...fixture,
      coverImageUrl: "https://file.quizzy.it.com/products/public/showcases/1fceaf60-f9b7-49ab-b780-cdaacbec3c55/cover/3d4bbf8d-d0c6-4a04-82ce-7ab936b88ba4.png",
    } : fixture, khmer, output);
  }
}

async function verifyHtml(english, khmer, output) {
  const http = require("node:http");
  const { spawn } = require("node:child_process");
  // Avoid sharing Next's persistent data cache between different fixture runs.
  const { randomUUID } = require("node:crypto");
  english = { ...english, id: randomUUID() };
  const kmId = randomUUID();
  const backend = http.createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    const record = request.url === `/showcases/${english.id}` ? english
      : request.url === `/showcases/${kmId}` ? { ...khmer, id: kmId, categoryName: null, tags: [] } : null;
    response.end(JSON.stringify(record || { content: [] }));
  });
  await new Promise(resolve => backend.listen(0, "127.0.0.1", resolve));
  const port = 3247;
  // NEXT_PUBLIC backend origins are inlined at build time. Redirect only the
  // two fixture reads in this isolated child, leaving production files intact.
  const preload = path.join(output, "fixture-fetch.cjs");
  fs.writeFileSync(preload, `const original = global.fetch;
global.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.href);
  if (url.pathname.endsWith('/showcases/${english.id}') || url.pathname.endsWith('/showcases/${kmId}')) {
    input = 'http://127.0.0.1:${backend.address().port}' + url.pathname.slice(url.pathname.lastIndexOf('/showcases/'));
  }
  return original(input, init);
};`);
  const child = spawn(process.execPath, ["--require", preload, require.resolve("next/dist/bin/next"), "start", "-p", String(port)], {
    cwd: root, env: { ...process.env, NEXT_PUBLIC_BACKEND_API_URL: `http://127.0.0.1:${backend.address().port}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", data => { log += data; });
  child.stderr.on("data", data => { log += data; });
  const base = `http://localhost:${port}`;
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      if (child.exitCode !== null) throw new Error(log);
      try { await fetch(`${base}/robots.txt`); break; } catch { await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    for (const [prefix, id, record, locale] of [["", english.id, english, "en_US"], ["/km", kmId, khmer, "km_KH"]]) {
      const route = `${prefix}/showcases/${id}`;
      const response = await fetch(`${base}${route}`, { headers: { "User-Agent": "facebookexternalhit/1.1" } });
      const html = await response.text();
      fs.writeFileSync(path.join(output, `${locale}.html`), html);
      assert.equal(response.status, 200, html.slice(0, 500));
      const head = html.slice(0, html.indexOf("</head>"));
      const metas = [...head.matchAll(/<meta\s[^>]*>/g)].map(match => match[0]);
      function meta(key) {
        const found = metas.filter(tag => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`));
        assert.equal(found.length, 1, `Expected exactly one ${key} in crawler HTML`);
        return found[0].match(/content="([^"]*)"/)[1];
      }
      assert.equal((head.match(/<title>/g) || []).length, 1);
      assert.ok(head.includes(`<title>${record.title} · DevSolve</title>`));
      assert.equal(meta("author"), record.author.fullName);
      assert.equal(meta("publisher"), "DevSolve");
      assert.equal(meta("og:site_name"), "DevSolve");
      assert.equal(meta("og:locale"), locale);
      assert.equal(meta("og:type"), "article");
      assert.equal(meta("og:image"), record.coverImageUrl || `https://devsolve.app${route}/social-image`);
      assert.equal(meta("twitter:image"), meta("og:image"));
      assert.equal(meta("og:image:alt"), record.title);
      assert.ok(Number(meta("og:image:width")) > 0);
      assert.ok(Number(meta("og:image:height")) > 0);
      if (!record.coverImageUrl) {
        assert.equal(meta("og:image:width"), "1200");
        assert.equal(meta("og:image:height"), "630");
      }
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
      const article = schemas.find(schema => schema["@type"] === "Article");
      assert.equal(article.author.name, record.author.fullName);
      assert.equal(article.inLanguage, prefix ? "km" : "en");
      assert.ok(!JSON.stringify(article).includes("undefined"));
      assert.ok(head.includes(`rel="canonical" href="https://devsolve.app${route}"`));
      if (prefix) {
        assert.ok(!metas.some(tag => /name="(?:category|keywords)"/.test(tag)));
        assert.equal(meta("description"), record.overview);
      }
      const png = await fetch(`${base}${route}/social-image`);
      assert.equal(png.status, 200);
      assert.ok(png.headers.get("content-type").startsWith("image/png"));
      assert.equal((await sharp(Buffer.from(await png.arrayBuffer())).metadata()).width, 1200);
    }
    console.log("Production HTML passed: one set of Showcase tags in the crawler head, localized canonicals, public PNG routes, and no inherited generic category/keywords.");
  } finally {
    child.kill();
    backend.close();
    fs.writeFileSync(path.join(output, "server.log"), log);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
