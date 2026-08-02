import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ATTRIBUTION_SESSION_KEY, attributionForSubmission, captureFirstTouchAttribution, type AttributionBrowser } from "./attribution";

const memoryStorage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, values };
};
const browser = (href: string, referrer = "", storage = memoryStorage(), now = "2026-08-03T10:00:00.000Z"): AttributionBrowser => {
  const url = new URL(href);
  return { location: { href, origin: url.origin, pathname: url.pathname }, document: { referrer }, sessionStorage: storage, now: () => new Date(now) };
};

const storage = memoryStorage();
const first = captureFirstTouchAttribution(browser("https://tajweedscholars.com/?utm_source= facebook%20&utm_medium=organic&utm_campaign=launch&utm_content=kids-post&utm_term=" + "x".repeat(300) + "&gclid=secret&fbclid=secret", "https://search.example/results?q=quran", storage));
assert.equal(first?.utm_source, "facebook");
assert.equal(first?.utm_medium, "organic");
assert.equal(first?.utm_term?.length, 160);
assert.equal(first?.referrer_host, "search.example");
assert.equal(first?.landing_path, "/");
assert.equal(first?.first_touch_at, "2026-08-03T10:00:00.000Z");
assert.ok(!("gclid" in (first ?? {})) && !("fbclid" in (first ?? {})));
assert.doesNotMatch(storage.values.get(ATTRIBUTION_SESSION_KEY) ?? "", /results|q=quran|gclid|fbclid/);

const later = captureFirstTouchAttribution(browser("https://tajweedscholars.com/pricing?utm_source=overwrite&utm_campaign=later", "https://other.example/path?private=yes", storage));
assert.deepEqual(later, first, "later URLs do not overwrite first touch");
assert.deepEqual(attributionForSubmission("/free-trial?ignored=yes", browser("https://tajweedscholars.com/free-trial", "", storage)), { ...first, submission_path: "/free-trial" });

const sameOrigin = captureFirstTouchAttribution(browser("https://tajweedscholars.com/about", "https://tajweedscholars.com/programs?utm_source=internal"));
assert.equal(sameOrigin?.referrer_host, undefined);
assert.equal(sameOrigin?.landing_path, "/about");
const direct = captureFirstTouchAttribution(browser("https://tajweedscholars.com/free-trial"));
assert.equal(direct?.utm_source, undefined);
assert.equal(direct?.referrer_host, undefined);

const unavailable = browser("https://tajweedscholars.com/?utm_source=test");
unavailable.sessionStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
assert.equal(captureFirstTouchAttribution(unavailable), undefined);
assert.doesNotThrow(() => captureFirstTouchAttribution());
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", { configurable: true, get() { throw new Error("unavailable"); } });
assert.equal(captureFirstTouchAttribution(), undefined);
if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else delete (globalThis as { window?: unknown }).window;

const source = readFileSync(new URL("./attribution.ts", import.meta.url), "utf8");
assert.doesNotMatch(source, /localStorage|document\.cookie|gclid|fbclid/);
assert.match(source, /typeof window/, "SSR access is guarded");
const formSource = readFileSync(new URL("../components/TrialForm.tsx", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
assert.match(formSource, /attributionForSubmission\(\)/, "submission includes stored first touch");
assert.match(mainSource, /captureFirstTouchAttribution\(\)/, "first page bootstrap captures attribution");
assert.doesNotMatch(formSource, /name=["'](?:utm_|referrer_host|landing_path|submission_path|first_touch_at)/, "attribution is not rendered as form fields");
console.log("Privacy-conscious first-touch attribution tests passed");
