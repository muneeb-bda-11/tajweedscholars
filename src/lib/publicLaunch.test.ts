import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../App.tsx");
const contact = read("../pages/Contact.tsx");
const pricing = read("../pages/Pricing.tsx");
const programs = read("../pages/ProgramPage.tsx");
const about = read("../pages/About.tsx");
const why = read("../pages/WhyChooseUs.tsx");
const policy = read("../pages/PrivacyPolicy.tsx");
const config = read("../config/site.ts");
const header = read("../components/Header.tsx");
const footer = read("../components/Footer.tsx");

assert.doesNotMatch(contact, /ContactForm|success|DEMO_MODE|FORM_ENDPOINT/);
assert.match(contact, /WhatsApp/); assert.match(contact, /Email/); assert.match(contact, /Book 3 Free Trial Classes/);
assert.doesNotMatch(pricing + config, /SHOW_EXACT_PRICES|pricing-exact-toggle|Exact prices enabled|Interactive switch linked/);
assert.match(pricing, /Plans from \$40\/month/); assert.match(pricing, /30-minute/); assert.match(pricing, /Zoom/);

const programRoutes = ["kids-quran-classes", "adult-quran-classes", "tajweed-course", "hifz-program", "arabic-language", "islamic-studies"];
for (const route of programRoutes) assert.match(app, new RegExp(`<Route path="/${route}" element={<ProgramPage />} />`));
assert.match(programs, /What the student learns/); assert.match(programs, /How classes work/); assert.match(programs, /Program highlights/); assert.match(programs, /30 minutes/);
assert.match(programs, /Children ages 4–15/); assert.match(programs, /consultation-based/); assert.match(programs, /not as a standalone program/);

assert.match(app, /path="\/about" element={<About \/>}/); assert.doesNotMatch(about, /placeholder|under construction/i); assert.match(about, /complete verified Sanad/);
assert.match(app, /path="\/why-choose-us" element={<WhyChooseUs \/>}/); assert.doesNotMatch(why, /placeholder|under construction/i); assert.match(why, /WHY_CHOOSE_US/); assert.match(why, /TRUST_STRIP/);
assert.match(policy, /Privacy Policy/); assert.match(policy, /90 days/); assert.match(policy, /not been legally reviewed/); assert.match(policy + config, /tajweedscholar@gmail.com/);

assert.match(app, /path="\/free-trial" element={<FreeTrial \/>}/);
assert.match(header, /mobile-programs/); assert.match(header, /mobile-policies/); assert.match(header, /NAVIGATION_LINKS\.programs/);
for (const path of ["/about", "/pricing", "/free-trial", "/contact"]) assert.match(footer, new RegExp(path.replace("/", "\\/")));

console.log("Public launch blocker route and presentation assertions passed");
