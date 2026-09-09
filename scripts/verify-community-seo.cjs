/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness loads the TypeScript modules directly. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const sharp = require("sharp");
const { randomUUID } = require("node:crypto");
const root = path.resolve(__dirname, "..");
const output = path.join(root, ".next/community-seo-verification");
fs.mkdirSync(output, { recursive: true });
process.env.NEXT_PUBLIC_SITE_URL = "https://devsolve.app";
process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.test/api/v1";
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  return resolve.call(this, id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : id, ...args);
};
for (const extension of [".ts", ".tsx"]) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
require("next/cache").unstable_cache = fn => fn;
const optimizer = require("next/dist/server/image-optimizer");
require.cache[require.resolve("next/dist/server/image-optimizer")].exports = { ...optimizer,
  fetchExternalImage: async (url, privateIP, maxBytes) => {
    assert.equal(privateIP, false);
    assert.equal(maxBytes, 5 * 1024 * 1024);
    if (url.includes("broken")) throw new Error("Unavailable image");
    return { buffer: await sharp({ create: { width: 800, height: 450, channels: 3, background: "white" } }).png().toBuffer() };
  },
};
const { communityMetadata, communityDetails, getCommunityContent, communityImageCandidates } = require("../src/lib/seo/community.ts");
const { contentCard } = require("../src/lib/seo/content-card.tsx");
const problem = { id: randomUUID(), title: "Fix WebSocket timeouts", description: "**Actual** problem with `proxy_read_timeout`.",
  author: { id: randomUUID(), fullName: "Problem Author" }, category: { name: "Networking" },
  tags: [{ name: "Nginx" }], technologies: [{ name: "WebSocket" }], createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z" };
const solution = { id: randomUUID(), problemId: problem.id, summary: "Extend the Nginx timeout", bodyMarkdown: "The **real solution**, with a safe <b>description</b>.",
  author: { id: randomUUID(), displayName: "Solution Author" }, testedWith: [{ technology: "Nginx" }], createdAt: "2026-09-03T00:00:00Z", updatedAt: "2026-09-04T00:00:00Z" };

async function main() {
  for (const selected of [false, true]) {
    for (const lang of ["en", "km"]) {
      const record = selected ? solution : problem;
      const content = { problem, solution: selected ? solution : null, solutionId: selected ? solution.id : undefined };
      const meta = await communityMetadata(content, problem.id, lang);
      const prefix = lang === "km" ? "/km" : "";
      const query = selected ? `?solution=${solution.id}` : "";
      assert.equal(meta.title.absolute, `${selected ? solution.summary : problem.title} · DevSolve`);
      assert.equal(meta.authors[0].name, selected ? "Solution Author" : "Problem Author");
      assert.equal(meta.openGraph.publishedTime, new Date(record.createdAt).toISOString());
      assert.equal(meta.openGraph.modifiedTime, new Date(record.updatedAt).toISOString());
      assert.equal(meta.openGraph.images[0].url, `https://devsolve.app${prefix}/community/${problem.id}/social-image${query}`);
      assert.deepEqual(meta.openGraph.images, meta.twitter.images);
      assert.equal(meta.alternates.canonical, `${prefix}/community/${problem.id}${query}`);
      assert.equal(meta.openGraph.locale, lang === "km" ? "km_KH" : "en_US");
      assert.equal(meta.category, "Networking");
      assert.deepEqual(meta.keywords, ["Nginx", "WebSocket", "Networking"]);
      const withImage = { ...record, attachments: [{ mimeType: "image/png", downloadUrl: "/api/v1/problems/test/attachments/photo/download" }] };
      const imageMeta = await communityMetadata({ ...content, [selected ? "solution" : "problem"]: withImage }, problem.id, lang);
      assert.equal(imageMeta.openGraph.images[0].url, "https://devsolve.app/api/problems/test/attachments/photo/download");
      assert.equal(imageMeta.openGraph.images[0].width, 800);
      assert.deepEqual(imageMeta.openGraph.images, imageMeta.twitter.images);
    }
  }
  const blank = await communityMetadata({ problem: { id: problem.id, title: "Minimal" }, solution: null }, problem.id, "en");
  assert.equal(blank.authors, null);
  assert.equal(blank.creator, null);
  assert.equal(blank.category, null);
  assert.equal(blank.keywords, null);
  const unavailable = await communityMetadata({ problem, solution: null, solutionId: solution.id }, problem.id, "en");
  assert.equal(unavailable.robots.index, false);
  assert.equal(unavailable.authors, null);
  assert.equal(unavailable.title.absolute, "Solution · DevSolve");
  assert.deepEqual(communityImageCandidates([{ mimeType: "application/pdf", downloadUrl: "/guide.pdf" }], "![Diagram](/uploads/diagram.png)"), ["https://devsolve.app/uploads/diagram.png"]);
  assert.deepEqual(communityImageCandidates([{ mimeType: "image/png", downloadUrl: "javascript:alert(1)" }]), []);
  const broken = await communityMetadata({ problem: { ...problem, attachments: [{ mimeType: "image/png", downloadUrl: "/broken.png" }] }, solution: null }, problem.id, "en");
  assert.ok(broken.openGraph.images[0].url.endsWith("/social-image"));
  const originalFetch = global.fetch;
  let servedSolution = solution;
  global.fetch = async url => new Response(JSON.stringify(String(url).includes("/solutions/") ? servedSolution : problem));
  assert.equal((await getCommunityContent(problem.id, solution.id)).solution.id, solution.id);
  servedSolution = { ...solution, problemId: randomUUID() };
  assert.equal((await getCommunityContent(problem.id, solution.id)).solution, null);
  servedSolution = { ...solution, moderation: { status: "PENDING" } };
  assert.equal((await getCommunityContent(problem.id, solution.id)).solution, null);
  assert.equal((await getCommunityContent(problem.id, "bad-id")).solution, null);
  global.fetch = async () => Response.json({ ...problem, status: "DRAFT" });
  assert.equal((await getCommunityContent(problem.id)).problem, null);
  global.fetch = originalFetch;
  for (const [name, selected, title] of [["problem-en", false, problem.title], ["solution-en", true, solution.summary],
    ["problem-km", false, "បញ្ហាការតភ្ជាប់ទៅម៉ាស៊ីនមេ និងការកំណត់ប្រព័ន្ធសម្រាប់អ្នកអភិវឌ្ឍន៍"],
    ["solution-km", true, "កែសម្រួលការកំណត់ Nginx និងពន្យារពេលដល់ ២៤ ម៉ោង"]]) {
    const details = communityDetails({ problem: { ...problem, title }, solution: { ...solution, summary: title }, solutionId: selected ? solution.id : undefined });
    const png = Buffer.from(await (await contentCard({ title: details.title, description: details.body, label: details.kind, author: { name: details.authorName } })).arrayBuffer());
    assert.equal((await sharp(png).metadata()).width, 1200);
    fs.writeFileSync(path.join(output, `${name}.png`), png);
  }
  console.log("Problem/solution metadata contracts, ownership checks, and four PNG renders passed.");
  if (process.argv.includes("--html")) await verifyHtml();
}

async function verifyHtml() {
  const { spawn } = require("node:child_process");
  const preload = path.join(output, "fixtures.cjs");
  fs.writeFileSync(preload, `const original = global.fetch;
const problem = ${JSON.stringify(problem)}, solution = ${JSON.stringify(solution)};
global.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.href);
  if (url.pathname.endsWith('/problems/' + problem.id)) return Promise.resolve(Response.json(problem));
  if (url.pathname.endsWith('/solutions/' + solution.id)) return Promise.resolve(Response.json(solution));
  if (url.pathname.endsWith('/problems/' + problem.id + '/solutions')) return Promise.resolve(Response.json({content: []}));
  return original(input, init);
};`);
  const child = spawn(process.execPath, ["--require", preload, require.resolve("next/dist/bin/next"), "start", "-p", "3249"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  child.stdout.on("data", chunk => { log += chunk; });
  child.stderr.on("data", chunk => { log += chunk; });
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      if (child.exitCode !== null) throw new Error(log);
      try { await fetch("http://localhost:3249/robots.txt"); break; } catch { await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    for (const lang of ["en", "km"]) for (const selected of [false, true]) {
      const prefix = lang === "km" ? "/km" : "";
      const query = selected ? `?solution=${solution.id}` : "";
      const route = `${prefix}/community/${problem.id}${query}`;
      const response = await fetch(`http://localhost:3249${route}`, { headers: { "user-agent": "facebookexternalhit/1.1" } });
      const html = await response.text();
      assert.equal(response.status, 200);
      fs.writeFileSync(path.join(output, `${lang}-${selected ? "solution" : "problem"}.html`), html);
      const head = html.slice(0, html.indexOf("</head>"));
      const tags = [...head.matchAll(/<meta\s[^>]*>/g)].map(match => match[0]);
      function meta(key) {
        const matches = tags.filter(tag => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`));
        assert.equal(matches.length, 1, `Expected one ${key}`);
        return matches[0].match(/content="([^"]*)"/)[1];
      }
      assert.equal(meta("author"), selected ? "Solution Author" : "Problem Author");
      assert.equal(meta("publisher"), "DevSolve");
      assert.equal(meta("og:locale"), lang === "km" ? "km_KH" : "en_US");
      assert.equal(meta("og:type"), "article");
      assert.equal(meta("og:image"), meta("twitter:image"));
      assert.equal(meta("og:image:alt"), selected ? solution.summary : problem.title);
      assert.equal(meta("og:image:width"), "1200");
      assert.ok(head.includes(`rel="canonical" href="https://devsolve.app${route}"`));
      assert.equal((head.match(/<title>/g) || []).length, 1);
      if (selected) assert.ok(html.includes(solution.summary), "Shared solution must be passed to the client even outside the first page");
      const imagePath = new URL(meta("og:image")).pathname + query;
      const png = await fetch(`http://localhost:3249${imagePath}`);
      assert.equal(png.status, 200);
      assert.equal((await sharp(Buffer.from(await png.arrayBuffer())).metadata()).height, 630);
    }
    console.log("Production crawler HTML and anonymous image routes passed for problems and solutions in both locales.");
  } finally {
    child.kill();
    fs.writeFileSync(path.join(output, "server.log"), log);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
