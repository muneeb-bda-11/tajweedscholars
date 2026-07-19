import assert from "node:assert/strict";
import { submitTrialRequest, trialSubmissionStatus, TrialSubmissionError, type TrialSubmissionPayload } from "./trialSubmission.ts";

const payload: TrialSubmissionPayload = { learnerType: "self", ageGroup: "adult", mainGoal: "tajweed", contactName: "Learner", guardianName: "", countryCode: "PK", countryName: "Pakistan", region: "", timeZone: "Asia/Karachi", whatsapp: "+923294293717", email: "learner@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "", consent: true, submissionId: "submission-test", honeypot: "", formStartedAt: Date.now() - 1000 };
const originalFetch = globalThis.fetch;
let calls = 0, sent: Record<string, unknown> = {};

globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => { calls += 1; sent = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ ok: true, leadId: "TS-TEST-ONE", message: "received" }), { status: 200, headers: { "Content-Type": "application/json" } }); }) as typeof fetch;
assert.equal((await submitTrialRequest(payload)).leadId, "TS-TEST-ONE");
assert.equal(calls, 1); assert.equal(sent.guardianName, ""); assert.ok(!("apiSecret" in sent)); assert.ok(!("city" in sent));
assert.equal(trialSubmissionStatus(0), "Submitting securely…"); assert.equal(trialSubmissionStatus(700), "Saving your trial request…"); assert.equal(trialSubmissionStatus(2500), "Almost done — confirming your request…");

globalThis.fetch = (async () => new Response(JSON.stringify({ ok: true, message: "received" }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;
await assert.rejects(() => submitTrialRequest(payload), (error: unknown) => error instanceof TrialSubmissionError && /confirm/i.test(error.message));

globalThis.fetch = (async () => new Response(JSON.stringify({ ok: false, code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fieldErrors: { guardianName: "Enter a parent or guardian name." } }), { status: 400, headers: { "Content-Type": "application/json" } })) as typeof fetch;
await assert.rejects(() => submitTrialRequest(payload), (error: unknown) => error instanceof TrialSubmissionError && error.fieldErrors.guardianName === "Enter a parent or guardian name.");

globalThis.fetch = (async () => { throw new Error("network"); }) as typeof fetch;
await assert.rejects(() => submitTrialRequest(payload), (error: unknown) => error instanceof TrialSubmissionError && /could not submit/i.test(error.message));
globalThis.fetch = originalFetch;

console.log("Trial submission success, field-error, and network regression tests passed");
