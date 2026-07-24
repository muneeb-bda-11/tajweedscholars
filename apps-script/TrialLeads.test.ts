import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./TrialLeads.gs", import.meta.url), "utf8");
const sent: Array<{ recipient: string; subject: string; plainBody: string; options: Record<string, unknown> }> = [];
const context = vm.createContext({
  console: { log() {}, error() {} },
  GmailApp: {
    getAliases: () => ["admissions@tajweedscholars.com"],
    sendEmail(recipient: string, subject: string, plainBody: string, options: Record<string, unknown>) {
      sent.push({ recipient, subject, plainBody, options });
    }
  },
  MailApp: { getRemainingDailyQuota: () => 100 },
  Utilities: {
    formatDate(date: Date, zone: string, pattern: string) {
      assert.equal(zone, "Asia/Karachi");
      if (pattern === "Z") return "+0500";
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).formatToParts(date);
      const part = (type: string) => parts.find(item => item.type === type)?.value || "";
      return `${part("day")} ${part("month")} ${part("year")}, ${part("hour")}:${part("minute")} ${part("dayPeriod").toUpperCase()}`;
    }
  },
  encodeURIComponent, Date, Number, String, Object, Array, Math, RegExp, JSON, isFinite, isNaN
});
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

const lead = { leadId: "TS-TEST-1", submittedAtUtc: "2026-01-01T00:00:00.000Z", learnerType: "child", ageGroup: "7-9", mainGoal: "qaida", contactName: "A <Learner>", guardianName: "Parent & Guardian", countryCode: "PK", countryName: "Pakistan", region: "", timeZone: "Asia/Karachi", whatsapp: "+923294293717", email: "test@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "<private>", spreadsheetUrl: "https://docs.google.com/spreadsheets/d/test" };
const properties = { FOUNDER_EMAIL: "muneeb@tajweedscholars.com", REPLY_TO_EMAIL: "admissions@tajweedscholars.com", WHATSAPP_BUSINESS_NUMBER: "+923246608501", WEBSITE_URL: "https://example.test" };
const props = { getProperty(key: string) { return properties[key as keyof typeof properties] || ""; } };
fn<(lead: Record<string, unknown>, props: { getProperty(key: string): string }) => void>("sendFounderLeadEmail_")(lead, props);
fn<(lead: Record<string, unknown>, props: { getProperty(key: string): string }) => void>("sendSubmitterAcknowledgement_")(lead, props);
assert.equal(sent.length, 2);
assert.match(String(sent[0].options.htmlBody), /Message on WhatsApp/); assert.match(String(sent[0].options.htmlBody), /Reply by Email/); assert.match(String(sent[0].options.htmlBody), /Open CRM/);
assert.doesNotMatch(String(sent[0].options.htmlBody), /<private>|<Learner>/); assert.match(String(sent[0].options.htmlBody), /&lt;private&gt;/);
assert.match(sent[0].plainBody, /Child learner/); assert.match(sent[0].plainBody, /Start with Qaida/); assert.match(sent[0].plainBody, /7\u20139/); assert.match(sent[0].plainBody, /Evening/);
assert.match(sent[0].plainBody, /Received: 01 Jan 2026, 05:00 AM PKT \(UTC\+5\)/); assert.match(String(sent[0].options.htmlBody), /01 Jan 2026, 05:00 AM PKT \(UTC\+5\)/);
assert.doesNotMatch(sent[0].plainBody + sent[1].plainBody, /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) [A-Z][a-z]{2} \d{2} \d{4}/);
assert.match(String(sent[1].options.htmlBody), /What happens next/); assert.match(String(sent[1].options.htmlBody), /No payment information is required/); assert.match(sent[1].plainBody, /Live private one-to-one Quran classes/);
assert.match(sent[1].plainBody, /Request received: 01 Jan 2026, 05:00 AM PKT/); assert.match(String(sent[1].options.htmlBody), /01 Jan 2026, 05:00 AM PKT/);
assert.equal(sent[0].recipient, "muneeb@tajweedscholars.com"); assert.equal(sent[0].options.from, "admissions@tajweedscholars.com"); assert.equal(sent[0].options.replyTo, "admissions@tajweedscholars.com");
assert.equal(sent[1].recipient, "test@example.com"); assert.equal(sent[1].options.from, "admissions@tajweedscholars.com"); assert.equal(sent[1].options.replyTo, "admissions@tajweedscholars.com");
assert.match(String(sent[0].options.htmlBody) + String(sent[1].options.htmlBody), /admissions@tajweedscholars\.com/);
assert.match(String(sent[0].options.htmlBody) + String(sent[1].options.htmlBody), /#277F68/);
assert.match(String(sent[0].options.htmlBody) + String(sent[1].options.htmlBody), /#AE8F6D/);
assert.doesNotMatch(String(sent[0].options.htmlBody) + String(sent[1].options.htmlBody), /#163d2b|#92400e/i);

const row = fn<(id: string, lead: Record<string, unknown>, timestamp: string) => unknown[]>("rowFor_")("TS-TEST-1", { ...lead, consent: true }, lead.submittedAtUtc);
assert.equal(row[5], "7-9"); assert.equal(row[8], "Parent & Guardian"); assert.equal(row[11], "Not provided"); assert.equal(row[17], "<private>");
assert.equal(row[1], "2026-01-01T00:00:00.000Z");
assert.equal(JSON.stringify(row.slice(-10, -1)), JSON.stringify(["Queued", "", "Queued", "", 0, "", "", "", ""]));
assert.equal((row[row.length - 1] as Date).toISOString(), "2026-01-01T00:00:00.000Z");
const adultRow = fn<(id: string, lead: Record<string, unknown>, timestamp: string) => unknown[]>("rowFor_")("TS-TEST-2", { ...lead, learnerType: "self", ageGroup: "adult", guardianName: "", region: "", notes: "", consent: true }, lead.submittedAtUtc);
assert.equal(adultRow[5], "adult"); assert.equal(adultRow[8], "Not applicable \u2014 adult learner"); assert.equal(adultRow[11], "Not provided"); assert.equal(adultRow[17], "Not provided");
assert.equal(fn<(error: unknown) => string>("safeErrorMessage_")(new Error("Delivery failed for test@example.com")), "Delivery failed for [redacted email]");
assert.equal(fn<(error: unknown) => string>("safeErrorMessage_")(new Error("Missing Script Property: FOUNDER_EMAIL")), "Missing Script Property: FOUNDER_EMAIL");

assert.match(source, /function setupPhase1Admissions\(\)/); assert.match(source, /function verifyPhase1AdmissionsSetup\(\)/); assert.match(source, /function processPendingLeadNotifications\(\)/);
assert.match(source, /function repairPhase1AdmissionsDisplayData\(\)/); assert.match(source, /setNumberFormat\("@"\)/);
assert.match(source, /everyMinutes\(1\)/); assert.match(source, /Founder Alert Status/); assert.match(source, /Lead Activity Log/);
assert.doesNotMatch(source, /function processNotificationQueue\(\)/); assert.doesNotMatch(source, /function refreshNotificationTrigger_/);
const doPostSource = source.slice(source.indexOf("function doPost"), source.indexOf("function queueLeadNotification_"));
assert.doesNotMatch(doPostSource, /waitLock\(10000\)/);
assert.match(doPostSource, /tryLock\(2000\)/); assert.match(doPostSource, /TEMPORARILY_BUSY/);
assert.equal((doPostSource.match(/SpreadsheetApp\.openById/g) || []).length, 1);
assert.doesNotMatch(doPostSource, /assertHeaders_|ensureOperationalHeaders_|ensureAgeGroupPlainText_|ensureActivitySheet_/);
assert.doesNotMatch(doPostSource, /SpreadsheetApp\.flush|sendFounderLeadEmail_|sendSubmitterAcknowledgement_|logActivity_|appendRow/);
assert.equal((doPostSource.match(/\.setValues/g) || []).length, 1);
assert.match(doPostSource, /var submittedAtUtc = new Date\(\)\.toISOString\(\)[\s\S]*setValues\(\[rowFor_\(leadId, normalized, submittedAtUtc\)\]\)[\s\S]*queueLeadNotification_\(props, hash, leadId, normalized, submittedAtUtc\)[\s\S]*setProperty\(duplicateKey, leadId\)/);
assert.match(doPostSource, /if \(!lock\.tryLock\(2000\)\)[\s\S]*TEMPORARILY_BUSY[\s\S]*SpreadsheetApp\.openById/);
assert.match(doPostSource, /if \(existingLeadId\) \{[\s\S]*leadId = existingLeadId;[\s\S]*\} else \{[\s\S]*setValues/);
assert.match(source, /function setupTrialLeadSystem\(\)/);
assert.doesNotMatch(source, /ADMISSIONS_EMAIL/);
assert.equal((source.match(/function sendFounderLeadEmail_\(/g) || []).length, 1);
assert.equal((source.match(/function sendSubmitterAcknowledgement_\(/g) || []).length, 1);
const requiredProperty = fn<(props: { getProperty(key: string): string }, key: string) => string>("requiredProperty_");
assert.throws(() => requiredProperty({ getProperty: () => "" }, "FOUNDER_EMAIL"), /Missing Script Property: FOUNDER_EMAIL/);
assert.throws(() => requiredProperty({ getProperty: () => "" }, "REPLY_TO_EMAIL"), /Missing Script Property: REPLY_TO_EMAIL/);
const verifiedSenderAlias = fn<(props: { getProperty(key: string): string }) => string>("verifiedSenderAlias_");
context.GmailApp.getAliases = () => ["Admissions@TajweedScholars.com"];
assert.equal(verifiedSenderAlias(props), "Admissions@TajweedScholars.com");
context.GmailApp.getAliases = () => ["other@example.com"];
assert.throws(() => verifiedSenderAlias(props), /Verified Gmail sender alias is unavailable: admissions@tajweedscholars\.com/);
context.GmailApp.getAliases = () => ["admissions@tajweedscholars.com"];
assert.doesNotMatch(source, /MailApp\.sendEmail/);
const utcIsoTimestamp = fn<(value: unknown) => string>("utcIsoTimestamp_");
assert.equal(utcIsoTimestamp("2026-01-01T00:00:00Z"), "2026-01-01T00:00:00.000Z");
assert.equal(utcIsoTimestamp(""), "Unavailable (legacy queued job)");
const formatBusinessDateTime = fn<(value: unknown, props: { getProperty(key: string): string }, includeOffset: boolean) => string>("formatBusinessDateTime_");
assert.equal(formatBusinessDateTime("2026-07-24T05:29:00.000Z", props, true), "24 Jul 2026, 10:29 AM PKT (UTC+5)");
const pktValues: unknown[][] = [[""], [new Date("2026-01-02T00:00:00Z")], [""]];
const backfillResult = fn<(utc: unknown[][], pkt: unknown[][]) => { updated: number; skipped: number; invalid: number }>("backfillPktValues_")(
  [["2026-01-01T00:00:00Z"], ["2026-01-02T00:00:00Z"], ["invalid"]], pktValues
);
assert.equal(JSON.stringify(backfillResult), JSON.stringify({ updated: 1, skipped: 1, invalid: 1 }));
assert.equal((pktValues[0][0] as Date).toISOString(), "2026-01-01T00:00:00.000Z");
assert.equal((pktValues[1][0] as Date).toISOString(), "2026-01-02T00:00:00.000Z");
assert.equal(pktValues[2][0], "");

const logoBlob = { setName() { return this; } };
context.EMAIL_LOGO_ATTEMPTED_ = false; context.EMAIL_LOGO_CACHE_ = null;
context.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getHeaders: () => ({ "Content-Type": "image/png" }), getBlob: () => logoBlob }) };
const logoProps = { getProperty: (key: string) => key === "EMAIL_LOGO_URL" ? "https://tajweedscholars.com/brand/logo-horizontal.png" : properties[key as keyof typeof properties] || "" };
const emailShell = fn<(label: string, title: string, content: string, contact: string, props: typeof logoProps) => string>("emailShell_");
const emailSendOptions = fn<(html: string, sender: string, replyTo: string, props: typeof logoProps) => Record<string, unknown>>("emailSendOptions_");
const logoHtml = emailShell("", "Test", "<p>Safe</p>", "admissions@tajweedscholars.com", logoProps);
assert.match(logoHtml, /src="cid:tsLogo"/);
assert.equal((emailSendOptions(logoHtml, "admissions@tajweedscholars.com", "admissions@tajweedscholars.com", logoProps).inlineImages as Record<string, unknown>).tsLogo, logoBlob);
context.EMAIL_LOGO_ATTEMPTED_ = false; context.EMAIL_LOGO_CACHE_ = null;
context.UrlFetchApp = { fetch: () => { throw new Error("network"); } };
const noLogoHtml = emailShell("", "Test", "", "admissions@tajweedscholars.com", logoProps);
const noLogoOptions = emailSendOptions(noLogoHtml, "admissions@tajweedscholars.com", "admissions@tajweedscholars.com", logoProps);
assert.equal(noLogoOptions.inlineImages, undefined);
assert.match(String(noLogoOptions.htmlBody), />Tajweed Scholars<\/div>/);

const operationalHeaders = Array.from(context.OPERATIONAL_HEADERS as string[]);
const displayHeaders = Array.from(context.DISPLAY_HEADERS as string[]);
assert.deepEqual(displayHeaders, ["Submitted At PKT"]);
assert.equal(Array.from(context.TRIAL_HEADERS as string[]).length + operationalHeaders.length, 29);
const allHeaders = [...Array.from(context.TRIAL_HEADERS as string[]), ...operationalHeaders];
const map = Object.fromEntries(allHeaders.map((header, index) => [header, index]));
const makeRow = (founder = "Queued", user = "Queued", attempts = 0) => {
  const values = new Array(allHeaders.length).fill("");
  values[map["Lead ID"]] = "TS-TARGET";
  values[map["Founder Alert Status"]] = founder;
  values[map["User Email Status"]] = user;
  values[map["Notification Retry Count"]] = attempts;
  return values;
};
const runJob = (row: unknown[], failFounder = false, failUser = false, jobState: Record<string, unknown> = {}) => {
  const calls: string[] = [];
  context.sendFounderLeadEmail_ = () => { calls.push("founder"); if (failFounder) throw new Error("FOUNDER_SEND_FAILED"); };
  context.sendSubmitterAcknowledgement_ = () => { calls.push("user"); if (failUser) throw new Error("USER_SEND_FAILED"); };
  const saved: Record<string, string> = {};
  const testProps = { getProperty() { return ""; }, setProperty(key: string, value: string) { saved[key] = value; } };
  const result = fn<(job: Record<string, unknown>, row: unknown[], map: Record<string, number>, props: typeof testProps, key: string, max: number) => { complete: boolean; operationalValues: unknown[] }>("processNotificationJob_")(
    { leadId: "TS-TARGET", hash: "hash", email: "test@example.com", ...jobState }, row, map, testProps, "pending", 3
  );
  return { calls, saved, result };
};

let outcome = runJob(makeRow());
assert.deepEqual(outcome.calls, ["founder", "user"]); assert.equal(outcome.result.complete, true);
assert.equal(outcome.result.operationalValues[0], "Sent"); assert.equal(outcome.result.operationalValues[2], "Sent");
assert.equal(outcome.result.operationalValues[4], 1); assert.match(String(outcome.result.operationalValues[1]), /Z$/); assert.match(String(outcome.result.operationalValues[3]), /Z$/);
assert.equal(outcome.result.operationalValues[7], ""); assert.equal(outcome.result.operationalValues[8], "");

outcome = runJob(makeRow(), false, true);
assert.equal(outcome.result.operationalValues[0], "Sent"); assert.equal(outcome.result.operationalValues[2], "Retrying"); assert.match(String(outcome.result.operationalValues[7]), /User email/);
outcome = runJob(makeRow(), true, false);
assert.equal(outcome.result.operationalValues[0], "Retrying"); assert.equal(outcome.result.operationalValues[2], "Sent"); assert.match(String(outcome.result.operationalValues[7]), /Founder email/);
outcome = runJob(makeRow("Sent", "Retrying", 1));
assert.deepEqual(outcome.calls, ["user"]); assert.equal(outcome.result.operationalValues[4], 2);
outcome = runJob(makeRow("Retrying", "Queued", 1), false, false, { founderSent: true });
assert.deepEqual(outcome.calls, ["user"]); assert.equal(outcome.result.operationalValues[0], "Sent");
outcome = runJob(makeRow("Sent", "Sent", 2));
assert.deepEqual(outcome.calls, []); assert.equal(outcome.result.complete, true); assert.equal(outcome.result.operationalValues[4], 3);

const goodSheet = { getLastColumn: () => allHeaders.length, getRange: () => ({ getDisplayValues: () => [allHeaders] }) };
assert.equal(fn<(sheet: typeof goodSheet) => Record<string, number>>("canonicalNotificationHeaderMap_")(goodSheet)["Lead ID"], 0);
assert.throws(() => fn<(sheet: typeof goodSheet) => unknown>("canonicalNotificationHeaderMap_")({ ...goodSheet, getLastColumn: () => allHeaders.length - 1 }), /OPERATIONAL_HEADERS_MISSING/);
assert.throws(() => fn<(sheet: typeof goodSheet) => unknown>("canonicalNotificationHeaderMap_")({ ...goodSheet, getRange: () => ({ getDisplayValues: () => [[...allHeaders.slice(0, -1), "Wrong"]] }) }), /HEADERS_MISMATCH/);

const triggerHandlers = ["processPendingLeadNotifications", "processPendingLeadNotifications", "processNotificationQueue", "unrelated"];
const deleted: string[] = []; const created: Array<{ handler: string; minutes: number }> = [];
context.ScriptApp = {
  getProjectTriggers: () => triggerHandlers.map(handler => ({ getHandlerFunction: () => handler })),
  deleteTrigger: (trigger: { getHandlerFunction(): string }) => deleted.push(trigger.getHandlerFunction()),
  newTrigger: (handler: string) => ({ timeBased: () => ({ everyMinutes: (minutes: number) => ({ create: () => created.push({ handler, minutes }) }) }) })
};
fn<() => void>("setupLeadNotificationTrigger")();
assert.deepEqual(deleted.sort(), ["processNotificationQueue", "processPendingLeadNotifications", "processPendingLeadNotifications"].sort());
assert.deepEqual(created, [{ handler: "processPendingLeadNotifications", minutes: 1 }]);

const otherRow = makeRow(); otherRow[map["Lead ID"]] = "TS-OTHER";
const targetRow = makeRow();
targetRow[map["Submitted At UTC"]] = "2026-02-03T04:05:06Z";
const pendingJob = { leadId: "TS-TARGET", hash: "target-hash", email: "test@example.com", founderSent: false, submitterSent: false };
const propertyStore: Record<string, string> = {
  SPREADSHEET_ID: "sheet-id", FOUNDER_EMAIL: "founder@example.com", REPLY_TO_EMAIL: "admissions@example.com",
  pending_notification_target: JSON.stringify(pendingJob)
};
const rowWrites: Array<{ row: number; column: number; width: number; values: unknown[][] }> = [];
const integrationSheet = {
  getLastColumn: () => allHeaders.length, getLastRow: () => 3,
  getRange(row: number, column: number, height: number, width: number) {
    if (row === 1) return { getDisplayValues: () => [allHeaders] };
    if (row === 2 && height === 2) return { getValues: () => [otherRow, targetRow] };
    return { setValues: (values: unknown[][]) => rowWrites.push({ row, column, width, values }) };
  }
};
let spreadsheetOpenCount = 0;
context.PropertiesService = { getScriptProperties: () => ({
  getProperties: () => ({ ...propertyStore }), getProperty: (key: string) => propertyStore[key] || "",
  setProperty: (key: string, value: string) => { propertyStore[key] = value; }, deleteProperty: (key: string) => { delete propertyStore[key]; }
}) };
context.SpreadsheetApp = { openById: () => { spreadsheetOpenCount += 1; return { getSheetByName: () => integrationSheet }; } };
const integrationSends: string[] = []; let hydratedTimestamp = "";
context.sendFounderLeadEmail_ = (job: Record<string, unknown>) => { integrationSends.push("founder"); hydratedTimestamp = String(job.submittedAtUtc); };
context.sendSubmitterAcknowledgement_ = () => integrationSends.push("user");
const integrationResult = fn<() => { processed: number }>("processPendingLeadNotificationsUnlocked_")();
assert.equal(integrationResult.processed, 1); assert.equal(spreadsheetOpenCount, 1); assert.deepEqual(integrationSends, ["founder", "user"]);
assert.equal(hydratedTimestamp, "2026-02-03T04:05:06.000Z");
assert.equal(rowWrites.length, 1); assert.equal(rowWrites[0].row, 3); assert.equal(rowWrites[0].column, allHeaders.length - operationalHeaders.length + 1);
assert.equal(rowWrites[0].width, 9); assert.equal(rowWrites[0].values[0].length, 9);
assert.equal(propertyStore.pending_notification_target, undefined); assert.equal(propertyStore["notified_target-hash"], "yes");

console.log("Admissions operations pure helper, email, queue, and compatibility tests passed");
