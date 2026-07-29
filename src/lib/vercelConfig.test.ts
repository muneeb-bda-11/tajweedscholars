import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

interface VercelConfig {
  $schema: string;
  trailingSlash: boolean;
  cleanUrls: boolean;
  rewrites?: unknown;
  routes?: unknown;
}

const config = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as VercelConfig;

assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
assert.equal(config.routes, undefined, "legacy routes must not override filesystem/API handling");
assert.equal(config.rewrites, undefined, "public routes must resolve to generated filesystem HTML");
assert.equal(config.cleanUrls, true, "generated HTML is served through extensionless public URLs");
assert.equal(config.trailingSlash, false, "trailing-slash variants redirect to canonical non-trailing URLs");

const router = readFileSync(new URL("router.tsx", import.meta.url), "utf8");
assert.match(router, /window\.history\.pushState/);
assert.match(router, /window\.location\.pathname/);
assert.match(router, /href={to}/);
assert.doesNotMatch(router, /hashchange/);

console.log("Vercel filesystem prerendering preserves clean navigation and canonical trailing-slash behavior");
