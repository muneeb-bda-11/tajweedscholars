import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolveInitialRoute } from "./router";

assert.deepEqual(resolveInitialRoute({ pathname: "/pricing", search: "", hash: "" }), { path: "/pricing" });
assert.deepEqual(resolveInitialRoute({ pathname: "/free-trial", search: "?mainGoal=hifz", hash: "" }), { path: "/free-trial" });
assert.deepEqual(resolveInitialRoute({ pathname: "/", search: "", hash: "#/pricing" }), { path: "/pricing", replacement: "/pricing" });
assert.deepEqual(resolveInitialRoute({ pathname: "/", search: "", hash: "#/free-trial?mainGoal=hifz" }), { path: "/free-trial", replacement: "/free-trial?mainGoal=hifz" });
assert.deepEqual(resolveInitialRoute({ pathname: "/", search: "?focus=form", hash: "#/free-trial" }), { path: "/free-trial", replacement: "/free-trial?focus=form" });
assert.deepEqual(resolveInitialRoute({ pathname: "/", search: "", hash: "#//evil.example" }), { path: "/" });
assert.deepEqual(resolveInitialRoute({ pathname: "/", search: "", hash: "#/unknown" }), { path: "/" });

const router = readFileSync(new URL("router.tsx", import.meta.url), "utf8");
for (const expected of ["history.pushState", "history.replaceState", 'addEventListener("popstate"', "window.location.pathname", "window.location.search", "active-route", "href={to}"]) assert.match(router, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
for (const removed of ["hashchange", "window.location.hash =", "href={`#${to}`}"]) assert.doesNotMatch(router, new RegExp(removed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

const sourceFolders = ["../components/", "../pages/"];
for (const folder of sourceFolders) {
  for (const file of readdirSync(new URL(folder, import.meta.url)).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(new URL(`${folder}${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /href=["'{`]#\//, `${file} contains a hash-based public link`);
  }
}

const metadata = readFileSync(new URL("../config/metadata.ts", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
assert.doesNotMatch(metadata + sitemap, /https:\/\/tajweedscholars\.com\/#/);

const trialForm = readFileSync(new URL("../components/TrialForm.tsx", import.meta.url), "utf8");
assert.match(trialForm, /window\.location\.search/);
for (const field of ["learnerType", "ageGroup", "mainGoal", "recommendedProgram", "focus"]) assert.match(trialForm, new RegExp(field));

const contact = readFileSync(new URL("../pages/Contact.tsx", import.meta.url), "utf8");
assert.match(contact, /id="contact-trial-cta-card"[\s\S]*text-stone-600/);
assert.doesNotMatch(contact, /id="contact-trial-cta-card"[\s\S]*text-stone-200/);

console.log("Clean History API routing, legacy migration, query preservation, and link assertions passed");
