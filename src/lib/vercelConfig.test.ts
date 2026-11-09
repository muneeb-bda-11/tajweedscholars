import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PUBLIC_ROUTES } from "../config/metadata";

interface VercelConfig {
  $schema: string;
  trailingSlash: boolean;
  cleanUrls: boolean;
  rewrites?: unknown;
  routes?: unknown;
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
}

const config = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as VercelConfig;

assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
assert.equal(config.routes, undefined, "legacy routes must not override filesystem/API handling");
assert.equal(config.rewrites, undefined, "public routes must resolve to generated filesystem HTML");
// Redirects are allowed ONLY as exact legacy-URL 301s to real public routes (digest #60:
// a changed URL needs a proper 301). No wildcards, parameters, or catch-alls.
if (config.redirects !== undefined) {
  assert.ok(Array.isArray(config.redirects), "redirects must be a list of exact legacy-URL entries");
  for (const redirect of config.redirects) {
    assert.equal(typeof redirect.source, "string", "redirect source must be a path");
    assert.match(redirect.source, /^\//, "redirect source must be an absolute path");
    assert.doesNotMatch(redirect.source, /[*():?+\[\]]/, "redirect source must be an exact path, not a pattern");
    assert.equal(redirect.permanent, true, "legacy redirects must be permanent (301)");
    assert.ok(PUBLIC_ROUTES.includes(redirect.destination), `redirect destination must be a public route: ${redirect.destination}`);
  }
}
assert.equal(config.cleanUrls, true, "generated HTML is served through extensionless public URLs");
assert.equal(config.trailingSlash, false, "trailing-slash variants redirect to canonical non-trailing URLs");
for (const route of ["/programs/", "/pricing/", "/free-trial/"]) {
  assert.equal(config.trailingSlash, false, `${route} is normalized to its non-trailing canonical route`);
}
assert.equal(config.routes, undefined, "unknown paths remain real filesystem 404 responses");
assert.equal(config.rewrites, undefined, "API routes and static assets are not captured by a fallback rewrite");

const router = readFileSync(new URL("router.tsx", import.meta.url), "utf8");
assert.match(router, /window\.history\.pushState/);
assert.match(router, /window\.location\.pathname/);
assert.match(router, /href={to}/);
assert.doesNotMatch(router, /hashchange/);

console.log("Vercel filesystem prerendering preserves clean navigation and canonical trailing-slash behavior");
