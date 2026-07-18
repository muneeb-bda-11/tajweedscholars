import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SITE_CONFIG } from "../config/site";
import { WhatsAppCta } from "./WhatsAppCta.tsx";
import { FreeTrial } from "../pages/FreeTrial.tsx";
import { MAIN_GOAL_OPTIONS } from "../shared/trialOptions.ts";
import { readFileSync } from "node:fs";

const cta = renderToStaticMarkup(<WhatsAppCta />);
assert.match(cta, /<svg[^>]*aria-hidden="true"/);
assert.match(cta, /min-h-12/);
assert.match(cta, /whitespace-nowrap/);
assert.match(cta, new RegExp(`href="${SITE_CONFIG.WHATSAPP_LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
assert.doesNotMatch(SITE_CONFIG.WHATSAPP_LINK, /contactName|guardianName|email|whatsapp|notes/i);

const page = renderToStaticMarkup(<FreeTrial />);
assert.equal((page.match(/id="free-trial-whatsapp-cta"/g) || []).length, 1);
assert.equal((page.match(/id="registration-form-section"/g) || []).length, 1);
assert.equal((page.match(/id="trial-summary-title"/g) || []).length, 1);
assert.equal((page.match(/id="trial-faq-title"/g) || []).length, 1);
assert.ok(page.indexOf('id="trial-form-container"') < page.indexOf('id="free-trial-whatsapp-cta"'));
assert.ok(page.indexOf('id="free-trial-whatsapp-cta"') < page.indexOf('id="trial-summary-title"'));
assert.ok(page.indexOf('id="trial-summary-title"') < page.indexOf('id="trial-faq-title"'));
assert.doesNotMatch(page, /Can my WhatsApp number be from another country/);
assert.match(page, /Can I book for more than one learner/);
assert.match(cta, /For quick questions only\. Submit the form to request your three trial classes\./);
assert.doesNotMatch(cta, /help before submitting/);
const pageSource = readFileSync(new URL("../pages/FreeTrial.tsx", import.meta.url), "utf8");
assert.ok(pageSource.indexOf("<TrialForm") < pageSource.indexOf("<WhatsAppCta"), "success and form states share the same section order");
assert.doesNotMatch(pageSource, /(?:^|\s)(?:sm:|md:|lg:)?order-/m);
const responsiveCss = readFileSync(new URL("../index.css", import.meta.url), "utf8");
assert.doesNotMatch(responsiveCss, /#registration-form-section[^}]*\b(?:display:\s*contents|order\s*:)/s);
assert.doesNotMatch(responsiveCss, /#trial-form-container\s*\{[^}]*order\s*:/s);
assert.deepEqual(MAIN_GOAL_OPTIONS, [
  { value: "qaida", label: "Start with Qaida" },
  { value: "quran-reading", label: "Improve Quran reading" },
  { value: "tajweed", label: "Improve Tajweed & pronunciation" },
  { value: "hifz", label: "Hifz / Quran memorization" },
  { value: "unsure", label: "Not sure — help me choose" }
]);
assert.doesNotMatch(page, /Islamic Studies/);
console.log("WhatsApp CTA and Free Trial section-order tests passed");
