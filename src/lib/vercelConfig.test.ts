import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGE_METADATA } from "../config/metadata";

interface VercelConfig {
  $schema: string;
  rewrites: Array<{ source: string; destination: string }>;
  routes?: unknown;
}

const config = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as VercelConfig;

assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
assert.equal(config.routes, undefined, "legacy routes must not override filesystem/API handling");

const expectedPublicDeepLinks = Object.keys(PAGE_METADATA).filter((route) => route !== "/");
const sources = config.rewrites.map(({ source }) => source);
assert.deepEqual(sources, expectedPublicDeepLinks, "every clean public URL has one exact SPA fallback");
assert.equal(new Set(sources).size, sources.length, "fallback sources are unique");
for (const rewrite of config.rewrites) {
  assert.equal(rewrite.destination, "/index.html");
  assert.ok(!rewrite.source.includes("*"), "fallbacks must not catch API or static resources");
}

for (const preservedPath of [
  "/api/trial-leads",
  "/robots.txt",
  "/sitemap.xml",
  "/assets/example.js",
  "/brand/logo-horizontal.svg",
]) {
  assert.ok(!sources.includes(preservedPath), `${preservedPath} bypasses the SPA fallback`);
}

const router = readFileSync(new URL("router.tsx", import.meta.url), "utf8");
assert.match(router, /window\.location\.hash/);
assert.match(router, /window\.location\.pathname/);
assert.match(router, /href={`#\${to}`}/);

console.log("Vercel exact public-route fallbacks preserve API/static files and hash navigation");
