import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { canonicalUrlFor, PAGE_METADATA, PUBLIC_ROUTES, SOCIAL_IMAGE_URL } from "../src/config/metadata";

const distRoot = path.join(process.cwd(), "dist");
const internalLinks = new Set(PUBLIC_ROUTES);
const titles = new Set<string>();
const report: Array<{ route: string; title: string; h1: string }> = [];
const decodeHtml = (value: string) => value
  .replaceAll("&quot;", '"')
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");
const attribute = (html: string, selector: RegExp, label: string) => {
  const match = html.match(selector);
  assert.ok(match?.[1], label);
  return decodeHtml(match[1]);
};

for (const route of PUBLIC_ROUTES) {
  const file = path.join(distRoot, route === "/" ? "index.html" : route.slice(1), ...(route === "/" ? [] : ["index.html"]));
  const html = await readFile(file, "utf8");
  const title = attribute(html, /<title>([^<]+)<\/title>/i, `${route}: title`);
  assert.equal(title, PAGE_METADATA[route].title, `${route}: configured title`);
  assert.ok(!titles.has(title), `${route}: title is unique`);
  titles.add(title);
  assert.equal(attribute(html, /<meta\s+name="description"\s+content="([^"]+)"/i, `${route}: description`), PAGE_METADATA[route].description);
  assert.equal(attribute(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, `${route}: canonical`), canonicalUrlFor(route));
  assert.equal(attribute(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i, `${route}: og:title`), title);
  assert.ok(attribute(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i, `${route}: og:description`));
  assert.equal(attribute(html, /<meta\s+property="og:url"\s+content="([^"]+)"/i, `${route}: og:url`), canonicalUrlFor(route));
  assert.equal(attribute(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i, `${route}: og:image`), SOCIAL_IMAGE_URL);
  assert.equal(attribute(html, /<meta\s+name="twitter:title"\s+content="([^"]+)"/i, `${route}: twitter:title`), title);
  assert.ok(attribute(html, /<meta\s+name="twitter:description"\s+content="([^"]+)"/i, `${route}: twitter:description`));
  assert.equal(attribute(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"/i, `${route}: twitter:image`), SOCIAL_IMAGE_URL);
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1s.length, 1, `${route}: exactly one H1`);
  const h1 = h1s[0][1].replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").trim();
  assert.ok(h1.length > 2, `${route}: non-empty H1`);
  const root = attribute(html, /<div\s+id="root">([\s\S]+)<\/div>\s*<\/body>/i, `${route}: prerendered root`);
  assert.ok(root.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 200, `${route}: meaningful body content`);
  assert.doesNotMatch(html, /localhost|vercel\.app/i, `${route}: production URLs only`);
  assert.doesNotMatch(html, /<meta[^>]+(?:noindex|nofollow)/i, `${route}: indexable`);
  for (const script of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) JSON.parse(script[1]);
  for (const link of html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/gi)) {
    const pathname = link[1].split(/[?#]/)[0];
    if (pathname.startsWith("/brand/") || pathname.startsWith("/assets/")) continue;
    assert.ok(internalLinks.has(pathname), `${route}: valid internal link ${pathname}`);
  }
  report.push({ route, title, h1 });
}

const sitemap = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(sitemapUrls, PUBLIC_ROUTES.map(canonicalUrlFor), "sitemap URLs match generated public routes");
assert.equal(titles.size, PUBLIC_ROUTES.length, "all route titles are unique");
console.table(report);
console.log(`SEO output validation passed for ${PUBLIC_ROUTES.length} routes.`);
