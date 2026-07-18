import assert from "node:assert/strict";
import { buildTrialSubmissionPayload, nextLearnerData, stepForField, validateTrialForm, withLearnerType, type TrialFormData } from "./trialFormLogic.ts";
import { newSubmissionMeta, normalizePhoneEntry } from "./trialUx.ts";
import { CANONICAL_VALUES, requiresGuardian } from "../shared/trialOptions.ts";
import { readFileSync } from "node:fs";

const base: TrialFormData = { learnerType: "child", ageGroup: "7-9", mainGoal: "qaida", contactName: " Learner ", guardianName: " Parent ", countryCode: "PK", countryName: "Pakistan", region: "Punjab", timeZone: "Asia/Karachi", whatsapp: "+923294293717", email: "learner@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "", consent: true };
const meta = { submissionId: "submission-one", formStartedAt: Date.now() - 1000, honeypot: "" };

// Guardian matrix A-E.
assert.equal(requiresGuardian("7-9"), true);
assert.deepEqual(validateTrialForm(base, 2), {});
assert.equal(buildTrialSubmissionPayload(base, meta).guardianName, "Parent");
assert.equal(validateTrialForm({ ...base, guardianName: "" }, 2).guardianName, "Enter a parent or guardian name.");
const adult = { ...base, learnerType: "self", ageGroup: "adult", guardianName: "Hidden guardian" } as TrialFormData;
assert.equal(requiresGuardian(adult.ageGroup), false);
assert.deepEqual(validateTrialForm(adult, "all"), {});
assert.equal(buildTrialSubmissionPayload(adult, meta).guardianName, "");
const teenSelf = { ...base, learnerType: "self", ageGroup: "16-17" } as TrialFormData;
assert.deepEqual(validateTrialForm(teenSelf, 2), {});
assert.equal(buildTrialSubmissionPayload(teenSelf, meta).guardianName, "Parent");
assert.ok(validateTrialForm({ ...teenSelf, guardianName: "" }, 2).guardianName);

// Learner changes, preservation, API-field routing, and Add another learner F-J.
const changedToChild = withLearnerType(adult, "child");
assert.equal(changedToChild.ageGroup, "adult");
assert.equal(changedToChild.guardianName, "Hidden guardian");
assert.deepEqual(validateTrialForm(changedToChild, 1), {});
assert.equal(buildTrialSubmissionPayload(adult, meta).guardianName, "");
assert.equal(teenSelf.guardianName, " Parent ");
assert.equal(stepForField("guardianName"), 2);
const next = nextLearnerData(base), nextMeta = newSubmissionMeta();
assert.equal(next.learnerType, ""); assert.equal(next.ageGroup, ""); assert.equal(next.mainGoal, "");
assert.equal(next.contactName, base.contactName); assert.equal(next.guardianName, base.guardianName); assert.equal(next.email, base.email);
assert.notEqual(nextMeta.submissionId, meta.submissionId); assert.ok(nextMeta.formStartedAt > 0);

// Complete client validation regression matrix.
assert.ok(validateTrialForm({ ...base, learnerType: "" }, 1).learnerType);
assert.ok(validateTrialForm({ ...base, ageGroup: "" }, 1).ageGroup);
assert.deepEqual(validateTrialForm({ ...base, learnerType: "child", ageGroup: "adult" }, 1), {});
assert.equal(buildTrialSubmissionPayload({ ...base, learnerType: "child", ageGroup: "adult" }, meta).learnerType, "child");
assert.ok(validateTrialForm({ ...base, mainGoal: "" }, 1).mainGoal);
assert.deepEqual(CANONICAL_VALUES.mainGoal, ["qaida", "quran-reading", "tajweed", "hifz", "unsure"]);
assert.ok(validateTrialForm({ ...base, contactName: "" }, 2).contactName);
assert.ok(validateTrialForm({ ...base, countryCode: "" }, 2).countryName);
assert.deepEqual(validateTrialForm({ ...base, region: "" }, 2), {});
assert.ok(validateTrialForm({ ...base, timeZone: "Not/AZone" }, 2).timeZone);
assert.deepEqual(normalizePhoneEntry("3294293717", "PK").e164, "+923294293717");
assert.deepEqual(validateTrialForm({ ...base, countryCode: "GB", countryName: "United Kingdom" }, 2), {});
assert.ok(validateTrialForm({ ...base, whatsapp: "+123" }, 2).whatsapp);
assert.deepEqual(validateTrialForm(base, 2), {});
assert.ok(validateTrialForm({ ...base, email: "invalid" }, 2).email);
assert.ok(validateTrialForm({ ...base, preferredDays: [] }, 3).preferredDays);
assert.ok(validateTrialForm({ ...base, preferredTime: "" }, 3).preferredTime);
assert.deepEqual(validateTrialForm({ ...base, notes: "" }, 3), {});
assert.ok(validateTrialForm({ ...base, notes: "x".repeat(1001) }, 3).notes);
assert.ok(validateTrialForm({ ...base, consent: false }, 3).consent);
const allErrors = validateTrialForm({ ...base, guardianName: "", preferredDays: [] }, "all");
assert.ok(allErrors.guardianName && allErrors.preferredDays);
const payload = buildTrialSubmissionPayload(base, meta) as unknown as Record<string, unknown>;
assert.equal(payload.guardianName, "Parent"); assert.equal(payload.contactName, "Learner"); assert.equal(payload.email, "learner@example.com");
assert.equal(payload.honeypot, ""); assert.ok(typeof payload.formStartedAt === "number" && payload.formStartedAt > 0); assert.ok(!("city" in payload)); assert.ok(!("apiSecret" in payload));

const formSource = readFileSync(new URL("../components/TrialForm.tsx", import.meta.url), "utf8");
assert.match(formSource, /if \(submitting\.current\) return/);
assert.match(formSource, /aria-invalid=\{Boolean\(visibleErrors\.guardianName\)\}/);
assert.match(formSource, /aria-describedby=\{described\("guardianName"\)\}/);
assert.match(formSource, /setStep\(stepForField\(first\)\)/);
assert.match(formSource, /nextLearnerData\(value\)/);
assert.match(formSource, /meta\.current = newSubmissionMeta\(\)/);
assert.doesNotMatch(formSource, /phone number country must match/i);
assert.match(formSource, /advanceCurrentStep/);
assert.match(formSource, /submitFinalTrialRequest/);
assert.match(formSource, /handleFormSubmit/);
assert.match(formSource, /if \(step < 3\)/);
assert.match(formSource, /validateTrialForm\(data, current\)/);
assert.match(formSource, /getVisibleErrors/); assert.match(formSource, /attemptedSteps/); assert.match(formSource, /apiErrorFields/);
assert.match(formSource, /if \(status === "error"\) \{ setStatus\("idle"\); setMessage\(""\); \}/);

console.log("TrialForm guardian and complete client validation matrix passed");
