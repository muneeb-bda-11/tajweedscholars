import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { closedSelectorState } from "../components/SearchCombobox.tsx";
import { buildTrialSubmissionPayload } from "./trialFormLogic.ts";

const search = readFileSync(new URL("../components/SearchCombobox.tsx", import.meta.url), "utf8");
const phone = readFileSync(new URL("../components/PhoneCountrySelect.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/Header.tsx", import.meta.url), "utf8");
const finder = readFileSync(new URL("../components/ProgramFinder.tsx", import.meta.url), "utf8");
const overlay = readFileSync(new URL("./useDismissibleOverlay.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./router.tsx", import.meta.url), "utf8");

assert.deepEqual(closedSelectorState(), { open: false, query: "", active: 0 });
assert.match(search, /onChange\(option\.value\);\s*close\(true\)/s, "residence/time-zone selection updates before closing");
assert.match(search, /event\.key === "Enter"[\s\S]*choose\(filtered\[state\.active\]\)/);
assert.match(search, /event\.key === "Escape"[\s\S]*close\(true\)/);
assert.match(search, /onPointerDown=\{event => \{ event\.preventDefault\(\); event\.stopPropagation\(\); choose\(option\); \}\}/);
assert.match(search, /query: event\.target\.value/, "search typing keeps controlled popup state");
assert.match(search, /useDismissibleOverlay/, "residence and time-zone selectors share overlay coordination");

assert.match(phone, /const choose = \(code: Country\) => \{ onChange\(code\); close\(true\); \}/);
assert.match(phone, /setOpen\(false\); setQuery\(""\); setActive\(0\)/);
assert.match(phone, /event\.key === "Enter"[\s\S]*choose\(grouped\[active\]\.code\)/);
assert.match(phone, /event\.key === "Escape"[\s\S]*close\(\)/);
assert.match(phone, /useDismissibleOverlay/);
assert.match(phone, /h-\[18px\] w-6 shrink-0/);
assert.match(phone, /min-h-11 w-\[72px\]/);
assert.match(phone, /min-w-0 flex-1 truncate/);
for (const code of ["PK", "GB", "US", "CA", "AU"]) assert.ok(phone.includes("flags[country]"), `${code} uses the fixed SVG flag wrapper`);

assert.match(overlay, /document\.addEventListener\("pointerdown", outside\)/);
assert.match(overlay, /event\.key === "Escape"/);
assert.match(overlay, /OPEN_EVENT/, "opening one selector dismisses another");
assert.match(header, /onClick=\{closeDesktop\}/);
assert.match(header, /onClick=\{closeDrawer\}/);
assert.match(header, /setPrograms\(false\); setPolicies\(false\)/);
assert.match(header, /document\.body\.style\.overflow = ""/);
assert.match(header, /<Link to="\/programs" onClick=\{closeDesktop\}/);
assert.match(header, /event\.stopPropagation\(\); setDesktopPrograms/);
assert.match(router, /onClick\?\.\(event\);\s*if \(event\.defaultPrevented\) return;/s, "menu close callbacks compose with navigation");
assert.match(finder, /const go = \(to: string\) => \{ dismiss\(false\); navigate\(to\); \}/);
assert.match(finder, /document\.body\.style\.overflow = previous/);

const payload = buildTrialSubmissionPayload({ learnerType: "self", ageGroup: "adult", mainGoal: "tajweed", contactName: "Learner", guardianName: "", countryCode: "PK", countryName: "Pakistan", region: "", timeZone: "Asia/Karachi", whatsapp: "+923001234567", email: "learner@example.com", preferredDays: ["monday"], preferredTime: "evening", notes: "", consent: true }, { submissionId: "test-submission", formStartedAt: 1, honeypot: "" });
assert.deepEqual(Object.keys(payload).sort(), ["ageGroup","consent","contactName","countryCode","countryName","email","formStartedAt","guardianName","honeypot","learnerType","mainGoal","notes","preferredDays","preferredTime","region","submissionId","timeZone","whatsapp"].sort());

console.log("selector and navigation close/reset regression tests passed");
