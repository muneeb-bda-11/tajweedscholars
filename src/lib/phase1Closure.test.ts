import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PAGE_METADATA, PUBLIC_ROUTES } from "../config/metadata";
import { POLICIES } from "../config/policies";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../App.tsx");
const footer = read("../components/Footer.tsx");
const safeguarding = read("../components/SafeguardingSummary.tsx");
const program = read("../pages/ProgramPage.tsx");
const why = read("../pages/WhyChooseUs.tsx");
const notFound = read("../pages/NotFound.tsx");
const robots = read("../../public/robots.txt");
const sitemap = read("../../public/sitemap.xml");

const policyRoutes = ["/terms-and-conditions", "/payment-policy", "/refund-policy", "/reschedule-policy", "/child-safeguarding", "/recording-policy", "/complaints", "/acceptable-use"];
for (const route of policyRoutes) {
  assert.ok(POLICIES[route], `${route} has approved page content`);
  assert.match(app, new RegExp(`path="${route}"`));
  assert.match(footer + read("../config/site.ts"), new RegExp(route));
}
assert.match(footer + read("../config/site.ts"), /Privacy Policy/);

assert.equal(PUBLIC_ROUTES.length, 22);
assert.equal(new Set(Object.values(PAGE_METADATA).map(({ title }) => title)).size, PUBLIC_ROUTES.length);
for (const route of PUBLIC_ROUTES) {
  const metadata = PAGE_METADATA[route];
  assert.ok(metadata.title && metadata.description);
  const url = `https://tajweedscholars.com${route === "/" ? "/" : route}`;
  assert.match(sitemap, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(robots, /Allow: \/\s/);
assert.match(robots, /Disallow: \/api\//);
assert.doesNotMatch(robots + sitemap, /localhost|src\/|node_modules|trial-leads/);
assert.match(app, /<NotFoundRoute \/>/);
assert.match(notFound, /PUBLIC_ROUTES\.includes\(path\) \? null : <NotFound \/>/);
assert.match(notFound, /404 — Page not found/);

assert.match(program, /program\.id === "kids-classes" && <SafeguardingSummary/);
assert.match(why, /<SafeguardingSummary \/>/);
assert.match(safeguarding, /\/child-safeguarding/);
for (const truth of ["parent or guardian", "official Tajweed Scholars WhatsApp, email, and Zoom channels", "identity", "verified Sanad\/Ijazah", "safeguarding agreement", "Founder \/ Operations Lead"]) assert.match(safeguarding, new RegExp(truth, "i"));

const publicSource = readdirSync(new URL("../pages/", import.meta.url)).filter((file) => file.endsWith(".tsx")).map((file) => read(`../pages/${file}`)).join("\n") + footer + safeguarding;
for (const prohibited of [/Stripe/i, /PayPal/i, /\bWise\b/i, /58\+\s*teachers/i, /guaranteed results/i, /placeholder phone/i, /live dashboard/i, /parent portal/i, /student portal/i]) assert.doesNotMatch(publicSource, prohibited);

// The submission module remains the sole browser API boundary; tests use a fake fetch only.
const submission = read("trialSubmission.ts");
assert.match(submission, /\/api\/trial-leads/);
assert.doesNotMatch(submission, /script\.google|sendgrid|google sheets/i);

console.log("Phase 1 launch closure routes, metadata, SEO, safeguarding, claims, and API-boundary assertions passed");
