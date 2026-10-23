import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { canonicalUrlFor, PAGE_METADATA, PUBLIC_ROUTES, SITE_NAME, SOCIAL_IMAGE_URL } from "../src/config/metadata";
import { inspectRouteHtml } from "./html-validation";
import { BRAND_ASSETS, jsonLdEntities, validateBrandAssets } from "./brand-validation";
import { DRAFT_RESOURCES, PUBLISHED_RESOURCES, publishedResourceForPath, resourceFaqPairs, resourceRoute } from "../src/content/resources";
import { PROGRAMS } from "../src/config/site";
import { PROGRAM_FAQS } from "../src/config/pageContent";
import { countryPageForPath } from "../src/content/countryPages";

const distRoot = path.join(process.cwd(), "dist");
const internalLinks = new Set(PUBLIC_ROUTES);
const titles = new Set<string>();
const report: Array<{ route: string; title: string; h1: string }> = [];
await validateBrandAssets(distRoot);
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
  assert.equal(attribute(html, /<meta\s+property="og:site_name"\s+content="([^"]+)"/i, `${route}: og:site_name`), SITE_NAME);
  assert.equal(attribute(html, /<meta\s+name="twitter:title"\s+content="([^"]+)"/i, `${route}: twitter:title`), title);
  assert.ok(attribute(html, /<meta\s+name="twitter:description"\s+content="([^"]+)"/i, `${route}: twitter:description`));
  assert.equal(attribute(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"/i, `${route}: twitter:image`), SOCIAL_IMAGE_URL);
  assert.doesNotMatch(html, /<meta[^>]+(?:noindex|nofollow)/i, `${route}: indexable`);
  assert.match(html, new RegExp(`<link\\s+rel="icon"\\s+href="${BRAND_ASSETS.faviconSvg.replace("/", "\\/")}"`), `${route}: SVG favicon`);
  assert.match(html, new RegExp(`<link\\s+rel="icon"\\s+href="${BRAND_ASSETS.faviconPng.replace("/", "\\/")}"[^>]*sizes="48x48"`), `${route}: 48px PNG favicon`);
  assert.match(html, new RegExp(`<link\\s+rel="apple-touch-icon"\\s+href="${BRAND_ASSETS.appleTouchIcon.replace("/", "\\/")}"[^>]*sizes="180x180"`), `${route}: Apple touch icon`);
  assert.doesNotMatch(html, /(?:localhost|vercel\.app)[^"<]*(?:favicon|logo)|(?:favicon|logo)[^"<]*(?:localhost|vercel\.app)/i, `${route}: production-safe brand URLs`);
  for (const assetUrl of html.matchAll(/(?:src|href|content)="(\/(?:brand|assets)\/[^"?#]+)[^"#]*"/gi)) {
    await readFile(path.join(distRoot, assetUrl[1].slice(1)));
  }
  for (const script of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) JSON.parse(script[1]);
  if (route.startsWith("/resources/")) {
    const structuredData = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((script) => JSON.parse(script[1]) as { "@type"?: string });
    assert.equal(structuredData.filter((data) => data["@type"] === "Article").length, 1, `${route}: one Article structured-data record`);
    assert.equal(structuredData.filter((data) => data["@type"] === "BreadcrumbList").length, 1, `${route}: visible breadcrumbs have one BreadcrumbList record`);
    assert.match(html, /<nav\s+aria-label="Breadcrumb"/, `${route}: structured breadcrumbs are visible`);
    assert.match(html, /By\s+<strong[^>]*>[^<]+<\/strong>/, `${route}: visible author`);
    assert.match(html, /Updated\s+<time/, `${route}: visible updated date`);
  }
  const structuredBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((script) => JSON.parse(script[1]) as { "@type"?: string; name?: string; mainEntity?: Array<{ name?: string }> });
  const countType = (type: string) => structuredBlocks.filter((data) => data["@type"] === type).length;
  const resource = publishedResourceForPath(route);
  if (resource) {
    const pairs = resourceFaqPairs(resource);
    assert.equal(countType("FAQPage"), pairs.length > 0 ? 1 : 0, `${route}: FAQPage present exactly when the article renders an FAQ section`);
    if (pairs.length > 0) {
      const faq = structuredBlocks.find((data) => data["@type"] === "FAQPage");
      assert.deepEqual(faq?.mainEntity?.map((entity) => entity.name), pairs.map(([question]) => question), `${route}: FAQPage questions match the visible FAQ section`);
      for (const [question] of pairs) assert.ok(html.includes(question), `${route}: FAQ question is visible: ${question}`);
    }
  }
  const program = PROGRAMS.find((item) => item.path === route);
  if (program) {
    assert.equal(countType("Course"), 1, `${route}: one Course structured-data record`);
    assert.equal(countType("FAQPage"), 1, `${route}: one FAQPage structured-data record`);
    const course = structuredBlocks.find((data) => data["@type"] === "Course");
    assert.equal(course?.name, PAGE_METADATA[route].title, `${route}: Course name matches the page metadata title`);
    const faq = structuredBlocks.find((data) => data["@type"] === "FAQPage");
    assert.deepEqual(faq?.mainEntity?.map((entity) => entity.name), PROGRAM_FAQS[program.id].map(([question]) => question), `${route}: FAQPage questions match the visible FAQs`);
    for (const [question] of PROGRAM_FAQS[program.id]) assert.ok(html.includes(question), `${route}: FAQ question is visible: ${question}`);
  }
  const country = countryPageForPath(route);
  if (country) {
    assert.equal(countType("WebPage"), 1, `${route}: one WebPage structured-data record`);
    assert.equal(countType("BreadcrumbList"), 1, `${route}: one BreadcrumbList structured-data record`);
    assert.equal(countType("FAQPage"), 1, `${route}: one FAQPage structured-data record`);
    const faq = structuredBlocks.find((data) => data["@type"] === "FAQPage");
    assert.deepEqual(faq?.mainEntity?.map((entity) => entity.name), country.faqs.map(([question]) => question), `${route}: FAQPage questions match the visible FAQs`);
    for (const [question] of country.faqs) assert.ok(html.includes(question), `${route}: FAQ question is visible: ${question}`);
  }
  for (const link of html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/gi)) {
    const pathname = link[1].split(/[?#]/)[0];
    if (pathname.startsWith("/brand/") || pathname.startsWith("/assets/")) continue;
    assert.ok(internalLinks.has(pathname), `${route}: valid internal link ${pathname}`);
  }
  report.push({ route, title, h1 });
}

const homepage = await readFile(path.join(distRoot, "index.html"), "utf8");
const homepageEntities = jsonLdEntities(homepage);
const websites = homepageEntities.filter((entity) => entity["@type"] === "WebSite");
const organizations = homepageEntities.filter((entity) => entity["@type"] === "Organization");
assert.equal(websites.length, 1, "homepage has one WebSite entity");
assert.equal(organizations.length, 1, "homepage has one Organization entity");
assert.equal(websites[0].name, SITE_NAME, "WebSite name is Tajweed Scholars");
assert.equal(websites[0].url, canonicalUrlFor("/"), "WebSite URL is canonical homepage");
assert.deepEqual(websites[0].alternateName, [SITE_NAME, "tajweedscholars.com"], "WebSite alternate names are stable");
const organizationLogo = organizations[0].logo as Record<string, unknown>;
assert.equal(organizationLogo["@type"], "ImageObject", "Organization logo is an ImageObject");
assert.equal(organizationLogo.url, `${canonicalUrlFor("/")}brand/logo-mark-512.png`, "Organization logo uses the absolute production URL");
assert.deepEqual([organizationLogo.width, organizationLogo.height], [512, 512], "Organization logo dimensions match the asset");

const sitemap = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(sitemapUrls, PUBLIC_ROUTES.map(canonicalUrlFor), "sitemap URLs match generated public routes");
assert.equal(titles.size, PUBLIC_ROUTES.length, "all route titles are unique");
const rss = await readFile(path.join(distRoot, "rss.xml"), "utf8");
assert.doesNotThrow(() => { assert.match(rss, /^<\?xml[^>]+>\s*<rss\b[\s\S]*<\/rss>\s*$/); }, "RSS is well-formed XML-shaped output");
for (const resource of PUBLISHED_RESOURCES) assert.match(rss, new RegExp(canonicalUrlFor(resourceRoute(resource))), `${resource.slug}: present in RSS`);
for (const resource of DRAFT_RESOURCES) {
  assert.doesNotMatch(sitemap, new RegExp(resource.slug), `${resource.slug}: draft excluded from sitemap`);
  assert.doesNotMatch(rss, new RegExp(resource.slug), `${resource.slug}: draft excluded from RSS`);
}
console.table(report);
console.log(`SEO output validation passed for ${PUBLIC_ROUTES.length} routes.`);
