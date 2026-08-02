import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PAGE_METADATA, PUBLIC_ROUTES, canonicalUrlFor } from "../config/metadata";
import { DRAFT_RESOURCES, PUBLISHED_RESOURCES, RESOURCE_RECORDS, publishedResourceForPath, resourceRoute } from "../content/resources";

assert.equal(RESOURCE_RECORDS.length, 5);
assert.equal(PUBLISHED_RESOURCES.length, 1);
assert.equal(DRAFT_RESOURCES.length, 4);
assert.equal(PUBLIC_ROUTES.length, Object.keys(PAGE_METADATA).length, "public routes are derived from published metadata");
assert.equal(new Set(RESOURCE_RECORDS.map(({ slug }) => slug)).size, RESOURCE_RECORDS.length, "resource slugs are unique");

for (const resource of RESOURCE_RECORDS) {
  assert.ok(resource.title && resource.slug && resource.metaDescription && resource.summary && resource.category && resource.intendedAudience && resource.authorName && resource.updatedDate);
  assert.match(resource.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  if (resource.draft) {
    assert.equal(resource.publishedDate, null);
    assert.ok(!PUBLIC_ROUTES.includes(resourceRoute(resource)), `${resource.slug} draft has no public route`);
    assert.equal(PAGE_METADATA[resourceRoute(resource)], undefined, `${resource.slug} draft has no public metadata`);
    assert.equal(publishedResourceForPath(resourceRoute(resource)), undefined);
    assert.equal(existsSync(new URL(`../../dist/resources/${resource.slug}/index.html`, import.meta.url)), false, `${resource.slug} draft has no generated HTML`);
  } else if ("sections" in resource) {
    assert.ok(resource.publishedDate && resource.introduction && resource.sections.length);
    assert.ok(PUBLIC_ROUTES.includes(resourceRoute(resource)));
    assert.deepEqual(PAGE_METADATA[resourceRoute(resource)], { title: `${resource.title} | Tajweed Scholars`, description: resource.metaDescription });
    for (const route of resource.relatedProgramRoutes) assert.ok(PUBLIC_ROUTES.includes(route), `${resource.slug} has valid related route ${route}`);
  }
}

assert.equal(publishedResourceForPath("/resources/not-a-published-resource"), undefined);
assert.ok(!PUBLIC_ROUTES.includes("/resources/not-a-published-resource"), "unknown resource slug remains a filesystem 404");
assert.equal(existsSync(new URL("../../dist/resources/not-a-published-resource/index.html", import.meta.url)), false, "unknown resource slug has no generated HTML");

if (existsSync(new URL("../../dist/rss.xml", import.meta.url))) {
  const rss = readFileSync(new URL("../../dist/rss.xml", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../../dist/sitemap.xml", import.meta.url), "utf8");
  for (const resource of PUBLISHED_RESOURCES) {
    assert.match(rss, new RegExp(canonicalUrlFor(resourceRoute(resource))));
    assert.match(sitemap, new RegExp(canonicalUrlFor(resourceRoute(resource))));
  }
  for (const resource of DRAFT_RESOURCES) {
    assert.doesNotMatch(rss, new RegExp(resource.slug));
    assert.doesNotMatch(sitemap, new RegExp(resource.slug));
  }
}

console.log("Typed resource publication and draft-exclusion rules passed");
