import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const phoneSelector = readFileSync(new URL("../components/PhoneCountrySelect.tsx", import.meta.url), "utf8");
const form = readFileSync(new URL("../components/TrialForm.tsx", import.meta.url), "utf8");
const routes = readFileSync(new URL("routeModules.ts", import.meta.url), "utf8");
const pathways = readFileSync(new URL("../components/home/AudiencePathSelector.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../components/home/HeroLessonVisual.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

assert.doesNotMatch(phoneSelector, /^import flags from/m, "the complete flag registry is not in the initial Free Trial graph");
assert.match(phoneSelector, /await import\("react-phone-number-input\/flags"\)/, "flags load on demand");
assert.match(form, /if \(current === 1\) await preloadCountryFlags\(\); showStep\(current \+ 1\)/, "validated Step 1 loads flags before Step 2 is shown");

const idleRoutes = routes.match(/const run = \(\) => \[(.*?)\]\.forEach\(prefetchRoute\)/)?.[1] || "";
assert.doesNotMatch(idleRoutes, /free-trial/, "Free Trial is not idle-prefetched");
assert.match(routes, /connection\?\.saveData/);
assert.match(routes, /effectiveType\?\.includes\("2g"\)/);

assert.match(pathways, /loading="lazy" decoding="async"/);
assert.match(footer, /loading="lazy" decoding="async"/);
assert.match(hero, /fetchPriority="high"/);
assert.doesNotMatch(hero, /loading="lazy"/);

assert.doesNotMatch(css, /fonts\.googleapis\.com/);
assert.match(html, /rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);
assert.match(html, /rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin/);
assert.match(html, /family=Inter:wght@400;500;600;700&family=Noto\+Naskh\+Arabic:wght@400;500;600;700&family=Plus\+Jakarta\+Sans:wght@600;700;800/);

console.log("Deferred heavy data, route prefetch, image, and font delivery tests passed");
