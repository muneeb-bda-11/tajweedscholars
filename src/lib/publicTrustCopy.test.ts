import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const publicSources = [
  ...readdirSync(new URL("../pages/", import.meta.url)).filter((file) => file.endsWith(".tsx")).map((file) => read(`../pages/${file}`)),
  ...readdirSync(new URL("../components/", import.meta.url), { recursive: true }).filter((file) => String(file).endsWith(".tsx")).map((file) => read(`../components/${String(file).replaceAll("\\", "/")}`)),
  read("../config/site.ts"), read("../config/pageContent.ts"), read("../config/policies.ts"), read("../config/metadata.ts"),
].join("\n");

for (const phrase of ["Phase 1", "working policy", "interim", "Founder approval", "Parent Success", "premier", "perfect recitation", "certified teachers", "Teachers You Can Verify", "absolute academic integrity", "zero commitment", "temporary photography placeholder"]) {
  assert.doesNotMatch(publicSources, new RegExp(phrase, "i"), `public source must not contain ${phrase}`);
}

for (const email of ["info@tajweedscholars.com", "admissions@tajweedscholars.com", "accounts@tajweedscholars.com", "privacy@tajweedscholars.com"]) assert.match(publicSources, new RegExp(email.replace(".", "\\.")));
assert.match(publicSources, /Muneeb Ur Rahman/);
assert.match(publicSources, /Founder &amp; Operations Lead|Founder & Operations Lead/);
assert.match(publicSources, /Teachers' Sanad\/Ijazah credentials are checked before assignment\./);
assert.match(publicSources, /Female teacher requests are considered subject to availability and confirmed before enrollment\./);
assert.match(publicSources, /Separate recording consent is obtained before any class is recorded\./);
assert.match(publicSources, /The Free Trial booking form does not provide recording consent\./);
assert.match(publicSources, /Remitly/); assert.match(publicSources, /TapTap Send/); assert.match(publicSources, /direct\/manual bank transfer/);
assert.doesNotMatch(publicSources, /Stripe|PayPal|\bWise\b|credit card|debit card/i);
assert.match(publicSources, /Effective date: 2 August 2026/);

for (const page of ["Home.tsx", "Programs.tsx", "FreeTrial.tsx", "Pricing.tsx", "About.tsx", "WhyChooseUs.tsx", "Contact.tsx", "PrivacyPolicy.tsx", "PolicyPage.tsx", "ProgramPage.tsx"]) {
  const source = read(`../pages/${page}`);
  assert.equal((source.match(/<h1\b/g) || []).length, 1, `${page} has exactly one h1`);
}

const png = readFileSync(new URL("../../public/brand/og-cover.png", import.meta.url));
assert.equal(png.toString("ascii", 1, 4), "PNG");
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);

console.log("Public trust, policy copy, heading, contact, payment, and social image assertions passed");
