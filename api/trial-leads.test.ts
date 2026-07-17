import assert from "node:assert/strict";
import { normalizeTrialPayload, parseAppsScriptResponse, requestAppsScript, UpstreamError, UpstreamValidationError, validateAppsScriptUrl, validateTrialPayload, type RequestOnce } from "./trial-leads.ts";
import { newSubmissionMeta, timeZoneLabel } from "../src/lib/trialUx.ts";

const base = { learnerType: "self", ageGroup: "adult", mainGoal: "tajweed", contactName: "Test Learner", guardianName: "", countryCode: "PK", countryName: "Pakistan", region: "", timeZone: "Asia/Karachi", whatsapp: "+923001234567", email: "learner@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "", consent: true, submissionId: "test-submission", honeypot: "", formStartedAt: Date.now() - 5000 };
const displayPayload = { ...base, learnerType: "My child", ageGroup: "7–9", mainGoal: "Learn Qaida", guardianName: "Parent Name", region: "Punjab", whatsapp: "+923246608501", preferredDays: ["Monday", "Wednesday"], preferredTime: "Evening" };
const normalized = normalizeTrialPayload(displayPayload) as Record<string, unknown>;
assert.deepEqual({ learnerType: normalized.learnerType, ageGroup: normalized.ageGroup, mainGoal: normalized.mainGoal, preferredDays: normalized.preferredDays, preferredTime: normalized.preferredTime }, { learnerType: "child", ageGroup: "7-9", mainGoal: "qaida", preferredDays: ["monday", "wednesday"], preferredTime: "evening" });
const validated = validateTrialPayload(normalized); assert.deepEqual(validated.fieldErrors, {}); assert.ok(validated.payload);
assert.equal(validated.payload?.guardianName, "Parent Name");
assert.ok(validateTrialPayload({ ...base, learnerType: "child", ageGroup: "7-9", guardianName: "" }).fieldErrors.guardianName);
assert.deepEqual(validateTrialPayload({ ...base, learnerType: "self", ageGroup: "adult", guardianName: "" }).fieldErrors, {});
assert.equal(validateTrialPayload({ ...base, learnerType: "self", ageGroup: "adult", guardianName: "Ignored" }).payload?.guardianName, "");
assert.equal(validateTrialPayload({ ...base, learnerType: "child", ageGroup: "7-9", guardianName: "  Parent  " }).payload?.guardianName, "Parent");
assert.ok(validateTrialPayload({ ...base, learnerType: "child", ageGroup: "adult" }).fieldErrors.ageGroup);
assert.deepEqual(validateTrialPayload({ ...base, countryCode: "GB", countryName: "United Kingdom", whatsapp: "+923001234567" }).fieldErrors, {});
assert.deepEqual(validateTrialPayload({ ...base, whatsapp: "+447911123456" }).fieldErrors, {});
assert.ok(validateTrialPayload({ ...base, whatsapp: "+123" }).fieldErrors.whatsapp);
assert.ok(validateTrialPayload({ ...base, timeZone: "Invalid/Zone" }).fieldErrors.timeZone);
assert.ok(validateTrialPayload({ ...base, email: "invalid" }).fieldErrors.email);
assert.ok(validateTrialPayload({ ...base, preferredDays: [] }).fieldErrors.preferredDays);
assert.ok(validateTrialPayload({ ...base, preferredDays: ["monday", "monday"] }).fieldErrors.preferredDays);
assert.ok(validateTrialPayload({ ...base, preferredTime: "night" }).fieldErrors.preferredTime);
assert.ok(validateTrialPayload({ ...base, consent: false }).fieldErrors.consent);
assert.equal(timeZoneLabel(base.timeZone), "Pakistan Time (UTC+05:00)");
assert.equal(validateTrialPayload({ ...base, timeZone: "America/New_York" }).payload?.timeZone, "America/New_York");
assert.notEqual(newSubmissionMeta().submissionId, newSubmissionMeta().submissionId);

const execUrl = "https://script.google.com/macros/s/test-deployment/exec";
let calls: Array<{ hostname: string; method: string; body?: string }> = [];
const sequence = (results: Array<{ statusCode: number; body: string; location?: string }>): RequestOnce => async (request) => { calls.push({ hostname: request.url.hostname, method: request.method, body: request.body }); const result = results.shift(); if (!result) throw new Error("Missing test response"); return result; };

// Canonical payload forwarding and successful JSON response.
calls = []; const success = await requestAppsScript(execUrl, { ...validated.payload, apiSecret: "test-secret" }, { requestOnce: sequence([{ statusCode: 200, body: JSON.stringify({ ok: true, leadId: "TS-TEST-123" }) }]) });
const forwarded = JSON.parse(calls[0].body || "{}"); assert.equal(forwarded.learnerType, "child"); assert.deepEqual(forwarded.preferredDays, ["monday", "wednesday"]); assert.equal(parseAppsScriptResponse(success).leadId, "TS-TEST-123");
assert.equal(forwarded.guardianName, "Parent Name");

// 302 converts POST to GET and removes the body.
calls = []; await requestAppsScript(execUrl, {}, { requestOnce: sequence([{ statusCode: 302, body: "", location: "https://script.googleusercontent.com/result" }, { statusCode: 200, body: "{}" }]) });
assert.deepEqual(calls.map(({ method, body }) => ({ method, body })), [{ method: "POST", body: "{}" }, { method: "GET", body: undefined }]);

// 307 preserves POST and its body.
calls = []; await requestAppsScript(execUrl, { canonical: true }, { requestOnce: sequence([{ statusCode: 307, body: "", location: "https://script.googleusercontent.com/result" }, { statusCode: 200, body: "{}" }]) });
assert.equal(calls[1].method, "POST"); assert.equal(calls[1].body, calls[0].body);

// Redirect limit and URL validation.
await assert.rejects(() => requestAppsScript(execUrl, {}, { maxRedirects: 1, requestOnce: sequence([{ statusCode: 302, body: "", location: execUrl }, { statusCode: 302, body: "", location: execUrl }]) }), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_REDIRECT_LIMIT");
assert.throws(() => validateAppsScriptUrl("https://example.com/macros/s/id/exec"), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_CONFIG_ERROR");
assert.throws(() => validateAppsScriptUrl("https://script.google.com/macros/s/id/dev"), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_CONFIG_ERROR");

// Invalid JSON and safe timeout/network mappings.
assert.throws(() => parseAppsScriptResponse({ statusCode: 200, body: "not-json" }), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_INVALID_RESPONSE");
assert.throws(() => parseAppsScriptResponse({ statusCode: 400, body: JSON.stringify({ ok: false, code: "VALIDATION_ERROR", fieldErrors: { guardianName: "required", apiSecret: "must not leak" } }) }), (error: unknown) => error instanceof UpstreamValidationError && error.fieldErrors.guardianName === "required" && !("apiSecret" in error.fieldErrors));
assert.throws(() => parseAppsScriptResponse({ statusCode: 200, body: JSON.stringify({ ok: true, leadId: "wrong-format" }) }), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_INVALID_RESPONSE");
await assert.rejects(() => requestAppsScript(execUrl, {}, { requestOnce: async () => { throw new UpstreamError("UPSTREAM_TIMEOUT"); } }), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_TIMEOUT");
await assert.rejects(() => requestAppsScript(execUrl, {}, { requestOnce: async () => { throw new UpstreamError("UPSTREAM_DNS_ERROR"); } }), (error: unknown) => error instanceof UpstreamError && error.diagnosticCode === "UPSTREAM_DNS_ERROR");

const canonical = normalizeTrialPayload({ ...base, city: "Deprecated", displayLabel: "Adult", apiSecret: "browser-secret" }) as Record<string, unknown>;
assert.ok(!("city" in canonical)); assert.ok(!("displayLabel" in canonical)); assert.ok(!("apiSecret" in canonical));

console.log("trial-leads HTTPS forwarding tests passed (no real Apps Script call)");
