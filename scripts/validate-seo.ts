import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { canonicalUrlFor, PAGE_METADATA, PUBLIC_ROUTES, SOCIAL_IMAGE_URL } from "../src/config/metadata";
import { inspectRouteHtml } from "./html-validation";

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
  const { inspection, errors } = inspectRouteHtml(html, { ...PAGE_METADATA[route], canonical: canonicalUrlFor(route) });
  assert.deepEqual(errors, [], `${route}: generated HTML validation:\n- ${errors.join("\n- ")}`);
  const { title, h1 } = inspection;
  assert.ok(!titles.has(title), `${route}: title is unique`);
  titles.add(title);
  assert.equal(attribute(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i, `${route}: og:title`), title);
  assert.ok(attribute(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i, `${route}: og:description`));
  assert.equal(attribute(html, /<meta\s+property="og:url"\s+content="([^"]+)"/i, `${route}: og:url`), canonicalUrlFor(route));
  assert.equal(attribute(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i, `${route}: og:image`), SOCIAL_IMAGE_URL);
  assert.equal(attribute(html, /<meta\s+name="twitter:title"\s+content="([^"]+)"/i, `${route}: twitter:title`), title);
  assert.ok(attribute(html, /<meta\s+name="twitter:description"\s+content="([^"]+)"/i, `${route}: twitter:description`));
  assert.equal(attribute(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"/i, `${route}: twitter:image`), SOCIAL_IMAGE_URL);
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
