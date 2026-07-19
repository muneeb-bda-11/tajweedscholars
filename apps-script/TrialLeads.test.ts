import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./TrialLeads.gs", import.meta.url), "utf8");
const sent: Array<Record<string, unknown>> = [];
const context = vm.createContext({ console: { log() {}, error() {} }, MailApp: { sendEmail(message: Record<string, unknown>) { sent.push(message); } }, encodeURIComponent, Date, Number, String, Object, Array, Math, RegExp, JSON, isFinite, isNaN });
vm.runInContext(source, context);
const fn = <T extends (...args: never[]) => unknown>(name: string) => context[name] as T;

assert.equal(fn<(value: unknown) => string>("htmlEscape_")('<script>&"\''), "&lt;script&gt;&amp;&quot;&#39;");
const adult = fn<(lead: Record<string, unknown>) => Record<string, unknown>>("presentationValues_")({ learnerType: "self", ageGroup: "adult", mainGoal: "tajweed", guardianName: "", region: "", notes: "", preferredDays: ["monday"], preferredTime: "morning" });
assert.equal(adult.guardian, "Not applicable \u2014 adult learner"); assert.equal(adult.region, "Not provided"); assert.equal(adult.notes, "Not provided"); assert.equal(adult.learner, "Adult learner"); assert.equal(adult.ageGroup, "Adult");
const minor = fn<(lead: Record<string, unknown>) => Record<string, unknown>>("presentationValues_")({ learnerType: "self", ageGroup: "7-9", mainGoal: "qaida", guardianName: "Parent", region: "Punjab", notes: "Ready", preferredDays: ["monday"], preferredTime: "evening" });
assert.equal(minor.guardian, "Parent"); assert.equal(minor.learner, "Learner"); assert.equal(minor.goal, "Start with Qaida");

const canonicalAge = fn<(value: unknown) => string>("canonicalAgeGroup_");
for (const age of ["4-6", "7-9", "10-12", "adult"]) assert.equal(canonicalAge(age), age);
const repairedAge = fn<(value: unknown, display: string) => string | null>("repairedAgeGroup_");
assert.equal(repairedAge(new Date(2026, 3, 6), ""), "4-6");
assert.equal(repairedAge(new Date(2026, 6, 9), ""), "7-9");
assert.equal(repairedAge(new Date(2026, 9, 12), ""), "10-12");
assert.equal(repairedAge(new Date(2026, 4, 8), ""), null);

const wa = fn<(number: string, message: string) => string>("buildWhatsAppUrl_")("+92 (329) 429-3717", "Assalamu alaikum");
assert.equal(wa, "https://wa.me/923294293717?text=Assalamu%20alaikum");
assert.equal(fn<(leadId: string) => string>("founderEmailSubject_")("TS-TEST-1"), "[ACTION REQUIRED] New Trial Lead \u2014 TS-TEST-1");
assert.equal(fn<() => string>("userEmailSubject_")(), "We received your Tajweed Scholars trial request");
assert.equal(fn<(a: string, b: string, c: number, d: number) => boolean>("notificationEligible_")("Queued", "Queued", 0, 3), true);
assert.equal(fn<(a: string, b: string, c: number, d: number) => boolean>("notificationEligible_")("Retrying", "Sent", 1, 3), true);
assert.equal(fn<(a: string, b: string, c: number, d: number) => boolean>("notificationEligible_")("Failed", "Sent", 2, 3), true);
assert.equal(fn<(a: string, b: string, c: number, d: number) => boolean>("notificationEligible_")("Failed", "Sent", 3, 3), false);
assert.equal(fn<(a: string, b: string, c: number, d: number) => boolean>("notificationEligible_")("Sent", "Sent", 0, 3), false);
assert.equal(fn<(a: number, b: number) => boolean>("retryExhausted_")(3, 3), true);

const lead = { leadId: "TS-TEST-1", receivedAt: "2026-01-01T00:00:00Z", learnerType: "child", ageGroup: "7-9", mainGoal: "qaida", contactName: "A <Learner>", guardianName: "Parent & Guardian", countryCode: "PK", countryName: "Pakistan", region: "", timeZone: "Asia/Karachi", whatsapp: "+923294293717", email: "test@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "<private>", spreadsheetUrl: "https://docs.google.com/spreadsheets/d/test" };
const properties = { FOUNDER_EMAIL: "founder@example.com", REPLY_TO_EMAIL: "tajweedscholar@gmail.com", WHATSAPP_BUSINESS_NUMBER: "+923246608501", WEBSITE_URL: "https://example.test" };
const props = { getProperty(key: string) { return properties[key as keyof typeof properties] || ""; } };
fn<(lead: Record<string, unknown>, props: { getProperty(key: string): string }) => void>("sendFounderLeadEmail_")(lead, props);
fn<(lead: Record<string, unknown>, props: { getProperty(key: string): string }) => void>("sendSubmitterAcknowledgement_")(lead, props);
assert.equal(sent.length, 2);
assert.match(String(sent[0].htmlBody), /Message on WhatsApp/); assert.match(String(sent[0].htmlBody), /Reply by Email/); assert.match(String(sent[0].htmlBody), /Open CRM/);
assert.doesNotMatch(String(sent[0].htmlBody), /<private>|<Learner>/); assert.match(String(sent[0].htmlBody), /&lt;private&gt;/);
assert.match(String(sent[0].body), /Child learner/); assert.match(String(sent[0].body), /Start with Qaida/); assert.match(String(sent[0].body), /7\u20139/); assert.match(String(sent[0].body), /Evening/);
assert.doesNotMatch(String(sent[0].body) + String(sent[1].body), /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) [A-Z][a-z]{2} \d{2} \d{4}/);
assert.match(String(sent[1].htmlBody), /What happens next/); assert.match(String(sent[1].htmlBody), /No payment information is required/); assert.match(String(sent[1].body), /Live private one-to-one Quran classes/);

const row = fn<(id: string, lead: Record<string, unknown>) => unknown[]>("rowFor_")("TS-TEST-1", { ...lead, consent: true });
assert.equal(row[5], "7-9"); assert.equal(row[8], "Parent & Guardian"); assert.equal(row[11], "Not provided"); assert.equal(row[17], "<private>");
assert.equal(JSON.stringify(row.slice(-9)), JSON.stringify(["Queued", "", "Queued", "", 0, "", "", "", ""]));
const adultRow = fn<(id: string, lead: Record<string, unknown>) => unknown[]>("rowFor_")("TS-TEST-2", { ...lead, learnerType: "self", ageGroup: "adult", guardianName: "", region: "", notes: "", consent: true });
assert.equal(adultRow[5], "adult"); assert.equal(adultRow[8], "Not applicable \u2014 adult learner"); assert.equal(adultRow[11], "Not provided"); assert.equal(adultRow[17], "Not provided");
assert.equal(fn<(error: unknown) => string>("safeErrorMessage_")(new Error("test@example.com +923294293717 private notes")), "Error");

assert.match(source, /function setupPhase1Admissions\(\)/); assert.match(source, /function verifyPhase1AdmissionsSetup\(\)/); assert.match(source, /function processNotificationQueue\(\)/);
assert.match(source, /function repairPhase1AdmissionsDisplayData\(\)/); assert.match(source, /setNumberFormat\("@"\)/);
assert.match(source, /everyMinutes\(5\)/); assert.match(source, /Founder Alert Status/); assert.match(source, /Lead Activity Log/);
assert.match(source, /Founder Alert Status", "Sent/); assert.match(source, /User Email Status", "Sent/);
assert.doesNotMatch(source, /processNotificationQueue\(\);[\s\S]{0,200}return json_/);
const doPostSource = source.slice(source.indexOf("function doPost"), source.indexOf("function queueLeadNotification_"));
assert.doesNotMatch(doPostSource, /waitLock\(10000\)/);
assert.match(doPostSource, /tryLock\(2000\)/); assert.match(doPostSource, /TEMPORARILY_BUSY/);
assert.equal((doPostSource.match(/SpreadsheetApp\.openById/g) || []).length, 1);
assert.doesNotMatch(doPostSource, /assertHeaders_|ensureOperationalHeaders_|ensureAgeGroupPlainText_|ensureActivitySheet_/);
assert.doesNotMatch(doPostSource, /SpreadsheetApp\.flush|sendFounderLeadEmail_|sendSubmitterAcknowledgement_|logActivity_|appendRow/);
assert.equal((doPostSource.match(/\.setValues/g) || []).length, 1);
assert.match(doPostSource, /setValues\(\[rowFor_\(leadId, normalized\)\]\)[\s\S]*queueLeadNotification_[\s\S]*setProperty\(duplicateKey, leadId\)/);
assert.match(doPostSource, /if \(!lock\.tryLock\(2000\)\)[\s\S]*TEMPORARILY_BUSY[\s\S]*SpreadsheetApp\.openById/);
assert.match(doPostSource, /if \(existingLeadId\) \{[\s\S]*leadId = existingLeadId;[\s\S]*\} else \{[\s\S]*setValues/);
assert.match(source, /function setupTrialLeadSystem\(\)/);

console.log("Admissions operations pure helper, email, queue, and compatibility tests passed");
