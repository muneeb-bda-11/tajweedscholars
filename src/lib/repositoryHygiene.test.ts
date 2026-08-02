import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const readme = read("README.md");
const environment = read(".env.example");
const metadata = read("metadata.json");
const vite = read("vite.config.ts");

for (const source of [readme, environment, metadata, vite]) assert.doesNotMatch(source, /AI Studio|Gemini|GEMINI_API_KEY|MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API/i);
for (const expected of ["React 19", "Vite", "scripts/prerender.tsx", "Vercel deployment", "npm test", "npm run validate:seo", "Manual deployment fallback"]) assert.match(readme, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
assert.match(environment, /^APPS_SCRIPT_WEB_APP_URL=$/m);
assert.match(environment, /^APPS_SCRIPT_API_SECRET=$/m);
assert.deepEqual(JSON.parse(metadata), {
  name: "Tajweed Scholars",
  description: "Live, private one-to-one online Quran classes for children and adults, with three free trial classes.",
});
for (const stale of ["assets/.aistudio/.gitignore", "ts.mjs -ErrorAction SilentlyContinue", "tatusgit commit -m Complete Tajweed Scholars Phase 1 website", "tatus"]) assert.equal(existsSync(new URL(stale, root)), false, `${stale} is removed`);

console.log("Repository documentation, environment sample, metadata, and stale-file hygiene assertions passed");
